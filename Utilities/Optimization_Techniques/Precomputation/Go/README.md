# Precomputation (Go)

Go implementation of precomputation techniques.

## Features

- Factorials and inverse factorials
- Prime sieve
- Smallest Prime Factor (SPF)
- Prefix sums

## Usage

```go
fact := NewFactorials(1000, MOD)
fmt.Println(fact.NCr(10, 3))

primes, isPrime := Sieve(100)
ps := NewPrefixSum(arr)
sum := ps.Query(l, r)
```

