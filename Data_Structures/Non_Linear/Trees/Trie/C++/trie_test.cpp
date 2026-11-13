#include <iostream>
#include <cassert>
#include <algorithm>
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

void testDeleteReturnValueAndPruning() {
    Trie trie;
    trie.insert("apple");
    trie.insert("app");
    trie.insert("dog");
    assert(trie.deleteWord("apple") == true);
    assert(trie.search("apple") == false);
    assert(trie.search("app") == true);
    assert(trie.deleteWord("apple") == false);  // already gone
    assert(trie.deleteWord("appl") == false);   // a prefix, not a word
    assert(trie.deleteWord("cat") == false);    // never inserted
    assert(trie.startsWith("appl") == false);   // pruned
    assert(trie.deleteWord("app") == true);
    assert(trie.deleteWord("dog") == true);
    assert(trie.isEmpty());
    cout << "testDeleteReturnValueAndPruning passed" << endl;
}

void testCountAndWords() {
    Trie trie;
    assert(trie.countWords() == 0);
    trie.insert("apple");
    trie.insert("app");
    trie.insert("banana");
    assert(trie.countWords() == 3);
    vector<string> words = trie.getAllWords();
    sort(words.begin(), words.end());
    assert((words == vector<string>{"app", "apple", "banana"}));
    cout << "testCountAndWords passed" << endl;
}

void testEmptyWord() {
    Trie trie;
    trie.insert("");
    assert(trie.countWords() == 1);
    assert(!trie.isEmpty());
    assert(trie.search(""));
    assert(trie.deleteWord(""));
    assert(trie.isEmpty());
    cout << "testEmptyWord passed" << endl;
}

void testLongWordAndSeparateTries() {
    string word(100000, 'a');
    {
        Trie trie;
        trie.insert(word);
        assert(trie.countWords() == 1);
        assert(trie.getAllWords().size() == 1);
        assert(trie.deleteWord(word));
        assert(trie.isEmpty());
        trie.insert(word);  // freed by the destructor without recursion
    }
    // Two tries never share nodes (copying is deleted).
    Trie a;
    a.insert("x");
    Trie b;
    b.insert("y");
    assert(!a.search("y"));
    cout << "testLongWordAndSeparateTries passed" << endl;
}

int main() {
    cout << "Running Trie tests..." << endl;
    testInsertAndSearch();
    testStartsWith();
    testIsEmpty();
    testDeleteReturnValueAndPruning();
    testCountAndWords();
    testEmptyWord();
    testLongWordAndSeparateTries();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

