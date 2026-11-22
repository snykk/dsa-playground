# Contributing Guidelines

Thank you for your interest in contributing to the **Data Structures & Algorithms (DSA) Playground** repository. This document explains how to propose a change and what a good change looks like.

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md). Report a security problem privately, as [SECURITY.md](SECURITY.md) describes, never in a public issue.

## How to Contribute

Contributions of all kinds are welcome:

- **Report bugs**: found a wrong result or a broken page? Open an issue.
- **Suggest features**: a missing topic, a new visualization, a site improvement.
- **Improve documentation**: clearer explanations, fixed facts, better diagrams.
- **Add implementations**: a missing topic, or a missing language for an existing one.
- **Add test cases**: edge cases and error cases that are not covered yet.
- **Fix issues**: bugs and code quality.

## Contribution Process

Branch and commit conventions are the maintainer's, written down in [RELEASING.md](RELEASING.md). Follow them in your pull request.

### 1. Fork and clone (outside contributors)

Click "Fork" on the repository page, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/dsa-playground.git
cd dsa-playground
```

### 2. Create a branch

Start from an up-to-date `master` and give the branch one clear piece of work. Name it for what is true once the change lands:

```bash
git switch -c fix/a-splay-tree-search-miss-returns-none
```

Prefixes: `feat/` (new topic, visualization or feature), `fix/` (bug fix), `docs/` (documentation only), `chore/` (maintenance), `ci/` (workflows).

### 3. Make your changes

- Write clean, readable code in the style of the folder you are editing.
- Comment the why, not the what.
- Add or update tests with the code.
- Update the READMEs in the same change when behaviour or facts change.

### 4. Test your changes

```bash
make test                # Python, Go and C++ together
make test-python         # or one language at a time
make test-go
make test-cpp
python3 scripts/check_readme_style.py "<topic or category folder>"   # when a README changed (or --all)
make test-web            # when the web site changes (needs Node)
```

To run one topic by hand, use the commands in its language README ("How to Run").

### 5. Commit

A commit title reads `type: <what is true afterwards>`, with no scope. Types: `feat`, `fix`, `docs`, `chore`, `ci`, `build`, `refactor`, `test`. Add a short body when the reason is not obvious.

```bash
git add <the files you changed>
git commit -m "fix: a splay tree search miss returns None, and delete keeps the tree intact"
```

### 6. Push and open a pull request

```bash
git push origin <your-branch>
```

Open a pull request against `master`. Describe what changed and why, list the checks you ran, and link any related issue. The maintainer merges accepted pull requests into the next release branch, and releases follow [RELEASING.md](RELEASING.md).

## Project Structure

### Directory Structure

```text
dsa-playground/
  Data_Structures/       Linear/, Non_Linear/, Hashing/, Advanced_Structures/
  Algorithms/            Sorting/, Searching/, Graph_Algorithms/, Dynamic_Programming/, ...
  Problem_Patterns/      two pointers, sliding window, prefix sums, ...
  Complexity_Analysis/   Time_Complexity/, Space_Complexity/, Amortized_Analysis/
  Utilities/             Optimization_Techniques/, Problem_Types/, Templates/
  web/                   the Astro site (articles, visualizations, tests)
  scripts/               test runners and check_readme_style.py
  Makefile               make test and the other targets
  README.md  STUDY_GUIDE.md  CONTRIBUTING.md  RELEASING.md  CHANGELOG.md
  CODE_OF_CONDUCT.md  SECURITY.md  LICENSE
```

Every topic folder has the same layout, for example `Algorithms/Sorting/Quick_Sort/`:

```text
Quick_Sort/
  README.md                topic README
  Python/
    quick_sort.py
    quick_sort_test.py
    README.md
  C++/
    quick_sort.cpp
    quick_sort_test.cpp
    README.md
  Go/
    main.go
    main_test.go
    go.mod
    README.md
