#include "skip_list.cpp"
#include <cassert>
#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    // Test empty list
    {
        SkipList sl;
        assert(sl.display().empty());
        assert(!sl.search(1));
    }

    // Test insert single
    {
        SkipList sl;
        sl.insert(10);
        vector<int> expected = {10};
        assert(sl.display() == expected);
    }

    // Test insert multiple
    {
        SkipList sl;
        int vals[] = {3, 6, 9, 12, 19, 25};
        for (int v : vals) sl.insert(v);
        vector<int> expected = {3, 6, 9, 12, 19, 25};
        assert(sl.display() == expected);
    }

    // Test insert reverse order
    {
        SkipList sl;
        for (int v = 5; v >= 1; v--) sl.insert(v);
        vector<int> expected = {1, 2, 3, 4, 5};
        assert(sl.display() == expected);
    }

    // Test insert duplicate
    {
        SkipList sl;
        sl.insert(5);
        sl.insert(5);
        vector<int> expected = {5};
        assert(sl.display() == expected);
    }

    // Test search hit
    {
        SkipList sl;
        int vals[] = {3, 7, 11, 20};
        for (int v : vals) sl.insert(v);
        assert(sl.search(3));
        assert(sl.search(7));
        assert(sl.search(11));
        assert(sl.search(20));
    }

    // Test search miss
    {
        SkipList sl;
        int vals[] = {3, 7, 11, 20};
        for (int v : vals) sl.insert(v);
        assert(!sl.search(1));
        assert(!sl.search(5));
        assert(!sl.search(100));
    }

    // Test delete existing
    {
        SkipList sl;
        int vals[] = {3, 7, 11, 20};
        for (int v : vals) sl.insert(v);
        assert(sl.deleteNode(7));
        assert(!sl.search(7));
        vector<int> expected = {3, 11, 20};
        assert(sl.display() == expected);
    }

    // Test delete non-existing
    {
        SkipList sl;
        sl.insert(5);
        assert(!sl.deleteNode(10));
        vector<int> expected = {5};
        assert(sl.display() == expected);
    }

    // Test delete from empty
    {
        SkipList sl;
        assert(!sl.deleteNode(1));
    }

    // Test delete all elements
    {
        SkipList sl;
        for (int v = 1; v <= 3; v++) sl.insert(v);
        assert(sl.deleteNode(1));
        assert(sl.deleteNode(2));
        assert(sl.deleteNode(3));
        assert(sl.display().empty());
    }

    // Test large dataset
    {
        SkipList sl;
        for (int i = 1000; i >= 1; i--) sl.insert(i);
        vector<int> result = sl.display();
        assert((int)result.size() == 1000);
        for (int i = 0; i < 1000; i++) assert(result[i] == i + 1);
        assert(sl.search(500));
        assert(sl.deleteNode(500));
        assert(!sl.search(500));
        assert((int)sl.display().size() == 999);
    }

    cout << "All tests passed!" << endl;
    return 0;
}
