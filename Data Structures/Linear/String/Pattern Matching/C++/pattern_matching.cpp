#include <vector>
#include <string>
#include <iostream>
#include <unordered_map>
using namespace std;

// Naive search
vector<int> naive_search(const string &text, const string &pattern){
    vector<int> indices;
    int n = text.size(), m = pattern.size();
    for(int i=0;i<=n-m;i++){
        if(text.substr(i,m)==pattern) indices.push_back(i);
    }
    return indices;
}

// KMP
vector<int> compute_lps(const string &pattern){
    int m = pattern.size();
    vector<int> lps(m,0);
    int len=0,i=1;
    while(i<m){
        if(pattern[i]==pattern[len]){
            len++; lps[i]=len; i++;
        }else{
            if(len!=0) len = lps[len-1];
            else { lps[i]=0; i++; }
        }
    }
    return lps;
}

vector<int> kmp_search(const string &text, const string &pattern){
    vector<int> indices;
    int n=text.size(), m=pattern.size();
    vector<int> lps = compute_lps(pattern);
    int i=0,j=0;
    while(i<n){
        if(pattern[j]==text[i]) { i++; j++; }
        if(j==m){ indices.push_back(i-j); j=lps[j-1]; }
        else if(i<n && pattern[j]!=text[i]){
            if(j!=0) j=lps[j-1]; else i++;
        }
    }
    return indices;
}