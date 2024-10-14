---
layout: sicp
title: SICP Exercise in chapter2
date:  2024-10-14 18:00:00 +0900
description: Let's learn some SICP. The book is detailed and in-depth.
categories: [FP, SICP, Scheme]
keywords: SICP, Scheme
essays: true   
---

# Chapter 2

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

