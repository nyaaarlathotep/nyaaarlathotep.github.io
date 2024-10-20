---
layout: sicp
title: SICP Exercise in chapter2
date: 2024-10-14 18:00:00 +0900
description: Let's learn some SICP. Indeed.
categories: [FP, SICP, Scheme]
keywords: SICP, Scheme
essays: true
---

# Chapter 2

The abstraction of data lead to the interface of the data.

Church numerals...

## 2.1

### 2.1

```
(define (make-rat n d)
 (let ((g (gcd n d)))
 (if (< (* n d) 0)
    (cons (- (abs (/ n g))) (abs (/ d g)))
    (cons (abs (/ n g)) (abs (/ d g)))
 )
 )
)
```

```
> (make-rat 2 -3)
'(-2 . 3)
> (make-rat 2 3)
'(2 . 3)
> (make-rat -2 3)
'(-2 . 3)
> (make-rat -2 -3)
'(2 . 3)
```

### 2.2

```
(define (print-point p)
 (display "(")
 (display (x-point p))
 (display ",")
 (display (y-point p))
 (display ")"))


(define (x-point p)
   (car p)
)
(define (y-point p)
   (cdr p)
)
(define (make-point x y)
   (cons x y)
)
(define (make-segment x y)
   (cons x y)
)
(define (start-segment s)
   (car s)
)
(define (end-segment s)
   (cdr s)
)

(define (midpoint-segment s)
   (make-point 
      (average (x-point (start-segment s)) (x-point (end-segment s)))
      (average (y-point (start-segment s)) (y-point (end-segment s)))
   )
)
```

### 2.3

Maybe add another layer for edge length?

```
(define (make-rectangle a b)
   (cons a b)
)
(define (edge-a s)
   (car s)
)
(define (edge-b s)
   (cdr s)
)
(define (point-length one two)
)

(define (side-length r)
   (let ((a (edge-a r)))
   (let ((b (edge-b r)))
   (cons
      (point-length (start-segment a) (end-segment a))
      (point-length (start-segment b) (end-segment b))
   )
   )
   )
)

(define (area r)
(let ((edge-lengths (side-length r)))
   (* (car edge-lengths) (cdr edge-lengths))
)
)

(define (perimeter r)
(let ((edge-lengths (side-length r)))
   (* 2 (+ (car edge-lengths) (cdr edge-lengths)))
)
)
```

### 2.4

```
 (define (cons x y)
 (lambda (m) (m x y)))
 (define (car z)
 (z (lambda (p q) p)))
 (define (cdr z)
 (z (lambda (p q) q)))
```

```
> (cons 1 2)
#<procedure>
> (car (cons 1 2))
1
> (cdr (cons 1 2))
2
```

### 2.5

I don't get it, it just means some renames?

Ok. 

```
(define (cons a b)
    (* (expt 2 a) (expt 3 b))
)

(define (car z)
    (if ( = (remainder z 2) 0)
        (+ 1 (car (/ z 2)))
        0
    )
)
(define (cdr z)
    (if ( = (remainder z 3) 0)
        (+ 1 (cdr (/ z 3)))
        0
    )
)
```

### 2.6

Wow... The num means applying how many `f` to `x`. So if you take zero and add as x and f, then the whole pack would be the real nums.

```
(define one
    (lambda (f)
        (lambda (x) (f x))
    )
)
(define two
    (lambda (f)
        (lambda (x) (f (f x)))
    )
)
```

Good news, a + b = b + a.

```
(define (plus a b)
    (lambda (f)
        (lambda (x)
            ((b f) ((a f) x))
        )
    )
)
```

Let me guess, what is the definition of multiply?

Well then. Instead of handling x, let's handle f.

```
(define (multiply a b)
    (lambda (f)
        (lambda (x)
            ((b (a f)) x)
        )
    )
)
```

So, the function comes first than the num itself?

some test:

```
> ((two add1) 3)
5
> ((one add1) 3)
4
> (((plus one two) add1) 3)
6
> (((multiply two two) add1) 3)
7
```

### 2.7

```
(define (make-interval a b) (cons a b))
```

```
    (define (upper-bound c)
        (max (car c) (cdr c))
    )
    (define (lower-bound c)
        (min (car c) (cdr c))
    )
```

