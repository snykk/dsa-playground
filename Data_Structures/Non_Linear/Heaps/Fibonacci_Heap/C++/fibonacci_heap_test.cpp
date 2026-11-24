#include <iostream>
#include <vector>
#include <cassert>
#include <cmath>
#include <type_traits>
#include <algorithm>
#include <map>
#include <memory>
#include <set>
#include <stdexcept>
#include <string>
#include <utility>

// White-box access: the tie regression test reads min_node, which only a
// private member can tell (equal keys look the same through peek()), and the
// invariant checks walk the nodes.
#define private public
#include "fibonacci_heap.cpp"
#undef private
using namespace std;

void test_insert_and_peek() {
    FibonacciHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    assert(heap.peek() == 3);
    cout << "Insert and peek test passed!" << endl;
}

void test_extract_min() {
    FibonacciHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.insert(7);
    heap.insert(1);

    assert(heap.extract_min() == 1);
    assert(heap.extract_min() == 3);
    assert(heap.extract_min() == 5);
    assert(heap.extract_min() == 7);
    cout << "Extract min test passed!" << endl;
}

void test_is_empty() {
    FibonacciHeap heap;
    assert(heap.is_empty());
    heap.insert(5);
    assert(!heap.is_empty());
    cout << "Is empty test passed!" << endl;
}

void test_size() {
    FibonacciHeap heap;
    assert(heap.size() == 0);
    heap.insert(5);
    heap.insert(3);
    assert(heap.size() == 2);
    cout << "Size test passed!" << endl;
}

void test_clear() {
    FibonacciHeap heap;
    heap.insert(5);
    heap.insert(3);
    heap.clear();
    assert(heap.is_empty());
    assert(heap.size() == 0);
    cout << "Clear test passed!" << endl;
}

void test_single_element() {
    FibonacciHeap heap;
    heap.insert(5);
    assert(heap.peek() == 5);
    assert(heap.extract_min() == 5);
    assert(heap.is_empty());
    cout << "Single element test passed!" << endl;
}

void test_multiple_extracts() {
    FibonacciHeap heap;
    vector<int> arr = {5, 3, 7, 1, 9, 2};
    for (int val : arr) {
        heap.insert(val);
    }

    vector<int> result;
    while (!heap.is_empty()) {
        result.push_back(heap.extract_min());
    }

    vector<int> expected = {1, 2, 3, 5, 7, 9};
    assert(result == expected);
    cout << "Multiple extracts test passed!" << endl;
}

void test_empty_heap_throws() {
    FibonacciHeap heap;
    bool threw = false;
    try { heap.peek(); } catch (const runtime_error& e) { threw = string(e.what()) == "Heap is empty"; }
    assert(threw);
    threw = false;
    try { heap.extract_min(); } catch (const runtime_error& e) { threw = string(e.what()) == "Heap is empty"; }
    assert(threw);
    cout << "Empty heap throws test passed!" << endl;
}

void test_not_copyable() {
    // Regression: copying used to share nodes and double free them.
    static_assert(!is_copy_constructible<FibonacciHeap>::value, "no copy ctor");
    static_assert(!is_copy_assignable<FibonacciHeap>::value, "no copy assignment");
    cout << "Not copyable test passed!" << endl;
}

void test_consolidation_at_scale() {
    FibonacciHeap heap;
    vector<int> vals;
    unsigned s = 12345;
    for (int i = 0; i < 2000; i++) {
        s = s * 1103515245u + 12345u;
        vals.push_back((int)((s >> 8) % 500) - 250);  // duplicates, negatives
    }
    for (int v : vals) heap.insert(v);
    sort(vals.begin(), vals.end());
    for (int v : vals) {
        assert(heap.extract_min() == v);
    }
    assert(heap.is_empty());
    cout << "Consolidation at scale test passed!" << endl;
}

