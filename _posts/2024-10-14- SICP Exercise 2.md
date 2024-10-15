---
layout: sicp
title: SICP Exercise in chapter2
date: 2024-10-14 18:00:00 +0900
description: Let's learn some SICP. Indeed, The book is detailed and in-depth.
categories: [FP, SICP, Scheme]
keywords: SICP, Scheme
essays: true
---

# Chapter 2

The abstraction of data lead to the interface of the data.

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