### 2.8

```
(define (sub-interval x y)
  (make-interval (- (upper-bound x) 
                    (lower-bound y))
                 (- (lower-bound x) 
                    (upper-bound y))))
```

### 2.9

Both addition and subtraction result in a interval of the sum of two intervals.

It's obvious multiply and divide don't have a proper function of interval for negative numbers.

### 2.10

How to signal a error in Scheme?

```
(define (div-interval x y)
  (if (or (<= 0 (upper-bound y)) (<= 0 (lower-bound y)))
  	(raise "some bound is zero")
    (mul-interval x 
                (make-interval 
                 (/ 1.0 (upper-bound y)) 
                 (/ 1.0 (lower-bound y))))
  )
)
```

```
(define (make-interval a b)
	(if (or (<= 0 (upper-bound y)) (<= 0 (lower-bound y)))
		(raise "some bound is zero")
		(cons a b)
	)
)
```

### 2.11

3*3 = 9 cases in which every case is different. Obviously, it need 4 multiply when two interval are both neg-pos.

 Rewrite this procedure using Ben’s suggestion.

I copied, it's quite annoying.

```
(define (mul-interval x y)
  (let ((low-x (lower-bound x))
        (low-y (lower-bound y))
        (up-x (upper-bound x))
        (up-y (upper-bound y)))
    (cond ((and (>= low-x 0) (>= up-x 0))
           (cond ((and (>= low-y 0) (>= up-y 0)) ; + + | + +
                  (make-interval (* low-x low-y)
                                 (* up-x up-y)))
                 ((and (<= low-y 0) (>= up-y 0)) ; + + | - +
                  (make-interval (* up-x low-y)
                                 (* up-x up-y)))
                 ((and (<= low-y 0) (<= up-y 0)) ; + + | - -
                  (make-interval (* up-x low-y)
                                 (* low-x up-y)))))
          ((and (<= low-x 0) (>= up-x 0))
           (cond ((and (>= low-y 0) (>= up-y 0)) ; - + | + +
                  (make-interval (* low-x up-y)
                                 (* up-x up-y)))
                 ((and (<= low-y 0) (>= up-y 0)) ; - + | - + 
                  (make-interval (min (* low-x up-y) (* up-x low-y))
                                 (max (* low-x low-y) (* up-x up-y))))
                 ((and (<= low-y 0) (<= up-y 0)) ; - + | - -
                  (make-interval (* up-x low-y)
                                 (* low-x low-y)))))
          ((and (<= low-x 0) (<= up-x 0))
           (cond ((and (>= low-y 0) (>= up-y 0)) ; - - | + +
                  (make-interval (* low-x up-y)
                                 (* up-x low-y)))
                 ((and (<= low-y 0) (>= up-y 0)) ; - - | - +
                  (make-interval (* low-x up-y)
                                 (* low-x low-y)))
                 ((and (<= low-y 0) (<= up-y 0)) ; - - | - -
                  (make-interval (* up-x up-y)
                                 (* low-x low-y))))))))
```

### 2.12

```
(define (make-center-percent c w)
  (make-interval (- c (* c w)) (+ c (* c w))))
  
(define (center i)
  (/ (+ (lower-bound i) 
        (upper-bound i)) 
     2))
     
(define (percent i)
	(/
		(- (upper-bound i) (center i)) 
	    (center i)
	)
)
```

### 2.13

Since the tolerance is small enough, I'd try to simplify the formula by ignoring part of the res.

The new multiply assuming all the numbers are positive:

```
(define (mul-interval x y)
    (make-interval (* (upper-bound x) (upper-bound y))
                   (* (lower-bound x) (lower-bound y))
)
```

which approximately equals to:

```
(define (mul-interval x y)
    (make-center-percent (* (center x) (center y))
                   (* (percent x) (percent y))
)
```

----

Lem is so blunt.

```
> (define r1 (make-interval 3 0.25))
> (define r2 (make-interval 5 0.1))
> (par1 r1 r2)
'(0.003125 . 42.85714285714286)
> (par2 r1 r2)
'(0.07142857142857142 . 1.875)

```

### 2.14

``````````
``````````

## 2.2

Finally, it comes to some familar topic.

> In general, an operation for combining data objects satisfies the closure property if the results of combining things with that operation can themselves be combined using the same operation.

