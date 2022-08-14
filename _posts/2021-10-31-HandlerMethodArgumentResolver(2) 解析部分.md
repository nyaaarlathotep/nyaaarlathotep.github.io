---
layout: post
title: HandlerMethodArgumentResolver(2) 解析部分
date:  2021-10-31 9:00:00 +0900
description: HandlerMethodArgumentResolver(2) 解析部分
img: post-1.jpg # Add image post (optional)
tags: [spring]
essays: true  
---
HandlerMethodArgumentResolver(2) 解析部分

# 参数解析入口

## InvocableHandlerMethod

在http请求到达服务之后，需要经过一番复杂的解析，其中一部分就是对参数的解析。

```java
public class InvocableHandlerMethod extends HandlerMethod {
    private HandlerMethodArgumentResolverComposite resolvers = new HandlerMethodArgumentResolverComposite();    
    ……
        protected Object[] getMethodArgumentValues(NativeWebRequest request, @Nullable ModelAndViewContainer mavContainer, Object... providedArgs) throws Exception {
        MethodParameter[] parameters = this.getMethodParameters();
        if (ObjectUtils.isEmpty(parameters)) {
            return EMPTY_ARGS;
        } else {
            Object[] args = new Object[parameters.length];

            for(int i = 0; i < parameters.length; ++i) {
                MethodParameter parameter = parameters[i];
                parameter.initParameterNameDiscovery(this.parameterNameDiscoverer);
                args[i] = findProvidedArgument(parameter, providedArgs);
                if (args[i] == null) {
                    // 检查是否有合适的resolver
                    if (!this.resolvers.supportsParameter(parameter)) {
                        throw new IllegalStateException(formatArgumentError(parameter, "No suitable resolver"));
                    }

                    try {
                        // 解析得到参数
                        args[i] = this.resolvers.resolveArgument(parameter, mavContainer, request, this.dataBinderFactory);
                    } catch (Exception var10) {
                        if (logger.isDebugEnabled()) {
                            String exMsg = var10.getMessage();
                            if (exMsg != null && !exMsg.contains(parameter.getExecutable().toGenericString())) {
                                logger.debug(formatArgumentError(parameter, exMsg));
                            }
                        }

                        throw var10;
                    }
                }
            }

            return args;
        }
    }
    ……
}
```

最终，获取参数的方法是`org.springframework.web.method.support.InvocableHandlerMethod#getMethodArgumentValues`，使用` HandlerMethodArgumentResolverComposite`解析参数。

以什么样的顺序，最终选择哪一个ArgumentResolver来解析参数，都是需要讨论的问题。

# 参数具体解析过程

## HandlerMethodArgumentResolverComposite

```java
public class HandlerMethodArgumentResolverComposite implements HandlerMethodArgumentResolver { 
    private final List<HandlerMethodArgumentResolver> argumentResolvers = new ArrayList();
    private final Map<MethodParameter, HandlerMethodArgumentResolver> argumentResolverCache = new ConcurrentHashMap(256);
    ……
	@Nullable
    private HandlerMethodArgumentResolver getArgumentResolver(MethodParameter parameter) {
        HandlerMethodArgumentResolver result = (HandlerMethodArgumentResolver)this.argumentResolverCache.get(parameter);
        if (result == null) {
            Iterator var3 = this.argumentResolvers.iterator();

            while(var3.hasNext()) {
                HandlerMethodArgumentResolver resolver = (HandlerMethodArgumentResolver)var3.next();
                if (resolver.supportsParameter(parameter)) {
                    result = resolver;
                    this.argumentResolverCache.put(parameter, resolver);
                    break;
                }
            }
        }
        return result;
    }
}
```

`getArgumentResolver`方法会返回一个`HandlerMethodArgumentResolver`用以处理参数，从代码中可以看出，方法会尝试从`argumentResolverCache`中取`MethodParameter`对应的`HandlerMethodArgumentResolver`，如果找不到就会从`argumentResolvers`中按顺序遍历，找到支持此`MethodParameter`的`HandlerMethodArgumentResolver`后，再添加到`argumentResolverCache`中。

因此，`argumentResolvers`中的`HandlerMethodArgumentResolver`的顺序肯定会影响参数的解析，如果前面的方法支持此`MethodParameter`，那么这种`HandlerMethodArgumentResolver`就会被直接返回，而不会继续检查后面的`HandlerMethodArgumentResolver`。

## RequestMappingHandlerAdapter

`HandlerMethodArgumentResolverComposite`中的`argumentResolvers`在`RequestMappingHandlerAdapter`中的`afterPropertiesSet`被初始化。

