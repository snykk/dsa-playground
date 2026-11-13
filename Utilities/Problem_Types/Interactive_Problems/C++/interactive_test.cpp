#include <cassert>
#include <deque>
#include <functional>
#include <iostream>
#include <set>
#include <sstream>
#include <streambuf>
#include "interactive.cpp"

// An in-process judge: every complete line the solution writes to cout is passed to a
// handler, and the text it returns becomes the next thing the solution reads from cin.
class Judge {
    class OutBuf : public streambuf {
      public:
        Judge* judge;
        string line;
        int overflow(int c) override {
            if (c == EOF) return c;
            if (c == '\n') {
                judge->log.push_back(line);
                string reply = judge->handler(line);
                if (!reply.empty()) judge->pending += reply + "\n";
                line.clear();
            } else {
                line += (char)c;
            }
            return c;
        }
    };
    class InBuf : public streambuf {
      public:
        Judge* judge;
        string chunk;
        int underflow() override {
            if (judge->pending.empty()) return EOF;  // the solution waits for a reply that never comes
            chunk = judge->pending;
            judge->pending.clear();
            setg(&chunk[0], &chunk[0], &chunk[0] + chunk.size());
            return (unsigned char)chunk[0];
        }
    };

  public:
    function<string(const string&)> handler;
    vector<string> log;
    string pending;
    OutBuf out;
    InBuf in;

    explicit Judge(function<string(const string&)> h) : handler(h) {
        out.judge = this;
        in.judge = this;
    }

    template <class F>
    void run(F fn) {
        streambuf* oldOut = cout.rdbuf(&out);
        streambuf* oldIn = cin.rdbuf(&in);
        cin.clear();
        fn();
        cout.rdbuf(oldOut);
        cin.rdbuf(oldIn);
        cin.clear();
    }

    int queries() const {
        int q = 0;
        for (auto& l : log) q += (!l.empty() && l[0] == '?');
        return q;
    }
};

void testGuessNumber() {
    for (int n = 1; n < 70; n++) {
        int budget = 1;
        while ((1 << (budget - 1)) <= n) budget++;  // bit length + 1
        for (int secret = 1; secret <= n; secret++) {
            bool solved = false;
            Judge judge([&](const string& line) -> string {
                istringstream ss(line);
                string kind;
                int value;
                ss >> kind >> value;
                if (kind == "!") {
                    solved = solved || value == secret;
                    return "";
                }
                if (value == secret) {
                    solved = true;
                    return "correct";
                }
                return secret > value ? "higher" : "lower";
            });
            judge.run([&] { guessNumber(n); });
            assert(solved);
            assert(judge.queries() <= budget);
        }
    }
}

void testFindMaximum() {
    vector<int> values = {5, 9, 2, 7, 1};
    Judge judge([&](const string& line) -> string {
        istringstream ss(line);
        string kind;
        int i, j;
        ss >> kind;
        if (kind == "!") return "";
        ss >> i >> j;
        int a = values[i - 1], b = values[j - 1];
        return to_string((a > b) - (a < b));
    });
    int best = 0;
    judge.run([&] { best = findMaximum(5); });
    assert(best == 2);
    assert(judge.queries() == 4);
    assert(judge.log.back() == "! 2");
}

void testFindMinimumInRotatedArray() {
    for (int n = 1; n <= 40; n++) {
        for (int shift = 0; shift < n; shift++) {
            vector<int> a(n);
            for (int i = 0; i < n; i++) a[i] = (i + shift) % n + 10;  // rotated sorted array
            int minIdx = (n - shift) % n;
            Judge judge([&](const string& line) -> string {
                istringstream ss(line);
                string kind;
                int i;
                ss >> kind >> i;
                if (kind == "!") return "";
                return to_string(a[i - 1]);
            });
            int got = -1;
            judge.run([&] { got = findMinimumInteractive(n); });
            assert(got == minIdx);
            int budget = 1;
            while ((1 << (budget - 1)) < n) budget++;  // ceil(log2 n) + 1
            assert(judge.queries() <= budget);
        }
    }
}

void testGuessSubset() {
    set<int> hidden = {2, 5, 6};
    Judge judge([&](const string& line) -> string {
        istringstream ss(line);
        string kind;
        ss >> kind;
        if (kind == "!") return "";
        int k, x;
        ss >> k;
        while (ss >> x) if (hidden.count(x)) return "1";
        return "0";
    });
    judge.run([&] { guessSubset(7); });
    assert(judge.queries() == 7);
    assert(judge.log.back() == "! 3 2 5 6");
}

void testExploreGraph() {
    vector<vector<int>> graph = {{}, {2, 3}, {1, 4}, {1}, {2}, {}};
    Judge judge([&](const string& line) -> string {
        istringstream ss(line);
        string kind;
        int u;
        ss >> kind >> u;
        string r = to_string(graph[u].size());
        for (int v : graph[u]) r += " " + to_string(v);
        return r;
    });
    judge.run([&] { exploreGraph(5); });
    assert(judge.queries() == 4);  // node 5 is unreachable
}

int main() {
    testGuessNumber();
    testFindMaximum();
    testFindMinimumInRotatedArray();
    testGuessSubset();
    testExploreGraph();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
