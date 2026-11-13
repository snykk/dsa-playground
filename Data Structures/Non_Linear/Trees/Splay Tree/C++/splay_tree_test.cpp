/**
 * Test cases for Splay Tree (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <cstdlib>
#include <map>
#include <type_traits>
#include "splay_tree.cpp"

void testInsertAndSearch() {
    SplayTree tree;
    tree.insert(10, "ten");
    tree.insert(5, "five");
    tree.insert(15, "fifteen");
    
    assert(tree.search(10) == "ten");
    assert(tree.search(5) == "five");
    assert(tree.search(15) == "fifteen");
    assert(tree.search(20).empty());
    
    std::cout << "Insert and Search test passed" << std::endl;
}

void testSplayOperation() {
    SplayTree tree;
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);

    tree.search(20);
    assert(tree.rootKey() == 20);
    tree.search(40);
    assert(tree.rootKey() == 40);

    std::cout << "Splay operation test passed" << std::endl;
}

void testDelete() {
    SplayTree tree;
    const int keys[] = {10, 5, 15, 3, 7};
    for (int k : keys) tree.insert(k, "v" + std::to_string(k));

    assert(tree.remove(3) == true);
    assert((tree.inorderTraversal() == std::vector<int>{5, 7, 10, 15}));

    assert(tree.remove(5) == true);
    assert((tree.inorderTraversal() == std::vector<int>{7, 10, 15}));

    assert(tree.remove(10) == true);
    assert((tree.inorderTraversal() == std::vector<int>{7, 15}));
    assert(tree.search(7) == "v7");
    assert(tree.search(15) == "v15");

    assert(tree.remove(100) == false);
    assert(tree.size() == 2);

    std::cout << "Delete test passed" << std::endl;
}

// Regression: the left child was the max of the left subtree, and the old
// remove() left a dangling parent pointer (heap-use-after-free under ASan).
void testDeleteLeftChildIsMax() {
    SplayTree tree;
    tree.insert(1, "a");
    tree.insert(3, "c");
    tree.insert(2, "b");
    assert(tree.remove(2) == true);
    assert(tree.search(3) == "c");
    assert((tree.inorderTraversal() == std::vector<int>{1, 3}));
    assert(tree.isConsistent());
    std::cout << "Delete (left child is max) test passed" << std::endl;
}

// Regression: failed searches and deletes now splay the last visited node.
void testMissSplays() {
    SplayTree tree;
    for (int k : {10, 20, 30, 40}) tree.insert(k);
    assert(tree.rootKey() == 40);
    assert(tree.search(25).empty());
    assert(tree.rootKey() == 20 || tree.rootKey() == 30);
    SplayTree t2;
    for (int k : {10, 20, 30, 40}) t2.insert(k);
    assert(t2.remove(5) == false);
    assert(t2.rootKey() == 10);
    std::cout << "Miss splays test passed" << std::endl;
}

// Regression: recursion on a path-shaped tree overflowed the native stack.
void testDeepTree() {
    SplayTree tree;
    const int n = 1000000;
    for (int i = 0; i < n; i++) tree.insert(i);
    assert(tree.size() == n);
    assert((int)tree.inorderTraversal().size() == n);
    std::cout << "Deep tree test passed" << std::endl;
}

// Regression: copying used to leave the copy empty (or double free).
static_assert(!std::is_copy_constructible<SplayTree>::value, "copy must be deleted");
static_assert(!std::is_copy_assignable<SplayTree>::value, "copy assignment must be deleted");

void testRandomAgainstMap() {
    srand(11);
    SplayTree tree;
    std::map<int, std::string> ref;
    for (int i = 0; i < 20000; i++) {
        int k = rand() % 50;
        int op = rand() % 10;
        if (op < 4) {
            std::string v = std::to_string(i);
            tree.insert(k, v);
            ref[k] = v;
        } else if (op < 7) {
            assert(tree.remove(k) == (ref.erase(k) == 1));
        } else {
            auto it = ref.find(k);
            assert(tree.search(k) == (it == ref.end() ? std::string() : it->second));
        }
        assert(tree.isConsistent());
        assert(tree.size() == (int)ref.size());
    }
    std::vector<int> expect;
    for (auto& kv : ref) expect.push_back(kv.first);
    assert(tree.inorderTraversal() == expect);
    std::cout << "Random vs map test passed" << std::endl;
}

void testFindMinMax() {
    SplayTree tree;
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);
    tree.insert(60);
    tree.insert(80);
    
    assert(tree.findMin() == 20);
    assert(tree.findMax() == 80);
    
    std::cout << "Find Min/Max test passed" << std::endl;
}

void testInorderTraversal() {
    SplayTree tree;
    std::vector<int> keys = {50, 30, 70, 20, 40, 60, 80};
    for (int key : keys) {
        tree.insert(key);
    }
    
    std::vector<int> result = tree.inorderTraversal();
    std::sort(keys.begin(), keys.end());
    
    assert(result == keys);
    
    std::cout << "Inorder traversal test passed" << std::endl;
}

void testEmptyTree() {
    SplayTree tree;
    assert(tree.isEmpty() == true);
    assert(tree.size() == 0);
    assert(tree.search(10).empty());
    assert(tree.findMin() == -1);
    assert(tree.findMax() == -1);
    assert(tree.inorderTraversal().empty());
    
    std::cout << "Empty tree test passed" << std::endl;
}

void testUpdateExistingKey() {
    SplayTree tree;
    tree.insert(10, "old");
    tree.insert(10, "new");
    
    assert(tree.search(10) == "new");
    
    std::cout << "Update existing key test passed" << std::endl;
}

void testSingleNode() {
    SplayTree tree;
    tree.insert(42);
    
    assert(tree.isEmpty() == false);
    assert(tree.size() == 1);
    assert(tree.findMin() == 42);
    assert(tree.findMax() == 42);
    
    std::cout << "Single node test passed" << std::endl;
}

int main() {
    std::cout << "Running Splay Tree tests..." << std::endl;
    std::cout << std::endl;
    
    testInsertAndSearch();
    testSplayOperation();
    testDelete();
    testDeleteLeftChildIsMax();
    testMissSplays();
    testDeepTree();
    testRandomAgainstMap();
    testFindMinMax();
    testInorderTraversal();
    testEmptyTree();
    testUpdateExistingKey();
    testSingleNode();
    
    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;
    
    return 0;
}

