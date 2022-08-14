---
layout: post
title: 注解@ControllerAdvice的全局处理
date: 2022-3-3 9:00:00 +0900
description: 注解@ControllerAdvice的全局处理
img: post-1.jpg # Add image post (optional)
tags: [spring]
essays: true  
---

# 前言

`@ControllerAdvice `是Spring MVC一个强大的工具，可以对Controller做一些全局的增强和处理。

Spring boot中常用`@RestControllerAdvice `对服务所有的controller进行统一的异常处理。

我的版本：`spring-webmvc-5.3.2.jar`

> ### ControllerAdvice
>
> Indicates the annotated class assists a "Controller".
> Serves as a specialization of @Component, allowing for implementation classes to be autodetected through classpath scanning.
>
> It is typically used to define @ExceptionHandler, @InitBinder, and @ModelAttribute methods that apply to all @RequestMapping methods.
>
> One of annotations(), basePackageClasses(), basePackages() or its alias value() may be specified to define specific subsets of Controllers to assist. When multiple selectors are applied, OR logic is applied - meaning selected Controllers should match at least one selector.
>
> The default behavior (i.e. if used without any selector), the @ControllerAdvice annotated class will assist all known Controllers.
>
> Note that those checks are done at runtime, so adding many attributes and using multiple strategies may have negative impacts (complexity, performance).
>
> 表明被注解的类是一个 "控制器"。
> 作为@Component的特殊化，允许实现类通过classpath扫描被自动检测到。
>
> 它通常用于定义@ExceptionHandler、@InitBinder和@ModelAttribute方法，适用于所有@RequestMapping方法。
>
> annotations()、basePackageClasses()、basePackages()或其别名value()中的一个可以被指定来定义特定的控制器子集来协助。当多个选择器被应用时，OR逻辑被应用--意味着被选中的控制器应该至少匹配一个选择器。
>
> 默认行为（即如果不使用任何选择器），@ControllerAdvice注释的类将协助所有已知的控制器。
>
> 请注意，这些检查是在运行时进行的，所以添加许多属性和使用多种策略可能会产生负面影响（复杂性、性能）。

- @ExceptionHandler —— 统一异常处理
- @InitBinder —— 全局controller入参的预处理，可以注册自定义参数的解析
- @ModelAttribute —— 全局公共模型数据

# 注册

## 初始化

`@InitBinder`,`@ModelAttribute`通过`org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter#initControllerAdviceCache`初始化，`RequestMappingHandlerAdapter`实现了`InitializingBean` 接口的`afterPropertiesSet`方法，会在bean初始化时调用，在`RequestMappingHandlerAdapter`初始化其他Resolver前调用。	

```
    public void afterPropertiesSet() {
        this.initControllerAdviceCache();
		……
    }
```
```
   private void initControllerAdviceCache() {
        if (this.getApplicationContext() != null) {
            List<ControllerAdviceBean> adviceBeans = ControllerAdviceBean.findAnnotatedBeans(this.getApplicationContext());
            List<Object> requestResponseBodyAdviceBeans = new ArrayList();
            Iterator var3 = adviceBeans.iterator();

            while(var3.hasNext()) {
                ControllerAdviceBean adviceBean = (ControllerAdviceBean)var3.next();
                Class<?> beanType = adviceBean.getBeanType();
                if (beanType == null) {
                    throw new IllegalStateException("Unresolvable type for ControllerAdviceBean: " + adviceBean);
                }

                Set<Method> attrMethods = MethodIntrospector.selectMethods(beanType, MODEL_ATTRIBUTE_METHODS);
                if (!attrMethods.isEmpty()) {
                    this.modelAttributeAdviceCache.put(adviceBean, attrMethods);
                }

                Set<Method> binderMethods = MethodIntrospector.selectMethods(beanType, INIT_BINDER_METHODS);
                if (!binderMethods.isEmpty()) {
                    this.initBinderAdviceCache.put(adviceBean, binderMethods);
                }

                if (RequestBodyAdvice.class.isAssignableFrom(beanType) || ResponseBodyAdvice.class.isAssignableFrom(beanType)) {
                    requestResponseBodyAdviceBeans.add(adviceBean);
                }
            }

            if (!requestResponseBodyAdviceBeans.isEmpty()) {
                this.requestResponseBodyAdvice.addAll(0, requestResponseBodyAdviceBeans);
            }

            if (this.logger.isDebugEnabled()) {
                int modelSize = this.modelAttributeAdviceCache.size();
                int binderSize = this.initBinderAdviceCache.size();
                int reqCount = this.getBodyAdviceCount(RequestBodyAdvice.class);
                int resCount = this.getBodyAdviceCount(ResponseBodyAdvice.class);
                if (modelSize == 0 && binderSize == 0 && reqCount == 0 && resCount == 0) {
                    this.logger.debug("ControllerAdvice beans: none");
                } else {
                    this.logger.debug("ControllerAdvice beans: " + modelSize + " @ModelAttribute, " + binderSize + " @InitBinder, " + reqCount + " RequestBodyAdvice, " + resCount + " ResponseBodyAdvice");
                }
            }

        }
    }
```

