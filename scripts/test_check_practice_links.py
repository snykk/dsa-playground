"""
Unit tests for scripts/check_practice_links.py: everything that needs no network. Reading the
articles' entries, the site labels, comparing names, classifying the judges' answers, and the
checker itself with a stand-in for the network.

Run from the repository root:

    python3 -m unittest discover -s scripts -p "test_*.py"

The name does not end in _test.py, so `make test-python` (which runs the topic tests) leaves it
to the practice-links workflow.
"""
import json
import os
import re
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import check_practice_links as cpl  # noqa: E402

BACKSLASH = chr(92)


def block(*entries):
    """An article fragment with a <PracticeProblems> block holding the given entry lines."""
    lines = "\n".join("    %s," % e for e in entries)
    return "## Practice problems\n\n<PracticeProblems\n  problems={[\n%s\n  ]}\n/>\n" % lines


def entry(name, site, url):
    return cpl.Entry("a.mdx", name, site, url)


class TestParseEntries(unittest.TestCase):
    def test_single_quoted_entries(self):
        source = block(
            "{ name: 'Sort an Array', site: 'LeetCode 912', url: 'https://leetcode.com/problems/sort-an-array/', idea: 'quick sort itself' }",
            "{ name: 'Sort Colors', site: 'LeetCode 75', url: 'https://leetcode.com/problems/sort-colors/', idea: 'one partition' }",
        )
        self.assertEqual(
            cpl.parse_entries(source, "quick-sort.mdx"),
            [
                cpl.Entry("quick-sort.mdx", "Sort an Array", "LeetCode 912", "https://leetcode.com/problems/sort-an-array/"),
                cpl.Entry("quick-sort.mdx", "Sort Colors", "LeetCode 75", "https://leetcode.com/problems/sort-colors/"),
            ],
        )

    def test_double_quoted_strings_with_apostrophes(self):
        source = block(
            """{ name: "Grundy's Game", site: 'CSES 2207', url: 'https://cses.fi/problemset/task/2207', idea: "the mex of the parts' XORs" }"""
        )
        self.assertEqual(cpl.parse_entries(source)[0].name, "Grundy's Game")

    def test_escapes_in_strings(self):
        quote = BACKSLASH + "'"
        source = block(
            "{ name: 'Grundy" + quote + "s Game', site: 'CSES 2207', url: 'https://cses.fi/problemset/task/2207', idea: 'x' }",
            '{ name: "Say ' + BACKSLASH + '"hi' + BACKSLASH + '"", site: "Kattis hi", url: "https://open.kattis.com/problems/hi", idea: "x" }',
        )
        self.assertEqual([e.name for e in cpl.parse_entries(source)], ["Grundy's Game", 'Say "hi"'])

    def test_hexadecimal_escapes(self):
        # An ASCII-only article spells any other character as an escape; the name is the character.
        literal = "'Pok" + BACKSLASH + "u00e9mon " + BACKSLASH + "x41'"
        self.assertEqual(cpl.js_string(literal), "Pok" + chr(0xE9) + "mon A")

    def test_properties_in_any_order_and_strings_with_braces_or_slashes(self):
        source = block("{ url: 'https://open.kattis.com/problems/x', idea: 'sets {A, C} and a />', site: 'Kattis x', name: 'X' }")
        self.assertEqual(cpl.parse_entries(source), [entry("X", "Kattis x", "https://open.kattis.com/problems/x")._replace(article="")])

    def test_ignores_text_outside_the_component(self):
        source = "Prose that says name: 'Not a problem' and url: 'https://example.com/'.\n\n" + block(
            "{ name: 'Weird Algorithm', site: 'CSES 1068', url: 'https://cses.fi/problemset/task/1068', idea: 'x' }"
        )
        self.assertEqual([e.name for e in cpl.parse_entries(source)], ["Weird Algorithm"])

    def test_article_without_practice_problems(self):
        self.assertEqual(cpl.parse_entries("## Exercises\n\nNo judge has one.\n"), [])

    def test_an_entry_it_cannot_read_is_an_error(self):
        not_a_string = block("{ name: 'A', site: 'LeetCode 1', url: 'https://leetcode.com/problems/a/', idea: idea }")
        without_url = block("{ name: 'A', site: 'LeetCode 1', idea: 'x' }")
        unterminated = "<PracticeProblems problems={[ { name: 'A' } ]}"
        for source in (not_a_string, without_url, unterminated):
            with self.assertRaises(cpl.ParseError):
                cpl.parse_entries(source, "a.mdx")

    def test_reads_every_entry_of_the_real_articles(self):
        entries = cpl.load_entries()
        urls = 0
        for name in os.listdir(cpl.ARTICLES):
            if name.endswith(".mdx"):
                with open(os.path.join(cpl.ARTICLES, name), encoding="utf-8") as f:
                    urls += len(re.findall(r"\burl:\s*['\"]", f.read()))
        self.assertGreater(len(entries), 0)
        self.assertEqual(len(entries), urls)
        for e in entries:
            self.assertTrue(e.name.strip() and e.site.strip() and e.url.startswith("https://"), e)


