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

