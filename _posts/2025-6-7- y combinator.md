---
layout: post
title: Y 组合子的推导过程
date: 2025-5-5 9:00:00 +0900
description: 再推一遍仍然令人感叹啊，define 也能被实现了，就像是公理突然退化成了定理一样，整个推导过程也令人头晕。
categories: [Scheme,FP]
keywords: Scheme, FP, The Little Schemer
essays: true 
---

# Y 组合子的推导过程

## 前言

本文可视为《The Little Schemer》第九章关于 Y 组合子推导内容的注释版。原书对于代码的解释内容比较简略，完全依赖读者对于 scheme 代码本身的理解（这也是本书的优点），这部分的代码又频繁地需要展开和重复，函数体较长，理解成本很高，即便当时理解了再回头看还是容易忘记。因此我在这里重新自己推导一遍，可以说增加一些冗余甚至画蛇添足的补充内容，以加深自己的理解与记忆，也方便日后翻阅。

### 前提知识

- Scheme 基本语法
- 一些用到的函数

```
> (define eternity
    (lambda (x)
      (eternity x)))
```

`eternity`是一个会一直递归自己，永远不会返回的函数，在推导过程中作为不应该走到的 cond 路径的结果。

`add1` 接受一个数字，并将这个数字加 1。

`cdr`接受一个列表，返回这个列表除了第一个元素后的列表。

`null?`返回列表中是否有元素。

## 推导过程

### 有限递归处理

从标准的`length`函数出发：

```
> (define length
    (lambda (l)
      (cond
        ((null? l) 0)
        (else (add1 (length (cdr l)))))))
```

**步骤1：消除命名依赖**

现在，假如我们不能使用 define 了，我们用 enternity 替换原函数体中的 length，那么 length 就变成了下面这样：

```
> (lambda (l)
    (cond
      ((null? l) 0)
      (else (add1 (eternity (cdr l))))))
#<procedure>
```

它只能计算长度为 0 的列表，其他情况都会不返回。

**步骤2：扩展递归深度**

但这不符合我们的使用需求，那么我们尝试继续改造：

```
> (lambda (l)
    (cond
      ((null? l) 0)
      (else (add1 (length0 (cdr l))))))
```

length0 指代我们的第一版只能计算长度为 0 的 length，所以其实它就是：

```
> (lambda (l)
    (cond
      ((null? l) 0)
      (else (add1 ((lambda (l)
      (cond
        ((null? l) 0)
        (else (add1 (eternity (cdr l))))))
                   (cdr l))))))
#<procedure>

```

这里只是把原来的 length0 的匿名函数替换了，现在它能计算长度为 1 的列表了。

以此类推，我们可以用这种模式，生成能计算不同长度列表的匿名函数，但这很明显不够。回忆一下 define 还可以使用时这个函数是什么样的？eternity 这个位置是 length 这个函数本身。让我们进一步改造它。

```
> ((lambda (length)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 (length (cdr l))))))) 
   eternity)
#<procedure>
```

将 eternity 作为参数的 length0。

```
> ((lambda (f)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 (f (cdr l))))))) 
   ((lambda (g)
         (lambda (l)
           (cond
             ((null? l) 0)
             (else (add1 (g (cdr l))))))) 
       eternity))
#<procedure>
```

将 length0 作为参数的 length1。

这两个函数与之前的实质并无差别，只是做了一下形式的变化。

**步骤3：抽象模式**

注意到，这里存在重复使用一个匿名函数，我们尝试用 mk-length 将他提出来进行化简。

```
> ((lambda (mk-length)
     (mk-length eternity))
   (lambda (length)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 (length (cdr l))))))))
#<procedure>

```

将mk-lenght 提出来的 length0。

```
> ((lambda (mk-length)
     (mk-length (mk-length eternity)))
   (lambda (length)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 (length (cdr l))))))))
#<procedure>
```

将mk-lenght 提出来的 length1。它们的区别只有`(mk-length eternity)`变为了`(mk-length (mk-length eternity))`以此类推`(mk-length (mk-length (mk-length eternity)))`就是 length2……

我们再将 length0 换个方式，这次没有 enternity 了。

```
> ((lambda (mk-length)
     (mk-length mk-length))
   (lambda (length)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 (length (cdr l))))))))
#<procedure>

```

为了方便观看和理解，我们将 mk-length 中的参数也重命名为 mk-length。

```
> ((lambda (mk-length)
     (mk-length mk-length))
   (lambda (mk-length)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 (mk-length (cdr l))))))))
#<procedure>

```

到此为止，上面的两个 函数 仍然都是 length0 的变换。如果我们输入长度大于 0 的列表，那么程序就会路由到第二个 mk-length，它还没被完成，Scheme 会报错提示你 contract 不对，即，类型对不上。

我们推导一下：输入 `'(1)`，先将 mk-length 展开，再代入 `'(1)`，看看是什么问题。

```
> (((lambda (mk-length)
       (mk-length mk-length))
     (lambda (mk-length)
       (lambda (l)
         (cond
           ((null? l) 0)
           (else (add1 (mk-length (cdr l)))))))) '(1))


>((lambda (l)
           (cond
             ((null? l) 0)
             (else (add1 ((lambda (mk-length)
           (lambda (l)
             (cond
               ((null? l) 0)
               (else (add1 (mk-length (cdr l)))))))
                          (cdr l)))))) '(1))

> (add1 
   ((lambda (mk-length)
      (lambda (l)
        (cond
          ((null? l) 0)
          (else (add1 (mk-length (cdr l))))))) '()))


```

