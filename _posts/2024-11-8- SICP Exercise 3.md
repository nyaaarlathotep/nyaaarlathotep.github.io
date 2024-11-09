---
layout: sicp
title: SICP Exercise in chapter3
date: 2024-11-8 12:00:00 +0900
description: Let's learn some SICP. I'm not done, yet.
categories: [FP, SICP, Scheme]
keywords: SICP, Scheme
essays: true
---

# Chapter 3

> Until now, all our procedures could be viewed as specifications for computing mathematical functions. A call to a procedure computed the value of the function applied to the given arguments, and two calls to the same procedure with the same arguments always produced the same result.

## 3.1

### 3.1

```
(define (make-accumulator balance)
  (lambda (amount)
        (begin (set! balance 
                     (+ balance amount))
               balance)
))
```

### 3.2

```
(define (make-monitored f)
  (let ((count 0))
  (define (dispatch m)
    (cond ((eq? m 'how-many-calls?) count)
          ((eq? m 'reset-count) (set! count 0))
          (else (begin (set! count (+ count 1)) (f m) ))))
  dispatch))
```

```
> (s 100)
10
> (s 'how-many-calls?)
1
> (s 100)
10
> (s 'how-many-calls?)
2
> (s 'how-many-calls?)
2
> (s 'how-many-calls?)
2
> (s 'reset)
sqrt: contract violation
  expected: number?
  given: 'reset
 [,bt for context]
> (s 'reset-count)
> (s 'how-many-calls?)
0
> (s 100)
10
> (s 'how-many-calls?)
1

```

### 3.3

```
(define (make-account pass balance)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance 
                     (- balance amount))
               balance)
        "Insufficient funds"))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (dispatch key m)
    (cond ((not (eq? pass key)) "Incorrect password")
          ((eq? m 'withdraw) withdraw)
          ((eq? m 'deposit) deposit)
          (else (error "Unknown request: 
                 MAKE-ACCOUNT" m))))
  dispatch)
```

```
> ((acc 'secret-password 'withdraw) 40)
application: not a procedure;
 expected a procedure that can be applied to arguments
  given: "Incorrect password"
 [,bt for context]

```

OK.

```
(define (make-account balance pass)
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance 
                     (- balance amount))
               balance)
        "Insufficient funds"))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (dispatch m)
    (cond ((eq? m 'withdraw) withdraw)
          ((eq? m 'deposit) deposit)
          (else (error "Unknown request: 
                 MAKE-ACCOUNT" m))))
  (lambda (key m)
  	(if (eq? key pass)
  		(dispatch m)
  		(lambda (X) "Incorrect password")
  	)
  )
)
```

### 3.4

LOL.

Can they combined together?

```
(define call-the-cops "COPS COMING")
```

```
(define (make-account balance pass)
  (let ((try 0))
  (define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance 
                     (- balance amount))
               balance)
        "Insufficient funds"))
  (define (deposit amount)
    (set! balance (+ balance amount))
    balance)
  (define (dispatch m)
    (cond ((eq? m 'withdraw) withdraw)
          ((eq? m 'deposit) deposit)
          (else (error "Unknown request: 
                 MAKE-ACCOUNT" m))))
  (lambda (key m)
  	(if (eq? key pass)
  		(dispatch m)
  		(begin
  			(set! try (+ try 1))
  			(if (> try 7)
  				(lambda (X) call-the-cops)
  				(lambda (X) "Incorrect password")
  			)
  		)
  	)
  )
  )
)
```

```
> (define acc 
    (make-account 100 'secret-password))
> ((acc 'secret-password 'withdraw) 40)
60
> ((acc 'some-other-password 'deposit) 50)
"Incorrect password"
> ((acc 'some-other-password 'deposit) 50)
"Incorrect password"
> ((acc 'some-other-password 'deposit) 50)
"Incorrect password"
> ((acc 'some-other-password 'deposit) 50)
"Incorrect password"
> ((acc 'some-other-password 'deposit) 50)
"Incorrect password"
> ((acc 'some-other-password 'deposit) 50)
"Incorrect password"
> ((acc 'some-other-password 'deposit) 50)
"Incorrect password"
> ((acc 'some-other-password 'deposit) 50)
"COPS COMING"
> ((acc 'some-other-password 'deposit) 50)
"COPS COMING"
> ((acc 'some-other-password 'deposit) 50)
"COPS COMING"
```

### 3.5

Well, the `MIT-Scheme` is not the same as the racket, I need to rewrite `random-in-range`.

```
(define (random-in-range low high)
  (let ((range (- high low)))
    (+ low (random range))))
```

```
(define (estimate-integral P x1 x2 y1 y2 trials)
  (* 4 (random-integral-test P x1 x2 y1 y2 trials)))
(define (random-integral-test  P x1 x2 y1 y2 trials)
  (define (iter trials-remaining trials-passed)
    (let ((x (random-in-range x1 x2)))
      (let ((y (random-in-range y1 y2)))
        (cond ((= trials-remaining 0)   
               (/ trials-passed trials))
              ((P x y)
               (iter (- trials-remaining 1)
                     (+ trials-passed 1)
                     ))
              (else
               (iter (- trials-remaining 1)
                     trials-passed
                     ))))))
  (iter trials 0))


(define (get-pi trials)
    (exact->inexact
        (estimate-integral (lambda (x y)
                               (< (+ (square x)
                                     (square y))
                                1.0))
                           -1.0
                           1.0
                           -1.0
                           1.0
                           trials)))
```

I could use the original `monte-carlo`, it seems much easier.

> ```
> (define (estimate-integral p? x1 x2 y1 y2 trials)
>     (* 4
>        (monte-carlo trials
>                     (lambda ()
>                         (p? (random-in-range x1 x2)
>                             (random-in-range y1 y2))))))
> ```
>
> ```
> (define (get-pi trials)
>     (exact->inexact
>         (estimate-integral (lambda (x y)
>                                (< (+ (square x)
>                                      (square y))
>                                 1.0))
>                            -1.0
>                            1.0
>                            -1.0
>                            1.0
>                            trials)))
> ```

### 3.6

We don't have `rand` or ` rand-update` in Racket. Oh, I find something: [2 SICP Language](https://docs.racket-lang.org/sicp-manual/SICP_Language.html). OK, it still doesn't work.

I guess it's Just another dispatch.

```
 (define rand 
   (let ((x random-init)) 
     (define (dispatch message) 
       (cond ((eq? message 'generate) 
               (begin (set! x (rand-update x)) 
                      x)) 
             ((eq? message 'reset) 
               (lambda (new-value) (set! x new-value))))) 
     dispatch)) 

```

