#!/usr/bin/env python3
"""
Check topic and language READMEs against the house template (CONTRIBUTING.md,
"README.md Structure").

Usage:
    python3 scripts/check_readme_style.py "Algorithms/Sorting/Quick_Sort" [more folders...]
    python3 scripts/check_readme_style.py --all

A topic folder is a folder with a Python/, C++/ or Go/ subfolder. For each topic the
script checks the topic README and every language README in it, prints one line per
problem and exits with status 1 if there is any problem.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = {"Python": "Python", "C++": "C++", "Go": "Go"}
SKIP_DIRS = {".git", ".github", "node_modules", "web", "docs", "scripts", ".venv", "venv", "__pycache__"}

# Required sections of a topic README: (name shown in messages, heading pattern).
TOPIC_SECTIONS = [
    ("Intuition", r"intuition"),
    ("Visual", r"visual"),
    ("How It Works / Operations", r"(how it works|operations|algorithm|recurrence|definition|the rule|the idea|technique)"),
    ("Step-by-Step Trace", r"(step-by-step trace|worked example|trace)"),
    ("Complexity", r"complexity"),
    ("When to Use", r"when to use"),
    ("<Topic> vs. <Alternatives>", r".*\bvs\.?\s"),
    ("Common Pitfalls", r"common pitfalls"),
    ("Implementations", r"implementations"),
    ("Practice Problems", r"practice problems"),
    ("Related", r"related"),
]
LANG_SECTIONS = [
    ("Files", r"files"),
    ("API", r"api"),
    ("How to Run", r"how to run"),
]

# Emoji and pictographs (plus the plain check / cross marks the old READMEs used).
EMOJI = re.compile(
    "[%s-%s%s-%s%s-%s%s-%s%s%s%s]"
    % (chr(0x1F000), chr(0x1FAFF), chr(0x2600), chr(0x27BF), chr(0x2B00), chr(0x2BFF),
       chr(0x2300), chr(0x23FF), chr(0xFE0F), chr(0x2713), chr(0x2717))
)


def strip_code(text):
    """Text outside fenced code blocks, so code samples are not checked."""
    return re.sub(r"```.*?```", "", text, flags=re.S)


def headings(text, level):
    return [m.group(1).strip() for m in re.finditer(r"^%s (.+?)\s*$" % ("#" * level), strip_code(text), flags=re.M)]


def check_common(path, text, problems):
    body = strip_code(text)
    for n, line in enumerate(body.splitlines(), 1):
        if EMOJI.search(line):
            problems.append("%s: emoji on line %d: %s" % (path, n, line.strip()[:60]))
            break
    if re.search(r"last updated", body, flags=re.I):
        problems.append("%s: remove the 'Last Updated' stamp (git history has the date)" % path)


def check_topic(folder, problems):
    path = os.path.join(folder, "README.md")
    rel = os.path.relpath(path, ROOT)
    if not os.path.isfile(path):
        problems.append("%s: missing" % rel)
        return
    text = open(path, encoding="utf-8").read()
    check_common(rel, text, problems)
    if not re.match(r"# \S", text):
        problems.append("%s: must start with '# <Topic name>'" % rel)
    found = headings(text, 2)
    for name, pattern in TOPIC_SECTIONS:
        if not any(re.match(pattern, h, flags=re.I) for h in found):
            problems.append("%s: missing section '## %s'" % (rel, name))
    for lang in LANGS:
        sub = os.path.join(folder, lang)
        if os.path.isdir(sub):
            check_lang(sub, lang, problems)


def check_lang(folder, lang, problems):
    path = os.path.join(folder, "README.md")
    rel = os.path.relpath(path, ROOT)
    if not os.path.isfile(path):
        problems.append("%s: missing" % rel)
        return
    text = open(path, encoding="utf-8").read()
    check_common(rel, text, problems)
    first = text.splitlines()[0] if text else ""
    if not re.match(r"# .+ -- %s Implementation$" % re.escape(lang), first):
        problems.append("%s: title must be '# <Topic> -- %s Implementation'" % (rel, lang))
    found = headings(text, 2)
    for name, pattern in LANG_SECTIONS:
        if not any(re.match(pattern, h, flags=re.I) for h in found):
            problems.append("%s: missing section '## %s'" % (rel, name))


def topic_folders():
    for root, dirs, _files in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS and not d.startswith("."))
        if any(d in LANGS for d in dirs):
            yield root
            dirs[:] = [d for d in dirs if d not in LANGS]


def main(argv):
    if not argv:
        print(__doc__.strip())
        return 2
    folders = list(topic_folders()) if argv == ["--all"] else [os.path.join(ROOT, a) for a in argv]
    problems = []
    for folder in folders:
        if not os.path.isdir(folder):
            problems.append("%s: not a folder" % folder)
            continue
        check_topic(folder, problems)
    for p in problems:
        print(p)
    print("%d topic folder(s) checked, %d problem(s)" % (len(folders), len(problems)))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
