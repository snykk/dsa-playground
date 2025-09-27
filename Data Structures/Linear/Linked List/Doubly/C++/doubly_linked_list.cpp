#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* prev;
    Node* next;
    Node(int d) : data(d), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList {
public:
    Node* head;
    DoublyLinkedList() { head = nullptr; }

    void insertAtHead(int data) {
        Node* newNode = new Node(data);
        if(head) head->prev = newNode;
        newNode->next = head;
        head = newNode;
    }

    void insertAtTail(int data) {
        Node* newNode = new Node(data);
        if(!head) { head = newNode; return; }
        Node* temp = head;
        while(temp->next) temp = temp->next;
        temp->next = newNode;
        newNode->prev = temp;
    }

    void deleteValue(int data) {
        Node* temp = head;
        while(temp) {
            if(temp->data == data) {
                if(temp->prev) temp->prev->next = temp->next;
                else head = temp->next;
                if(temp->next) temp->next->prev = temp->prev;
                delete temp;
                return;
            }
            temp = temp->next;
        }
    }

    void traverseForward() {
        Node* temp = head;
        while(temp) { cout << temp->data << " <-> "; temp = temp->next; }
        cout << "NULL\n";
    }

    void traverseBackward() {
        Node* temp = head;
        if(!temp) { cout << "NULL\n"; return; }
        while(temp->next) temp = temp->next;
        while(temp) { cout << temp->data << " <-> "; temp = temp->prev; }
        cout << "NULL\n";
    }
};
