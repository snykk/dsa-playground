#include <string>
#include <algorithm>
#include <vector>
#include <cctype>
using namespace std;

string reverse_string(const string &s){
    string res = s;
    reverse(res.begin(), res.end());
    return res;
}

// Two pointers walk towards the middle: O(n) time, O(1) extra space.
// It compares bytes, so a multi-byte UTF-8 character is not treated as one unit.
bool is_palindrome(const string &s){
    if(s.empty()) return true;
    for(size_t i = 0, j = s.size() - 1; i < j; i++, j--)
        if(s[i] != s[j]) return false;
    return true;
}

int count_vowels(const string &s){
    string vowels = "aeiouAEIOU";
    int cnt = 0;
    for(char c : s) if(vowels.find(c)!=string::npos) cnt++;
    return cnt;
}

string replace_char(string s, char oldc, char newc){
    replace(s.begin(), s.end(), oldc, newc);
    return s;
}

string to_upper(string s){
    transform(s.begin(), s.end(), s.begin(),
              [](unsigned char c){ return (char)toupper(c); });
    return s;
}

string to_lower(string s){
    transform(s.begin(), s.end(), s.begin(),
              [](unsigned char c){ return (char)tolower(c); });
    return s;
}

// Like Python's split(sep) and Go's strings.Split: empty fields are kept, so
// "a b " gives {"a", "b", ""} and "" gives {""}.
vector<string> split_string(const string &s, char sep=' '){
    vector<string> res;
    size_t start = 0;
    while(true){
        size_t pos = s.find(sep, start);
        if(pos == string::npos){
            res.push_back(s.substr(start));
            break;
        }
        res.push_back(s.substr(start, pos - start));
        start = pos + 1;
    }
    return res;
}

string join_string(const vector<string> &v, const string &sep=" "){
    string res;
    for(size_t i=0;i<v.size();i++){
        res += v[i];
        if(i<v.size()-1) res += sep;
    }
    return res;
}