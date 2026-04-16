#include "rope.cpp"
#include <cassert>
#include <iostream>

int main() {
    // Test: create from string
    {
        Rope r("Hello, World!");
        assert(r.toString() == "Hello, World!");
        assert(r.length() == 13);
    }

    // Test: empty rope
    {
        Rope r;
        assert(r.toString() == "");
        assert(r.length() == 0);
    }

    // Test: single character
    {
        Rope r("A");
        assert(r.toString() == "A");
        assert(r.length() == 1);
        assert(r.index(0) == 'A');
    }

    // Test: index access
    {
        Rope r("Hello, World!");
        assert(r.index(0) == 'H');
        assert(r.index(4) == 'o');
        assert(r.index(7) == 'W');
        assert(r.index(12) == '!');
    }

    // Test: index out of bounds
    {
        Rope r("abc");
        bool caught = false;
        try { r.index(3); } catch (out_of_range&) { caught = true; }
        assert(caught);
        caught = false;
        try { r.index(-1); } catch (out_of_range&) { caught = true; }
        assert(caught);
    }

    // Test: concat
    {
        Rope r1("Hello, ");
        Rope r2("World!");
        Rope r3 = r1.concat(r2);
        assert(r3.toString() == "Hello, World!");
        assert(r3.length() == 13);
    }

    // Test: concat with empty
    {
        Rope r1("Hello");
        Rope r2;
        assert(r1.concat(r2).toString() == "Hello");
        assert(r2.concat(r1).toString() == "Hello");
    }

    // Test: split
    {
        Rope r("Hello, World!");
        auto [left, right] = r.split(7);
        assert(left.toString() == "Hello, ");
        assert(right.toString() == "World!");
    }

    // Test: split at boundaries
    {
        Rope r("Hello");
        auto [l1, r1] = r.split(0);
        assert(l1.toString() == "");
        assert(r1.toString() == "Hello");

        auto [l2, r2] = r.split(5);
        assert(l2.toString() == "Hello");
        assert(r2.toString() == "");
    }

    // Test: insert in middle
    {
        Rope r("Hello World!");
        r.insert(5, ",");
        assert(r.toString() == "Hello, World!");
    }

    // Test: insert at start and end
    {
        Rope r("World!");
        r.insert(0, "Hello, ");
        assert(r.toString() == "Hello, World!");

        Rope r2("Hello, ");
        r2.insert(7, "World!");
        assert(r2.toString() == "Hello, World!");
    }

    // Test: delete substring
    {
        Rope r("Hello, World!");
        r.deleteStr(5, 2);
        assert(r.toString() == "HelloWorld!");
    }

    // Test: delete from start and end
    {
        Rope r1("Hello, World!");
        r1.deleteStr(0, 7);
        assert(r1.toString() == "World!");

        Rope r2("Hello, World!");
        r2.deleteStr(5, 8);
        assert(r2.toString() == "Hello");
    }

    // Test: long string
    {
        string text;
        for (int i = 0; i < 100; i++) text += "abcdefghij";
        Rope r(text);
        assert(r.length() == 1000);
        assert(r.toString() == text);
        assert(r.index(0) == 'a');
        assert(r.index(999) == 'j');
    }

    // Test: multiple operations
    {
        Rope r("Hello");
        r.insert(5, " World");
        r.insert(11, "!");
        assert(r.toString() == "Hello World!");
        r.deleteStr(5, 6);
        assert(r.toString() == "Hello!");
    }

    cout << "All Rope tests passed!" << endl;
    return 0;
}