class TestSiteLabels(unittest.TestCase):
    def test_judge_of(self):
        self.assertEqual(cpl.judge_of("https://leetcode.com/problems/two-sum/"), "leetcode")
        self.assertEqual(cpl.judge_of("https://www.spoj.com/problems/PRIME1/"), "spoj")
        self.assertIsNone(cpl.judge_of("https://www.hackerrank.com/challenges/x/problem"))

    def test_labels_that_match_their_links(self):
        for name, site, url in [
            ("Sort an Array", "LeetCode 912", "https://leetcode.com/problems/sort-an-array/"),
            ("Weird Algorithm", "CSES 1068", "https://cses.fi/problemset/task/1068"),
            ("Bertown roads", "Codeforces 118E", "https://codeforces.com/problemset/problem/118/E"),
            ("Bread", "AtCoder abc252_f", "https://atcoder.jp/contests/abc252/tasks/abc252_f"),
            ("Knapsack 1", "AtCoder DP D", "https://atcoder.jp/contests/dp/tasks/dp_d"),
            ("Oversleeping", "AtCoder ABC 193 E", "https://atcoder.jp/contests/abc193/tasks/abc193_e"),
            ("Convolution", "AtCoder Library Practice F", "https://atcoder.jp/contests/practice2/tasks/practice2_f"),
            ("Board Wrapping", "Kattis wrapping", "https://open.kattis.com/problems/wrapping"),
            ("D-query", "SPOJ DQUERY", "https://www.spoj.com/problems/DQUERY/"),
        ]:
            self.assertIsNone(cpl.label_issue(entry(name, site, url)), site)

    def test_labels_that_do_not(self):
        for site, url in [
            ("LeetCode", "https://leetcode.com/problems/sort-an-array/"),
            ("CSES 1069", "https://cses.fi/problemset/task/1068"),
            ("Codeforces 118D", "https://codeforces.com/problemset/problem/118/E"),
            ("AtCoder DP E", "https://atcoder.jp/contests/dp/tasks/dp_d"),
            ("Kattis wrap", "https://open.kattis.com/problems/wrapping"),
            ("SPOJ PRIME1", "https://www.spoj.com/problems/DQUERY/"),
            ("LeetCode 1068", "https://cses.fi/problemset/task/1068"),
        ]:
            self.assertIsNotNone(cpl.label_issue(entry("X", site, url)), site)


class TestNames(unittest.TestCase):
    def test_same_name_ignores_surrounding_and_repeated_spaces(self):
        self.assertTrue(cpl.same_name("Shortest Common Supersequence", "Shortest Common Supersequence "))
        self.assertTrue(cpl.same_name("Two  Sum", " Two Sum"))

    def test_same_name_is_exact_otherwise(self):
        self.assertFalse(cpl.same_name("Two Sum", "Two sum"))
        self.assertFalse(cpl.same_name("Two Sum", "Two Sum II"))
        self.assertFalse(cpl.same_name("Two Sum", ""))

    def test_page_titles(self):
        self.assertEqual(cpl.page_title("<html><head><title>\n  F - Bread\n</title></head>"), "F - Bread")
        self.assertEqual(cpl.page_title("<title>Tom &amp; Jerry</title>"), "Tom & Jerry")
        self.assertIsNone(cpl.page_title("<html></html>"))

    def test_atcoder_and_kattis_titles(self):
        self.assertEqual(cpl.atcoder_name("F - Bread"), "Bread")
        self.assertEqual(cpl.atcoder_name("Ex - A - B Game"), "A - B Game")
        dash = chr(0x2013)
        self.assertEqual(cpl.kattis_name("Closest Pair (Uniform) %s Kattis, Kattis" % dash), "Closest Pair (Uniform)")
        self.assertEqual(cpl.kattis_name("Board Wrapping - Kattis, Kattis"), "Board Wrapping")


