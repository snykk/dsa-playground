#include "two_sat.h"

#include <cassert>
#include <iostream>
#include <vector>

int lit(int x, bool positive = true) { return positive ? 2 * x : 2 * x + 1; }

bool checkAssignment(const std::vector<std::pair<int, int>>& clauses,
                     const std::vector<bool>& a) {
    for (auto& [p, q] : clauses) {
        bool vp = (p % 2 == 0) ? a[p / 2] : !a[p / 2];
        bool vq = (q % 2 == 0) ? a[q / 2] : !a[q / 2];
        if (!(vp || vq)) return false;
    }
    return true;
}

void testSingleClauseSatisfiable() {
    TwoSAT s(2);
    s.addClause(lit(0), lit(1));
    auto a = s.solve();
    assert(a.has_value());
    assert(a->at(0) || a->at(1));
}

void testForceTrue() {
    TwoSAT s(1);
    s.forceTrue(lit(0));
    auto a = s.solve();
    assert(a.has_value() && a->at(0));
}

void testForceFalse() {
    TwoSAT s(1);
    s.forceTrue(lit(0, false));
    auto a = s.solve();
    assert(a.has_value() && !a->at(0));
}

void testContradiction() {
    TwoSAT s(1);
    s.forceTrue(lit(0));
    s.forceTrue(lit(0, false));
    assert(!s.solve().has_value());
}

void testContradictionChain() {
    TwoSAT s(2);
    s.implies(lit(0), lit(1));
    s.implies(lit(1), lit(0, false));
    s.forceTrue(lit(0));
    assert(!s.solve().has_value());
}

void testTextbook() {
    TwoSAT s(2);
    std::vector<std::pair<int, int>> clauses = {
        {lit(0), lit(1)},
        {lit(0, false), lit(1)},
        {lit(0, false), lit(1, false)},
    };
    for (auto& [p, q] : clauses) s.addClause(p, q);
    auto a = s.solve();
    assert(a.has_value());
    assert(checkAssignment(clauses, *a));
}

void testImpliesChain() {
    TwoSAT s(4);
    s.implies(lit(0), lit(1));
    s.implies(lit(1), lit(2));
    s.implies(lit(2), lit(3));
    s.forceTrue(lit(0));
    auto a = s.solve();
    assert(a.has_value());
    assert(a->at(0) && a->at(1) && a->at(2) && a->at(3));
}

void testNoConstraints() {
    TwoSAT s(5);
    auto a = s.solve();
    assert(a.has_value());
    assert(a->size() == 5);
}

void testMultipleVars() {
    TwoSAT s(3);
    std::vector<std::pair<int, int>> clauses = {
        {lit(0), lit(1, false)},
        {lit(0, false), lit(2)},
        {lit(1), lit(2)},
    };
    for (auto& [p, q] : clauses) s.addClause(p, q);
    auto a = s.solve();
    assert(a.has_value());
    assert(checkAssignment(clauses, *a));
}

int main() {
    testSingleClauseSatisfiable();
    testForceTrue();
    testForceFalse();
    testContradiction();
    testContradictionChain();
    testTextbook();
    testImpliesChain();
    testNoConstraints();
    testMultipleVars();
    std::cout << "All 9 tests passed!" << std::endl;
    return 0;
}
