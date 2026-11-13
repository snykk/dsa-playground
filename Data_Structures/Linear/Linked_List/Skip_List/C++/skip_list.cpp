#include <iostream>
#include <vector>
#include <random>
using namespace std;

struct Node {
    int key;
    vector<Node*> forward;
    Node(int key, int level) : key(key), forward(level + 1, nullptr) {}
};

class SkipList {
    int max_level;
    float p;
    int level;
    Node* header;
    mt19937 rng;  // per-instance generator: does not touch the global rand() state

    int randomLevel() {
        bernoulli_distribution coin(p);
        int lvl = 0;
        while (lvl < max_level && coin(rng))
            lvl++;
        return lvl;
    }

public:
    SkipList(int max_level = 16, float p = 0.5)
        : max_level(max_level), p(p), level(0), rng(random_device{}()) {
        // The header key is a placeholder: it is never compared with a real key.
        header = new Node(-1, max_level);
    }

    // The destructor frees the nodes, so a shallow copy would free them twice.
    SkipList(const SkipList&) = delete;
    SkipList& operator=(const SkipList&) = delete;

    ~SkipList() {
        Node* current = header;
        while (current) {
            Node* next = current->forward[0];
            delete current;
            current = next;
        }
    }

    void insert(int key) {
        vector<Node*> update(max_level + 1, nullptr);
        Node* current = header;

        for (int i = level; i >= 0; i--) {
            while (current->forward[i] && current->forward[i]->key < key)
                current = current->forward[i];
            update[i] = current;
        }

        current = current->forward[0];

        if (current && current->key == key)
            return;

        int new_level = randomLevel();

        if (new_level > level) {
            for (int i = level + 1; i <= new_level; i++)
                update[i] = header;
            level = new_level;
        }

        Node* new_node = new Node(key, new_level);

        for (int i = 0; i <= new_level; i++) {
            new_node->forward[i] = update[i]->forward[i];
            update[i]->forward[i] = new_node;
        }
    }

    bool search(int key) {
        Node* current = header;

        for (int i = level; i >= 0; i--) {
            while (current->forward[i] && current->forward[i]->key < key)
                current = current->forward[i];
        }

        current = current->forward[0];

        return current != nullptr && current->key == key;
    }

    bool deleteNode(int key) {
        vector<Node*> update(max_level + 1, nullptr);
        Node* current = header;

        for (int i = level; i >= 0; i--) {
            while (current->forward[i] && current->forward[i]->key < key)
                current = current->forward[i];
            update[i] = current;
        }

        current = current->forward[0];

        if (!current || current->key != key)
            return false;

        for (int i = 0; i <= level; i++) {
            if (update[i]->forward[i] != current)
                break;
            update[i]->forward[i] = current->forward[i];
        }

        delete current;

        while (level > 0 && header->forward[level] == nullptr)
            level--;

        return true;
    }

    vector<int> display() {
        vector<int> elems;
        Node* current = header->forward[0];
        while (current) {
            elems.push_back(current->key);
            current = current->forward[0];
        }
        return elems;
    }
};
