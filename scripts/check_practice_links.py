#!/usr/bin/env python3
"""
Check the practice problems the site's articles link to against the judges that host them.

Every article in web/src/content/articles/ ends with a list of practice problems:

    <PracticeProblems
      problems={[
        { name: 'Sort an Array', site: 'LeetCode 912', url: 'https://leetcode.com/problems/sort-an-array/', idea: '...' },
      ]}
    />

`name` is the judge's own title and `site` names the judge and the problem's number or id.
Judges rename, move and paywall problems, so this script asks each judge whether every listed
problem still exists under that name and number:

- LeetCode: its GraphQL endpoint, one request per problem with a short pause between them, for
  the problem's number, its title and whether it is premium. Titles are compared with the
  surrounding spaces stripped, because a few carry a trailing space on LeetCode's side.
- CSES: its problem list page, one request for the id and name of every task.
- Codeforces: https://codeforces.com/api/problemset.problems, one request for every problem.
- AtCoder and Kattis: the title of the problem page.
- SPOJ answers scripts with 403 Forbidden, so its problems are listed as unchecked.

Before any request, each entry's site label must name the problem its link points to, for
example "CSES 1068" with .../task/1068 and "Codeforces 118E" with .../problem/118/E.

A problem fails only on a definite answer: the page does not exist, the name or the number
differs, or the problem is premium. A Cloudflare challenge, a rate limit, a server error or a
timeout means the problem could not be checked: it is reported, but it does not fail the run.

Usage:
    python3 scripts/check_practice_links.py                  # every judge
    python3 scripts/check_practice_links.py --judge cses     # one judge (repeatable)

Prints one line per problem that failed, could not be checked or is unchecked, then a summary.
Exits with status 1 if any problem failed, 2 if the articles could not be read, 0 otherwise.
The weekly workflow .github/workflows/practice-links.yml runs it, after its unit tests in
scripts/test_check_practice_links.py (python3 -m unittest discover -s scripts -p "test_*.py").
Standard library only.
"""
from __future__ import annotations

import argparse
import html
import http.client
import json
import os
import re
import socket
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from typing import Callable, Dict, List, NamedTuple, Optional, Tuple

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTICLES = os.path.join(ROOT, "web", "src", "content", "articles")

USER_AGENT = "Mozilla/5.0 (compatible; practice-link-check)"
TIMEOUT = 30  # seconds for one request
LEETCODE_PAUSE = 0.5  # seconds between two LeetCode requests
RETRIES = 2  # further attempts after a rate limit, a server error or no answer
RETRY_WAIT = 5  # seconds before the first retry; doubles for the next one

OK = "ok"
FAILED = "failed"
COULD_NOT_CHECK = "could not check"
UNCHECKED = "unchecked"


class Entry(NamedTuple):
    """One practice problem as an article lists it."""

    article: str
    name: str
    site: str
    url: str


class Verdict(NamedTuple):
    """The outcome for one problem: a status above and, unless it is OK, the reason."""

    status: str
    reason: str = ""
    retry: bool = False  # a later attempt may get a real answer (rate limit, server error, no answer)


class Response(NamedTuple):
    """An HTTP answer: status, headers with lower-case names, and the body as text."""

    status: int
    headers: Dict[str, str]
    body: str


class ParseError(ValueError):
    """An article's practice problems could not be read."""


class Unreachable(Exception):
    """A request got no HTTP answer at all (timeout, DNS failure, refused connection)."""


# --- Reading the articles -------------------------------------------------------------------

# A JavaScript string literal in single or double quotes, with backslash escapes, on one line.
STRING = r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\""
# The component, up to its "/>"; strings are skipped whole, so a "/>" inside one does not end it.
BLOCK = re.compile(r"<PracticeProblems\b(?:%s|[^'\"/]|/(?!>))*/>" % STRING)
# One problem: an object literal whose every property is a string.
ENTRY = re.compile(r"\{\s*(?:\w+\s*:\s*(?:%s)\s*,?\s*)+\}" % STRING)
PROPERTY = re.compile(r"(\w+)\s*:\s*(%s)" % STRING)
REQUIRED = ("name", "site", "url")
SIMPLE_ESCAPES = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "v": "\v", "0": "\0"}