void test_consolidate_tie_follows_python_order() {
    // Regression: after consolidation the new minimum is the first smallest root
    // in Python's degree_table insertion order, where a degree that is deleted
    // and stored again moves to the end. Here degree 0 holds 3, is deleted when
    // 3 is linked under the second 2 (degree 1 is stored), then holds the first 2
    // again: the order is {1, 0}, so Python picks the 2 of degree 1. Scanning the
    // std::map in degree order picked the other 2.
    FibonacciHeap heap;
    for (int k : {1, 2, 2, 3}) heap.insert(k);
    assert(heap.extract_min() == 1);
    // Python: root list from min_node is [(2, degree 1, child 3), (2, degree 0)]
    FibonacciHeapNode* m = heap.min_node;
    assert(m->key == 2 && m->degree == 1);
    assert(m->child != nullptr && m->child->key == 3);
    assert(m->right->key == 2 && m->right->degree == 0);
    assert(m->right->right == m);
    cout << "Consolidate tie follows Python order test passed!" << endl;
}

/* ---------- helpers: the dump format and the invariants of the Python tests ---------- */

vector<FibonacciHeapNode*> ring_of(FibonacciHeapNode* start) {
    vector<FibonacciHeapNode*> out;
    if (start == nullptr) return out;
    FibonacciHeapNode* current = start;
    do {
        out.push_back(current);
        current = current->right;
    } while (current != start);
    return out;
}

// A tree as text: key, * when marked, then the children in ring order.
string show(FibonacciHeapNode* node) {
    string text = to_string(node->key) + (node->marked ? "*" : "");
    vector<FibonacciHeapNode*> children = ring_of(node->child);
    if (!children.empty()) {
        text += "(";
        for (size_t i = 0; i < children.size(); i++) text += (i ? " " : "") + show(children[i]);
        text += ")";
    }
    return text;
}

// The root list from min_node, one tree per entry.
string dump(FibonacciHeap& heap) {
    string text;
    vector<FibonacciHeapNode*> roots = ring_of(heap.min_node);
    for (size_t i = 0; i < roots.size(); i++) text += (i ? ", " : "") + show(roots[i]);
    return text;
}

long long fib(int n) {
    long long a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        long long t = a + b;
        a = b;
        b = t;
    }
    return a;
}

int marked_count(FibonacciHeap& heap) {
    int total = 0;
    vector<FibonacciHeapNode*> rings;
    if (heap.min_node) rings.push_back(heap.min_node);
    while (!rings.empty()) {
        FibonacciHeapNode* start = rings.back();
        rings.pop_back();
        for (FibonacciHeapNode* n : ring_of(start)) {
            total += n->marked;
            if (n->child) rings.push_back(n->child);
        }
    }
    return total;
}

// Returns the subtree size; checks heap order, degrees and the F(d + 2) bound.
long long check_tree(FibonacciHeapNode* node, int count) {
    assert(node->in_heap);
    long long size = 1;
    vector<FibonacciHeapNode*> children = ring_of(node->child);
    assert(node->degree == (int)children.size());
    for (FibonacciHeapNode* c : children) {
        assert(c->parent == node);
        assert(c->right->left == c);
        assert(c->key >= node->key);
        size += check_tree(c, count);
    }
    assert(size >= fib(node->degree + 2));
    const double phi = (1 + sqrt(5.0)) / 2;
    assert(node->degree <= log((double)count) / log(phi) + 1e-9);
    return size;
}

void check_invariants(FibonacciHeap& heap) {
    if (heap.min_node == nullptr) {
        assert(heap.count == 0);
        return;
    }
    long long total = 0;
    for (FibonacciHeapNode* root : ring_of(heap.min_node)) {
        assert(root->right->left == root && root->left->right == root);
        assert(root->parent == nullptr);
        assert(!root->marked);
        assert(heap.min_node->key <= root->key);
        total += check_tree(root, heap.count);
    }
    assert(total == heap.count);
}

template <typename F>
string error_of(F f) {
    try {
        f();
    } catch (const exception& e) {
        return e.what();
    }
    return "";
}

const string STALE = "stale handle: the node is no longer in a heap";

/* ---------- handles ---------- */