我们对 length1 做一个不太一样的变换。

```
> ((lambda (mk-length)
     (mk-length mk-length))
   (lambda (mk-length)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 ((mk-length eternity) (cdr l))))))))
#<procedure>

```

注意，关键在于 ` (else (add1 ((mk-length eternity) (cdr l))))))))`这一行，`(mk-length eternity)`即为 length0，因此这个函数可以处理长度为 1 的列表。

当长度超过 1 时，它会尝试把 eternity 作为参数输入给 eternity，Scheme 会卡住。

现在扩展起来已经简单多了，但每个函数能处理的列表的长度仍然是有限的。

### 突破有限递归

**关键转变：自引用结构**。我们将 eternity 也替换为 mk-length。此时会发生什么？

```
> ((lambda (mk-length)
     (mk-length mk-length))
   (lambda (mk-length)
     (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 ((mk-length mk-length) (cdr l))))))))
#<procedure>

```

我们尝试用长度为 1 的列表作为输入，并脑内推导一下，神奇的事情出现了：每次调用`(mk-length mk-length)`都会生成新的递归实例，和原来相同的实例，也就是说，不存在之前随着`(cdr l)`，我们的 函数 也会变化导致我们只能处理某个长度上限的列表的问题了，函数不断的将自己传给自己，不断的产生新的自己，这样就永远不会“过期”了。函数获得了无限递归能力。

这个 函数 已经完全实现了原来 length 的功能，我们已经做到了不用 define，实现递归了，只是形式不太一样。这里已经完成了 define 的功能，我们完全可以对每个需要递归的函数进行这样操作，只是不够简洁，而且需要重写函数内部构造，但最关键的一步由有限走向无限已经实现了，剩下的只有简化。

### 提取 Y 组合子：通用递归的抽象

接下来我们对它进行变换，尝试简化。

**步骤1：延迟求值优化**

与原来的 length 相比，` (else (add1 ((mk-length mk-length) (cdr l))))))))`这一行中的`mk-length mk-length`不太一样了，我们尝试变换一下。

```
> ((lambda (mk-length)
       (mk-length mk-length))
     (lambda (mk-length)
       (lambda (l)
         (cond
           ((null? l) 0)
           (else (add1 ((lambda (x)
                          ((mk-length mk-length) x)) (cdr l))))))))

```

`(mk-length mk-length)`变换为`(lambda (x) ((mk-length mk-length) x))`

**步骤2：分离核心逻辑**

```
> ((lambda (mk-length)
       (mk-length mk-length))
     (lambda (mk-length)
       ((lambda (length)
       (lambda (l)
         (cond
           ((null? l) 0)
           (else (add1 (length (cdr l)))))))
       (lambda (x) ((mk-length mk-length) x)))))
#<procedure>

```

再把`(lambda (x) ((mk-length mk-length) x))`提出来作为`length`。现在这个主体部分很熟悉了，就是完整的 length，现在几乎已经回到起点了。

```
> ((lambda (le)
     ((lambda (mk-length)
           (mk-length mk-length))
         (lambda (mk-length)
           (le (lambda (x)
                 ((mk-length mk-length) x))))))
   (lambda (length)
     (lambda (l)
     (cond
       ((null? l) 0)
       (else (add1 (length (cdr l))))))))
#<procedure>

```

**步骤3：定义Y组合子**

再把 length 的主体逻辑这部分去掉。我们最初的 define 变成了一个很长的函数，也就是下面这个：

```
> (lambda (le)
       ((lambda (mk-length)
             (mk-length mk-length))
           (lambda (mk-length)
             (le (lambda (x)
                   ((mk-length mk-length) x))))))
#<procedure>
```

我们给他换个名字：

```
> (define Y
    (lambda (le)
         ((lambda (f)
               (f f))
             (lambda (f)
               (le (lambda (x)
                     ((f f) x)))))))

```

再应用回去：

```
> (Y (lambda (length)
         (lambda (l)
         (cond
           ((null? l) 0)
           (else (add1 (length (cdr l))))))))
#<procedure>

```

测试一下：

```
> ((Y (lambda (length)
       (lambda (l)
       (cond
         ((null? l) 0)
         (else (add1 (length (cdr l)))))))) '(1 23 23 355 3 232 4))
4

> ((Y (lambda (length)
         (lambda (l)
         (cond
           ((null? l) 0)
           (else (add1 (length (cdr l)))))))) '(1 23 23 355 3 232 4))
7
```

**`Y (lambda (length)`就是`define length`。 此时`(Y proc)`等价于`(define recursive-proc proc)`，实现了匿名递归。**

它将接受自身引用的函数`(lambda (length) ...)`，并将它转换为了可直接调用的递归函数。

## 总结

Y 组合子接受一个函数 a，这个 a 本身需要接受一个参数 b。Y 的核心操作就是把函数 a 自己作为参数 b 传回给 a。为什么这个过程显得这么绕呢？因为在传入之前，a 本身还没有被定义，而我们却需要把这个尚未定义的东西作为参数传进去。它通过**匿名函数的自我应用**`(f f)`实现了递归绑定。

听起来确实有点绕，但本质上就是在实现递归。经过这一长串推导，我们最终用匿名函数实现了 define 的功能。