```

Folders that group topics (for example `Algorithms/Sorting/`) have only a category README and sub-folders.

### Folder Names

Every content folder is named in `Title_Case_With_Underscores`, ASCII only: no spaces, apostrophes, parentheses, `&`, `+` or other symbols. Examples: `Binary_Search_Tree`, `Dijkstras_Algorithm`, `B_Plus_Tree`, `Divide_and_Conquer`. The language folders are always `Python/`, `C++/` and `Go/`.

Each topic has exactly one folder. When a topic belongs to two areas (for example Kruskal's algorithm, which is both greedy and a graph algorithm), it lives in the area where readers look for it first, and the other area's overview links to it.

### Required Files for Each Topic

1. **Implementation** in each language folder (`*.py`, `*.cpp`, `main.go`)
2. **Test file** next to it (`*_test.py`, `*_test.cpp`, `main_test.go`)
3. **Language README** in each language folder
4. **Topic README** in the topic folder

## Coding Standards

### Python

- Follow PEP 8 style guide
- Use type hints where appropriate
- Include docstrings for classes and functions
- Use meaningful variable names

**Example:**
```python
class BinarySearchTree:
    """Binary Search Tree implementation.
    
    A BST is a binary tree where:
    - Left subtree contains nodes with values < root
    - Right subtree contains nodes with values > root
    """
    
    def __init__(self):
        """Initialize an empty BST."""
        self.root = None
    
    def insert(self, value: int) -> None:
        """Insert a value into the BST.
        
        Args:
            value: The value to insert
        """
        # Implementation
```

### C++

- Follow Google C++ Style Guide
- Use meaningful variable and function names
- Include comments for complex logic
- Use `const` where appropriate

**Example:**
```cpp
class BinarySearchTree {
private:
    Node* root;

public:
    BinarySearchTree() : root(nullptr) {}
    
    void insert(int value);
    bool search(int value) const;
};
```

### Go

- Follow Go Code Review Comments
- Use meaningful names
- Include comments for exported functions
- Keep functions small and focused

**Example:**
```go
// BinarySearchTree represents a binary search tree
type BinarySearchTree struct {
    root *Node
}

// NewBinarySearchTree creates a new empty BST
func NewBinarySearchTree() *BinarySearchTree {
    return &BinarySearchTree{root: nil}
}

// Insert adds a value to the BST
func (bst *BinarySearchTree) Insert(value int) {
    // Implementation
}
```

## Documentation Standards

### README.md Structure

Every topic folder has a **topic README** (the explanation) and one **language README** per language folder (that implementation and how to run it). The web site has its own, richer article for each topic; the READMEs are the GitHub-side documentation and must stand on their own.

Rules for every README:

- Plain headings and lists: no emoji, no check / cross marks (write "Yes" / "No", or put pros and cons under their own headings).
- Facts must match the code in the folder (variant, tie-breaking, API, what each language does differently). If a change alters behaviour, update the README in the same change.
- No "Last Updated" stamps; git history has the date.
- Diagrams are ASCII art inside a ` ```text ` block.

**Topic README** (`<Topic>/README.md`), sections in this order:

1. `# <Topic name>`, then one short paragraph: what it is, the problem it solves, its headline complexity.
2. `## Intuition` - the idea in plain words (an analogy if it helps) and the invariant that makes it correct.
3. `## Visual` - an ASCII diagram of the structure or of one step.
4. `## How It Works` (algorithms) or `## Operations` (data structures) - numbered steps, or one subsection per operation.
5. `## Step-by-Step Trace` - a small input traced to the answer (a table or a short list).
6. `## Complexity` - time and space per case or per operation, and *why* (the recurrence, the amortized argument).
7. `## When to Use` - when it is the right tool, and when it is not.
8. `## <Topic> vs. <Alternatives>` - a short comparison table.
9. `## Common Pitfalls` - the bugs people actually write (off-by-one, overflow, empty input, duplicates, ...).
10. `## Implementations` - a table: language, folder, main file, notes on how the languages differ.
11. `## Practice Problems` - three to six problems with links.
12. `## Related` - links to related topic folders.

Theory topics (for example Big-O notation) may call section 4 `## Definition`; the other sections still apply.

**Language README** (`<Topic>/<Language>/README.md`):

1. `# <Topic> -- <Language> Implementation`
2. `## Files` - each file and what it contains.
3. `## API` - the public functions and types, one line each.
4. `## <Language>-Specific Notes` - idioms, memory handling, overflow, differences from the other languages.
5. `## How to Run` - the exact commands for the tests (and the demo, if there is one).
6. `## Key Takeaways` - two to four bullets.

**Category README** (a folder that groups topics, for example `Algorithms/Sorting/README.md`). It is the GitHub-side twin of the category's overview on the web site, `web/src/content/categories/<name>.mdx`, and says the same things more briefly. Sections, in this order:

