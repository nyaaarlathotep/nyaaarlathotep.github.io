---
layout: sicp
title: SICP Exercise in chapter1
date:  2024-10-01 18:00:00 +0900
description: Let's learn some SICP. It's chill so far.
categories: [FP, SICP, Scheme]
keywords: SICP, Scheme
essays: true   
---

# Chapter 1

很早就涉及到尾递归了，这对于递归真的很重要。

- linear recursive process
  - iterative process
  - recursive process

- Tree Recursion

### order

- normal-order
- applicative-order

The detailed mathematical explanation of orders of growth.

## 1.1

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

## 1.2

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

### 1.11

recursive process:

```
(define (f n) 
	(if (< n 3) 
		n
		(+ 
			(f (- n 1))
			(* 2 (f (- n 2)))
			(* 3 (f (- n 3)))
		)
	)
)
```

 iterative process.

```
(define (f n)
    (cond ((< n 3) n)
    (else (f_iter 2 1 0 (- n 2))))
)

(define (f_iter a b c count)
    (if (= count 0)
        a
        (f_iter (+ a (* 2 b) (* 3 c)) a b (- count 1))))
```

### 1.12

The procedure takes row as x, column as y and index from 1.

```
(define (pascal x y)
    (cond 
        ((or (= y 1) (= y x)) 1)
        (else (+ (pascal (- x 1) (- y 1)) (pascal (- x 1) y)))
    )
)
```

### 1.13

Math class, isn't it?

### 1.14

steps: O(2^n)? There are two cases every step.

### 1.15

a. 5 times.

12.15/3 = 4.05

4.05/3 = 1.35

1.35/3 = 0.45

0.45/3 = 0.15

0.15/3 = 0.05

b. space: O(log(n)), time: O(log(n))

3^x = n-> x = log(n)

### 1.16

```
(define (fast_iter_expt b n)
    (define (aux res base remain_n)
        (cond 
            ((= remain_n 1) (* res base))
            ((even? remain_n) (aux res (* base base) (/ remain_n 2)))
            (else (aux (* res base) base (- remain_n 1)))
        )
    )
    (aux 1 b n)
)
```

### 1.17

```
(define (alter_mup a b) 
    (cond
        ((= b 1) a)
        ((even? b) (alter_mup (double a) (halve b)))
        (else (+ a (alter_mup a (- b 1))))
    )
)
```

### 1.18

well, did I misunderstand?

```
(define (alter_iter_mup a b) 
    (define (aux res base remain_n)
        (cond 
            ((= remain_n 1) (+ res base))
            ((even? remain_n) (aux res (double base) (halve remain_n)))
            (else (aux (+ res base) base (- remain_n 1)))
        )
    )
    (aux 0 a b)
)
```

### 1.19

Oh, How would you come up with that. It's still a computation. Let's have a try.

really, It's much harder than I expected.

```
(define (fib n)
 (fib-iter 1 0 0 1 n))
(define (fib-iter a b p q count)
 (cond ((= count 0) b)
 ((even? count)
 (fib-iter a
 b
 (+ (* p p) (* q q))
 (+ (* p q) (* p q) (* q q))
 (/ count 2)))
 (else (fib-iter (+ (* b q) (* a q) (* a p))
 (+ (* b p) (* a q))
 p
 q
 (- count 1)))))
```

### 1.20

About 2 times?

### 1.21

```
> (smallest-divisor 199)
199
> (smallest-divisor 1999)
1999
> (smallest-divisor 19999)
7
```

What should I expected, 19999 takes a lot of time?

### 1.22

racket is hard to deal with output.

``` 
 (define (find-primes-bigger start count)
    (define (aux now c)
        (cond ((= c count) (newline))
            ((timed-prime-test now) 
             (display now) 
             (newline) 
             (aux (+ 1 now) (+ 1 c)))
            (else (aux (+ 1 now) c))
        )
    )
    (aux start 0)
 )
```

### 1.23

```
(define (next n)
    (if (odd? n)
        (+ 2 n)
        (+ 1 n)))

(define (prime? n)
 (= n (smallest-divisor n)))
(define (smallest-divisor n) (find-divisor n 2))
(define (find-divisor n test-divisor)
 (cond ((> (square test-divisor) n) n)
 ((divides? test-divisor n) test-divisor)
 (else (find-divisor n (next test-divisor)))))
(define (divides? a b) (= (remainder b a) 0))
```

### 1.24

### 1.25

honestly, I thought so. 

There are still differences. The book's expmod will `remainder`after every square call, while the Hacker's expmod will only `remainder` at last which is not capable for bigger number.

### 1.26

The expmod will be executed twice, just like the normal-order mentioned before. So, this make the O(log n) turn to O(n).

### 1.27

```
(define (fermat-fool? n)
    (define (aux times)
        (cond 
            ((= times n) true)
            ((= (expmod times n n) times) (aux (+ times 1)))
            (else false)
        )
    )
    (aux 1)
)
```

```
> (fermat-fool? 561)
#t
> (fermat-fool? 1105)
#t
> (fermat-fool? 1729)
#t
> (fermat-fool? 2465)
#t
> (fermat-fool? 2821)
#t
> (fermat-fool? 6601)
#t
```

### 1.28