def js_string(literal: str) -> str:
    """The value of a quoted JavaScript string literal such as 'it\\'s' or "a \\"b\\"".

    Handles the single-character escapes, and the two- and four-digit hexadecimal ones that an
    ASCII-only article needs for any other character.
    """
    body = literal[1:-1]
    out = []
    i = 0
    while i < len(body):
        ch = body[i]
        if ch != "\\" or i + 1 == len(body):
            out.append(ch)
            i += 1
            continue
        nxt = body[i + 1]
        digits = {"x": 2, "u": 4}.get(nxt, 0)
        code = body[i + 2:i + 2 + digits]
        if digits and re.fullmatch(r"[0-9a-fA-F]{%d}" % digits, code):
            out.append(chr(int(code, 16)))
            i += 2 + digits
        else:
            out.append(SIMPLE_ESCAPES.get(nxt, nxt))
            i += 2
    return "".join(out)


def parse_entries(source: str, article: str = "") -> List[Entry]:
    """The practice problems in one article's MDX source, in the order it lists them.

    Raises ParseError when a <PracticeProblems> block holds something this reader does not
    understand, so a change of format fails loudly instead of silently checking nothing.
    """
    blocks = BLOCK.findall(source)
    if len(blocks) != len(re.findall(r"<PracticeProblems\b", source)):
        raise ParseError("%s: a <PracticeProblems> block does not end with '/>'" % article)
    entries = []
    for block in blocks:
        for match in ENTRY.finditer(block):
            fields = {key: js_string(value) for key, value in PROPERTY.findall(match.group(0))}
            missing = [key for key in REQUIRED if not fields.get(key, "").strip()]
            if missing:
                raise ParseError("%s: a problem without %s: %s" % (article, " or ".join(missing), match.group(0)[:80]))
            entries.append(Entry(article, fields["name"], fields["site"], fields["url"]))
        rest = re.sub(STRING, "''", ENTRY.sub("", block))
        if re.search(r"\b(?:%s)\s*:" % "|".join(REQUIRED), rest):
            raise ParseError("%s: a problem whose properties are not all plain strings" % article)
    return entries


def load_entries(folder: str = ARTICLES) -> List[Entry]:
    """Every practice problem of every article in folder, article by article."""
    entries = []
    for name in sorted(os.listdir(folder)):
        if name.endswith(".mdx"):
            with open(os.path.join(folder, name), encoding="utf-8") as f:
                entries.extend(parse_entries(f.read(), name))
    return entries


# --- What a link and a label say ------------------------------------------------------------

JUDGE_NAMES = {
    "leetcode": "LeetCode",
    "cses": "CSES",
    "codeforces": "Codeforces",
    "atcoder": "AtCoder",
    "kattis": "Kattis",
    "spoj": "SPOJ",
}
LINKS = {
    "leetcode": re.compile(r"https://leetcode\.com/problems/(?P<slug>[a-z0-9-]+)/?$"),
    "cses": re.compile(r"https://cses\.fi/problemset/task/(?P<id>\d+)/?$"),
    "codeforces": re.compile(r"https://codeforces\.com/problemset/problem/(?P<contest>\d+)/(?P<index>[A-Z]\d?)/?$"),
    "atcoder": re.compile(r"https://atcoder\.jp/contests/(?P<contest>[\w-]+)/tasks/(?P<task>\w+)/?$"),
    "kattis": re.compile(r"https://open\.kattis\.com/problems/(?P<id>\w+)/?$"),
    "spoj": re.compile(r"https://www\.spoj\.com/problems/(?P<code>\w+)/?$"),
}
HOSTS = {
    "leetcode.com": "leetcode",
    "cses.fi": "cses",
    "codeforces.com": "codeforces",
    "atcoder.jp": "atcoder",
    "open.kattis.com": "kattis",
    "www.spoj.com": "spoj",
    "spoj.com": "spoj",
}


def judge_of(url: str) -> Optional[str]:
    """The judge a link goes to ("leetcode", "cses", ...), or None for any other site."""
    match = re.match(r"https?://([^/]+)", url)
    return HOSTS.get(match.group(1).lower()) if match else None


def label_issue(entry: Entry) -> Optional[str]:
    """What is wrong between the site label and the link, or None when they agree.

    LeetCode's number cannot be read from its link, so only its form is checked here; the
    judge's answer checks the number itself. AtCoder labels come in several forms ("AtCoder
    abc252_f", "AtCoder DP D", "AtCoder ABC 193 E"); their last word must name the task.
    """
    judge = judge_of(entry.url)
    match = LINKS[judge].match(entry.url) if judge else None
    if not match:
        return None
    words = entry.site.split()
    if not words or words[0] != JUDGE_NAMES[judge]:
        return "the site label %r does not name %s, where the link goes" % (entry.site, JUDGE_NAMES[judge])
    rest = words[1:]
    if judge == "leetcode":
        agree = len(rest) == 1 and rest[0].isdigit()
    elif judge == "cses":
        agree = rest == [match.group("id")]
    elif judge == "codeforces":
        agree = rest == [match.group("contest") + match.group("index")]
    elif judge == "atcoder":
        last, task = (rest[-1].lower() if rest else ""), match.group("task").lower()
        agree = bool(last) and (task == last or task.endswith("_" + last))
    elif judge == "kattis":
        agree = rest == [match.group("id")]
    else:
        agree = rest == [match.group("code")]
    return None if agree else "the site label %r does not match the link" % entry.site


