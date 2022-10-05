---
layout: post
title: Spring事务托管@Transactional不生效相关的学习
date: 2022-5-22 9:00:00 +0900
description: Spring事务托管@Transactional不生效相关的学习
img: post-1.jpg # Add image post (optional)
categories: [solution, Spring]
keywords: 事务, @Transactional
essays: true  
---

# 前言

为了保证数据的一致性，数据库为我们提供了事务，可以让数据更新一起成功或者一起失败。

在 Spring 中，我们的业务逻辑也需要使用事务。

可以通过原生，底层一点的方法，手动获取连接，手动 commit 来提交事务，也可以通过Spring已经为我们封装好的，给类或者方法加上注解`@Transactional`，来为方法开启事务支持。

`@Transactional`是通过 AOP 实现的，所以也会因此有一些特殊的规则与表现，没能完全对使用者透明。一些情况下，事务托管不生效了，需要从 Spring 和 AOP 的角度找问题。

就有这样一个例子：有一个没有加`@Transactional`注解的方法 A，使用`this.xxxx`的方式，调用了一个此类内部的另一个加了`@Transactional`注解的方法 B，结果，B 的事务并没有生效。

让 B 的事务重新生效也很简单，在类中，添加一个对类自己的引用，然后让 Spring 注入自己，使用这个引用来调用方法 B。

# 复现

这是一个关于 paper 更新的方法，以各种不同姿势对它做了一些更改，以模拟`@Transactional`并复现发生的各种情况。

`@Transactional`有一项属性是`propagation`，决定的是事务传播行为。

事务传播行为：如果在开始当前事务之前，一个事务上下文已经存在，此时有若干选项可以指定一个事务性方法的执行行为

- TransactionDefinition.PROPAGATION_REQUIRED：如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。这是默认值。
- TransactionDefinition.PROPAGATION_REQUIRES_NEW：创建一个新的事务，如果当前存在事务，则把当前事务挂起。
- TransactionDefinition.PROPAGATION_SUPPORTS：如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。
- TransactionDefinition.PROPAGATION_NOT_SUPPORTED：以非事务方式运行，如果当前存在事务，则把当前事务挂起。
- TransactionDefinition.PROPAGATION_NEVER：以非事务方式运行，如果当前存在事务，则抛出异常。
- TransactionDefinition.PROPAGATION_MANDATORY：如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。
- TransactionDefinition.PROPAGATION_NESTED：如果当前存在事务，则创建一个事务作为当前事务的嵌套事务来运行；如果当前没有事务，则该取值等价于TransactionDefinition.PROPAGATION_REQUIRED。

默认是如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务，我们期待这些方法的行为也是如此。

## updateWithoutException

```
    @RequestMapping(value = "/test1", method = RequestMethod.GET)
    public ResponseVO test1() {
        log.info("----test1----");
        testService.printPaperTitle();
        testService.updateWithoutException();
        testService.printPaperTitle();
        return ResponseVO.buildSuccess("end");
    
```

```
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWithoutException() {
        Paper paper = paperService.getPaperById(3308);
        paperService.updatePaper("updated completed", 3308);
        log.info("update now");
    }
```

log:

>2022-05-22 17:00:46.395  INFO 16571 --- [nio-8080-exec-2] c.example.ccf.controller.TestController  : ----test1----
>2022-05-22 17:00:46.397  INFO 16571 --- [nio-8080-exec-2] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= Transactional test paper waiting to be updated
>2022-05-22 17:00:46.399  INFO 16571 --- [nio-8080-exec-2] com.example.ccf.blImpl.TestServiceImpl   : update now
>2022-05-22 17:00:46.410  INFO 16571 --- [nio-8080-exec-2] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= updated completed

正常更新了id为3308的paper，paper的title由`Transactional test paper waiting to be updated`->`updated completed`

## updateWithException

```
    @RequestMapping(value = "/test2", method = RequestMethod.GET)
    public ResponseVO test2() {
        log.info("----test2----");
        testService.printPaperTitle();
        try {
            testService.updateWithException();
        } catch (Exception e) {
            log.error("exception occur!");
        }
        testService.printPaperTitle();
        return ResponseVO.buildSuccess("end");
    }
```

```
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWithException() throws Exception {
        Paper paper = paperService.getPaperById(3308);
        paperService.updatePaper("updated completed", 3308);
        log.info("update now");
        throw new Exception("Transactional test exception");
    }
```

log:

>2022-05-22 17:00:59.778  INFO 16571 --- [nio-8080-exec-3] c.example.ccf.controller.TestController  : ----test2----
>2022-05-22 17:00:59.780  INFO 16571 --- [nio-8080-exec-3] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= Transactional test paper waiting to be updated
>2022-05-22 17:00:59.783  INFO 16571 --- [nio-8080-exec-3] com.example.ccf.blImpl.TestServiceImpl   : update now
>2022-05-22 17:00:59.795 ERROR 16571 --- [nio-8080-exec-3] c.example.ccf.controller.TestController  : exception occur!
>2022-05-22 17:00:59.797  INFO 16571 --- [nio-8080-exec-3] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= Transactional test paper waiting to be updated

可以看到，updateWithException()中抛出了异常，事务生效了，paper的更新被阻止了，这就是我们加上` @Transactional`注解所期望的结果。

