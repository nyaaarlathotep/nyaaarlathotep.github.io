---
layout: sicp
title: SICP Exercise in chapter1
date: 2024-10-01 18:00:00 +0900
description: Let's learn some SICP. It's chill so far.
categories: [FP, SICP, Scheme]
keywords: SICP, Scheme
essays: true
---

# Chapter 1

很早就涉及到尾递归了，这对于递归真的很重要。

Due to the shitty input method, I have no choice but to use English.

~~A standard Chinese answer to the book's exercises: https://sicp.readthedocs.io/en/latest/index.html~~ This answer left a lot of errors unresolved and the matainer seems unavailable. Use the wiki instead.

- linear recursive process
  - iterative process
  - recursive process

- Tree Recursion

### order

- normal-order
- applicative-order

The detailed mathematical explanation of orders of growth.

### first-class elements

> ###  Some of the “rights and privileges” of first-class elements are
>
> - They may be named by variables.
> - They may be passed as arguments to procedures.
> - They may be returned as the results of procedures.
> - They may be included in data structures.

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

### 1.34

Just bug.

```
> (f f)
; application: not a procedure;
;  expected a procedure that can be applied to arguments
;   given: 2
; [,bt for context]
```

The interpreter try to apply `2`  to `f` which is illegal.

### 1.35

```
> (fixed-point (lambda (x) (+ 1 (/ 1 x)))
               1.0)
1.6180327868852458
```

### 1.36

```
(define (fixed-point f first-guess)
  (define (close-enough? v1 v2)
    (< (abs (- v1 v2)) 
       tolerance))
  (define (try guess)
  	(display guess)
  	(newline)
    (let ((next (f guess)))
      (if (close-enough? guess next)
          next
          (try next))))
  (try first-guess))
```

```
> (fixed-point (lambda (x) (/ (log 1000) (log x)))
               2.0)
2.0
9.965784284662087
3.004472209841214
6.279195757507157
3.759850702401539
5.215843784925895
4.182207192401397
4.8277650983445906
4.387593384662677
4.671250085763899
4.481403616895052
4.6053657460929
4.5230849678718865
4.577114682047341
4.541382480151454
4.564903245230833
4.549372679303342
4.559606491913287
4.552853875788271
4.557305529748263
4.554369064436181
4.556305311532999
4.555028263573554
4.555870396702851
4.555315001192079
4.5556812635433275
4.555439715736846
4.555599009998291
4.555493957531389
4.555563237292884
4.555517548417651
4.555547679306398
4.555527808516254
4.555540912917957
4.555532270803653
```

### 1.37

#### 1.

```
(define (cont-frac n d k)
	(define (aux count)
		(if (= count k)
			(/ (n k) (d k))
			(/ (n k) (+ (d k) (aux (+ count 1))))
		)
	)
	(aux 1)
)
```

k=11 is enough. The value won't change once k is big enough.

```
> (cont-frac (lambda (i) 1.0)
             (lambda (i) 1.0)
             11)
0.6180555555555556
> (cont-frac (lambda (i) 1.0)
             (lambda (i) 1.0)
             10)
0.6179775280898876

```

#### 2.

Ok then.

```
(define (cont-frac n d k)
	(define (aux count res)
		(if (= count 0)
			res
			(aux (- count 1) (/ (n k) (+ (d k) res)))
		)
	)
	(aux (- k 1) (/ (n k) (d k)))
)
```

### 1.38

```
(define (integer-division a b)
	(/ (- a (modulo a b)) b)
)
```



```
(define (Euler k)
	(cont-frac 
		(lambda (x) 1)
		(lambda (x) 
			(if (= (modulo x 3) 2)
				(* 2 (+ 1 (integer-division x 3)))
				1
			)
		)
		k
	)
)

```

### 1.39

```
(define (tan-cf x k)
	(cont-frac 
		(lambda (x)
			(if (= 1 x)
				x
				(- (square x))
			)
		)
		(lambda (x)
			(- (* 2 x) 1)
		) 
		k)
)
```

This answer has a lot differences with the inner function `tan`. Why?

### 1.40

```
(define (cubic a b c)
	(lambda (x)
		(+
			(* x x x)
			(* a (square x))
			(* b x)
			c
		)
	)
)
```

### 1.41