```
public class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter implements BeanFactoryAware, InitializingBean {
	……
	public void afterPropertiesSet() {
        this.initControllerAdviceCache();
        List handlers;
        if (this.argumentResolvers == null) {
            handlers = this.getDefaultArgumentResolvers();
            this.argumentResolvers = (new HandlerMethodArgumentResolverComposite()).addResolvers(handlers);
        }

        if (this.initBinderArgumentResolvers == null) {
            handlers = this.getDefaultInitBinderArgumentResolvers();
            this.initBinderArgumentResolvers = (new HandlerMethodArgumentResolverComposite()).addResolvers(handlers);
        }

        if (this.returnValueHandlers == null) {
            handlers = this.getDefaultReturnValueHandlers();
            this.returnValueHandlers = (new HandlerMethodReturnValueHandlerComposite()).addHandlers(handlers);
        }

    }
	……
	private List<HandlerMethodArgumentResolver> getDefaultArgumentResolvers() {
        List<HandlerMethodArgumentResolver> resolvers = new ArrayList(30);
        resolvers.add(new RequestParamMethodArgumentResolver(this.getBeanFactory(), false));
        resolvers.add(new RequestParamMapMethodArgumentResolver());
        resolvers.add(new PathVariableMethodArgumentResolver());
        resolvers.add(new PathVariableMapMethodArgumentResolver());
        resolvers.add(new MatrixVariableMethodArgumentResolver());
        resolvers.add(new MatrixVariableMapMethodArgumentResolver());
        resolvers.add(new ServletModelAttributeMethodProcessor(false));
        resolvers.add(new RequestResponseBodyMethodProcessor(this.getMessageConverters(), this.requestResponseBodyAdvice));
        resolvers.add(new RequestPartMethodArgumentResolver(this.getMessageConverters(), this.requestResponseBodyAdvice));
        resolvers.add(new RequestHeaderMethodArgumentResolver(this.getBeanFactory()));
        resolvers.add(new RequestHeaderMapMethodArgumentResolver());
        resolvers.add(new ServletCookieValueMethodArgumentResolver(this.getBeanFactory()));
        resolvers.add(new ExpressionValueMethodArgumentResolver(this.getBeanFactory()));
        resolvers.add(new SessionAttributeMethodArgumentResolver());
        resolvers.add(new RequestAttributeMethodArgumentResolver());
        resolvers.add(new ServletRequestMethodArgumentResolver());
        resolvers.add(new ServletResponseMethodArgumentResolver());
        resolvers.add(new HttpEntityMethodProcessor(this.getMessageConverters(), this.requestResponseBodyAdvice));
        resolvers.add(new RedirectAttributesMethodArgumentResolver());
        resolvers.add(new ModelMethodProcessor());
        resolvers.add(new MapMethodProcessor());
        resolvers.add(new ErrorsMethodArgumentResolver());
        resolvers.add(new SessionStatusMethodArgumentResolver());
        resolvers.add(new UriComponentsBuilderMethodArgumentResolver());
        if (KotlinDetector.isKotlinPresent()) {
            resolvers.add(new ContinuationHandlerMethodArgumentResolver());
        }

        if (this.getCustomArgumentResolvers() != null) {
            resolvers.addAll(this.getCustomArgumentResolvers());
        }

        resolvers.add(new PrincipalMethodArgumentResolver());
        resolvers.add(new RequestParamMethodArgumentResolver(this.getBeanFactory(), true));
        resolvers.add(new ServletModelAttributeMethodProcessor(true));
        return resolvers;
    }
    ……
}
```

可以看到，之前介绍过的`HandlerMethodArgumentResolver`基本都出现了。

`RequestParamMethodArgumentResolver`，`ServletModelAttributeMethodProcessor`在添加时排在最后（`ServletModelAttributeMethodProcessor`出现了两次，第一次构造时`annotationNotRequired`为`true`，第二次为`false`）。在我们的Controller在没有注释帮助Spring选择解析器的时候，Spring最后的兜底选择。

`RequestParam`平时用于处理带`@RequestParam`注解的参数，`ServletModelAttributeMethodProcessor`处理`model`相关。

这之后，就回到对应方法的解析过程中了。

### reference

[HandlerMethodArgumentResolver(一)：Controller方法入参自动封装器（将参数parameter解析为值）【享学Spring MVC】](https://blog.csdn.net/f641385712/article/details/98989698)

[SpringBoot源码——请求全过程源码分析——一步一步详细分析](https://blog.csdn.net/u013541707/article/details/108886764)