def same_name(listed: str, judge_name: str) -> bool:
    """Whether the article's name is the judge's title, ignoring surrounding and repeated spaces."""
    return " ".join(listed.split()) == " ".join(judge_name.split())


def page_title(page: str) -> Optional[str]:
    """The text of a page's <title>, unescaped and with its spaces collapsed."""
    match = re.search(r"<title[^>]*>(.*?)</title>", page, re.S | re.I)
    return " ".join(html.unescape(match.group(1)).split()) if match else None


def atcoder_name(title: str) -> str:
    """The problem's name in an AtCoder task title: "F - Bread" gives "Bread"."""
    return re.sub(r"^[A-Za-z0-9]+ - ", "", title)


def kattis_name(title: str) -> str:
    """The problem's name in a Kattis title: "Board Wrapping - Kattis, Kattis" gives "Board Wrapping".

    Kattis separates the two with an en dash, matched here as any one non-space character.
    """
    return re.sub(r"\s+\S\s+Kattis(?:, Kattis)?$", "", title)


# --- What a judge answered ------------------------------------------------------------------

CHALLENGE_MARKS = re.compile(r"Just a moment\.\.\.|/cdn-cgi/challenge-platform/|cf-chl|cf_chl")


def is_challenge(response: Response) -> bool:
    """Whether Cloudflare answered with a browser challenge instead of the page.

    An ordinary page may load Cloudflare's challenge-platform script too, so a 200 answer counts
    as a challenge only through the cf-mitigated header or the challenge page's own title.
    """
    if response.headers.get("cf-mitigated", "").lower() == "challenge":
        return True
    if response.status in (403, 429, 503):
        return bool(CHALLENGE_MARKS.search(response.body))
    return page_title(response.body) == "Just a moment..."


def response_verdict(response: Response, page: bool) -> Optional[Verdict]:
    """The verdict an answer decides on its own, or None when its body holds the answer.

    `page` says whether the request was for the problem's own page (AtCoder, Kattis), where a
    404 means the problem is gone, rather than for an endpoint shared by every problem.
    """
    if is_challenge(response):
        return Verdict(COULD_NOT_CHECK, "a Cloudflare challenge (HTTP %d)" % response.status)
    if response.status == 200:
        return None
    if response.status in (404, 410) and page:
        return Verdict(FAILED, "the page does not exist (HTTP %d)" % response.status)
    if response.status == 429:
        return Verdict(COULD_NOT_CHECK, "rate limited (HTTP 429)", retry=True)
    if response.status >= 500:
        return Verdict(COULD_NOT_CHECK, "server error (HTTP %d)" % response.status, retry=True)
    if response.status in (401, 403):
        return Verdict(COULD_NOT_CHECK, "access refused (HTTP %d)" % response.status)
    return Verdict(COULD_NOT_CHECK, "unexpected answer (HTTP %d)" % response.status)


def leetcode_verdict(entry: Entry, payload: object) -> Verdict:
    """Judge a LeetCode entry from the GraphQL answer {"data": {"question": {...} or null}}.

    An answer that reports errors decides nothing, even with a null question.
    """
    data = payload.get("data") if isinstance(payload, dict) else None
    errors = payload.get("errors") if isinstance(payload, dict) else None
    if errors or not isinstance(data, dict) or "question" not in data:
        return Verdict(COULD_NOT_CHECK, "LeetCode's answer has no question%s" % (": %s" % str(errors)[:120] if errors else ""))
    question = data["question"]
    if question is None:
        return Verdict(FAILED, "LeetCode has no problem at this link")
    problems = []
    number = entry.site.split()[-1]
    if str(question.get("questionFrontendId")) != number:
        problems.append("LeetCode numbers it %s" % question.get("questionFrontendId"))
    title = question.get("title") or ""
    if not same_name(entry.name, title):
        problems.append("LeetCode's title is %r" % title.strip())
    if question.get("isPaidOnly"):
        problems.append("it is premium (LeetCode subscribers only)")
    return Verdict(FAILED, "; ".join(problems)) if problems else Verdict(OK)


