#include <cassert>
#include <iostream>
#include <random>
#include <string>
#include <vector>
#include "suffix_tree.cpp"

static vector<int> brute_force(const string& text, const string& pattern) {
    vector<int> result;
    for (size_t i = 0; i + pattern.size() <= text.size(); i++) {
        if (text.compare(i, pattern.size(), pattern) == 0) {
            result.push_back(static_cast<int>(i));
        }
    }
    return result;
}

void testSearchBanana() {
    SuffixTree st("banana");
    assert((st.search("ana") == vector<int>{1, 3}));
    assert((st.search("ban") == vector<int>{0}));
    assert((st.search("a") == vector<int>{1, 3, 5}));
    assert((st.search("na") == vector<int>{2, 4}));
    assert((st.search("banana") == vector<int>{0}));
    assert(st.search("xyz").empty());
    assert(st.search("bananas").empty());
    cout << "testSearchBanana passed" << endl;
}

void testRegressionEdgeSplit() {
    // These failed when the tree never split edges.
    assert((SuffixTree("abac").search("ac") == vector<int>{2}));
    assert((SuffixTree("banana").search("ana") == vector<int>{1, 3}));
    cout << "testRegressionEdgeSplit passed" << endl;
}

void testSuffixes() {
    SuffixTree st("banana");
    vector<string> expected = {"a", "ana", "anana", "banana", "na", "nana"};
    assert(st.get_all_suffixes() == expected);
    cout << "testSuffixes passed" << endl;
}

void testEmptyAndSpecial() {
    SuffixTree empty("");  // used to crash on text.back()
    assert(empty.search("a").empty());
    assert(empty.get_all_suffixes().empty());
    SuffixTree st("a$a");
    assert((st.search("a") == vector<int>{0, 2}));
    assert((SuffixTree("banana$").search("$") == vector<int>{6}));
    assert(st.search("").empty());
    bool threw = false;
    try {
        SuffixTree bad(string("a\0b", 3));
    } catch (const invalid_argument&) {
        threw = true;
    }
    assert(threw);
    cout << "testEmptyAndSpecial passed" << endl;
}

void testDeepTree() {
    SuffixTree st(string(1500, 'a'));
    assert(st.search("a").size() == 1500);
    assert((st.search(string(1500, 'a')) == vector<int>{0}));
    cout << "testDeepTree passed" << endl;
}

void testRandomAgainstBruteForce() {
    mt19937 rng(7);
    const string alphabet = "abc$";
    for (int round = 0; round < 300; round++) {
        int len = rng() % 31;
        string text;
        for (int i = 0; i < len; i++) text += alphabet[rng() % alphabet.size()];
        SuffixTree st(text);
        for (int q = 0; q < 20; q++) {
            int plen = 1 + rng() % 5;
            string pattern;
            for (int i = 0; i < plen; i++) pattern += alphabet[rng() % alphabet.size()];
            assert(st.search(pattern) == brute_force(text, pattern));
        }
    }
    cout << "testRandomAgainstBruteForce passed" << endl;
}

int main() {
    cout << "Running Suffix Tree tests..." << endl;
    testSearchBanana();
    testRegressionEdgeSplit();
    testSuffixes();
    testEmptyAndSpecial();
    testDeepTree();
    testRandomAgainstBruteForce();
    cout << "\nAll tests passed!" << endl;
    return 0;
}