1. `# <Category name>`, exactly the title the site shows, then a one-paragraph lead: what the topics share and what separates them.
2. `## Topics` - a table in reading order: `#`, the linked topic or sub-category, what it adds (one line), and its level (or "N topics" for a sub-category). Every sub-folder that is a topic or has a README must be linked.
3. `## How They Compare` - one comparison table, usually complexity. For a category of sub-categories, compare the sub-areas instead and add `## Where to Start`.
4. `## Choosing One` - situation, choice and reason, when the topics are alternatives to each other.
5. `## Common Pitfalls` - three to five bullets.
6. `## Related` - linked prerequisites ("read first") and related folders.

Category READMEs are ASCII only (write `n^2`, `<=`, `sigma`, `Omega`).

Check a folder with `python3 scripts/check_readme_style.py "<topic or category folder>"` (or `--all`). For a topic, it checks the topic README and its language READMEs. For a category, it checks:
- ASCII only, and no emoji;
- the `## Topics` section;
- a link to every sub-folder;
- that every relative link resolves.

### Code Comments

- Explain **why**, not **what**
- Use comments for complex algorithms
- Keep comments up-to-date with code
- Remove commented-out code before submitting

## Testing Requirements

### Test Coverage

- Include tests for all public methods
- Test edge cases (empty structures, single element, etc.)
- Test error cases (invalid inputs, etc.)
- Use descriptive test names

**Python Example:**
```python
def test_insert_empty_tree(self):
    """Test inserting into an empty BST."""
    bst = BinarySearchTree()
    bst.insert(5)
    self.assertEqual(bst.root.value, 5)

def test_insert_multiple_values(self):
    """Test inserting multiple values."""
    bst = BinarySearchTree()
    bst.insert(5)
    bst.insert(3)
    bst.insert(7)
    self.assertTrue(bst.search(3))
    self.assertTrue(bst.search(7))
```

**C++ Example:**
```cpp
void test_insert_empty_tree() {
    BinarySearchTree bst;
    bst.insert(5);
    assert(bst.search(5) == true);
}
```

**Go Example:**
```go
func TestInsertEmptyTree(t *testing.T) {
    bst := NewBinarySearchTree()
    bst.Insert(5)
    if !bst.Search(5) {
        t.Error("Expected value 5 to be found")
    }
}
```

## Adding a Topic

A topic is a folder with code and tests in Python, C++ and Go and its READMEs, a page on the site with an article and a visualization, and an entry in every list of topics. Work through this checklist in order. Each item names the check that enforces it and the command that runs that check; an item that no check enforces says so, and the reviewer looks at it by hand. Run the web commands in `web/`, after `npm ci` with Node 22. The [pull request template](.github/PULL_REQUEST_TEMPLATE.md) repeats the short form of this list.

### Folder and code