def parse_cses_list(page: str) -> Dict[str, str]:
    """Task id to name, from the CSES problem list page."""
    links = re.finditer(r'<a href="/problemset/task/(\d+)/?"[^>]*>([^<]*)</a>', page)
    return {m.group(1): " ".join(html.unescape(m.group(2)).split()) for m in links}


def parse_codeforces_problems(text: str) -> Optional[Dict[str, str]]:
    """Contest id and index ("118E") to name, from problemset.problems; None if the API failed."""
    try:
        payload = json.loads(text)
        if payload.get("status") != "OK":
            return None
        return {"%s%s" % (p["contestId"], p["index"]): p["name"] for p in payload["result"]["problems"] if "contestId" in p}
    except (ValueError, AttributeError, KeyError, TypeError):
        return None


def name_verdict(entry: Entry, judge_name: Optional[str], judge: str) -> Verdict:
    """Compare an entry with the name its judge gives the problem (None: no such problem)."""
    if judge_name is None:
        return Verdict(FAILED, "%s has no such problem" % JUDGE_NAMES[judge])
    if same_name(entry.name, judge_name):
        return Verdict(OK)
    return Verdict(FAILED, "%s's title is %r" % (JUDGE_NAMES[judge], judge_name))


# --- Asking the judges ----------------------------------------------------------------------


def fetch(url: str, data: Optional[bytes] = None, headers: Optional[Dict[str, str]] = None) -> Response:
    """Send one request; an HTTP error status is returned as a Response, no answer raises Unreachable."""
    request = urllib.request.Request(url, data=data, headers={"User-Agent": USER_AGENT, "Accept-Language": "en", **(headers or {})})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as answer:
            body = answer.read().decode("utf-8", "replace")
            return Response(answer.status, {k.lower(): v for k, v in answer.headers.items()}, body)
    except urllib.error.HTTPError as error:
        try:
            body = error.read().decode("utf-8", "replace")
        except (OSError, http.client.HTTPException):
            body = ""
        return Response(error.code, {k.lower(): v for k, v in (error.headers or {}).items()}, body)
    except (urllib.error.URLError, http.client.HTTPException, socket.timeout, OSError) as error:
        raise Unreachable(str(getattr(error, "reason", error)) or type(error).__name__)


class Checker:
    """Checks entries one by one, keeping the lists that one request fetches for a whole judge."""

    def __init__(
        self,
        fetch: Callable[..., Response] = fetch,
        sleep: Callable[[float], None] = time.sleep,
        pause: float = LEETCODE_PAUSE,
        retries: int = RETRIES,
    ):
        self.fetch = fetch
        self.sleep = sleep
        self.pause = pause
        self.retries = retries
        self.lists: Dict[str, object] = {}  # judge -> its id-to-name map, or the Verdict that stopped it
        self.answers: Dict[Tuple[str, Optional[bytes]], Tuple[Optional[Response], Optional[Verdict]]] = {}
        self.last_leetcode = 0.0

    def request(self, url: str, page: bool, data: Optional[bytes] = None, headers: Optional[Dict[str, str]] = None) -> Tuple[Optional[Response], Optional[Verdict]]:
        """A usable 200 answer, or the verdict that the answers decided, retrying where it may help.

        Answers are kept, so a link that several articles list under different labels is
        fetched once.
        """
        key = (url, data)
        if key not in self.answers:
            self.answers[key] = self._request(url, page, data, headers)
        return self.answers[key]

    def _request(self, url: str, page: bool, data: Optional[bytes], headers: Optional[Dict[str, str]]) -> Tuple[Optional[Response], Optional[Verdict]]:
        verdict = None
        for attempt in range(self.retries + 1):
            if attempt:
                self.sleep(RETRY_WAIT * 2 ** (attempt - 1))
            if url.startswith("https://leetcode.com/"):
                # LeetCode is asked once per problem: space the requests out.
                wait = self.last_leetcode + self.pause - time.monotonic()
                if wait > 0:
                    self.sleep(wait)
                self.last_leetcode = time.monotonic()
            try:
                response = self.fetch(url, data, headers)
            except Unreachable as error:
                verdict = Verdict(COULD_NOT_CHECK, "no answer (%s)" % error, retry=True)
                continue
            verdict = response_verdict(response, page)
            if verdict is None:
                return response, None
            if not verdict.retry:
                break
        return None, verdict

    def check(self, entry: Entry) -> Verdict:
        """The verdict for one entry."""
        judge = judge_of(entry.url)
        if judge is None:
            return Verdict(UNCHECKED, "no check for this site")
        match = LINKS[judge].match(entry.url)
        if not match:
            return Verdict(COULD_NOT_CHECK, "the link is not in a form this script reads")
        issue = label_issue(entry)
        if issue:
            return Verdict(FAILED, issue)
        if judge == "spoj":
            return Verdict(UNCHECKED, "SPOJ refuses scripted requests (HTTP 403)")
        if judge == "leetcode":
            return self.check_leetcode(entry, match.group("slug"))
        if judge == "cses":
            return self.check_listed(entry, "cses", match.group("id"))
        if judge == "codeforces":
            return self.check_listed(entry, "codeforces", match.group("contest") + match.group("index"))
        return self.check_page(entry, judge)

    def check_leetcode(self, entry: Entry, slug: str) -> Verdict:
        """LeetCode: the problem's number, title and premium flag from the GraphQL endpoint."""
        query = {
            "query": "query q($slug: String!) { question(titleSlug: $slug) { questionFrontendId title isPaidOnly } }",
            "variables": {"slug": slug},
        }
        headers = {"Content-Type": "application/json", "Referer": "https://leetcode.com"}
        response, verdict = self.request("https://leetcode.com/graphql", False, json.dumps(query).encode(), headers)
        if verdict:
            return verdict
        try:
            payload = json.loads(response.body)
        except ValueError:
            return Verdict(COULD_NOT_CHECK, "LeetCode's answer is not JSON")
        return leetcode_verdict(entry, payload)

    def check_listed(self, entry: Entry, judge: str, key: str) -> Verdict:
        """CSES and Codeforces: look the problem up in the judge's whole list, fetched once."""
        if judge not in self.lists:
            if judge == "cses":
                response, verdict = self.request("https://cses.fi/problemset/", False)
                names = parse_cses_list(response.body) if response else None
            else:
                response, verdict = self.request("https://codeforces.com/api/problemset.problems", False)
                names = parse_codeforces_problems(response.body) if response else None
            if verdict is None and not names:
                verdict = Verdict(COULD_NOT_CHECK, "could not read %s's problem list" % JUDGE_NAMES[judge])
            self.lists[judge] = verdict if verdict else names
        names = self.lists[judge]
        if isinstance(names, Verdict):
            return names
        return name_verdict(entry, names.get(key), judge)

    def check_page(self, entry: Entry, judge: str) -> Verdict:
        """AtCoder and Kattis: the problem page's title."""
        response, verdict = self.request(entry.url, True)
        if verdict:
            return verdict
        title = page_title(response.body)
        if title is None:
            return Verdict(COULD_NOT_CHECK, "the page has no title")
        return name_verdict(entry, atcoder_name(title) if judge == "atcoder" else kattis_name(title), judge)


