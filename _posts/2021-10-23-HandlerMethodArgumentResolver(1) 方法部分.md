---
layout: post
title: HandlerMethodArgumentResolver(1) 方法部分
date:  2021-10-23 9:00:00 +0900
description: HandlerMethodArgumentResolver(1) 方法部分
img: post-1.jpg # Add image post (optional)
tags: [spring]
essays: true   
---

# 前言

Spring MVC十分强大，在私底下做了很多工作。

其中一个让我疑惑的地方就是controller，它是如何把一个网络的请求接入，解析并得到我们所需要的参数的呢？这样我们的工作只剩下编写我们所需要的入口以及所需要的参数，也就是一个接口，其他工作都交付给Spring来替我们完成了。有时候我们会给一些注解来对我们所需的参数进行标志，辅助Spring进行工作，比如`@PathVarible`、`@RequestParam`、`@RequestBody`，但更神秘的是，有时候出错，得不到需要的参数，但你把这些画蛇添足的注解删除，全权委托给Spring来帮助解析所需的参数，反而能达到目标，得到相应的参数。

我又注意到公司的项目，有位同事实现的controller统一从auth中提取用户，只需要加注解就可以，一个经过处理验权的User就会作为参数传入，统一管理，干净高效，令人愉悦。

这些奇妙的情况让我决定查查资料，总结一下有关的内容。

# 继承结构

我大致将HandlerMethodArgumentResolver的实现分为了三类，第一类最常用，也就对应着`@PathVarible`、`@RequestParam`这些注解；第二类与第一类对应，不过不再进行筛选处理，直接将参数作为一个map传入，由使用者自行处理；第三类是一些原生的Servlet api，在需要使用的时候直接注入；第四类对应`@RequestBody`的注解，会从http请求的请求体中获取对应的参数，这一种解析方式还和http请求的协商过程关系很大。

