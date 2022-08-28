---
layout: post
title: json boolen 类型反序列化的一个bug
categories: [solution, Java]
description: Java 在反序列化的时候，会有解析不出的情况，十分神秘，这个 bug 调了半天，一直没往 json 这边想。记忆里，一直以为反序列化是反射获得的，感觉不会出问题。没想到啊，被阴了一手。
keywords: Java, json
---

# 前言

json序列化是挺麻烦的一个东西，平时使用的时候我总是把它当成一个黑盒，也不太关注具体的实现，出问题的时候就麻烦了，摸不着头脑。

# 问题描述

Spring 入参，有 DTO 中有个 Boolean 属性的值，不知为何，不能成功反序列化，无论前端有没有传这个值，这个值最后得到的总是 null。

# 解决方案

1. 改属性的名称，将 is 前缀删除，重新生成 getter，setter 方法。
2. 将 setter 方法中，加上属性的前缀 is，如 setFormalMode-> setIsFormalMode。

查了查，大致问题是命名的规范性和 Intellij 联合起来导致的问题。Intellij 自动生成的 getter, setter 方法， 带 is 的 Boolean 型的变量，生成的方法会对变量名前缀的 is 做一些处理，而 Spring 的反序列化，是和方法的 setter 有关的，最终导致了这个问题。

# 复现

## DTO

```
public class TestBoolean {
    private Boolean isFormalMode;

    /**
     * Getter method for property <tt>isFormalMode<tt>.
     *
     * @return property value of isFormalMode
     */
    public Boolean getFormalMode() {
        return isFormalMode;
    }

    /**
     * Setter method for property <tt>isFormalMode</tt>.
     *
     * @param formalMode value to be assigned to property isFormalMode
     */
    public void setFormalMode(Boolean formalMode) {
        isFormalMode = formalMode;
    }

    @Override
    public String toString() {
        return "TestBoolean{" +
                "isFormalMode=" + isFormalMode +
                '}';
    }
}
```

## Controller

```
    public Result<byte[]> test(@RequestBody TestBoolean testBoolean) {
        logger.info("testBoolean:{}",testBoolean.toString());
        return new Result<>();
    }
```

## 前端传参

```
{
  "isFormalMode": true
}
```

## log

```
testBoolean:TestBoolean{isFormalMode=null}
```

# 控制变量

## 更改入参

```
{
  "formalMode": true
}

```

log:  

```
testBoolean:TestBoolean{isFormalMode=true}
```

可见，能成功反序列化了。Spring 尝试去反序列化的参数，是 formalMode 而非我们的属性 isFormalMode。

## 更改 setter 方法名

### setIsFormalMode

```
    public void setIsFormalMode(Boolean isFormalMode) {
        this.isFormalMode = isFormalMode;
    }
```

log:

```
testBoolean:TestBoolean{isFormalMode=true}
```

也可以成功。

### isIsFormalMode

```
    public void isIsFormalMode(Boolean isFormalMode) {
        this.isFormalMode = isFormalMode;
    }

```

log:

```
testBoolean:TestBoolean{isFormalMode=null}
```

这样并不能成功。

# 非 Spring 运行

然而，当我在本地直接用 JSON, jackson 尝试复现的时候，我发现 JSON 是并不能复现这个问题的，无论 setter 方法加不加 is，都能成功反序列化，而 jackson 就会直接报错了。Spring 默认用的好像也确实是 jackson。

# 感想

原来 json 反序列化的过程和 setter 名字是强相关的，没想到啊。只能说，想当然了，并不是反射。