class TestResponses(unittest.TestCase):
    def response(self, status, body="", **headers):
        return cpl.Response(status, {k.replace("_", "-"): v for k, v in headers.items()}, body)

    def test_a_page_that_answers(self):
        page = "<title>F - Bread</title><script src='/cdn-cgi/challenge-platform/scripts/jsd/main.js'></script>"
        self.assertIsNone(cpl.response_verdict(self.response(200, page), page=True))

    def test_a_missing_page_fails_but_a_missing_endpoint_is_not_checked(self):
        self.assertEqual(cpl.response_verdict(self.response(404), page=True).status, cpl.FAILED)
        self.assertEqual(cpl.response_verdict(self.response(410), page=True).status, cpl.FAILED)
        self.assertEqual(cpl.response_verdict(self.response(404), page=False).status, cpl.COULD_NOT_CHECK)

    def test_cloudflare_challenges_are_not_checked_or_retried(self):
        for answer in [
            self.response(403, "", cf_mitigated="challenge"),
            self.response(403, "<title>Just a moment...</title>"),
            self.response(503, "<script src='/cdn-cgi/challenge-platform/h/b/orchestrate/chl_page/v1'></script>"),
            self.response(200, "<html><title>Just a moment...</title></html>"),
        ]:
            verdict = cpl.response_verdict(answer, page=True)
            self.assertEqual(verdict.status, cpl.COULD_NOT_CHECK)
            self.assertIn("Cloudflare", verdict.reason)
            self.assertFalse(verdict.retry)

    def test_rate_limits_and_server_errors_are_retried(self):
        for status in (429, 500, 502, 503):
            verdict = cpl.response_verdict(self.response(status, "busy"), page=True)
            self.assertEqual((verdict.status, verdict.retry), (cpl.COULD_NOT_CHECK, True), status)

    def test_a_refusal_is_not_a_failure(self):
        verdict = cpl.response_verdict(self.response(403, "Forbidden"), page=True)
        self.assertEqual((verdict.status, verdict.retry), (cpl.COULD_NOT_CHECK, False))


class TestJudgeAnswers(unittest.TestCase):
    lc = entry("Shortest Common Supersequence", "LeetCode 1092", "https://leetcode.com/problems/shortest-common-supersequence/")

    def question(self, **fields):
        q = {"questionFrontendId": "1092", "title": "Shortest Common Supersequence ", "isPaidOnly": False}
        q.update(fields)
        return {"data": {"question": q}}

    def test_leetcode_ok_with_a_trailing_space(self):
        self.assertEqual(cpl.leetcode_verdict(self.lc, self.question()).status, cpl.OK)

    def test_leetcode_definite_problems(self):
        for payload, words in [
            ({"data": {"question": None}}, "no problem"),
            (self.question(isPaidOnly=True), "premium"),
            (self.question(questionFrontendId="1093"), "numbers it 1093"),
            (self.question(title="Shortest Common Subsequence"), "title is"),
        ]:
            verdict = cpl.leetcode_verdict(self.lc, payload)
            self.assertEqual(verdict.status, cpl.FAILED, payload)
            self.assertIn(words, verdict.reason)

    def test_leetcode_answers_that_decide_nothing(self):
        for payload in [{"errors": [{"message": "too many requests"}], "data": {"question": None}}, {"data": None}, [], "x"]:
            self.assertEqual(cpl.leetcode_verdict(self.lc, payload).status, cpl.COULD_NOT_CHECK, payload)

    def test_cses_problem_list(self):
        page = (
            '<ul class="task-list"><li class="task"><a href="/problemset/task/1068">Weird Algorithm</a>'
            '<span class="detail">1 / 2</span></li><li class="task"><a href="/problemset/task/2207">Grundy&#39;s Game</a></li></ul>'
        )
        self.assertEqual(cpl.parse_cses_list(page), {"1068": "Weird Algorithm", "2207": "Grundy's Game"})

    def test_codeforces_problem_list(self):
        text = json.dumps({"status": "OK", "result": {"problems": [
            {"contestId": 118, "index": "E", "name": "Bertown roads"},
            {"contestId": 1548, "index": "B", "name": "Integers Have Friends"},
            {"index": "A", "name": "a problem without a contest"},
        ]}})
        self.assertEqual(cpl.parse_codeforces_problems(text), {"118E": "Bertown roads", "1548B": "Integers Have Friends"})
        self.assertIsNone(cpl.parse_codeforces_problems(json.dumps({"status": "FAILED", "comment": "Call limit exceeded"})))
        self.assertIsNone(cpl.parse_codeforces_problems("<html>Just a moment...</html>"))

    def test_name_verdict(self):
        e = entry("Bread", "AtCoder abc252_f", "https://atcoder.jp/contests/abc252/tasks/abc252_f")
        self.assertEqual(cpl.name_verdict(e, "Bread", "atcoder").status, cpl.OK)
        self.assertEqual(cpl.name_verdict(e, "Toast", "atcoder").status, cpl.FAILED)
        self.assertEqual(cpl.name_verdict(e, None, "atcoder").status, cpl.FAILED)