void test_handles() {
    FibonacciHeap heap;
    FibonacciHeapHandle h = heap.insert(1);
    heap.insert(2);
    assert(h.key() == 1 && h.in_heap());
    assert(heap.extract_min() == 1);
    assert(!h.in_heap());
    assert(h.key() == 1);  // the handle keeps the node alive
    assert(error_of([&] { heap.decrease_key(h, 0); }) == STALE);
    assert(error_of([&] { heap.erase(h); }) == STALE);
    assert(heap.size() == 1 && heap.peek() == 2);

    FibonacciHeapHandle d = heap.insert(4);
    heap.erase(d);
    assert(!d.in_heap());
    assert(error_of([&] { heap.erase(d); }) == STALE);

    FibonacciHeapHandle empty;
    assert(!empty.in_heap());
    assert(error_of([&] { heap.decrease_key(empty, 0); }) == STALE);
    assert(error_of([&] { empty.key(); }) == "empty handle");
    cout << "Handles test passed!" << endl;
}

void test_clear_makes_every_handle_stale() {
    FibonacciHeap heap;
    vector<FibonacciHeapHandle> hs;
    for (int k = 0; k < 10; k++) hs.push_back(heap.insert(k));
    heap.extract_min();
    heap.decrease_key(hs[9], -1);
    heap.clear();
    for (const FibonacciHeapHandle& h : hs) assert(!h.in_heap());
    assert(error_of([&] { heap.decrease_key(hs[5], 0); }) == STALE);
    heap.insert(3);
    assert(heap.peek() == 3);
    cout << "Clear makes every handle stale test passed!" << endl;
}

void test_handle_outlives_the_heap() {
    FibonacciHeapHandle h;
    {
        FibonacciHeap heap;
        h = heap.insert(5);
        heap.insert(3);
    }
    // The heap freed its other node; this one lives on through the handle.
    assert(!h.in_heap());
    assert(h.key() == 5);
    FibonacciHeap other;
    assert(error_of([&] { other.decrease_key(h, 1); }) == STALE);
    cout << "Handle outlives the heap test passed!" << endl;
}

/* ---------- decrease_key ---------- */

void test_decrease_key_errors_and_equal_key() {
    FibonacciHeap heap;
    vector<FibonacciHeapHandle> hs;
    for (int k : {5, 3, 7}) hs.push_back(heap.insert(k));
    string before = dump(heap);
    assert(error_of([&] { heap.decrease_key(hs[1], 4); }) == "new key is greater than the current key");
    assert(hs[1].key() == 3 && dump(heap) == before);

    // A root: no cut, min_node moves.
    heap.decrease_key(hs[2], 1);
    assert(heap.min_node == hs[2].node.get() && heap.cut_count() == 0);
    // Equal to the minimum: the earlier one stays.
    heap.decrease_key(hs[0], 1);
    assert(heap.min_node == hs[2].node.get());

    FibonacciHeap tree;
    vector<FibonacciHeapHandle> ts;
    for (int k = 0; k < 9; k++) ts.push_back(tree.insert(k));
    tree.extract_min();
    tree.decrease_key(ts[8], 8);
    assert(dump(tree) == "1(2 5(6 7(8)) 3(4))");
    tree.decrease_key(ts[8], 7);
    assert(dump(tree) == "1(2 5(6 7(7)) 3(4))" && tree.cut_count() == 0);
    cout << "Decrease key errors and equal key test passed!" << endl;
}