# --- The report -----------------------------------------------------------------------------


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Check the articles' practice problems against their judges.")
    parser.add_argument("--judge", action="append", choices=sorted(JUDGE_NAMES), help="check only this judge (repeatable)")
    parser.add_argument("--articles", default=ARTICLES, help="folder of the MDX articles (default: %(default)s)")
    args = parser.parse_args(argv)

    try:
        entries = load_entries(args.articles)
    except (OSError, ParseError) as error:
        print("error: %s" % error, file=sys.stderr)
        return 2
    if not entries:
        print("error: no practice problems in %s" % args.articles, file=sys.stderr)
        return 2

    # One check per problem as listed (link, label, name); the report names every article listing it.
    problems: Dict[Tuple[str, str, str], List[str]] = {}
    for entry in entries:
        problems.setdefault((entry.url, entry.site, entry.name), []).append(entry.article)
    order = list(JUDGE_NAMES)
    keys = sorted(problems, key=lambda k: (order.index(judge_of(k[0])) if judge_of(k[0]) in order else len(order), k))
    if args.judge:
        keys = [k for k in keys if judge_of(k[0]) in args.judge]

    checker = Checker()
    counts: Counter = Counter()
    for url, site, name in keys:
        articles = problems[(url, site, name)]
        verdict = checker.check(Entry(articles[0], name, site, url))
        counts[verdict.status] += 1
        if verdict.status != OK:
            where = ", ".join(sorted(set(articles)))
            print('%s: %s "%s" <%s> in %s: %s' % (verdict.status.upper(), site, name, url, where, verdict.reason), flush=True)

    links = {k[0] for k in keys}
    articles = {a for k in keys for a in problems[k]}
    listed = sum(len(problems[k]) for k in keys)
    print(
        "%d problems as listed (%d links, %d entries in %d articles): %d ok, %d failed, %d could not be checked, %d unchecked"
        % (len(keys), len(links), listed, len(articles), counts[OK], counts[FAILED], counts[COULD_NOT_CHECK], counts[UNCHECKED])
    )
    return 1 if counts[FAILED] else 0


if __name__ == "__main__":
    sys.exit(main())