初始化完成后，`RequestMappingHandlerAdapter`的三个List`modelAttributeAdviceCache` ,`initBinderAdviceCache`,`requestResponseBodyAdvice`中，已经有了对应的adivce对象，可以被调用。



`@ExceptionHandler`通过`org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver#initExceptionHandlerAdviceCache`进行初始化。

```
    private void initExceptionHandlerAdviceCache() {
        if (this.getApplicationContext() != null) {
            List<ControllerAdviceBean> adviceBeans = ControllerAdviceBean.findAnnotatedBeans(this.getApplicationContext());
            Iterator var2 = adviceBeans.iterator();

            while(var2.hasNext()) {
                ControllerAdviceBean adviceBean = (ControllerAdviceBean)var2.next();
                Class<?> beanType = adviceBean.getBeanType();
                if (beanType == null) {
                    throw new IllegalStateException("Unresolvable type for ControllerAdviceBean: " + adviceBean);
                }

                ExceptionHandlerMethodResolver resolver = new ExceptionHandlerMethodResolver(beanType);
                if (resolver.hasExceptionMappings()) {
                    this.exceptionHandlerAdviceCache.put(adviceBean, resolver);
                }

                if (ResponseBodyAdvice.class.isAssignableFrom(beanType)) {
                    this.responseBodyAdvice.add(adviceBean);
                }
            }

            if (this.logger.isDebugEnabled()) {
                int handlerSize = this.exceptionHandlerAdviceCache.size();
                int adviceSize = this.responseBodyAdvice.size();
                if (handlerSize == 0 && adviceSize == 0) {
                    this.logger.debug("ControllerAdvice beans: none");
                } else {
                    this.logger.debug("ControllerAdvice beans: " + handlerSize + " @ExceptionHandler, " + adviceSize + " ResponseBodyAdvice");
                }
            }

        }
    }
```



### requestResponseBodyAdvice

在初始化`HandlerMethodArgumentResolver`时，会将` requestResponseBodyAdvice` 作为参数传入对应`HandlerMethodArgumentResolver`，在其解析Controller需要的参数的时候使用。

```
    private List<HandlerMethodArgumentResolver> getDefaultArgumentResolvers() {
        List<HandlerMethodArgumentResolver> resolvers = new ArrayList(30);
        ……
        resolvers.add(new RequestResponseBodyMethodProcessor(this.getMessageConverters(), this.requestResponseBodyAdvice));
        resolvers.add(new RequestPartMethodArgumentResolver(this.getMessageConverters(), this.requestResponseBodyAdvice));
        ……
        resolvers.add(new HttpEntityMethodProcessor(this.getMessageConverters(), this.requestResponseBodyAdvice));
        ……

        return resolvers;
    }
```

### modelAttributeAdviceCache

```
    private ModelFactory getModelFactory(HandlerMethod handlerMethod, WebDataBinderFactory binderFactory) {
        SessionAttributesHandler sessionAttrHandler = this.getSessionAttributesHandler(handlerMethod);
        Class<?> handlerType = handlerMethod.getBeanType();
        Set<Method> methods = (Set)this.modelAttributeCache.get(handlerType);
        if (methods == null) {
            methods = MethodIntrospector.selectMethods(handlerType, MODEL_ATTRIBUTE_METHODS);
            this.modelAttributeCache.put(handlerType, methods);
        }

        List<InvocableHandlerMethod> attrMethods = new ArrayList();
        // 此处用到了之前初始化的modelAttributeAdviceCache
        this.modelAttributeAdviceCache.forEach((controllerAdviceBean, methodSet) -> {
            if (controllerAdviceBean.isApplicableToBeanType(handlerType)) {
                Object bean = controllerAdviceBean.resolveBean();
                Iterator var7 = methodSet.iterator();

                while(var7.hasNext()) {
                    Method method = (Method)var7.next();
                    attrMethods.add(this.createModelAttributeMethod(binderFactory, bean, method));
                }
            }

        });
        Iterator var7 = methods.iterator();

        while(var7.hasNext()) {
            Method method = (Method)var7.next();
            Object bean = handlerMethod.getBean();
            attrMethods.add(this.createModelAttributeMethod(binderFactory, bean, method));
        }

        return new ModelFactory(attrMethods, binderFactory, sessionAttrHandler);
    }
```