![nameValue](https://raw.githubusercontent.com/nyaaarlathotep/nyaaar.github.io/gh-pages/assets/images/AbstractNamedValueMethodArgumentResolver.png)

![mapValue](https://raw.githubusercontent.com/nyaaarlathotep/nyaaar.github.io/gh-pages/assets/images/MapMethodArgumentResolver.png)

![servletValue](https://raw.githubusercontent.com/nyaaarlathotep/nyaaar.github.io/gh-pages/assets/images/ServletMethodArgumentResolver.png)

![bodyValue](https://raw.githubusercontent.com/nyaaarlathotep/nyaaar.github.io/gh-pages/assets/images/AbstractMessageConverterMethodArgumentResolver.png)

其中省略了一些我不常用的实现，比如自动从Cookie，Session等中取值。

# 源码

这部分内容最好还是自己去查一下spring源码，挺方便的，对照看看解析的过程能更好地理解。我在其中挑选了几个过程清晰典型的类作为例子。

## HandlerMethodArgumentResolver

```java
public interface HandlerMethodArgumentResolver {
    boolean supportsParameter(MethodParameter var1);

    @Nullable
    Object resolveArgument(MethodParameter var1, @Nullable ModelAndViewContainer var2, NativeWebRequest var3, @Nullable WebDataBinderFactory var4) throws Exception;
}
```

所有具体处理类都需要实现的接口。

简单清晰，一个方法确认此类支持的参数，另一个方法解析并返回需要的参数。

### AbstractNamedValueMethodArgumentResolver

```java
public abstract class AbstractNamedValueMethodArgumentResolver implements HandlerMethodArgumentResolver {
    ……
    @Nullable
    public final Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
    NamedValueInfo namedValueInfo = this.getNamedValueInfo(parameter);
    MethodParameter nestedParameter = parameter.nestedIfOptional();
    ……
    Object arg = this.resolveName(resolvedName.toString(), nestedParameter, webRequest);
   	……

        if (binderFactory != null) {
            WebDataBinder binder = binderFactory.createBinder(webRequest, (Object)null, namedValueInfo.name);
    ……
    }
    ……
    @Nullable
    protected abstract Object resolveName(String var1, MethodParameter var2, NativeWebRequest var3) throws Exception;
    ……
    protected abstract NamedValueInfo createNamedValueInfo(MethodParameter var1);
    ……
    protected static class NamedValueInfo {
        private final String name;
        private final boolean required;
        @Nullable
        private final String defaultValue;

        public NamedValueInfo(String name, boolean required, @Nullable String defaultValue) {
            this.name = name;
            this.required = required;
            this.defaultValue = defaultValue;
        }
    }
    ……
}
```

AbstractNamedValueMethodArgumentResolver，所有按name解析参数类，也就是上面的第一种解析方法，的共同的抽象父类

有几个部分比较重要，我把源码截出来分析一下。resolveArgument方法，是解析过程的起点，它的解析过程大致如下：

>1. 基于MethodParameter构建NameValueInfo <-- 主要有name, defaultValue, required（其实主要是解析方法参数上标注的注解~）
>2. 通过BeanExpressionResolver(${}占位符以及SpEL) 解析name
>3. **通过模版方法resolveName从 HttpServletRequest, Http Headers, URI template variables 等等中获取对应的属性值（具体由子类去实现）**
>4. 对 arg==null这种情况的处理, 要么使用默认值, 若 required = true && arg == null, 则一般报出异常（boolean类型除外~）
>5. 通过WebDataBinder将arg转换成Methodparameter.getParameterType()类型（注意：这里仅仅只是用了数据转换而已，并没有用bind()方法）

AbstractNamedValueMethodArgumentResolver的resolveArgument方法是final的，不允许子类覆盖。

子类剩下的必须工作就是实现模板方法resolveName和createNamedValueInfo了，根据各自情况进行解析。

还可以对无法解析，或者说解析出null的值做一定的处理。

#### RequestHeaderMethodArgumentResolver

```java
public class RequestHeaderMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    public RequestHeaderMethodArgumentResolver(@Nullable ConfigurableBeanFactory beanFactory) {
        super(beanFactory);
    }

    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(RequestHeader.class) && !Map.class.isAssignableFrom(parameter.nestedIfOptional().getNestedParameterType());
    }

    protected NamedValueInfo createNamedValueInfo(MethodParameter parameter) {
        RequestHeader ann = (RequestHeader)parameter.getParameterAnnotation(RequestHeader.class);
        Assert.state(ann != null, "No RequestHeader annotation");
        return new RequestHeaderMethodArgumentResolver.RequestHeaderNamedValueInfo(ann);
    }

    @Nullable
    protected Object resolveName(String name, MethodParameter parameter, NativeWebRequest request) throws Exception {
        String[] headerValues = request.getHeaderValues(name);
        if (headerValues != null) {
            return headerValues.length == 1 ? headerValues[0] : headerValues;
        } else {
            return null;
        }
    }

    protected void handleMissingValue(String name, MethodParameter parameter) throws ServletRequestBindingException {
        throw new MissingRequestHeaderException(name, parameter);
    }

    private static final class RequestHeaderNamedValueInfo extends NamedValueInfo {
        private RequestHeaderNamedValueInfo(RequestHeader annotation) {
            super(annotation.name(), annotation.required(), annotation.defaultValue());
        }
    }
}
```

RequestHeaderMethodArgumentResolver是一个典型的实现，可以将header中的值进行解析，填入相应的参数里。

支持带有@RequestHeader注解且值不是map的参数。

## PathVariableMapMethodArgumentResolver

```java
public class PathVariableMapMethodArgumentResolver implements HandlerMethodArgumentResolver {
    public PathVariableMapMethodArgumentResolver() {
    }

    public boolean supportsParameter(MethodParameter parameter) {
        PathVariable ann = (PathVariable)parameter.getParameterAnnotation(PathVariable.class);
        return ann != null && Map.class.isAssignableFrom(parameter.getParameterType()) && !StringUtils.hasText(ann.value());
    }

    public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
        Map<String, String> uriTemplateVars = (Map)webRequest.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE, 0);
        return !CollectionUtils.isEmpty(uriTemplateVars) ? new LinkedHashMap(uriTemplateVars) : Collections.emptyMap();
    }
}
```

方法会将url中?后面的部分映射为一个LinkedHashMap，比如说`/test?name=fsx&age=18&age=28`中，结果是`{name=fsx, age=18}`的一个map

## ServletRequestMethodArgumentResolver

```java
public class ServletRequestMethodArgumentResolver implements HandlerMethodArgumentResolver {
    @Nullable
    private static Class<?> pushBuilder;

    public ServletRequestMethodArgumentResolver() {
    }

    public boolean supportsParameter(MethodParameter parameter) {
        Class<?> paramType = parameter.getParameterType();
        return WebRequest.class.isAssignableFrom(paramType) 
            || ServletRequest.class.isAssignableFrom(paramType) 
            || MultipartRequest.class.isAssignableFrom(paramType) 
            || HttpSession.class.isAssignableFrom(paramType) 
            || pushBuilder != null && pushBuilder.isAssignableFrom(paramType) 
            || Principal.class.isAssignableFrom(paramType) && !parameter.hasParameterAnnotations() 
            || InputStream.class.isAssignableFrom(paramType) 
            || Reader.class.isAssignableFrom(paramType) 
            || HttpMethod.class == paramType 
            || Locale.class == paramType 
            || TimeZone.class == paramType 
            || ZoneId.class == paramType;
    }

    public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
        Class<?> paramType = parameter.getParameterType();
        if (WebRequest.class.isAssignableFrom(paramType)) {
            if (!paramType.isInstance(webRequest)) {
                throw new IllegalStateException("Current request is not of type [" + 
                                                paramType.getName() + "]: " + webRequest);
            } else {
                return webRequest;
            }
        } else {
            return !ServletRequest.class.isAssignableFrom(paramType) && !MultipartRequest.class.isAssignableFrom(paramType) ? this.resolveArgument(paramType, (HttpServletRequest)this.resolveNativeRequest(webRequest, HttpServletRequest.class)) : this.resolveNativeRequest(webRequest, paramType);
        }
    }
    ……
}
```

可以看到，支持的Parameter有很多，在Controller需要使用的时候，只需要在方法的入参上写明白类型，再加上注解，Spring就会帮助自动注入。

## AbstractMessageConverterMethodArgumentResolver

```java
public abstract class AbstractMessageConverterMethodArgumentResolver implements HandlerMethodArgumentResolver {
    
    ……
    @Nullable
    protected <T> Object readWithMessageConverters(NativeWebRequest webRequest, MethodParameter parameter, Type paramType) throws IOException, HttpMediaTypeNotSupportedException, HttpMessageNotReadableException {
        HttpInputMessage inputMessage = this.createInputMessage(webRequest);
        return this.readWithMessageConverters((HttpInputMessage)inputMessage, parameter, paramType);
    }

    @Nullable
    protected <T> Object readWithMessageConverters(HttpInputMessage inputMessage, MethodParameter parameter, Type targetType) throws IOException, HttpMediaTypeNotSupportedException, HttpMessageNotReadableException {
        ……
    }  
    ……
}
```

重点就是这两个readWithMessageConverters方法，通过他们解析HttpInputMessage的body，其他的部分是一些提供给子类使用的工具方法。

### RequestPartMethodArgumentResolver

这个方法专门为@RequestPart与MultipartFile 参数服务，与Spring的文件上传有关系。

### AbstractMessageConverterMethodProcessor

```java
public abstract class AbstractMessageConverterMethodProcessor extends AbstractMessageConverterMethodArgumentResolver implements HandlerMethodReturnValueHandler {
    ……
        protected <T> void writeWithMessageConverters(@Nullable T value, MethodParameter returnType, 
                 ServletServerHttpRequest inputMessage, ServletServerHttpResponse outputMessage) 
                           throws IOException, HttpMediaTypeNotAcceptableException, HttpMessageNotWritableException {
            ……
    }
    ……
    
}
```

主要就是writeWithMessageConverters这个方法，利用HttpMessageConverter来完成任务。这个抽象方法不再以Resolver结束，不仅能处理入参，还能处理返回值。

同时，它实现了内容协商的部分。

#### RequestResponseBodyMethodProcessor

```java
public class RequestResponseBodyMethodProcessor extends AbstractMessageConverterMethodProcessor {
    
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(RequestBody.class);
    }
    
    public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, 
           NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
        parameter = parameter.nestedIfOptional();
        Object arg = this.readWithMessageConverters(webRequest, parameter, 
                                                    parameter.getNestedGenericParameterType());
        String name = Conventions.getVariableNameForParameter(parameter);
        if (binderFactory != null) {
            WebDataBinder binder = binderFactory.createBinder(webRequest, arg, name);
            if (arg != null) {
                this.validateIfApplicable(binder, parameter);
                if (binder.getBindingResult().hasErrors() && this.isBindExceptionRequired(binder, parameter)) {
                    throw new MethodArgumentNotValidException(parameter, binder.getBindingResult());
                }
            }

            if (mavContainer != null) {
                mavContainer.addAttribute(BindingResult.MODEL_KEY_PREFIX + name, binder.getBindingResult());
            }
        }

        return this.adaptArgumentIfNecessary(arg, parameter);
    }
    ……
}
```

支持@RequestBody注解的参数

resolveArgument方法中，又调用了抽象父类中的readWithMessageConverters方法获得body的内容，之后解析以获得最后的结果。

### reference

[HandlerMethodArgumentResolver(一)：Controller方法入参自动封装器（将参数parameter解析为值）【享学Spring MVC】](https://blog.csdn.net/f641385712/article/details/98989698)

