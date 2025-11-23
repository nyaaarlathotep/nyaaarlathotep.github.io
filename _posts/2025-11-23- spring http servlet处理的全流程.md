---
layout: post
title: Spring http servlet 处理的全流程
date: 2025-11-23 9:00:00 +0900
description: Spring http servlet 处理的流程复杂多步骤，并且在很多步骤为我们提供了可自定义的织入点。
categories: [Spring]
keywords: String, str
essays: true
---

# Spring http servlet 处理的全流程

## 前言

这看起来是个八股问题，框架的建造者的目的就是让使用者不用在意框架，如果我们不用对框架进行二次开发也不用了解那么多。

想到这我有点说不出话了，这种知识性质的问题现在问问 ai 都能解决了，这篇博客的意义可能只是在 ai 无法使用的情况吧。转念安慰一下自己，了解一下 Spring 提供给我们的自定义切入点，认识一下 Tomcat 和 Spring 如何搭配干活也是好的。

## 逻辑流程

- 网卡
  - 虚拟机网卡，docker 容器网卡：建立 tcp 连接，转化为 socket
- Tomcat
  - Tomcat NIO：接受网卡建立的 socket，io 多路复用监听 socket
  - `Http11Processor`：解析字节流，转化为 Tomcat 的 request 与 response
  - Tomcat 路由：将请求根据 url 转发到对应的应用容器
- Spring
  - `DispatcherServlet`：Spring 的入口，进行统一分发
  - `HandlerMapping`：找到 url 对应的 Controller
  - `Interceptors`：Spring 拦截器前置处理
  - **Controller**：我们最熟悉的部分，真正业务逻辑的执行
  - 返回：结果写入 Response 对象（此时还没发给客户端，只是写到了 Tomcat 的缓冲区 `OutputBuffer`）

每一个小点都是一步重要的逻辑步骤。Spring 是 Tomcat 中的应用，其实在整个 tcp 处理流程中更加前置与重要，承担更多职责。然而现在都是 Spring Boot 自带的 tomcat，制作 jar 包进行部署启动，没有人用老式的 war 包进行部署了，看起来更像 Spring 内嵌 tomcat，我们在日常开发中也不强调 tomcat 了，就像是空气或者水，默认它的存在，这不得不说也是一种成功。

## 线程协作

一次 http 请求由多个不同职责的线程参与协作完成的。

- 操作系统内核线程创建 socket
- Tomcat 线程
  - Acceptor 线程：接受操作系统创建的 socket，放入 Poller 事件队列
  - Poller 线程：
    - 从 Poller 事件队列中取出 socket，注册到 Java IO 的 Selector 上并监听
    - socket 就绪，操作系统唤醒 Poller 线程
    - Poller 线程将就绪的 socket 发送给 worker
  - Worker 线程：开始**同步**处理 socket
    - 读取字节流，解析 http 内容
    - 执行 Spring servlet 调用
    - 写回 response

如果在 Spring 中不使用线程池或者异步，那么执行业务逻辑的线程实际就是 tomcat 配置的线程池中的 worker 线程。

在 Spring Boot 中，嵌入式 Tomcat 的默认配置主要涉及三个核心参数：`server.tomcat.threads.max`（Tomcat 服务器最大线程数配置，默认 200）、`server.tomcat.max-connections`（服务器能同时维持的 TCP 连接总数） 和 `server.tomcat.accept-count`（操作系统层面的 TCP 握手队列长度），

很多时候，docker 容器无法达到会受到 Tomcat 限制的流量，操作系统资源比如 CPU 和内存会先一步饱和，但如果 IO 密集，Worker 线程阻塞较多，那么 Tomcat 的限制可能会影响到我们的服务，此时操作系统资源虽然空闲，但无法处理更多请求。

## 织入点

- Tomcat：不依赖 Spring，不知道请求具体路由到哪里
  - Servlet Listeners：监听器
  - Servlet Filters：过滤器
- Spring
  - Interceptor：拦截器，操作 request 和 response
  - `HandlerMethodArgumentResolver`：参数解析，解析 request 和 response 生成 Controller 入参
  - `HttpMessageConverter`：消息转换，将 http body 转化为我们所需要的类
  - AOP：切面，动态代理，增加需要的功能
  - `ControllerAdvice`：全局异常处理

Spring 中的自定义织入点可以替换 Tomcat 中的织入点，且更加灵活，也和我们的业务代码”更近“。实践中，我们更倾向于用 Spring 的配置来自定义。

