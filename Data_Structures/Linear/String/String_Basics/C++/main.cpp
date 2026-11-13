#include <string>
#include <vector>
using namespace std;

char access_char(const string &s, int index) { return s[index]; }
int string_length(const string &s) { return s.size(); }

vector<char> traverse_string(const string &s) {
    vector<char> res;
    for(char c : s) res.push_back(c);
    return res;
}

string concatenate(const string &s1, const string &s2) { return s1 + s2; }

// Bytes [start, end), with both ends clamped to [0, size]; an empty range gives "".
string substring(const string &s, int start, int end) {
    int n = (int)s.size();
    if(start < 0) start = 0;
    if(end > n) end = n;
    if(end <= start) return "";
    return s.substr(start, end - start);
}
