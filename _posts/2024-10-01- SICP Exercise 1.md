---
layout: post
title: SICP Exercise in chapter1
date:  2024-10-01 18:00:00 +0900
description: Let's learn some SICP. It's chill so far.
categories: [FP, SICP, Scheme]
keywords: SICP, Scheme
essays: true   
---

# Chapter 1

很早就涉及到尾递归了，这对于递归真的很重要。

## Exercise 1

### 1.1

10

12

8

3

6

a = 3, b =4

19

#f

if (and #t #t) b a-> b -> 4

16

6

16

### 1.2

```
(/
    (= 5 4 
        (- 2 
            (- 3 
                (+ 6 
                    (/ 4 5)
                )
            )
        )
    )
    (* 3
    	(- 6 2)
    	(- 2 7)
    )
)
```

### 1.3

```
#! /bin/racket
#lang racket/base
(define (bigger_sum a b c)
 (cond 
  ((and (< a b) (< a c)) (+ b c))
  ((and (< b a) (< b c)) (+ a c))
  (else (+ (square a) (square b)))
 )
 )

(bigger_sum 1 2 3)
(bigger_sum 7 2 3)
(bigger_sum 5 7 3)
```

### 1.5

> This alternative “fully expand and then reduce” evaluation method is known as normal-order evaluation, in contrast to the “evaluate the arguments and then apply” method that the interpreter actually uses, which is called applicative-order evaluation.

神秘哦。`(define (p) (p))` 会怎么展开我都无法预期，尝试了下会等待输入。

哦，applicative-order 因为传入的时候就会执行会直接卡住。normal-order  会在 if 后还是前展开呢？按这个题意是先判断再展开了吗。

### 1.6

又卡死了。什么情况？是因为不是尾递归导致爆栈了吗？因为 if 和 cond 的计算顺序问题。不应该吧，这个精度没那么大吧。

还真是。哦，还不是精度导致的爆栈，这个就不会停下来，会一直计算，因为没有阻拦，每次递归都作为形参向下传了，多少的精度都会爆。

### 1.7

小数误差大好理解，大数为什么也不行呢？

哦，因为大数的两个乘数之间差太少了，导致 improve 没法发展，会一直循环下去。

多传一个上次迭代的 guess，再改下 good-enough? 即可。

### 1.8

```
#! /bin/racket
#lang racket/base

(define (square x) (* x x))
 (define (improve_cube guess x)
 (/ (+ (/ x (square guess)) (* 2 guess))
       3))

(define (tri x)
(* x x x)
)
(define (cube_good_enough? guess x)
 (< (abs (- (tri guess) x)) 0.001))
 

 (define (cube_iter guess x)
    (if (cube_good_enough? guess x)
    guess
    (cube_iter (improve_cube guess x) x))
 )

 (define (cube x)
    (cube_iter 1.0 x)
 )

 (cube 8)
 (cube 27)
 (cube 64)
```

### 1.9

The first one is recursive, the second one is iterative.

### 1.10

```
(A 1 10) -> (A 0 (A 1 9)) ->  (A 0  (A 0 (A 1 8)) ) -> (* 2  (A 0 (A 1 8)) ) -> (* 2 (* 2  (A 1 8)) ) -> 2^10
```

that is `( A 1 n ) -> (pow 2 n)`

```
(A 2 4) -> ( A 1 ( A 2 3 ) ) -> ( pow 2 ( A 2 3 ) ) -> ( pow 2 ( pow 2 ( A 2 2 ) ) ) -> ( pow 2 ( pow 2  ( pow 2 ( A 2 1 ) )  ) ) ->  ( pow 2 ( pow 2  ( pow 2 2 )  ) ) -> 65536
```

that is `( A 2 y ) -> (pow  2 (pow 2 (pow...`

```
(A 3 3) -> ( A 2 ( A 3 2) ) -> ( A 2 ( A 2 ( A 3 1 ) ) ) -> ( A 2 ( A 2 2 ) ) -> ( A 2 4 ) -> 65536
```

So,

`(define (f n) (A 0 n)) -> (define (f n) (* 2 n))`

```
(define (pow a b) 
    (if (= b 0)
        a
        (* a (pow a (- b 1)))
    )
)
```

` (define (g n) (A 1 n)) -> (define (g n) (pow 2 n))`

`(define (h n) (A 2 n))-> (pow  2 (pow 2 (pow...`

