#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class SinglyLinkedList {
    Node* head;
public:
    SinglyLinkedList() : head(nullptr) {}

    void insert_at_head(int val) {
        Node* node = new Node(val);
        node->next = head;
        head = node;
    }

    void insert_at_tail(int val) {
        Node* node = new Node(val);
        if(!head) { head = node; return; }
        Node* curr = head;
        while(curr->next) curr = curr->next;
        curr->next = node;
    }

    void delete_node(int key) {
        Node* curr = head;
        Node* prev = nullptr;
        while(curr && curr->data != key) { prev = curr; curr = curr->next; }
        if(!curr) return;
        if(prev) prev->next = curr->next;
        else head = curr->next;
        delete curr;
    }

    void display() {
        Node* curr = head;
        while(curr) { cout << curr->data << " "; curr = curr->next; }
        cout << endl;
    }
};