void test_cascading_cut_on_a_hand_built_tree() {
    FibonacciHeap heap;
    vector<FibonacciHeapHandle> hs;
    for (int k = 0; k < 9; k++) hs.push_back(heap.insert(k));
    assert(heap.extract_min() == 0);
    assert(dump(heap) == "1(2 5(6 7(8)) 3(4))");
    heap.decrease_key(hs[8], 0);
    assert(dump(heap) == "0, 1(2 5(6 7*) 3(4))" && heap.cut_count() == 1);
    heap.decrease_key(hs[6], 3);
    assert(dump(heap) == "0, 3, 1(2 5*(7*) 3(4))" && heap.cut_count() == 2);
    heap.decrease_key(hs[7], 1);
    assert(dump(heap) == "0, 5, 1, 3, 1(2 3(4))" && heap.cut_count() == 4);
    check_invariants(heap);
    vector<int> out;
    while (!heap.is_empty()) out.push_back(heap.extract_min());
    assert((out == vector<int>{0, 1, 1, 2, 3, 3, 4, 5}));

    FibonacciHeap deep;
    vector<FibonacciHeapHandle> ds;
    for (int k = 0; k < 17; k++) ds.push_back(deep.insert(k));
    deep.extract_min();
    deep.decrease_key(ds[16], 0);
    deep.decrease_key(ds[14], 0);
    deep.decrease_key(ds[10], 0);
    assert(dump(deep) == "0, 0, 0, 1(2 9*(13*(15*) 11(12)) 5(6 7(8)) 3(4))");
    deep.decrease_key(ds[15], 0);
    assert(dump(deep) == "0, 9(11(12)), 13, 0, 0, 0, 1(2 5(6 7(8)) 3(4))");
    assert(deep.cut_count() == 6 && marked_count(deep) == 0);
    check_invariants(deep);
    cout << "Cascading cut on a hand-built tree test passed!" << endl;
}

void test_a_node_that_becomes_a_root_loses_its_mark() {
    FibonacciHeap heap;
    vector<FibonacciHeapHandle> hs;
    for (int k = 0; k < 9; k++) hs.push_back(heap.insert(k));
    heap.extract_min();
    heap.decrease_key(hs[6], -1);
    assert(hs[5].node->marked);
    assert(heap.extract_min() == -1);
    assert(dump(heap) == "1(2 5*(7(8)) 3(4))");
    assert(heap.extract_min() == 1);
    assert(dump(heap) == "2, 3(4 5(7(8)))");
    assert(!hs[5].node->marked);
    check_invariants(heap);
    cout << "A node that becomes a root loses its mark test passed!" << endl;
}

/* ---------- erase ---------- */

void test_erase() {
    FibonacciHeap heap;
    vector<FibonacciHeapHandle> hs;
    for (int k = 0; k < 9; k++) hs.push_back(heap.insert(k));
    heap.extract_min();
    heap.erase(hs[4]);
    assert(dump(heap) == "1(2 5(6 7(8)) 3*)");
    heap.erase(hs[1]);
    assert(dump(heap) == "2(3), 5(6 7(8))");
    heap.erase(hs[7]);
    assert(dump(heap) == "2(3 5(6)), 8");
    check_invariants(heap);

    FibonacciHeap cascade;
    vector<FibonacciHeapHandle> cs;
    for (int k = 0; k < 9; k++) cs.push_back(cascade.insert(k));
    cascade.extract_min();
    cascade.decrease_key(cs[6], 0);
    assert(dump(cascade) == "0, 1(2 5*(7(8)) 3(4))");
    cascade.erase(cs[7]);
    assert(dump(cascade) == "0(8), 5, 1(2 3(4))" && cascade.cut_count() == 3);
    check_invariants(cascade);

    FibonacciHeap one;
    FibonacciHeapHandle only = one.insert(42);
    one.erase(only);
    assert(one.is_empty() && one.size() == 0);

    FibonacciHeap dup;
    FibonacciHeapHandle a = dup.insert(4), b = dup.insert(4), c = dup.insert(4);
    dup.erase(b);
    assert(dump(dup) == "4(4)" && dup.min_node == c.node.get());
    assert(dup.extract_min() == 4 && !c.in_heap() && a.in_heap());
    cout << "Erase test passed!" << endl;
}

/* ---------- merge ---------- */

void test_merge() {
    FibonacciHeap heap, other;
    vector<FibonacciHeapHandle> mine, theirs;
    for (int k : {5, 3, 7}) mine.push_back(heap.insert(k));
    for (int k : {4, 1, 6}) theirs.push_back(other.insert(k));
    heap.merge(other);
    assert(dump(heap) == "1, 6, 4, 7, 5, 3");
    assert(heap.size() == 6 && other.is_empty() && other.size() == 0);
    heap.decrease_key(theirs[2], 0);
    heap.erase(mine[0]);
    vector<int> out;
    while (!heap.is_empty()) out.push_back(heap.extract_min());
    assert((out == vector<int>{0, 1, 3, 4, 7}));
    other.insert(9);
    assert(other.peek() == 9);

    FibonacciHeap tie, tie2;
    FibonacciHeapHandle first = tie.insert(2);
    tie2.insert(2);
    tie.merge(tie2);
    assert(tie.min_node == first.node.get());

    FibonacciHeap e1, e2;
    e1.merge(e2);
    assert(e1.is_empty());
    FibonacciHeapHandle h = e2.insert(3);
    e1.merge(e2);
    assert(e1.min_node == h.node.get() && e1.size() == 1);

    assert(error_of([&] { e1.merge(e1); }) == "cannot merge a heap with itself");
    assert(e1.size() == 1);
    cout << "Merge test passed!" << endl;
}

