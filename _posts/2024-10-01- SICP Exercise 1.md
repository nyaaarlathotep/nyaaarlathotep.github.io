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

神秘哦。(define (p) (p)) 会怎么展开我都无法预期，尝试了下会等待输入。

哦，applicative-order 因为传入的时候就会执行会直接卡住。normal-order  会在 if 后还是前展开呢？按这个题意是先判断再展开了吗。