- [ ] **It is not here yet.** Search the repository and the topic lists in [README.md](README.md) and [STUDY_GUIDE.md](STUDY_GUIDE.md); the topic may be part of a broader one. No check.
- [ ] **One folder, where readers look for it first**: `<Area>/<Category>/<Topic_Name>/`, named as [Folder Names](#folder-names) says, with `Python/`, `C++/` and `Go/` inside. A folder with a language folder in it is a topic to every check below. Its page address comes from its path (`Dijkstras_Algorithm` becomes `dijkstras-algorithm`); an address that two folders share stops the site's repository scan in `web/src/lib/repo.ts`, so `npx vitest run` and `npm run build` fail.
- [ ] **Python, the reference implementation**: `Python/<topic_name>.py` and `Python/<topic_name>_test.py`, a `unittest` file that imports the implementation by its module name. `make test-python` finds every `*_test.py` and runs `python3 -m unittest <module>` in the file's own folder, with a limit of 120 seconds per file ([scripts/run_one_python_test.sh](scripts/run_one_python_test.sh)).
- [ ] **C++**: `C++/<topic_name>.cpp` and `C++/<topic_name>_test.cpp`. `make test-cpp` compiles each `*_test.cpp` alone, in its folder, with `g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD`, and runs it with a limit of 120 seconds ([scripts/run_one_cpp_test.sh](scripts/run_one_cpp_test.sh)). So the test includes the implementation (`#include "<topic_name>.cpp"`, or a header), a demo `main()` in the implementation sits inside `#ifndef IS_TEST_BUILD`, and a failed check exits with a non-zero status (a failed `assert` does). CI runs the same tests again under AddressSanitizer and UndefinedBehaviorSanitizer.
- [ ] **Go**: `Go/main.go`, `Go/main_test.go` and the module's own `Go/go.mod`, which asks for Go 1.24 at most, the version CI installs. `make test-go` runs `go test ./...` in every folder with a `go.mod` ([scripts/run_one_go_module.sh](scripts/run_one_go_module.sh)).
- [ ] **Tests** for every public operation, for edge cases (empty input, one element, duplicates) and for error cases, as [Testing Requirements](#testing-requirements) describes. C++ and Go implement at least the topic's core operations and agree with Python on them. `make test` runs all three languages; whether the cases are enough is up to the reviewer.

### READMEs

- [ ] **The topic README**, `<Topic_Name>/README.md`, with the sections of the [topic template](#readmemd-structure) in order, and facts that match the code. `python3 scripts/check_readme_style.py "<topic folder>"` requires the `# <Topic name>` title and every section from Intuition to Related, and rejects emoji and a "Last Updated" stamp. Whether the facts match the code is up to the reviewer.
- [ ] **A language README** in each language folder, titled `# <Topic> -- <Language> Implementation`. The same command requires that title and the Files, API and How to Run sections; Language-Specific Notes and Key Takeaways complete the template.
- [ ] **The category README** lists the topic in its `## Topics` table, in reading order, with what it adds and its level. `python3 scripts/check_readme_style.py "<category folder>"` fails when a sub-folder is not linked or a relative link does not resolve, and on any character that is not ASCII.
- [ ] **The counts.** The number of topics appears in [README.md](README.md) (the total and the area table), in the area and category READMEs and overviews, and in each phase of the study guide. No check finds a stale count: search for the old number.

### The article

- [ ] **The file** `web/src/content/articles/<slug>.mdx`, named after the folder: its slug, with the parent folder's slug in front only when another topic folder has the same name. Checked by `web/src/content/articles.test.ts` (`npx vitest run src/content/articles.test.ts`, test "names every page after its folder").
- [ ] **The front matter**: `topic` (the folder), `title`, `lead` (one or two sentences, at most 360 characters), `level` (`Beginner`, `Intermediate` or `Advanced`), `updated`, `facts` (2 to 6), and, when they apply, `properties` (yes or no, such as Stable), `prerequisites` and `related` (existing folders). The schema is `articleSchema` in `web/src/lib/article.ts`; `articles.test.ts` and `npm run build` (the content collection in `web/src/content.config.ts`) both check it, and `articles.test.ts` checks that every folder named exists.
- [ ] **The body**: at least six `##` sections in the order [web/README.md](web/README.md#topic-articles) gives, an Implementation section, `<TopicCode topic="<topic folder>" />` for the topic's own code, the visualization as `<ArticleViz ids={['<id>']} />`, and only the components registered in `web/src/components/mdxNames.ts`. ASCII only (entities such as `&le;` in prose), no `{` in prose, no horizontal rule and no `#` heading. All checked by `articles.test.ts`. Every claim must match the code; that is up to the reviewer.
- [ ] **Practice problems**: a `## Practice problems` section with at most a one-line paragraph, then one `<PracticeProblems problems={[ { name, site, url, idea }, ... ]} />` with 3 to 5 problems. `name` is the judge's own title, `site` the judge and the problem's number or id (`LeetCode 912`, `CSES 1068`, `Codeforces 118E`), `url` the problem's https page on a judge in `PRACTICE_JUDGES` (`web/src/lib/practice.ts`) without query parameters, `idea` one clause on what the problem practises; no problem twice. Checked by `web/src/lib/practice.test.ts` (`npx vitest run src/lib/practice.test.ts`). A topic that no judge has a problem for is added to `NO_JUDGE_PROBLEMS` in that test with the reason, and its README keeps exercises instead. Whether each problem still exists on its judge under that name and number, and is not premium, is checked by `python3 scripts/check_practice_links.py` (`--judge leetcode` and so on for one judge), which [a weekly workflow](.github/workflows/practice-links.yml) also runs.

### The visualization

- [ ] **A tracer**, `web/src/viz/algorithms/<name>.ts`, that returns one frame per step, each with a caption that says why the step happens, and its test `<name>.test.ts` against a brute force or a reference implementation (`npx vitest run src/viz/algorithms/<name>.test.ts`).
- [ ] **A renderer**: reuse one in `web/src/viz/renderers/`, or add one built from the atoms and molecules in `web/src/viz/ui/`. `npx astro check` type-checks it; the look is up to the reviewer.
- [ ] **A spec** in `web/src/viz/specs/`: the parser, the tracer, the renderer, the examples, a random input, the legend and the pseudocode, whose lines match the `line` indices the tracer emits.
- [ ] **The catalog entry** in the area's file in `web/src/viz/registry/`: `id`, `title`, `group` (one of `VIZ_GROUP_ORDER` in `web/src/viz/catalog.ts`), `blurb` and `topics`, the home topic folder first and then every other article or category overview that embeds the visualization, plus a loader. `web/src/viz/catalog.test.ts` checks unique ids, a loader for each entry, existing folders, that `topics` names exactly the pages whose `<ArticleViz>` embeds it, and runs every example and 25 random inputs through the tracer, checking captions and pseudocode lines.
- [ ] **Golden fixtures**, when the tracer re-implements the Python code: a generator `web/scripts/gen_<area>_fixtures.py` (or a new case in an existing one) runs the Python implementation on fixed inputs and writes `web/src/viz/algorithms/__fixtures__/<area>.json`, and the tracer's test must reproduce every value. CI runs every generator (`for script in web/scripts/gen_*_fixtures.py; do python3 "$script"; done`) and fails if any fixture changes.

### Lists and overviews

- [ ] **The category overview**, `web/src/content/categories/<category>.mdx`, when the category has one: the folder in `contents`, in reading order. `articles.test.ts` fails unless `contents` names every sub-folder exactly once.
- [ ] **The study guide**: the topic in its phase and section of [STUDY_GUIDE.md](STUDY_GUIDE.md), with its level, and at the same place in the matching `<TopicList>` of `web/src/content/pages/study-guide.mdx`. `articles.test.ts` fails when the page misses a topic or lists one twice, and when the page and STUDY_GUIDE.md list the topics in a different order.

### Before the pull request

- [ ] **The web checks**, in `web/`: `npx vitest run` (every unit test above), `npx astro check` (types) and `npm run build`, whose output must have no `[broken-link]` line (a README link that resolves nowhere). `make test-web` runs the three; CI's web job runs them and the fixture generators.
- [ ] **ASCII only** in every file you add. `articles.test.ts` rejects any other character in an MDX page and `check_readme_style.py` in a category README; for the other files, `perl -ne 'print "$ARGV:$.: $_" if /[^\x00-\x7F]/; close ARGV if eof' <files>` prints every line that has one. The site's TypeScript writes symbols as escapes ([web/README.md](web/README.md#conventions)).
- [ ] **A CHANGELOG entry** under `## Unreleased` in [CHANGELOG.md](CHANGELOG.md), under `### Added`, written for a reader in the format [RELEASING.md](RELEASING.md) describes: `- **What is new**: one line a reader can act on, then the detail.` No check; the release moves it into the version's section.
- [ ] **The whole suite**: `make test`, `python3 scripts/check_readme_style.py --all` and `make test-web`. CI runs them on every pull request, with the C++ tests again under the sanitizers and the fixture generators.
- [ ] **The pull request**: commit titles read `type: <what is true afterwards>`, the branch is up to date with `master`, comments explain why and no code is commented out. No check; the reviewer reads them.

## Code Review Process

1. **Automated checks**: CI runs the Python, Go and C++ tests (C++ also under sanitizers), checks the READMEs and links, and builds the site.
2. **Review**: the maintainer reads the change and may ask for edits.
3. **Merge**: an approved pull request goes into the next release branch.

### What Reviewers Look For

- Correctness
- Style and consistency with the surrounding code
- Test coverage, including edge cases
- Documentation that matches the code
- Performance where it matters

## Reporting Bugs and Requesting Topics

Open an issue with one of the [issue forms](https://github.com/snykk/dsa-playground/issues/new/choose), kept in [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/):

- **Bug report**: wrong output, a crash or a failing test in the Python, C++ or Go code, or something broken on the site or in a visualization.
- **Content error**: a wrong statement in a README or an article. Running the code is the best evidence.
- **Topic request**: a data structure, algorithm or pattern to add, where it belongs and why.

For anything else, open a blank issue.

## Documentation Contributions

Documentation fixes are welcome: typos, unclear explanations, wrong facts, more examples, better diagrams. Follow the README templates above.

## Learning Resources

If you're new to contributing:

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Code Review Guidelines](https://google.github.io/eng-practices/review/)

## Questions?

If you have questions:

- Open an issue with the `question` label
- Check existing issues
- Read [README.md](README.md) for project information

## Recognition

Contributions are credited in the git history and named in the release notes of the release that ships them.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

**Thank you for contributing to DSA Playground.**
