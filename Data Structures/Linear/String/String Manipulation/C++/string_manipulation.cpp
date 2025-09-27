#include <string>
#include <algorithm>
#include <vector>
#include <sstream>
using namespace std;

string reverse_string(const string &s){
    string res = s;
    reverse(res.begin(), res.end());
    return res;
}

bool is_palindrome(const string &s){
    return s == reverse_string(s);
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
    transform(s.begin(), s.end(), s.begin(), ::toupper);
    return s;
}

string to_lower(string s){
    transform(s.begin(), s.end(), s.begin(), ::tolower);
    return s;
}

vector<string> split_string(const string &s, char sep=' '){
    vector<string> res;
    stringstream ss(s);
    string word;
    while(getline(ss, word, sep)) res.push_back(word);
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