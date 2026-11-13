# Contributing Guidelines

Thank you for your interest in contributing to the **Data Structures & Algorithms (DSA) Playground** repository! This document provides guidelines and instructions for contributing.

---

## 🤝 How to Contribute

We welcome contributions of all kinds! Here are some ways you can help:

- 🐛 **Report Bugs**: Found an issue? Let us know!
- 💡 **Suggest Features**: Have an idea? Share it!
- 📝 **Improve Documentation**: Help make our docs better
- 💻 **Add Implementations**: Implement missing data structures or algorithms
- ✅ **Add Test Cases**: Improve test coverage
- 🔧 **Fix Issues**: Help fix bugs and improve code quality

---

## 📋 Contribution Process

### 1. Fork the Repository

1. Click the "Fork" button on the top right of the repository page
2. This creates a copy of the repository in your GitHub account

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/dsa-playground.git
cd dsa-playground
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch Naming Convention:**
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation updates
- `test/` - for adding tests
- `refactor/` - for code refactoring

### 4. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Include test cases
- Update documentation if needed

### 5. Test Your Changes

Make sure your code works correctly:

**Python:**
```bash
python data_structure_test.py
```

**C++:**
```bash
g++ -o test data_structure_test.cpp && ./test
```

**Go:**
```bash
go test
```

### 6. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add Binary Search Tree implementation

- Add BST implementation in Python, C++, and Go
- Include insert, search, delete operations
- Add comprehensive test cases
- Update README with usage examples"
```

**Commit Message Format:**
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation changes
- `test:` - adding tests
- `refactor:` - code refactoring
- `chore:` - maintenance tasks

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template
5. Submit the pull request

---

## 📁 Project Structure

### Directory Structure

```
dsa-playground/
├── Data Structures/
│   ├── Linear/
│   │   ├── Array/
│   │   │   ├── Python/
│   │   │   │   ├── array.py
│   │   │   │   ├── array_test.py
│   │   │   │   └── README.md
│   │   │   ├── C++/
│   │   │   │   ├── array.cpp
│   │   │   │   ├── array_test.cpp
│   │   │   │   └── README.md
│   │   │   ├── Go/
│   │   │   │   ├── main.go
│   │   │   │   ├── main_test.go
│   │   │   │   ├── go.mod
│   │   │   │   └── README.md
│   │   │   └── README.md
│   │   └── ...
│   └── Non_Linear/
│       └── ...
└── Algorithms/
    └── ...
```

### Required Files for Each Implementation

Each data structure/algorithm implementation must include:

1. **Implementation File** (`*.py`, `*.cpp`, `*.go`)
2. **Test File** (`*_test.py`, `*_test.cpp`, `*_test.go`)
3. **README.md** - Documentation for the specific language
4. **Main README.md** - Overview documentation in the parent folder

---

## 💻 Coding Standards

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

## 📝 Documentation Standards

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

Check a folder with `python3 scripts/check_readme_style.py "<topic folder>"` (or `--all`).

### Code Comments

- Explain **why**, not **what**
- Use comments for complex algorithms
- Keep comments up-to-date with code
- Remove commented-out code before submitting

---

## ✅ Testing Requirements

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

## 🎯 Implementation Checklist

Before submitting, ensure:

- [ ] Code follows the coding standards
- [ ] All tests pass
- [ ] Documentation is complete and accurate
- [ ] README.md files are updated
- [ ] Code is properly commented
- [ ] No linter errors
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up-to-date with main/master

---

## 🔍 Code Review Process

1. **Automated Checks**: Your PR will be checked by automated tools
2. **Review**: Maintainers will review your code
3. **Feedback**: You may receive feedback or requested changes
4. **Approval**: Once approved, your PR will be merged

### What Reviewers Look For

- ✅ Code correctness and functionality
- ✅ Code style and consistency
- ✅ Test coverage
- ✅ Documentation quality
- ✅ Performance considerations
- ✅ Edge case handling

---

## 📚 Adding New Data Structures/Algorithms

### Step-by-Step Guide

1. **Check if it's already implemented**
   - Search the repository
   - Check the progress checklist in README.md

2. **Create the folder structure**
   ```
   Data Structures/Non_Linear/Trees/Your Data Structure/
   ├── Python/
   ├── C++/
   ├── Go/
   └── README.md
   ```

3. **Implement in all three languages**
   - Python
   - C++
   - Go

4. **Add comprehensive tests**
   - Test all operations
   - Test edge cases
   - Test error handling

5. **Write documentation**
   - Main README.md (overview)
   - Language-specific README.md files
   - Code comments

6. **Update main README.md**
   - Add to progress checklist
   - Update progress percentages

7. **Submit PR**
   - Follow the PR template
   - Link any related issues

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
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
```

---

## 💡 Suggesting Features

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

## 📖 Documentation Contributions

We welcome documentation improvements:

- Fix typos and grammar
- Improve clarity
- Add more examples
- Add visual diagrams
- Translate documentation (if applicable)

---

## 🎓 Learning Resources

If you're new to contributing:

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Code Review Guidelines](https://google.github.io/eng-practices/review/)

---

## ❓ Questions?

If you have questions:

- Open an issue with the `question` label
- Check existing issues and discussions
- Review the README.md for project information

---

## 🙏 Recognition

Contributors will be:

- Listed in the README.md (if desired)
- Credited in commit messages
- Acknowledged in release notes

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to DSA Playground! 🚀**

Every contribution, no matter how small, helps make this repository better for everyone.

