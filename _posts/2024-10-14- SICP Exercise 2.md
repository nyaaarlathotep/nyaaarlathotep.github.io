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

### 2.30

```
(define (square-tree tree)
 (cond ((null? tree) null)
 ((not (pair? tree)) (* tree tree))
 (else (cons (square-tree (car tree))
 (square-tree (cdr tree))))))
```

```
(define (square-tree tree)
 (map (lambda (sub-tree)
 (if (pair? sub-tree)
 (square-tree sub-tree)
 (* sub-tree sub-tree)))
 tree))
```

### 2.31

```
(define (tree-map f tree)
    (map 
    (lambda (sub-tree)
    (if (pair? sub-tree)
    (tree-map f sub-tree)
    (f sub-tree))) 
    tree)
)
```

### 2.32

```
 (define (subsets s)
 (if (null? s)
 null
 (let ((rest (subsets (cdr s))))
 (append rest (map (lambda (poss) (cons (car s) poss)) rest)))))
```

### 2.33

```
(define (accumulate op initial sequence)
 (if (null? sequence)
 initial
 (op (car sequence)
 (accumulate op initial (cdr sequence)))))
```

```
 (define (map p sequence)
 (accumulate (lambda (x y) (cons (p x) y)) null sequence))
 (define (append seq1 seq2)
 (accumulate cons seq1 seq2))
 (define (length sequence)
 (accumulate (lambda (x y) (add1 y)) 0 sequence))
```

Ok, there's a little difference.

My result:

```
> (append '(1 2 3) '(4 5 6))
'(4 5 6 1 2 3)
```

> ```
> (define (append seq1 seq2)
>     (accumulate cons seq2 seq1))
> ```

> ```
> > (append '(1 2 3) '(4 5 6))
> '(1 2 3 4 5 6)
> ```

### 2.34

The initial number is zero, which multiplied by x equals zero. Thus it can be used as the initial number.

`(list 1 3 0 5 0 1)` -> `1 + 3x + 5x^3 + x^5`.

This is `(+ (* (3 + 5x^2 + x^4) x) 1))` -> `(+ (* higher-terms x) this-coeff))`, as `thisCoeff` is the initial number.

......

```
 (define (horner-eval x coefficient-sequence)
 (accumulate (lambda (this-coeff higher-terms) (+ (* higher-terms x) this-coeff))
 0
 coefficient-sequence))
```

### 2.35

map? Ok, use itself.

```
 (define (count-leaves t)
 (accumulate + 0 (map 
 (lambda (tree)
 	(if (pair? tree)
 		(count-leaves tree)
 		1
 	)
 ) t)))
```

### 2.36

Abstraction!

```
(define (accumulate-n op init seqs)
 (if (null? (car seqs))
 null
 (cons (accumulate op init 
    (accumulate (lambda (x y) (cons (car x) y)) null seqs)
 )
 (accumulate-n op init 
    (accumulate (lambda (x y) (cons (cdr x) y)) null seqs)
 ))))
```

```
> (accumulate (lambda (x y) (cons (car x) y)) null '((1 2 3) (4 5 6) (7 8 9) (10 11 12)))
'(1 4 7 10)
> (accumulate (lambda (x y) (cons (cdr x) y)) null '((1 2 3) (4 5 6) (7 8 9) (10 11 12)))
'((2 3) (5 6) (8 9) (11 12))
```

```
> (accumulate-n + 0 '((1 2 3) (4 5 6) (7 8 9) (10 11 12)))
'(22 26 30)
```

There's an alternative solution, nevermind.

> ```
> (define (car-n seqs)
>     (map car seqs))
> (define (cdr-n seqs)
>     (map cdr seqs))
> 
> (define (accumulate-n op init seqs)
>     (if (null? (car seqs))
>         '()
>         (cons (accumulate op init (car-n seqs))
>               (accumulate-n op init (cdr-n seqs)))))
> ```

### 2.37

So the `accumulate` is designed for matrices, and they fit each other perfectly.

```
(define (dot-product v w)
 (accumulate + 0 (map * v w)))
```

```
(define (matrix-*-vector m v)
 (map (lambda (w) (dot-product v w)) m))
```

```
(define (transpose mat)
 (accumulate-n cons null mat))
```

```
(define (matrix-*-matrix m n)
 (let ((cols (transpose n)))
 (map (lambda (v) (matrix-*-vector cols v)) m)))
```

### 2.38

```
(define (fold-right op initial sequence)
 (if (null? sequence)
 initial
 (op (car sequence)
 (fold-right op initial (cdr sequence)))))
```

```
(define (fold-left op initial sequence)
 (define (iter result rest)
 (if (null? rest)
 result
 (iter (op result (car rest))
 (cdr rest))))
 (iter initial sequence))
```

Obviously, `fold-left` is tail-recursive. We'd use it more.

Which remind me of OCaml, although this must be earlier.

```
>  (fold-left list null (list 1 2 3))
'(((() 1) 2) 3)
>  (fold-right list null (list 1 2 3))
'(1 (2 (3 ())))
```

The last two examples demonstrated clearly: Only when the exchange rule is permitted in the operation could these two functions work the same.

Oh, `associative law` or `monoid`( maybe more exactly: `semigroup`).

### 2.39

```
(define (reverse sequence)
 (fold-right (lambda (x y) (append y (list x))) nil sequence))
```