## callThis

```
    @RequestMapping(value = "/test3", method = RequestMethod.GET)
    public ResponseVO test3() {

        log.info("----test3----");
        testService.printPaperTitle();
        testService.callThis();
        testService.printPaperTitle();
        return ResponseVO.buildSuccess("end");
    }
```

```
    @Override
    public void callThis() {
        Paper paper = paperService.getPaperById(3308);
        log.info("call this.updateWithException()...paper title= {}", paper.getTitle());
        try {
        	// 以this的方式调用
            this.updateWithException();
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }
```

log:

>2022-05-22 17:01:12.873  INFO 16571 --- [nio-8080-exec-4] c.example.ccf.controller.TestController  : ----test3----
>2022-05-22 17:01:12.875  INFO 16571 --- [nio-8080-exec-4] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= Transactional test paper waiting to be updated
>2022-05-22 17:01:12.876  INFO 16571 --- [nio-8080-exec-4] com.example.ccf.blImpl.TestServiceImpl   : call this.updateWithException()...paper title= Transactional test paper waiting to be updated
>2022-05-22 17:01:12.892  INFO 16571 --- [nio-8080-exec-4] com.example.ccf.blImpl.TestServiceImpl   : update now
>2022-05-22 17:01:12.892 ERROR 16571 --- [nio-8080-exec-4] com.example.ccf.blImpl.TestServiceImpl   : Transactional test exception
>2022-05-22 17:01:12.893  INFO 16571 --- [nio-8080-exec-4] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= updated completed

可以看到，updateWithException()中抛出了异常，但事务没有生效，paper仍然更新了，按照预期，`propagation`缺省，使用默认值`TransactionDefinition.PROPAGATION_REQUIRED`，在调用者`callThis()`没有事务上下文的情况下，应该开启一个新的事务，但实际上并没有，它并没有如我们所预想的方式工作。

## callInjection

```
    @RequestMapping(value = "/test4", method = RequestMethod.GET)
    public ResponseVO test4() {
        log.info("----test4----");
        testService.printPaperTitle();
        testService.callInjection();
        testService.printPaperTitle();
        return ResponseVO.buildSuccess("end");
    }
```

```
    PaperService paperService;
    TestService testService;

    @Autowired
    public void DI(PaperService paperService, TestService testService) {
        this.paperService = paperService;
        this.testService = testService;
    }
    
    @Override
    public void callInjection() {
        Paper paper = paperService.getPaperById(3308);
        log.info("call testService.updateWithException()...paper title= {}", paper.getTitle());
        try {
        	// 
            testService.updateWithException();
        } catch (Exception e) {
            log.error(e.getMessage());

        }
    }
```

log:

>2022-05-22 17:01:29.693  INFO 16571 --- [nio-8080-exec-5] c.example.ccf.controller.TestController  : ----test4----
>2022-05-22 17:01:29.694  INFO 16571 --- [nio-8080-exec-5] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= Transactional test paper waiting to be updated
>2022-05-22 17:01:29.695  INFO 16571 --- [nio-8080-exec-5] com.example.ccf.blImpl.TestServiceImpl   : call testService.updateWithException()...paper title= Transactional test paper waiting to be updated
>2022-05-22 17:01:29.706  INFO 16571 --- [nio-8080-exec-5] com.example.ccf.blImpl.TestServiceImpl   : update now
>2022-05-22 17:01:29.718 ERROR 16571 --- [nio-8080-exec-5] com.example.ccf.blImpl.TestServiceImpl   : Transactional test exception
>2022-05-22 17:01:29.720  INFO 16571 --- [nio-8080-exec-5] com.example.ccf.blImpl.TestServiceImpl   : print paper here...paper title= Transactional test paper waiting to be updated

可以看到，updateWithException()中抛出了异常，这次事务生效了，paper没有更新。

# 分析

this. 和 调用注入的service. 的不同让我们的代码行为产生了不同。让我们用debug模式再跑一遍代码，看看有什么不同。

## callThis的调用栈

![test3stack.png](/images/transactional/test3stack.png)

## callInjection的调用栈

![test4stack.png](/images/transactional/test4stack.png)

可以看到，callThis调用的还是原来的方法，而callInjection调用的是Spring通过cglib加强过的方法，是通过proxy调用进我们的方法的，是有aop增强过的。

自然，只有callInjection的方法的事务会生效。

![test4aop.png](/images/transactional/test4aop.png)

同时，也可以看到`@Transactional`具体实施的地方。

```
    @Nullable
    protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass, InvocationCallback invocation) throws Throwable {
        TransactionAttributeSource tas = this.getTransactionAttributeSource();
        TransactionAttribute txAttr = tas != null ? tas.getTransactionAttribute(method, targetClass) : null;
		……
    }

```

总之，这个事务不生效的问题，归根结底是一个 aop 没有生效的问题，是一个 Spring 托管 bean 的问题，没有对 Spring 以及 AOP，代理的理解，就无法理解这个问题。

# reference

[详解 Spring 注解@Transactional事务控制原理](https://baijiahao.baidu.com/s?id=1677407386011788448&wfr=spider&for=pc)

[@Transactional](https://blog.csdn.net/mingyundezuoan/article/details/79017659)