/* ---------- the same results in all three languages ---------- */

struct Op {
    string kind;
    int a;
    int b;
    vector<int> keys;
};

// The script and the strings of the Python test test_pinned_script.
void test_pinned_script() {
    vector<Op> script;
    for (int k : {5, 3, 7, 1, 9, 2, 8, 6, 4, 0}) script.push_back({"insert", k, 0, {}});
    vector<Op> rest = {
        {"extract", 0, 0, {}}, {"decrease", 4, 0, {}}, {"decrease", 6, 2, {}}, {"decrease", 0, 5, {}},
        {"decrease", 1, 4, {}}, {"delete", 2, 0, {}}, {"merge", 0, 0, {4, 1, 10}}, {"extract", 0, 0, {}},
        {"delete", 11, 0, {}}, {"decrease", 12, -1, {}}, {"extract", 0, 0, {}}, {"decrease", 7, -2, {}},
        {"delete", 8, 0, {}}, {"extract", 0, 0, {}}, {"delete", 9, 0, {}}, {"peek", 0, 0, {}},
        {"delete", 0, 0, {}}, {"merge", 0, 0, {}}, {"merge", 0, 0, {1}},
    };
    script.insert(script.end(), rest.begin(), rest.end());
    for (int i = 0; i < 7; i++) script.push_back({"extract", 0, 0, {}});

    vector<string> pinned = {
        "- | 5 | 1",
        "- | 3, 5 | 11",
        "- | 3, 7, 5 | 111",
        "- | 1, 7, 5, 3 | 1111",
        "- | 1, 9, 7, 5, 3 | 11111",
        "- | 1, 2, 9, 7, 5, 3 | 111111",
        "- | 1, 8, 2, 9, 7, 5, 3 | 1111111",
        "- | 1, 6, 8, 2, 9, 7, 5, 3 | 11111111",
        "- | 1, 4, 6, 8, 2, 9, 7, 5, 3 | 111111111",
        "- | 0, 4, 6, 8, 2, 9, 7, 5, 3, 1 | 1111111111",
        "0 | 1, 2(8 3(5 7(9)) 4(6)) | 1111111110",
        "- | 0, 2(8 3(5 7*) 4(6)), 1 | 1111111110",
        "- | 0, 2(2 3(5 7*) 4(6)), 1 | 1111111110",
        "- | 0, 2(2 3(5 7*) 4(6)), 1 | 1111111110",
        "ValueError | 0, 2(2 3(5 7*) 4(6)), 1 | 1111111110",
        "- | 0(1), 2(2 3*(5) 4(6)) | 1101111110",
        "- | 0(1), 1, 10, 4, 2(2 3*(5) 4(6)) | 1101111110111",
        "0 | 1(1 4(10)), 2(2 3*(5) 4(6)) | 1101011110111",
        "- | 1, 2(2 3*(5) 4(6)), 4(10) | 1101011110101",
        "- | -1, 2(2 3*(5) 4(6)), 4, 1 | 1101011110101",
        "-1 | 1(4), 2(2 3*(5) 4(6)) | 1101011110100",
        "- | -2, 2(2 3*(5) 4*), 1(4) | 1101011110100",
        "- | -2, 2(2 3*(5)), 1(4) | 1101011100100",
        "-2 | 1(4), 2(2 3*(5)) | 1101011000100",
        "ValueError | 1(4), 2(2 3*(5)) | 1101011000100",
        "1 | 1(4), 2(2 3*(5)) | 1101011000100",
        "- | 1(4 2(2)), 3 | 0101011000100",
        "- | 1(4 2(2)), 3 | 0101011000100",
        "- | 1(4 2(2)), 1, 3 | 01010110001001",
        "1 | 1(4 2(2)), 3 | 01000110001001",
        "1 | 2(2 3(4)) | 01000110001000",
        "2 | 2, 3(4) | 01000010001000",
        "2 | 3(4) | 01000000001000",
        "3 | 4 | 00000000001000",
        "4 |  | 00000000000000",
        "IndexError |  | 00000000000000",
    };

    FibonacciHeap heap;
    vector<FibonacciHeapHandle> handles;
    assert(script.size() == pinned.size());
    for (size_t i = 0; i < script.size(); i++) {
        const Op& op = script[i];
        string result = "-";
        try {
            if (op.kind == "insert") {
                handles.push_back(heap.insert(op.a));
            } else if (op.kind == "extract") {
                result = to_string(heap.extract_min());
            } else if (op.kind == "peek") {
                result = to_string(heap.peek());
            } else if (op.kind == "decrease") {
                heap.decrease_key(handles[op.a], op.b);
            } else if (op.kind == "delete") {
                heap.erase(handles[op.a]);
            } else {
                FibonacciHeap other;
                for (int k : op.keys) handles.push_back(other.insert(k));
                heap.merge(other);
            }
        } catch (const runtime_error&) {
            result = "IndexError";   // Python's name for the same error
        } catch (const invalid_argument&) {
            result = "ValueError";
        }
        string live;
        for (const FibonacciHeapHandle& h : handles) live += h.in_heap() ? "1" : "0";
        string line = result + " | " + dump(heap) + " | " + live;
        if (line != pinned[i]) cerr << "step " << i << ": " << line << " != " << pinned[i] << endl;
        assert(line == pinned[i]);
        check_invariants(heap);
    }
    cout << "Pinned script test passed!" << endl;
}

