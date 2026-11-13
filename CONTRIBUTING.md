# Contributing Guidelines

Thank you for your interest in contributing to the **Data Structures & Algorithms (DSA) Playground** repository. This document explains how to propose a change and what a good change looks like.

---

## How to Contribute

Contributions of all kinds are welcome:

- **Report bugs**: found a wrong result or a broken page? Open an issue.
- **Suggest features**: a missing topic, a new visualization, a site improvement.
- **Improve documentation**: clearer explanations, fixed facts, better diagrams.
- **Add implementations**: a missing topic, or a missing language for an existing one.
- **Add test cases**: edge cases and error cases that are not covered yet.
- **Fix issues**: bugs and code quality.

---

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

---

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
  README.md  STUDY_GUIDE.md  CONTRIBUTING.md  RELEASING.md  CHANGELOG.md  LICENSE
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

---

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

---

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

---

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

---

## Implementation Checklist

Before opening a pull request, check that:

- [ ] the code follows the coding standards
- [ ] `make test` passes (and `make test-web` if the site changed)
- [ ] `python3 scripts/check_readme_style.py` passes for every README you touched
- [ ] the READMEs match the code
- [ ] comments explain why, with no commented-out code
- [ ] commit titles read `type: <what is true afterwards>`
- [ ] the branch is up to date with `master`

---

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

---

## Adding a New Data Structure or Algorithm

1. **Check it is not already there.** Search the repository, and see the topic lists in [README.md](README.md) and [STUDY_GUIDE.md](STUDY_GUIDE.md).

2. **Create the folder** in the area where readers look for it first (see Folder Names):

   ```text
   Data_Structures/Non_Linear/Trees/Your_Topic/
     README.md
     Python/
     C++/
     Go/
   ```

3. **Implement it in all three languages**, each with a test file covering every operation, edge cases and error cases.

4. **Write the documentation**: the topic README and a README in each language folder, following the templates above.

5. **Link it**: add it to the category README's `## Topics` table, and to the study guide if it belongs in a phase.

6. **Check and submit**: run `make test` and `python3 scripts/check_readme_style.py "<your topic folder>"`, then open the pull request.

---

## Reporting Bugs

### Bug Report Template

````markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Run '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment:**
- Language: [Python/C++/Go]
- Version: [e.g. Python 3.9]
- OS: [e.g. Windows 10]

**Code Example**
```python
# Minimal code to reproduce
```

**Additional context**
Any other relevant information.
````

---

## Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Why is this feature useful? What problem does it solve?

**Proposed Implementation**
How would you implement this? (Optional)

**Alternatives**
Any alternative solutions you've considered.

**Additional Context**
Any other relevant information.
```

---

## Documentation Contributions

Documentation fixes are welcome: typos, unclear explanations, wrong facts, more examples, better diagrams. Follow the README templates above.

---

## Learning Resources

If you're new to contributing:

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Code Review Guidelines](https://google.github.io/eng-practices/review/)

---

## Questions?

If you have questions:

- Open an issue with the `question` label
- Check existing issues
- Read [README.md](README.md) for project information

---

## Recognition

Contributions are credited in the git history and named in the release notes of the release that ships them.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to DSA Playground.**
