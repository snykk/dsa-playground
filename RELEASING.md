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
   - add the commit `docs: record vX.Y.Z in the changelog`. It puts a section `## [vX.Y.Z] - YYYY-MM-DD` at the top of CHANGELOG.md, saying what the release contains, and adds the footer link `[vX.Y.Z]: https://github.com/snykk/dsa-playground/releases/tag/vX.Y.Z`.

4. Check everything locally:

   ```text
   make test
   python3 scripts/check_readme_style.py --all
   cd web && npm test && npm run check && npm run build    # the build output must have no [broken-link]
   ```

5. Push the merged branches and the release branch, then open a pull request from `release/vX.Y.Z` to `master`. CI runs on the release branch and on the pull request.

6. The maintainer reviews the pull request and merges it on GitHub with **Create a merge commit**. Squash or rebase would flatten the branches the release is made of.

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

## Repository settings

- Pull requests: allow merge commits only.
- `master`: protect it once the repository is public, requiring a pull request and green CI. On a private repository, branch protection needs GitHub Pro.