/* ---------- long random runs ---------- */

struct Lcg {
    unsigned long long s;
    explicit Lcg(unsigned long long seed) : s(seed) {}
    unsigned next() {
        s = s * 6364136223846793005ULL + 1442695040888963407ULL;
        return (unsigned)(s >> 33);
    }
    int range(int lo, int hi) { return lo + (int)(next() % (unsigned)(hi - lo + 1)); }
    double real() { return next() / 2147483648.0; }
};

// Every operation against a multiset of the live keys; returns how many times it cleared.
int random_run(unsigned long long seed, int steps, bool check_every_step) {
    Lcg rng(seed);
    int clears = 0;
    FibonacciHeap heap;
    vector<FibonacciHeapHandle> live;
    vector<FibonacciHeapHandle> stale;
    multiset<int> ref;

    auto extract_and_check = [&]() {
        int expected = *ref.begin();
        int got = heap.extract_min();
        assert(got == expected);
        ref.erase(ref.find(got));
        int gone = -1;
        for (size_t i = 0; i < live.size(); i++) {
            if (!live[i].in_heap()) {
                assert(gone == -1);
                gone = (int)i;
            }
        }
        assert(gone >= 0 && live[gone].key() == got);
        stale.push_back(live[gone]);
        live.erase(live.begin() + gone);
    };

    for (int step = 0; step < steps; step++) {
        double r = rng.real();
        int marks_before = check_every_step ? marked_count(heap) : 0;
        if (r < 0.35 || live.empty()) {
            int key = rng.range(-1000, 1000);
            live.push_back(heap.insert(key));
            ref.insert(key);
        } else if (r < 0.55) {
            FibonacciHeapHandle& h = live[rng.next() % live.size()];
            int old_key = h.key();
            int key = old_key - rng.range(0, 300);
            heap.decrease_key(h, key);
            ref.erase(ref.find(old_key));
            ref.insert(key);
        } else if (r < 0.65) {
            size_t i = rng.next() % live.size();
            ref.erase(ref.find(live[i].key()));
            heap.erase(live[i]);
            assert(!live[i].in_heap());
            stale.push_back(live[i]);
            live.erase(live.begin() + i);
        } else if (r < 0.85) {
            extract_and_check();
        } else if (r < 0.93) {
            FibonacciHeap other;
            int n = rng.range(0, 6);
            for (int i = 0; i < n; i++) {
                int key = rng.range(-1000, 1000);
                live.push_back(other.insert(key));
                ref.insert(key);
            }
            heap.merge(other);
            assert(other.is_empty());
        } else if (r < 0.97) {
            FibonacciHeapHandle& h = live[rng.next() % live.size()];
            assert(error_of([&] { heap.decrease_key(h, h.key() + 1); }) == "new key is greater than the current key");
        } else if (r < 0.9995) {
            if (!stale.empty()) {
                FibonacciHeapHandle& h = stale[rng.next() % stale.size()];
                assert(error_of([&] { heap.decrease_key(h, -1000000); }) == STALE);
                assert(error_of([&] { heap.erase(h); }) == STALE);
            }
        } else {
            heap.clear();
            clears++;
            assert(heap.is_empty());
            for (const FibonacciHeapHandle& h : live) {
                assert(!h.in_heap());
                stale.push_back(h);
            }
            live.clear();
            ref.clear();
        }
        assert(heap.size() == (int)ref.size());
        if (!ref.empty()) assert(heap.peek() == *ref.begin());
        if (check_every_step) {
            check_invariants(heap);
            assert(marked_count(heap) <= marks_before + 1);
            for (const FibonacciHeapHandle& h : live) assert(h.in_heap());
        }
    }
    while (!ref.empty()) extract_and_check();
    assert(heap.is_empty());
    return clears;
}

