# Security Policy

DSA Playground has two parts:

- implementations of data structures and algorithms in Python, C++ and Go, written to teach;
- a static site built from them, [snykk.github.io/dsa-playground](https://snykk.github.io/dsa-playground/).

The site has no server and no accounts. It keeps nothing about its readers except what it stores in their own browser: the chosen theme and the study guide's ticks.

## Supported Versions

Fixes go to `master` and ship in the next release. Older releases are not patched.

| Version | Supported |
|---------|-----------|
| The [latest release](https://github.com/snykk/dsa-playground/releases/latest) and `master` | Yes |
| Older releases | No |

## Reporting a Vulnerability

Report it privately. Do not open a public issue, pull request or discussion.

- **Preferred**: GitHub's private vulnerability reporting. In the repository, open the Security tab, then select "Report a vulnerability", or go straight to [the form](https://github.com/snykk/dsa-playground/security/advisories/new).
- **Or by email**: write to [najibfikri26@gmail.com](mailto:najibfikri26@gmail.com), with `dsa-playground security` in the subject.

Include:

- what is affected: a page, a workflow or a file;
- how to reproduce it: a URL, an input or the steps;
- what an attacker gains;
- the release or the commit you tested.

A single maintainer reads the reports. You can expect:

1. an acknowledgement within 7 days;
2. an assessment. If the report is confirmed, a fix follows in a patch release, credited to you in CHANGELOG.md and in the advisory unless you ask not to be named;
3. a request to keep the report private until the fix is released, or for 90 days after your report, whichever comes first.

## Scope

**In scope:**

- **The site:**
  - script or HTML injection, for example through the search results, through the URL parameters a page reads (`?input=`, `?viz=`, `?step=`, `?theme=`), or through rendered README content;
  - anything that makes a page load or run content from another origin.
- **The build and release pipeline:**
  - the GitHub Actions workflows in `.github/workflows`, for example a way for a pull request to run code with write permissions or to read a secret;
  - the build scripts.
- **Dependencies**: a known vulnerability in a dependency, when it can be reached through this repository's site or build.

**Out of scope.** Report these as a normal issue, or not at all:

- **Bugs in the implementations**: wrong results, crashes, or very slow cases. Use the bug report form.
- **Using the implementations in production.** They are written to be read:
  - they are not hardened against hostile input;
  - they are not constant-time;
  - their hash functions are not cryptographic.

  Using them in a security-sensitive system is outside this policy.
- **Scanner output** that shows no concrete impact.
- **Missing HTTP security headers**, which GitHub Pages controls, and vulnerabilities in GitHub Pages or GitHub itself.
