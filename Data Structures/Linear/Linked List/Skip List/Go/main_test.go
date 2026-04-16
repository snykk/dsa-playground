package main

import (
	"reflect"
	"testing"
)

func TestEmptyList(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	if sl.Display() != nil {
		t.Errorf("expected nil, got %v", sl.Display())
	}
	if sl.Search(1) {
		t.Error("expected false for search on empty list")
	}
}

func TestInsertSingle(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	sl.Insert(10)
	expected := []int{10}
	if !reflect.DeepEqual(sl.Display(), expected) {
		t.Errorf("expected %v, got %v", expected, sl.Display())
	}
}

func TestInsertMultiple(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	for _, v := range []int{3, 6, 9, 12, 19, 25} {
		sl.Insert(v)
	}
	expected := []int{3, 6, 9, 12, 19, 25}
	if !reflect.DeepEqual(sl.Display(), expected) {
		t.Errorf("expected %v, got %v", expected, sl.Display())
	}
}

func TestInsertReverseOrder(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	for v := 5; v >= 1; v-- {
		sl.Insert(v)
	}
	expected := []int{1, 2, 3, 4, 5}
	if !reflect.DeepEqual(sl.Display(), expected) {
		t.Errorf("expected %v, got %v", expected, sl.Display())
	}
}

func TestInsertDuplicate(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	sl.Insert(5)
	sl.Insert(5)
	expected := []int{5}
	if !reflect.DeepEqual(sl.Display(), expected) {
		t.Errorf("expected %v, got %v", expected, sl.Display())
	}
}

func TestSearchHit(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	for _, v := range []int{3, 7, 11, 20} {
		sl.Insert(v)
	}
	for _, v := range []int{3, 7, 11, 20} {
		if !sl.Search(v) {
			t.Errorf("expected to find %d", v)
		}
	}
}

func TestSearchMiss(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	for _, v := range []int{3, 7, 11, 20} {
		sl.Insert(v)
	}
	for _, v := range []int{1, 5, 100} {
		if sl.Search(v) {
			t.Errorf("expected not to find %d", v)
		}
	}
}

func TestDeleteExisting(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	for _, v := range []int{3, 7, 11, 20} {
		sl.Insert(v)
	}
	if !sl.Delete(7) {
		t.Error("expected delete to return true")
	}
	if sl.Search(7) {
		t.Error("expected 7 to be deleted")
	}
	expected := []int{3, 11, 20}
	if !reflect.DeepEqual(sl.Display(), expected) {
		t.Errorf("expected %v, got %v", expected, sl.Display())
	}
}

func TestDeleteNonExisting(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	sl.Insert(5)
	if sl.Delete(10) {
		t.Error("expected delete to return false")
	}
	expected := []int{5}
	if !reflect.DeepEqual(sl.Display(), expected) {
		t.Errorf("expected %v, got %v", expected, sl.Display())
	}
}

func TestDeleteFromEmpty(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	if sl.Delete(1) {
		t.Error("expected delete to return false on empty list")
	}
}

func TestDeleteAllElements(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	for _, v := range []int{1, 2, 3} {
		sl.Insert(v)
	}
	for _, v := range []int{1, 2, 3} {
		if !sl.Delete(v) {
			t.Errorf("expected delete of %d to return true", v)
		}
	}
	if sl.Display() != nil {
		t.Errorf("expected nil, got %v", sl.Display())
	}
}

func TestLargeDataset(t *testing.T) {
	sl := NewSkipList(16, 0.5)
	for i := 1000; i >= 1; i-- {
		sl.Insert(i)
	}
	result := sl.Display()
	if len(result) != 1000 {
		t.Errorf("expected 1000 elements, got %d", len(result))
	}
	for i := 0; i < 1000; i++ {
		if result[i] != i+1 {
			t.Errorf("expected %d at index %d, got %d", i+1, i, result[i])
		}
	}
	if !sl.Search(500) {
		t.Error("expected to find 500")
	}
	if !sl.Delete(500) {
		t.Error("expected delete of 500 to return true")
	}
	if sl.Search(500) {
		t.Error("expected 500 to be deleted")
	}
	if len(sl.Display()) != 999 {
		t.Errorf("expected 999 elements, got %d", len(sl.Display()))
	}
}
