---
layout: post
title: json boolen 类型反序列化的一个bug
categories: [solution, Java]
description: Java 在反序列化的时候，会有解析不出的情况，十分神秘，这个 bug 调了半天，原因是一直没往 json 这边想。记忆里，一直以为反序列化是反射获得的，没想到啊，被阴了一手。
keywords: Java, json
---

# 前言

json序列化是挺麻烦的一个东西，平时使用的时候我总是把它当成一个黑盒，也不太关注具体的实现，出问题的时候就麻烦了。

# 问题描述

Spring 入参，有个类中有个 Boolean 属性的值，不知为何，不能成功反序列化，无论前端有没有传这个值，这个值最后得到的总是 null。

