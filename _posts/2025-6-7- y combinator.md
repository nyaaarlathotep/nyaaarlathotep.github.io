---
layout: post
title: Y 组合子的推导过程
date: 2025-5-5 9:00:00 +0900
description: Y 组合子的推导过程
categories: [Scheme,FP]
keywords: Scheme, FP, AIO
essays: true 
---

# Y 组合子的推导过程

## 前言

这篇文章基本上就是 The Little Schemer 第九章的 Y 组合子部分的再解释，原书对于代码的解释内容比较简略，完全依赖 scheme 代码本身的理解，这部分的代码又因为这一章的目的，导致较长，理解十分痛苦，需要读者完全了解大段的 scheme 代码，即便当时理解了再回头看还是容易忘记。因此我在这里重新自己推导一遍，可以说增加一些冗余甚至画蛇添足的补充内容，以加深自己的理解与记忆，也方便日后翻阅。

## 前提知识

- Scheme 基本语法
- 一些用到的函数

```
> (define eternity
    (lambda (x)
      (eternity x)))

```

eternity 是一个会一直递归自己，永远不会返回的函数，在推导过程中作为不应该走到的 cond 路径的结果。