void test_random_runs() {
    int clears = 0;
    for (unsigned long long seed : {1ULL, 2ULL, 3ULL}) clears += random_run(seed, 1500, true);
    assert(clears > 0);
    for (unsigned long long seed : {20261122ULL, 99ULL}) assert(random_run(seed, 30000, false) > 0);
    cout << "Random runs test passed!" << endl;
}

/* ---------- amortized cost, counted ---------- */

void test_amortized_cost_by_counting_links_and_cuts() {
    const double phi = (1 + sqrt(5.0)) / 2;
    for (int n : {1000, 4000, 16000}) {
        Lcg rng(n);
        FibonacciHeap heap;
        vector<FibonacciHeapHandle> hs;
        for (int i = 0; i < n; i++) hs.push_back(heap.insert(rng.range(0, 1000000)));
        heap.extract_min();
        long long decreases = 0, deletes = 0, extracts = 1;
        while (!heap.is_empty()) {
            FibonacciHeapHandle& h = hs[rng.next() % hs.size()];
            if (!h.in_heap()) continue;
            double r = rng.real();
            if (r < 0.6) {
                heap.decrease_key(h, h.key() - rng.range(0, 1000));
                decreases++;
            } else if (r < 0.7) {
                heap.erase(h);
                deletes++;
            } else {
                heap.extract_min();
                extracts++;
            }
        }
        assert(heap.cut_count() <= 2 * (decreases + deletes));
        long long max_degree = (long long)(log((double)n) / log(phi));
        assert(heap.link_count() <= n + heap.cut_count() + (extracts + deletes) * max_degree);
    }
    cout << "Amortized cost by counting links and cuts test passed!" << endl;
}

int main() {
    test_not_copyable();
    test_consolidate_tie_follows_python_order();
    test_consolidation_at_scale();
    test_insert_and_peek();
    test_extract_min();
    test_is_empty();
    test_size();
    test_clear();
    test_single_element();
    test_multiple_extracts();
    test_empty_heap_throws();
    test_handles();
    test_clear_makes_every_handle_stale();
    test_handle_outlives_the_heap();
    test_decrease_key_errors_and_equal_key();
    test_cascading_cut_on_a_hand_built_tree();
    test_a_node_that_becomes_a_root_loses_its_mark();
    test_erase();
    test_merge();
    test_pinned_script();
    test_random_runs();
    test_amortized_cost_by_counting_links_and_cuts();
    cout << "All tests passed!" << endl;
    return 0;
}