```
(define (reverse sequence)
 (fold-left (lambda (x y) (cons y x)) nil sequence))
```

### 2.40

```
(define (flatmap proc seq)
  (accumulate append nil (map proc seq)))
```

```
(define (unique-pairs n)
	(flatmap (lambda (i)
          (map (lambda (j) 
                 (list i j))
               (enumerate-interval 1 (- i 1))))
        (enumerate-interval 1 n))
)
```

### 2.41

distinct positive integers.

```
(define (three-sum n s)
	(map
		(lambda (pair)
			(cons (- s (+ (car pair) (cadr pair))) pair)
		)
		(filter 
			(lambda (pair) (< (+ (car pair) (cadr pair)) s ))
        	(unique-pairs n)
		)
	)
)
```

This one above produces some duplicate answers.

Just another brainless one.

```
(define (unique-three n)
	(flatmap (lambda (i)
          (flatmap (lambda (j) 
                 (map (lambda (k)
                 	(list i j k)
                 )
                 (enumerate-interval 1 (- j 1))
                 )
                 )
               (enumerate-interval 1 (- i 1))))
        (enumerate-interval 1 n))
)
```

```
(define (three-sum n s)
	(filter
		(lambda (l) (= (+ (car l)  (car (cdr l))  (car (cdr (cdr l))))  s))
        (unique-three n)
	)
)
```

OK, then. We need more abstactions.

```
(define (triple-sum-equal-to? sum triple)
    (= sum
       (+ (car triple)
          (cadr triple)
          (caddr triple))))
```

```
(define (triple-sum-equal-to? sum triple)
    (= sum
       (fold-right + 0 triple)))
```

### 2.42

Here comes the old friend.

`adjoin-position` simply add all the possible places for the queen to the rest of queens places.

```
(define (adjoin-position r c rest-of-queens)
	(cons (list r c) rest-of-queens)
)
```

```
(define empty-board null)
```

`(= a-c b-c)` will never break. Never mind.

```
(define (cross a b)
	(let ((a-r (car a)) (a-c (cadr a)) (b-r (car b)) (b-c (cadr b)))
		(if (or (= a-r b-r) (= a-c b-c))
			#t
			(if (= (abs (- a-r b-r)) (abs (- a-c b-c)))
				#t
				#f
			)
	    )
    )
)
```

```
(define (safe? k positions)
	(if (< (length positions) 2)
		#t
		(let ((new-queen (car positions)))
		(define (aux rest)
			(if (null? rest)
				#t
				(if (cross new-queen (car rest))
					#f
					(aux (cdr rest))
			)
			)

		)
		(aux (cdr positions))
		)
	)
)
```

The K in parameter is useless. Why?

```
(define (queens board-size)
  (define (queen-cols k)
    (if (= k 0)
        (list empty-board)
        (filter
         (lambda (positions) 
           (safe? k positions))
         (flatmap
          (lambda (rest-of-queens)
            (map (lambda (new-row)
                   (adjoin-position 
                    new-row 
                    k 
                    rest-of-queens))
                 (enumerate-interval 
                  1 
                  board-size)))
          (queen-cols (- k 1))))))
  (queen-cols board-size))
```

OK.

> ```
> (define (adjoin-position new-row k rest-of-queens)
>     (cons new-row rest-of-queens))
> ```
>
> ```
> (define (safe? k position)
>     (iter-check (car position) 
>                 (cdr position)
>                  1))
> 
> (define (iter-check row-of-new-queen rest-of-queens i)
>     (if (null? rest-of-queens)  ; 下方所有皇后检查完毕，新皇后安全
>         #t
>         (let ((row-of-current-queen (car rest-of-queens)))
>             (if (or (= row-of-new-queen row-of-current-queen)           ; 行碰撞
>                     (= row-of-new-queen (+ i row-of-current-queen))     ; 右下方碰撞
>                     (= row-of-new-queen (- row-of-current-queen i)))    ; 左下方碰撞
>                 #f
>                 (iter-check row-of-new-queen 
>                             (cdr rest-of-queens)    ; 继续检查剩余的皇后
>                             (+ i 1))))))            ; 更新步进值
> ```

### 2.43

> Louis Reasoner is having a terrible time doing Exercise 2.42.

Well, actually terrible.

Louis exchanged the order of generating all possibilities and checking  safety, such as generating all the placement possibilities for all the queens and then checking them, while our procedure will check the safety when placing each new queen.

> 练习 2.42 的 `queens` 函数对于每个棋盘 `(queen-cols k)` ，使用 `enumerate-interval` 产生 `board-size` 个棋盘。
>
> 而 Louis 的 `queens` 函数对于 `(enumerate-interval 1 board-size)` 的每个 `k` ，都要产生 `(queen-cols (- k 1))` 个棋盘。
>
> 因此， Louis 的 `queens` 函数的运行速度大约是原来 `queens` 函数的 `board-size` 倍，也即是 `T * board-size` 。

Really? Their speed of producing the same board-size is different.

> [thongpv87](http://community.schemewiki.org/?thongpv87)
>
> @aQuaYi I don't think it is correct because number of queen-cols also change over time

https://wernerdegroot.wordpress.com/2015/08/01/sicp-exercise-2-43/

LOL. I need a standard solution.
