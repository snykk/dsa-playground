/**
 * Test cases for Interval Tree (C++)
 */

#include <iostream>
#include <cassert>
#include "interval_tree.cpp"

void testInsertAndSearch() {
    IntervalTree tree;
    tree.insert(Interval(15, 20));
    tree.insert(Interval(10, 30));
    tree.insert(Interval(17, 19));
    
    std::vector<Interval> result = tree.searchOverlapping(Interval(14, 16));
    assert(result.size() > 0);
    
    std::cout << "✓ Insert and search test passed" << std::endl;
}

void testSearchPoint() {
    IntervalTree tree;
    tree.insert(Interval(10, 20));
    tree.insert(Interval(15, 25));
    
    std::vector<Interval> result = tree.searchContainingPoint(15);
    assert(result.size() > 0);
    
    std::cout << "✓ Search point test passed" << std::endl;
}

void testEmptyTree() {
    IntervalTree tree;
    assert(tree.isEmpty());
    assert(tree.searchOverlapping(Interval(10, 20)).empty());
    
    std::cout << "✓ Empty tree test passed" << std::endl;
}

int main() {
    std::cout << "Running Interval Tree tests..." << std::endl;
    std::cout << std::endl;
    
    testInsertAndSearch();
    testSearchPoint();
    testEmptyTree();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

