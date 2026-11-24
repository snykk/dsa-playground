# Releasing dsa-playground

Every change reaches `master` through a release branch and a pull request that the maintainer reviews and merges on GitHub. Nothing is pushed to `master` directly, and a published tag is never moved.

## Branches

- A branch starts from `origin/master` and holds one clear piece of work, usually four to ten commits. Its name says what is true once it lands, for example `fix/the-python-tests-no-longer-hang` or `feat/category-pages-as-articles`. Prefixes: `feat/`, `fix/`, `docs/`, `chore/`, `ci/`.
- When a branch needs another branch that is not released yet, it merges that branch in: `git merge --no-ff <dependency>`, with the message `Merge branch '<dependency>' into <branch>`. Merge only direct dependencies. Do not start a branch at another branch's tip.
- Commit titles read `type: <what is true afterwards>`, with no scope. For example: `fix: a splay tree search miss returns None, and delete keeps the tree intact`. Types: `feat`, `fix`, `docs`, `chore`, `ci`, `build`, `refactor`, `test`.

## A release, step by step

1. Create the release branch from `origin/master`:

   ```text
   git fetch origin
   git switch -c release/vX.Y.Z origin/master
   ```

2. Merge every finished branch with `--no-ff`, dependencies first. Git's default message is the right one: `Merge branch 'feat/x' into release/vX.Y.Z`.

3. Close the release on its branch:
   - if the release changes something README.md states, update README.md;
   - add the commit `docs: record vX.Y.Z in the changelog`. It adds a section `## [vX.Y.Z] - YYYY-MM-DD` under `## Unreleased` in CHANGELOG.md, moving into it anything listed under Unreleased, and the footer link `[vX.Y.Z]: https://github.com/snykk/dsa-playground/compare/vW...vX.Y.Z`, the compare view from the previous version's tag `vW` (it works once the tag is pushed). The section follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

     ```text
     ## [vX.Y.Z] - YYYY-MM-DD

     One sentence: what the release is about.

     ### Added
     - **What is new**: one line a reader can act on, then the detail. ([abc1234](https://github.com/snykk/dsa-playground/commit/<full hash>))

     ### Changed
     ### Removed
     ### Fixed
     ```

     Use only the headings the release needs, in Keep a Changelog's order: Added, Changed, Deprecated, Removed, Fixed, Security. Write each entry for someone using the repository or the site, not as a list of commits, and end it with a link to each commit that made it, shown by its short hash. Write the whole URL: GitHub does not turn a bare hash into a link inside a Markdown file. The branches are merged with merge commits, so the hashes stay valid on `master`. Sections before v0.9.0 have no commit links; their footer links still show every commit of the version.

4. Check everything locally:

   ```text
   make test
   python3 scripts/check_readme_style.py --all
   cd web && npm test && npm run check && npm run build    # the build output must have no [broken-link]
   ```

5. Push the merged branches and the release branch. Then open a pull request from `release/vX.Y.Z` to `master`, titled `Merge branch 'release/vX.Y.Z'`. CI runs on the release branch and on the pull request.

6. The maintainer reviews the pull request and merges it on GitHub with **Create a merge commit**. GitHub titles that commit after the pull request and its number, `Merge branch 'release/vX.Y.Z' (#N)`, and leaves its body empty. Squash or rebase would flatten the branches the release is made of.

7. Once CI is green on the merge commit on `master`, tag that commit and push the tag. The tag message states the release's scope in a few lines, with no history:

   ```text
   git fetch origin
   git tag -a vX.Y.Z -m "<what the release contains>" origin/master
   git push origin vX.Y.Z
   ```

8. The release workflow (`.github/workflows/release.yml`) checks the tag and publishes the GitHub Release, with the CHANGELOG section as its notes. It publishes only when:
   - the tag is annotated;
   - its message says more than its version;
   - CHANGELOG.md links it;
   - it is on master's first-parent line;
   - CI passed on its commit.

   If a check fails because CI has not finished or the section is missing, fix that on `master`, then run `gh workflow run release.yml -f tag=vX.Y.Z`.

## Versions

Versions follow SemVer with a `v` prefix. Before v1.0.0:
- a minor version (`v0.3.0`) adds topics, visualizations or site features;
- a patch version (`v0.2.1`) only fixes.

## If a release goes out wrong

A published tag is never moved or deleted, because others may already have fetched it. A wrong release is fixed by a patch release with its own changelog section.

Release notes are not part of the tag. To correct a published version's notes, fix its CHANGELOG section on `master` through a pull request, then run `gh workflow run release.yml -f tag=vX.Y.Z`: a dispatch reads the CHANGELOG on `master` and replaces that release's notes, and the tag stays where it is.

## Repository settings

- Pull requests: allow merge commits only. The default merge commit title is the pull request title (GitHub appends ` (#N)`), with an empty message.
- `master`: protect it once the repository is public, requiring a pull request and green CI. On a private repository, branch protection needs GitHub Pro.