LOL. The question itself is rather complex.

```
(define (double f)
	(lambda (x)
		(f (f x))
	)
)

```

```
> (((double (double double)) inc) 5)
21

```

### 1.42

```
(define (compose f g)
	(lambda (x)
		(f (g x))
	)
)
```

### 1.43

```
(define (repeated f n)
	(if (= 1 n)
		f
		(compose f (repeated f (- n 1)))
	)

)
```

### 1.44

```
(define dx 0.00001)
```

```
(define (smooth f)
	(lambda (x)
		(/
		(+ 
			(f x)
			(f (+ x dx))
			(f (- x dx))
		)
		3
		)
	)
)
```

```
> ((smooth floor) 0.9)
0.0
> ((smooth floor) 0.999999999999)
0.3333333333333333
> ((smooth floor) 1.0)
0.6666666666666666
> ((smooth floor) 1.000000000001)
0.6666666666666666
> ((smooth floor) 1.1)
1.0

```

```
> (((repeated smooth 3) floor) 1.00001)
0.8518518518518517
> (((repeated smooth 3) floor) 1.00002)
0.8518518518518517
> (((repeated smooth 3) floor) 1.00003)
0.9629629629629629
> (((repeated smooth 3) floor) 1.00004)
1.0
> (((repeated smooth 5) floor) 1.00004)
0.9753086419753085
> (((repeated smooth 10) floor) 1.00004)
0.9120560890108215

```

### 1.45

> ## 收敛条件
>
> 接着要解决的问题是，找出计算 nn 次方根和收敛计算所需的平均阻尼次数之间的关系，以下是一些实验数据：
>
> | n 次方根               | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | ...  | 15   | 16   | ...  | 31   | 32   | ...  |
> | :--------------------- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
> | 收敛所需的平均阻尼次数 | 1    | 1    | 1    | 2    | 2    | 2    | 2    | 3    | ...  | 3    | 4    | ...  | 4    | 5    | ...  |
>
> 可以看出，要使得计算 nn 次方根的不动点收敛，最少需要 ⌊lgn⌋⌊lg⁡n⌋ 次平均阻尼。

Ok. The minum times we need is floor(log(2) n).

> ```
> (define tolerance 0.00001)
> (define (fixed-point f first-guess)
>  (define (close-enough? v1 v2)
>  (< (abs (- v1 v2))
>  tolerance))
>  (define (try guess)
>  (let ((next (f guess)))
>  (if (close-enough? guess next)
>  next
>  (try next))))
>  (try first-guess))
> 
>  (define (average-damp f)
>  (lambda (x) (average x (f x))))
> 
> (define (average-damp-n-times f n)
>     ((repeated average-damp n) f))
> 
> (define (damped-nth-root n damp-times)
>     (lambda (x)
>         (fixed-point 
>             (average-damp-n-times 
>                 (lambda (y) 
>                     (/ x (expt y (- n 1)))) 
>                 damp-times)
>             1.0)))
> 
> 
> (define (lg n)
>     (cond ((> (/ n 2) 1)
>             (+ 1 (lg (/ n 2))))
>           ((< (/ n 2) 1)
>             0)
>           (else
>             1)))
> 
> 
> (define (nth-root n)
>     (damped-nth-root n (lg n)))
> 
> ```

### 1.46

```
(define (iterative-improve good-enough? improve)
    (define (try x)
        (if (good-enough? x)
            x
            (try (improve x))
        )
    )
    (lambda (x) (try x))
)

```

```
(define (sqrt x)
    ((iterative-improve 
    (lambda (guess) 
        (< (abs (- (square guess) x)) 0.001)
    ) 
    (lambda (guess)
        (average guess (/ x guess))
    )
    ) 1)
)

```

It's not the best solution, I use the `(f guess)` twice.

```
(define (fixed-point f first-guess)
    ((iterative-improve 
    (lambda (guess) (< (abs (- guess (f guess))) 0.00001))
    f
    ) first-guess)
)

```

Ok, I'd better improve it. This one is much more universal.

> ```
> (define (iterative-improve close-enough? improve)
>     (lambda (first-guess)
>         (define (try guess)
>             (let ((next (improve guess)))
>                 (if (close-enough? guess next)
>                     next
>                     (try next))))
>         (try first-guess)))
> ```
