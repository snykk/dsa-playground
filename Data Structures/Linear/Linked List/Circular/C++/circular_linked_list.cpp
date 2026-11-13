#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val): data(val), next(nullptr) {}
};

class CircularLinkedList {
public:
    Node* head;
    CircularLinkedList(): head(nullptr) {}

    // Owns its nodes: copying would make two lists free the same ring.
    CircularLinkedList(const CircularLinkedList&) = delete;
    CircularLinkedList& operator=(const CircularLinkedList&) = delete;

    ~CircularLinkedList() {
        if(!head) return;
        Node* tail = head;
        while(tail->next != head) tail = tail->next;
        tail->next = nullptr;  // open the ring, then free it as a plain chain
        while(head) {
            Node* next = head->next;
            delete head;
            head = next;
        }
    }

    void insertAtHead(int val) {
        Node* newNode = new Node(val);
        if(!head) {
            head = newNode;
            newNode->next = head;
            return;
        }
        Node* temp = head;
        while(temp->next != head) temp = temp->next;
        newNode->next = head;
        head = newNode;
        temp->next = head;
    }

    void insertAtTail(int val) {
        Node* newNode = new Node(val);
        if(!head) {
            head = newNode;
            newNode->next = head;
            return;
        }
        Node* temp = head;
        while(temp->next != head) temp = temp->next;
        temp->next = newNode;
        newNode->next = head;
    }

    void deleteValue(int key) {
        if(!head) return;
        if(head->next == head) {  // a single node: it is also the tail
            if(head->data == key) {
                delete head;
                head = nullptr;
            }
            return;
        }
        Node *curr = head, *prev = nullptr;
        do {
            if(curr->data == key) {
                if(prev) {
                    prev->next = curr->next;
                } else {
                    Node* tail = head;
                    while(tail->next != head) tail = tail->next;
                    head = curr->next;
                    tail->next = head;
                }
                delete curr;
                return;
            }
            prev = curr;
            curr = curr->next;
        } while(curr != head);
    }

    void traverse(int limit=10) {
        if(!head) return;
        Node* temp = head;
        int count = 0;
        do {
            cout << temp->data << " ";
            temp = temp->next;
            count++;
        } while(temp != head && count < limit);
        cout << endl;
    }
};