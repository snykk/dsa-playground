package main

import (
	"fmt"
	"math/rand"
)

type Node struct {
	key     int
	forward []*Node
}

type SkipList struct {
	maxLevel int
	p        float64
	level    int
	header   *Node
}

func NewSkipList(maxLevel int, p float64) *SkipList {
	header := &Node{key: -1, forward: make([]*Node, maxLevel+1)}
	return &SkipList{
		maxLevel: maxLevel,
		p:        p,
		level:    0,
		header:   header,
	}
}

func (sl *SkipList) randomLevel() int {
	lvl := 0
	for rand.Float64() < sl.p && lvl < sl.maxLevel {
		lvl++
	}
	return lvl
}

func (sl *SkipList) Insert(key int) {
	update := make([]*Node, sl.maxLevel+1)
	current := sl.header

	for i := sl.level; i >= 0; i-- {
		for current.forward[i] != nil && current.forward[i].key < key {
			current = current.forward[i]
		}
		update[i] = current
	}

	current = current.forward[0]

	if current != nil && current.key == key {
		return
	}

	newLevel := sl.randomLevel()

	if newLevel > sl.level {
		for i := sl.level + 1; i <= newLevel; i++ {
			update[i] = sl.header
		}
		sl.level = newLevel
	}

	newNode := &Node{key: key, forward: make([]*Node, newLevel+1)}

	for i := 0; i <= newLevel; i++ {
		newNode.forward[i] = update[i].forward[i]
		update[i].forward[i] = newNode
	}
}

func (sl *SkipList) Search(key int) bool {
	current := sl.header

	for i := sl.level; i >= 0; i-- {
		for current.forward[i] != nil && current.forward[i].key < key {
			current = current.forward[i]
		}
	}

	current = current.forward[0]

	return current != nil && current.key == key
}

func (sl *SkipList) Delete(key int) bool {
	update := make([]*Node, sl.maxLevel+1)
	current := sl.header

	for i := sl.level; i >= 0; i-- {
		for current.forward[i] != nil && current.forward[i].key < key {
			current = current.forward[i]
		}
		update[i] = current
	}

	current = current.forward[0]

	if current == nil || current.key != key {
		return false
	}

	for i := 0; i <= sl.level; i++ {
		if update[i].forward[i] != current {
			break
		}
		update[i].forward[i] = current.forward[i]
	}

	for sl.level > 0 && sl.header.forward[sl.level] == nil {
		sl.level--
	}

	return true
}

func (sl *SkipList) Display() []int {
	var elems []int
	current := sl.header.forward[0]
	for current != nil {
		elems = append(elems, current.key)
		current = current.forward[0]
	}
	return elems
}

func main() {
	sl := NewSkipList(16, 0.5)

	values := []int{3, 6, 9, 12, 19, 25}
	for _, v := range values {
		sl.Insert(v)
	}

	fmt.Println("Skip List:", sl.Display())
	fmt.Println("Search 9:", sl.Search(9))
	fmt.Println("Search 15:", sl.Search(15))

	sl.Delete(9)
	fmt.Println("After deleting 9:", sl.Display())
}