class TestChecker(unittest.TestCase):
    """The checker with a stand-in for the network: no request leaves the machine."""

    def checker(self, answers):
        self.requests = []

        def fetch(url, data=None, headers=None):
            self.requests.append(url)
            answer = answers[url]
            if isinstance(answer, Exception):
                raise answer
            return answer

        return cpl.Checker(fetch=fetch, sleep=lambda seconds: None, pause=0)

    def test_cses_and_codeforces_lists_are_fetched_once(self):
        checker = self.checker({
            "https://cses.fi/problemset/": cpl.Response(200, {}, '<a href="/problemset/task/1068">Weird Algorithm</a>'),
        })
        self.assertEqual(checker.check(entry("Weird Algorithm", "CSES 1068", "https://cses.fi/problemset/task/1068")).status, cpl.OK)
        self.assertEqual(checker.check(entry("Missing Number", "CSES 1083", "https://cses.fi/problemset/task/1083")).status, cpl.FAILED)
        self.assertEqual(self.requests, ["https://cses.fi/problemset/"])

    def test_pages_spoj_and_unreachable_judges(self):
        kattis = "https://open.kattis.com/problems/wrapping"
        gone = "https://open.kattis.com/problems/gone"
        atcoder = "https://atcoder.jp/contests/dp/tasks/dp_d"
        checker = self.checker({
            kattis: cpl.Response(200, {}, "<title>Board Wrapping %s Kattis, Kattis</title>" % chr(0x2013)),
            gone: cpl.Response(404, {}, "<title>404: Not Found</title>"),
            atcoder: cpl.Unreachable("timed out"),
        })
        self.assertEqual(checker.check(entry("Board Wrapping", "Kattis wrapping", kattis)).status, cpl.OK)
        self.assertEqual(checker.check(entry("Gone", "Kattis gone", gone)).status, cpl.FAILED)
        self.assertEqual(checker.check(entry("Knapsack 1", "AtCoder DP D", atcoder)).status, cpl.COULD_NOT_CHECK)
        self.assertEqual(self.requests.count(atcoder), 1 + cpl.RETRIES)
        self.assertEqual(checker.check(entry("D-query", "SPOJ DQUERY", "https://www.spoj.com/problems/DQUERY/")).status, cpl.UNCHECKED)

    def test_a_wrong_label_fails_without_a_request(self):
        checker = self.checker({})
        verdict = checker.check(entry("Weird Algorithm", "CSES 1069", "https://cses.fi/problemset/task/1068"))
        self.assertEqual(verdict.status, cpl.FAILED)
        self.assertEqual(self.requests, [])

    def test_leetcode(self):
        answer = {"data": {"question": {"questionFrontendId": "912", "title": "Sort an Array", "isPaidOnly": False}}}
        checker = self.checker({"https://leetcode.com/graphql": cpl.Response(200, {}, json.dumps(answer))})
        self.assertEqual(checker.check(entry("Sort an Array", "LeetCode 912", "https://leetcode.com/problems/sort-an-array/")).status, cpl.OK)


if __name__ == "__main__":
    unittest.main()