`getModelFactory`会在`invokeHandlerMethod`中被调用，在每次将请求转发给Controller之前进行处理，将Controller中需要的参数从Model中取出，传给Controller。

### initBinderAdviceCache

```
private WebDataBinderFactory getDataBinderFactory(HandlerMethod handlerMethod) throws Exception {
    Class<?> handlerType = handlerMethod.getBeanType();
    Set<Method> methods = (Set)this.initBinderCache.get(handlerType);
    if (methods == null) {
        methods = MethodIntrospector.selectMethods(handlerType, INIT_BINDER_METHODS);
        this.initBinderCache.put(handlerType, methods);
    }

    List<InvocableHandlerMethod> initBinderMethods = new ArrayList();
    this.initBinderAdviceCache.forEach((controllerAdviceBean, methodSet) -> {
        if (controllerAdviceBean.isApplicableToBeanType(handlerType)) {
            Object bean = controllerAdviceBean.resolveBean();
            Iterator var6 = methodSet.iterator();

            while(var6.hasNext()) {
                Method method = (Method)var6.next();
                initBinderMethods.add(this.createInitBinderMethod(bean, method));
            }
        }

    });
    Iterator var5 = methods.iterator();

    while(var5.hasNext()) {
        Method method = (Method)var5.next();
        Object bean = handlerMethod.getBean();
        initBinderMethods.add(this.createInitBinderMethod(bean, method));
    }

    return this.createDataBinderFactory(initBinderMethods);
}
```

`getDataBinderFactory`同样会在`invokeHandlerMethod`中被调用，由`org.springframework.web.method.support.HandlerMethodArgumentResolverComposite#resolveArgument`传递给`HandlerMethodArgumentResolver`接口中的方法`resolveArgument`，解析为参数

```
    
    public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
        HandlerMethodArgumentResolver resolver = this.getArgumentResolver(parameter);
        if (resolver == null) {
            throw new IllegalArgumentException("Unsupported parameter type [" + parameter.getParameterType().getName() + "]. supportsParameter should be called first.");
        } else {
        	// binderFactory被当作参数传入
            return resolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory);
        }
    }
```

具体的例子，如`RequestResponseBodyMethodProcessor`

```
    public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {
        parameter = parameter.nestedIfOptional();
        Object arg = this.readWithMessageConverters(webRequest, parameter, parameter.getNestedGenericParameterType());
        String name = Conventions.getVariableNameForParameter(parameter);
        // 使用到了binderFactory，如果argument符合条件，就会进行处理
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
```

### doResolveHandlerMethodException

```
    @Nullable                                                                         
    protected ModelAndView doResolveHandlerMethodException(HttpServletRequest request, HttpServletResponse response, @Nullable HandlerMethod handlerMethod, Exception exception){
        ServletInvocableHandlerMethod exceptionHandlerMethod = this.getExceptionHandlerMethod(handlerMethod, exception);
        if (exceptionHandlerMethod == null) {
            return null;
        } else {
            if (this.argumentResolvers != null) {
                exceptionHandlerMethod.setHandlerMethodArgumentResolvers(this.argumentResolvers);
            }

            if (this.returnValueHandlers != null) {
                exceptionHandlerMethod.setHandlerMethodReturnValueHandlers(this.returnValueHandlers);
            }

            ServletWebRequest webRequest = new ServletWebRequest(request, response);
            ModelAndViewContainer mavContainer = new ModelAndViewContainer();

            try {
                if (this.logger.isDebugEnabled()) {
                    this.logger.debug("Using @ExceptionHandler " + exceptionHandlerMethod);
                }

                Throwable cause = exception.getCause();
                if (cause != null) {
                    exceptionHandlerMethod.invokeAndHandle(webRequest, mavContainer, new Object[]{exception, cause, handlerMethod});
                } else {
                    exceptionHandlerMethod.invokeAndHandle(webRequest, mavContainer, new Object[]{exception, handlerMethod});
                }
            } catch (Throwable var12) {
                if (var12 != exception && var12 != exception.getCause() && this.logger.isWarnEnabled()) {
                    this.logger.warn("Failure in @ExceptionHandler " + exceptionHandlerMethod, var12);
                }

                return null;
            }

            if (mavContainer.isRequestHandled()) {
                return new ModelAndView();
            } else {
                ModelMap model = mavContainer.getModel();
                HttpStatus status = mavContainer.getStatus();
                ModelAndView mav = new ModelAndView(mavContainer.getViewName(), model, status);
                mav.setViewName(mavContainer.getViewName());
                if (!mavContainer.isViewReference()) {
                    mav.setView((View)mavContainer.getView());
                }

                if (model instanceof RedirectAttributes) {
                    Map<String, ?> flashAttributes = ((RedirectAttributes)model).getFlashAttributes();
                    RequestContextUtils.getOutputFlashMap(request).putAll(flashAttributes);
                }

                return mav;
            }
        }
    }                                                                                                                        
```

