---
layout: post
title: 避免使用 continue
date: 2025-7-19 9:00:00 +0900
description: continue 语句非常糟糕。（真的吗？）
categories: [translation]
keywords: continue
essays: true
---

原文：[Avoid continue](https://www.teamten.com/lawrence/programming/avoid-continue.html)

这篇文章和卫语句的思考相反，其中一些观点，比如多抽取函又数和我的理解相同。有些想法有点意思，在这里翻译一下互相印证。

我的观点仍然是：卫语句还是更好，在逻辑过于复杂时，尽早返回有助于减少心智负担，而只有逻辑相对较少且比较简单的情况下避免 continue 才会让代码更加清晰。

# 避免使用 continue

> “我从未见过哪段代码在重构并移除 `continue` 语句后没有得到改进的。”
>
> ——Douglas Crockford，《JavaScript: The Good Parts》 (第111页)

`continue` 语句非常糟糕。

------

首先，想一想 “continue” 在英文里是什么意思。它的意思是“继续前进”、“不要停下来”、“持续进行某项活动或流程”。现在，我们来看看这段代码：

```
for (int i = 0; i < 10; i++) {
    A();
    B();
    continue;
    C();
    D();
}
```

首先执行 `A()`，然后是 `B()`，接着就遇到了 `continue`。它做了什么？它并**没有**继续前进，也**没有**“持续进行某项活动或流程”。如果真是那样，代码应该继续执行 `C()` 才对。恰恰相反，它中断了代码的流程。如果把它叫做 `do_not_continue` (不要继续)，或许更具自文档性。

更实际地说，它实际上就是一个 `goto` 语句，并以类似的方式破坏了代码的流程。在快速浏览代码时，我们很容易忽略它：

```Java
for (Node node : nodeList) {
    if (node.isBad()) {
        continue;
    }
    processNode();
}
```

从逻辑上讲，它也更难解析。读者必须这样思考：“如果节点是坏的，那么就 continue (跳到下次循环)，否则就处理它。”（关于这一点，可以看看《保持 if 子句无副作用》中那个糟糕得可笑的例子。）反过来想会更容易：“如果节点是好的，我们就处理它”，就像这样：

```
for (Node node : nodeList) {
    if (!node.isBad()) {
        processNode();
    }
}
```

## 将复杂逻辑拆分为函数

如果你的循环体太大或逻辑太复杂，无法简单地反转条件，那就说明它不适合写成内联代码，应该被拆分到一个独立的函数里，然后你就可以使用 `return` 了。例如：

```
for (Node node : nodeList) {
    if (node.isQuestionable()) {
        NodeData nodeData = node.getNodeData();
        if (nodeData.isBad()) {
            continue;
        }
    }
    processNode();
}
```

在这里，`continue` 比第一个例子隐藏得更深，而且也更难简单地反转条件。你可以通过两种方式进行重构。第一种是使用 `return`：

```
for (Node node : nodeList) {
    potentiallyProcessNode(node);
}

void potentiallyProcessNode(Node node) {
    if (node.isQuestionable()) {
        NodeData nodeData = node.getNodeData();
        if (nodeData.isBad()) {
            return;
        }
    }
    processNode();
}
```

更好的方法是将判断逻辑也提取出来：

```
for (Node node : nodeList) {
    if (shouldProcessNode()) {
        processNode();
    }
}

boolean shouldProcessNode(Node node) {
    if (node.isQuestionable()) {
        NodeData nodeData = node.getNodeData();
        if (nodeData.isBad()) {
            return false;
        }
    }
    return true;
}
```

将逻辑拆分成独立函数还有额外的好处：你可以为它命名、编写文档，如果你喜欢的话，甚至可以对它进行单元测试。

## `return` vs `continue`

但是，`return` 不也是一种 `goto` 吗？是的，但它的跳转目标要清晰得多：它会**完全离开当前区域（函数）**。你不需要仔细检查外层的代码块，去寻找那个被 `continue` 的循环究竟是哪一个。

为了说明它可能带来的 bug 风险，我们来看看这段代码：

```
for (Node node : nodeList) {
    // 一堆东西
    // 这里有很多行代码
    log("considered node", node);
}
```

现在，有人添加了下面这个前置判断（guard clause）：

```
for (Node node : nodeList) {
    if (node.isBad()) {
        continue;
    }
    // 一堆东西
    // 这里有很多行代码
    log("considered node", node);
}
```

他们没有注意到末尾的 `log()` 调用，不小心就把它跳过了。如果他们当时写的是一个很长的 `if` 语句，那么在调整缩进、考虑哪些代码行应该放在 `if` 块内外时，就更有可能注意到这一行。反过来的情况也可能发生：循环体中已经存在一个 `continue`，而有人在循环末尾添加了一行新代码。这两种情况我都见过。

## 那 `break` 呢？

最后，那 `break` 怎么样呢？它也谈不上多好，但比起 `continue` 有两个优势。其一，它的命名没有跟它的实际作用完全相反。其二，要避免使用 `break`，往往需要引入一堆额外的逻辑：

```
boolean done = false;
for (int i = 0; i < 10 && !done; i++) {
    if (wantToBeDone(i)) {
        done = true;
    } else {
        // 做点什么
    }
}
```

我认为，这个布尔值带来的复杂性，比移除 `break` 所节省的复杂性还要多。而且这种方法在 for-each 循环中根本行不通：

```
for (Node node : nodeList) {
    if (wantToBeDone(node)) {
        // ?!?
    } else {
        // 做点什么
    }
}
```

所以，是的，如果能轻松避免，那就不用 `break`。但 **`continue` 才是这里真正的坏蛋**。