> 因为在计算 $$a^{n-1}$$ 时只有一半的几率会遇到 $1$ 取模 $n$ 的非平凡方根，因此我们至少要执行测试 $n/2$ 次才能保证测试结果的准确性（是的， Miller-Rabin 测试也是一个概率函数）。

really.	

```

(define (non-zero-random n)
    (let ((r (random n)))
        (if (not (= r 0))
            r
            (non-zero-random n))))

(define (Miller-Rabin-test n)
    (let ((times (ceiling (/ n 2))))
        (test-iter n times)))

(define (test-iter n times)
    (cond ((= times 0)
            #t)
          ((= (rabin-expmod (non-zero-random n) (- n 1) n)
              1)
            (test-iter n (- times 1)))
          (else
            #f)))

(define (rabin-expmod base exp m)
 (cond ((= exp 0) 1)
    ((and (= (remainder (square base) m ) 1) (not (= base 1)) (not (= base (- m 1)))) 0)
    ((even? exp)
        (remainder
            (square (rabin-expmod base (/ exp 2) m))
            m))
    (else
        (remainder
        (* base (rabin-expmod base (- exp 1) m))
        m))))

```

### 1.29

The problem is how to define the `next` here. I changed the `sum`.

```
(define (simpson-sum term a next b times)
 (if (> a b)
 0
 (+ (* (term a) times)
 (simpson-sum term (next a) next b (
    if (= times 4) 2 4    
 )))))

(define (simpson-intergal f a b n)
    (let ((h (/ (- b a) n)))
        (define (add-dx x)
            (+ h x))
        (* (+ (simpson-sum f (+ a h) add-dx (- b h) 4) (f a) (f b)) (/ h 3))
    )
)
```

Any idea?

```
> (simpson-intergal cube 0 1 100)
1/4
> (simpson-intergal cube 0 1 1000)
1/4
> (simpson-intergal cube 0 1 10000)
1/4
> (simpson-intergal cube 0 1 1)
1/3
```

```
> (integral cube 0 1 0.01)
0.24998750000000042
> (integral cube 0 1 0.001)
0.249999875000001
> (integral cube 0 1 0.0001)
0.24999999874993412
> (integral cube 0 1 0.00001)
0.24999999998662864
> (integral cube 0 1 0.000001)
0.2500000000014447
```

wtf... Let's see the right answer.

ok, pass the `k` rather than the num itself.

```
(define (simpson f a b n)
    
    (define h (/ (- b a) n))

    (define (y k)
        (f (+ a (* k h))))

    (define (factor k)
        (cond ((or (= k 0) (= k n))
                1)
              ((odd? k)
                4)
              (else
                2)))
    
    (define (term k)
        (* (factor k)
           (y k)))

    (define (next k)
        (+ k 1))

    (if (not (even? n))
        (error "n can't be odd")
        (* (/ h 3)
           (sum term (exact->inexact 0) next n))))

```

### 1.30

```
(define (sum term a next b)
 (define (iter a result)
 (if ()> a b)
 result
 (iter (next a) (+ result (term a)))))
 (iter a 0))
```

### 1.31

#### a.

```
(define (product term a next b)
    (define (iter a res)
    (if (> a b)
    res
    (iter (next a) (* res (term a)))
    ))
    (iter a 1)
)
```

factorial:

```
(defin (factorial s e)
(define (term a)
    a
)
(define (next a)
    (+ 1 a)
)
(product term s next e)
)
```

It seems bad for calculation speed to divide it to two parts.

```
(define (pi-appro k)
    (define (next a)
        (+ a 1)
    )
    (define (term-down k)
        (- (+ k 2) (modulo (+ k 1) 2))
    )
    (define (term-up k)
        (- (+ k 2) (modulo (+ k 2) 2))
    )

    (* (/ (product term-up 1 next k) (product term-down 1 next k)) (exact->inexact 4))
)
```

#### b.

```
(define (product term a next b)
 (if (> a b)
 1
 (* (term a)
 (product term (next a) next b))))
```

### 1.32

null-value -> identity 幺元.

#### a.

```
(define (accumulate combiner null-value term a next b)
    (define (iter a res)
    (if (> a b)
    res
    (iter (next a) (combiner res (term a)))
    ))
    (iter a null-value)
)
```

```
(define (product term a next b)
    (accumulate * 1 term a next b)
)
```

```
> (product (lambda (x) x) 1 (lambda (x) (+ x 1)) 3)
6
> (product (lambda (x) x) 1 (lambda (x) (+ x 1)) 4)
24
> (product (lambda (x) x) 1 (lambda (x) (+ x 1)) 5)
120
```

```
(define (sum term a next b)
    (accumulate + 0 term a next b)
)
```

#### b.

```
(define (accumulate combiner null-value term a next b)
 (if (> a b)
 null-value
 (combiner (term a)
 (accumulate combiner null-value term (next a) next b))))
```

### 1.33

```
(define (filtered-accumulate combiner null-value term a next b predicate)
    (define (iter a res)
    (if (> a b)
    res
    (if (predicate a)
        (iter (next a) (combiner res (term a)))
        (iter (next a) res)
    )
    ))
    (iter a null-value)
)
```

#### a.

```
(define (sum-prime-square a b)
    (filtered-accumulate + 0 square a add1 b prime?)
)
```

#### b.

```
(define (product-less-gcd n)
    (filtered-accumulate * 1 (lambda (x) x) 1 add1 n (lambda (x) (= 1 (gcd x n))))
) 
```



