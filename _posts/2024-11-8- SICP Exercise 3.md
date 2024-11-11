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

> In general, programming with assignment forces us to carefully consider the relative orders of the assignments to make sure that each statement is using the correct version of the variables that have been changed. This issue simply does not arise in functional programs.[11](https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/full-text/book/book-Z-H-20.html#footnote_Temp_339) The complexity of imperative programs becomes even worse if we consider applications in which several processes execute concurrently. We will return to this in section [3.4](https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/full-text/book/book-Z-H-23.html#%_sec_3.4). First, however, we will address the issue of providing a computational model for expressions that involve assignment, and explore the uses of objects with local state in designing simulations.

substitution model of evaluation:

>  To apply a compound procedure to arguments, evaluate the body of the procedure with each formal parameter replaced by the corresponding argument. 



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

### 3.7

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

```
(define (make-joint account old-pass new-pass)
  (lambda (key m)
    (if (eq? key new-pass)
      (account old-pass m)
      (error "Incorrect password" key)
    )
  )
)
```

The book said I may modify the 3.3 answer, while I just proxy it. There may be some better answer?

### 3.8

Wow, quite Interesting.

```
(define (f add)
	
	(let ((a -1))
		(begin (set! a (+ add))
			a
		)
	)
)
```

This is another sign of *referentially transparent*.

```
> (define f (make-f))
> (f 0)
-1
> (f 1)
0

```

```
> (define f (make-f))
> (f 1)
0
> (f 0)
0

```

## 3.2

> λ-expression was evaluated to produce the procedure

A procedure as a pair is created in an environment.

> To apply a procedure to arguments, create a new environment containing a frame that binds the parameters to the values of the arguments. **The enclosing environment of this frame is the environment specified by the procedure**. Now, within this new environment, evaluate the procedure body. 

The enclosing environment of this frame is the environment in which the procedure is created.

I wonder which part is frame and which is env. The body of the lambda (i.e. the pointers' pair) is frame?

> two key properties that make local procedure definitions a useful technique for modularizing programs:
>
> - The names of the local procedures do not interfere with names external to the enclosing procedure, because the local procedure names will be bound in the frame that the procedure creates when it is run, rather than being bound in the global environment.
> - The local procedures can access the arguments of the enclosing procedure, simply by using parameter names as free variables. This is because the body of the local procedure is evaluated in an environment that is subordinate to the evaluation environment for the enclosing procedure.

Will `sqrt` create a lot of env? There is a recursive call.

### 3.9

![3.9](/images/sicp/3.9.png)

### 3.10

I guess...

There is an unused env which stands for the `((lambda (balance) ⟨body⟩) 100)`

![3.9](/images/sicp/3.10-1.png)

![3.9](/images/sicp/3.10-2.png)

![3.9](/images/sicp/3.10-3.png)

### 3.11

`(define acc (make-account 50))`

![3.9](/images/sicp/3.11-1.png)

`((acc 'deposit) 40)`

I'm not sure how to express the another call `(( ) )`.

![3.9](/images/sicp/3.11-2.png)

`((acc 'deposit) 60)`