So, this is the true definition of closure. It's about hierarchical.

### 2.17

```
(define (last-pair p)
	(define (aux p e)
		(if (null? p)
			e
			(aux (cdr p) (car p))
		)
	)
	(aux p null)
)
```

### 2.18

```
(define (reverse l)
	(define (aux remain r)
		(if (null? remain)
			r
			(aux (cdr remain) (cons (car remain) r))
		)
	)
	(aux l null)
)
```

### 2.19

```
(define (first-denomination c)
	(car c)
)

(define (except-first-denomination c)
	(cdr c)
)

(define no-more? null?)
```

The order of the list coin-values  doesn't affect the answer produced by cc.

Every possibility will be tested, no one would escape.

### 2.20

```
(define (same-parity f . l)
	(define (aux remain parity)
		(if (null? remain)
			null
			(if (= parity (modulo (car remain) 2))
			(cons (car remain) (aux (cdr remain) parity))
			(aux (cdr remain) parity)
		)
		)
	)
	(aux (cons f l) (modulo f 2))
)
```

### 2.21

```
 (define (square-list items)
 (if (null? items)
 nil
 (cons (square (car items)) (square-list (cdr items)))))

```

```
 (define (square-list items)
 (map queare items))
```

### 2.22

This is a classic problem of tail recursion with lists. In the first attempt, the last element is `cons`ed to the result first, so the result is reversed. In the second attempt, `cons`ing a list to an element does not create a normal list.

### 2.23

How to throw a useless return value of a function in Scheme? Or let the procedure continue to run.

```
(define (for-each f l)
    (
        (if (null? l)
            '()
            (cons (f (car l )) (for-each f (cdr l)))
        )
    )
)
```

I'd use `begin`.

> ```
> (define (for-each p lst)
>     (if (not (null? lst))
>         (begin
>             (p (car lst))
>             (for-each p (cdr lst)))))
> ```

### 2.24

```
> (list
   1 (list 2 (list 3 4)))
'(1 (2 (3 4)))
```

How do I draw a tree?

![2.24](/images/sicp/image-20241020202027664.png)

### 2.25

```
> (car (cdr (car (cdr (cdr '(1 3 (5 7) 9))))))
7
> (car (car '((7))))
7
> (car (cdr (car (cdr (car (cdr (car (cdr (car (cdr (car (cdr '(1 (2 (3 (4 (5 (6 7))))))))))))))))))
7
```

Come on.

### 2.26

```
>  (append x y)
'(1 2 3 4 5 6)
>  (cons x y)
'((1 2 3) 4 5 6)
>  (list x y)
'((1 2 3) (4 5 6))
```

### 2.27

```
(define (deep-reverse l)
    (define (aux remain r)
        (cond 
            ((null? remain) r)
            ((pair? (car remain)) (aux (cdr remain) (cons (deep-reverse (car remain)) r)))
            (else (aux (cdr remain) (cons (car remain) r)))
        )
    )
    (aux l null)
)
```

### 2.28

```
(define (fringe t)
    (cond
        ((null? t) null)
        ((list? t) (append (fringe (car t)) (fringe (cdr t))))
        (else (list t))
    )
)
```

### 2.29

a.

```
(define (left-branch  b)
    (car b)
)

(define (right-branch  b)
    (car (cdr b))
)

(define (branch-length b)
    (car b)
)

(define (branch-structure b)
    (car (cdr b))
)
```

b.

```

(define (total-weight b)
    (define (weight s)
        (if (list? s)
            (total-weight s)
            s
        )
    )
    (+ (weight (left-branch b)) (weight (right-branch b)))
)
```

c.

`(and (balanced left) (balanced right) (equal torque))`

```
(define (balanced b)
    (define (balanced-branch br)
        (if (list? (branch-structure br))
            (balanced (branch-structure))
            true
        )
    )
    (and
        (= (* (weight (left-branch b)) (branch-length (left-branch b))) (* (weight (right-branch b)) (branch-length (right-branch b))))
        (balanced-branch (left-branch b))
        (balanced-branch (right-branch b))
    )
)
```

d.

A little. Maybe more than a little, cause  the branch hanging prediction needs to be changed.

Anyway, `list a b` is `cons a (list b)`