这里会一步一步的找到`Exception`对应的`handler`，最终交予其处理。

## 加载顺序

当存在多个`@ExceptionHandler`时，可能会产生冲突，多个`@ControllerAdvice`中存在多个`@ExceptionHandler `可以对同一种`exception`进行处理，这时，Spring会根据包扫描的顺序指定异常处理，有时候我们可能想让更加具体的特殊类型的`ExceptionHandler`处理的对应的Exception，但所有的Exception都被另一个`@ControllerAdvice`拦下并处理了。这是我们不想看到的。

此时需要指定加载顺序，指定我们需要的`@ExceptionHandler `进行处理。让标注`@ControllerAdvice`或者`@RestControllerAdvice`的类作以下工作。

- 实现`Ordered`接口。
- 加`@Order`注解，如`@Order(Ordered.HIGHEST_PRECEDENCE) `

从`ExceptionHandlerExceptionResolver`的`Map<ControllerAdviceBean, ExceptionHandlerMethodResolver> exceptionHandlerAdviceCache`出发。

最后到达的进行排序的方法是这个。

```
    public static List<ControllerAdviceBean> findAnnotatedBeans(ApplicationContext context) {
        ListableBeanFactory beanFactory = context;
        if (context instanceof ConfigurableApplicationContext) {
            beanFactory = ((ConfigurableApplicationContext)context).getBeanFactory();
        }

        List<ControllerAdviceBean> adviceBeans = new ArrayList();
        String[] var3 = BeanFactoryUtils.beanNamesForTypeIncludingAncestors((ListableBeanFactory)beanFactory, Object.class);
        int var4 = var3.length;

        for(int var5 = 0; var5 < var4; ++var5) {
            String name = var3[var5];
            if (!ScopedProxyUtils.isScopedTarget(name)) {
                ControllerAdvice controllerAdvice = (ControllerAdvice)((ListableBeanFactory)beanFactory).findAnnotationOnBean(name, ControllerAdvice.class);
                if (controllerAdvice != null) {
                    adviceBeans.add(new ControllerAdviceBean(name, (BeanFactory)beanFactory, controllerAdvice));
                }
            }
        }
        // 根据Order排序，返回排好序的adviceBeans
        OrderComparator.sort(adviceBeans);
        return adviceBeans;
    }
```

# 具体使用

## @ExceptionHandler —— 统一异常处理

较为常用，尤其是在Spring Boot和Restful的情况下，比较方便。

此时常用`@RestControllerAdvice `来解决问题，相当于` ControllerAdvice + ResponseBody`，在Controller抛出对应的Exception时，会作统一的处理，可以封装成统一的对象返回给前端，这样不会暴露后端具体发生的错误。

```
@RestControllerAdvice(annotations = RestController.class)
public class UniformReponseHandler<T> {

    @ExceptionHandler(MyException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public CallResultMsg sendErrorResponse_UserDefined(Exception exception){
        return new CallResultMsg(false, ((UserDefinedException)exception).getException(), null);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public CallResultMsg sendErrorResponse_System(Exception exception){
        if (exception instanceof UserDefinedException) {
            return this.sendErrorResponse_UserDefined(exception);
        }

        return new CallResultMsg(false, CodeAndMsg.UNKNOWEXCEPTION, null);
    }
}
```

## @ModelAttribute —— 全局公共模型数据

可能常常用在Spring MVC的情况下。方便的设置一个公共的Model，每个Controller都可以中取出自己需要的数据，而且只需要在入参的时候声明所需要的`attribute`即可。

```
@ControllerAdvice
public class GlobalModel {
    @ModelAttribute(value = "msg1")
    public String message() {
        return "msg1";
    }

    @ModelAttribute
    public void addAttributes(Model model) {
        model.addAttribute("msg2", "msg2v");
        HashMap<String, String> map = new HashMap<>();
        map.put("name", "hangge");
        map.put("age", "100");
        model.addAttribute("info", map);
    }
}
```

```
@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello(@ModelAttribute("msg1") String msg1,
                      @ModelAttribute("info") Map<String, String> info) {
        String result = "msg1：" + msg1 + "<br>" + "info：" + info;
        return result;
    }
}
```

# reference

[调整多个ControllerAdvice的执行顺序](https://www.jianshu.com/p/d4b3bc3b46fc)
