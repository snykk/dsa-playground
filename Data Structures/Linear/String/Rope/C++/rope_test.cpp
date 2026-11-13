#include "rope.cpp"
#include <cassert>
#include <iostream>
#include <cmath>
#include <random>
#include <string>

// Cached fields are right and sibling heights differ by at most 1.
static void checkTree(const NodePtr& node) {
    if (!node) return;
    if (!node->data.empty()) {
        assert(node->length == (int)node->data.size() && node->height == 0);
        return;
    }
    checkTree(node->left);
    checkTree(node->right);
    assert(node->weight == node->left->length);
    assert(node->length == node->left->length + node->right->length);
    assert(node->height == 1 + max(node->left->height, node->right->height));
    assert(abs(node->left->height - node->right->height) <= 1);
}

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

    // Regression: appending at the end used to build a chain (height n); the tree
    // is now rebalanced, so the height stays logarithmic and nothing overflows the stack.
    {
        Rope r;
        const int n = 20000;
        for (int i = 0; i < n; i++) r.insert(r.length(), "x");
        assert(r.length() == n);
        assert(r.height() <= 2 * log2((double)n));
        assert(r.toString() == string(n, 'x'));
        r.insert(0, "y");
        assert(r.index(0) == 'y');
    }
    {
        Rope r;
        for (int i = 0; i < 3000; i++) r.insert(0, string(1, (char)('0' + i % 10)));
        assert(r.height() <= 2 * log2(3000.0));
    }

    // Randomized edits against a plain std::string
    {
        mt19937 rng(7);
        Rope r("seed text");
        string model = "seed text";
        auto clampPos = [&](int pos) { return min(max(pos, 0), (int)model.size()); };
        for (int step = 0; step < 3000; step++) {
            int op = rng() % 4;
            int pos = (int)(rng() % (model.size() + 7)) - 3;
            if (op == 0) {
                string text;
                for (int k = rng() % 13; k > 0; k--) text += (char)('a' + rng() % 3);
                r.insert(pos, text);
                model.insert(clampPos(pos), text);
            } else if (op == 1) {
                int len = rng() % 16;
                r.deleteStr(pos, len);
                model.erase(clampPos(pos), len);
            } else if (op == 2) {
                auto [left, right] = r.split(pos);
                int p = clampPos(pos);
                assert(left.toString() == model.substr(0, p));
                assert(right.toString() == model.substr(p));
                r = left.concat(right);
            } else {
                Rope other(string(rng() % 21, '-'));
                r = r.concat(other);
                model += other.toString();
            }
            assert(r.length() == (int)model.size());
        }
        assert(r.toString() == model);
        for (int i = 0; i < (int)model.size(); i += 7) assert(r.index(i) == model[i]);
    }

    // The AVL join keeps sibling heights within 1 for very unequal sides
    {
        NodePtr big = ropeBuild(string(5000, 'a'));
        NodePtr small = ropeBuild("zz");
        checkTree(ropeJoin(big, small));
        checkTree(ropeJoin(small, big));
        NodePtr acc = nullptr;
        for (int i = 0; i < 500; i++) acc = ropeJoin(acc, ropeBuild(string(1 + i % 37, 'k')));
        checkTree(acc);
        auto [a, b] = ropeSplit(acc, 123);
        checkTree(a);
        checkTree(b);
        assert(ropeLength(a) == 123 && ropeLength(a) + ropeLength(b) == ropeLength(acc));
    }

    // split and concat leave their sources unchanged
    {
        Rope r("abcdefghijklmnopqrstuvwxyz");
        string before = r.toString();
        auto [left, right] = r.split(10);
        Rope joined = left.concat(right);
        assert(r.toString() == before);
        assert(left.toString() == before.substr(0, 10));
        assert(right.toString() == before.substr(10));
        assert(joined.toString() == before);
    }

    cout << "All Rope tests passed!" << endl;
    return 0;
}
