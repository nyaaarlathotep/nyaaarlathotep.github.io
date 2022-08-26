---
layout: post
title: HandlerMethodArgumentResolver(3) 自定义解析器部分
date:  2021-11-21 9:00:00 +0900
description: HandlerMethodArgumentResolver(3) 自定义解析器部分
img: post-1.jpg # Add image post (optional)
categories: [Spring]
keywords: Spring, HandlerMethodArgumentResolver
essays: true  
---

HandlerMethodArgumentResolver(3) 自定义解析器部分

# 使用场景

自定义解析器并不能做到更多的东西，只是能将原来必须要显示处理才能获得的参数，只需要一个注解就能获得，将参数解析的部分放到幕后处理了。这样的操作降低了可能的代码重复与耦合，让Controller层的代码看起来更清爽简洁一点。

简单的举几个例子：

- Controller获得当前登录的用户。这是一个普遍的需求，通常的解决方法需要一个util类，Controller输入从请求中获得的token之类验权信息，获得具体登录的用户相关的信息。
- Controller将经过非对称加密的请求解密，把参数解密后还可能包含反序列化的过程，这也需要一个util类。

# 注解类

首先，你需要一个注解类，发挥`@RequsetParam`了类似的作用，表明你最后需要解析器返回的参数。

```java
@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface User {
}
```

注解仅仅做一个标志，沟通解析器和具体的参数，不需要额外的东西。

# 参数解析器

之后，你需要继承`HandlerMethodArgumentResolver`，实现自己的具体的解析类，让他帮助你实现之前util类实现的功能，自动从request中取出相应的参数，解析并最后赋给你注解的参数，传入Controller。

```java
// spring注解，如果需要autowired自己需要的服务类
@Configuration
public class UserArgumentResolver implements HandlerMethodArgumentResolver {
    @Override
    // 指定支持的methodParameter
    public boolean supportsParameter(MethodParameter methodParameter) {
        return methodParameter.hasParameterAnnotation(User.class);
    }

    @Override
    public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer, NativeWebRequest nativeWebRequest, WebDataBinderFactory webDataBinderFactory) throws Exception {
        HttpServletRequest httpServletRequest = nativeWebRequest.getNativeRequest(HttpServletRequest.class);
        
        // 具体的自定义的参数处理
        String user1 = (String) httpServletRequest.getSession().getAttribute("User");
        String user2 = (String) httpServletRequest.getHeader("user");
        ……

        return null;
    }
}
```

# 注册解析器

将解析器注册在Spring中，供其使用，不然是不会解析的。

这里实现了`WebMvcConfigurer`，而不是继承已经废弃的`WebMvcConfigurerAdapter`。

```
@Configuration
public class MyWebMvcConfigurationAdapter implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new UserArgumentResolver());
    }
}
```

还有个小问题，解析器默认是注册在整个`argumentResolvers`List的最底部的，可能会出现之前的解析器提前拦截处理参数的情况，这时候可能简单的实现`WebMcConfigurer`就不够了，还需要重写前一篇文章提到的`RequestMappingHandlerAdapter`的部分。我还找到了一个利用自定义`BeanPostProcessor`来完成的方法，贴在下面参考里了。

### reference

[HandlerMethodArgumentResolver(四)：自定参数解析器处理特定场景需求，介绍PropertyNamingStrategy的使用【享学Spring MVC】](https://fangshixiang.blog.csdn.net/article/details/100183979)

[WebMvcConfigurer.addArgumentResolvers自定义参数处理器不生效的原理与解决方案](https://blog.csdn.net/weixin_42213903/article/details/101211873)

[HandlerMethodArgumentResolver的原理是什么？](https://segmentfault.com/q/1010000017496491)

