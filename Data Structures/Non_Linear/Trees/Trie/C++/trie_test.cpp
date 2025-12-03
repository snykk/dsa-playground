#include <iostream>
#include <cassert>
#include <vector>
#include "trie.cpp"

void testInsertAndSearch() {
    Trie trie;
    trie.insert("apple");
    trie.insert("app");
    trie.insert("application");
    assert(trie.search("apple") == true);
    assert(trie.search("app") == true);
    assert(trie.search("application") == true);
    assert(trie.search("appl") == false);
    cout << "testInsertAndSearch passed" << endl;
}

void testStartsWith() {
    Trie trie;
    trie.insert("apple");
    trie.insert("app");
    assert(trie.startsWith("app") == true);
    assert(trie.startsWith("ban") == false);
    cout << "testStartsWith passed" << endl;
}

void testIsEmpty() {
    Trie trie;
    assert(trie.isEmpty() == true);
    trie.insert("test");
    assert(trie.isEmpty() == false);
    cout << "testIsEmpty passed" << endl;
}

int main() {
    cout << "Running Trie tests..." << endl;
    testInsertAndSearch();
    testStartsWith();
    testIsEmpty();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

