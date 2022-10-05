---
layout: post
title: template page
categories: [solution]
description: some word here
keywords: Java, Spring
---

# 前言

最近在写自己的一个小项目，各种版本都上了最新的，出了好多问题，一个一个解决下来真的酸爽，网上好多解决方案的都是对应旧版本的，没法用。这个问题解决的有点意思，顺手记录一下。

# 问题描述

我的版本：Spring 2.7.3, springdoc-openapi-ui 1.6.11, Swagger3

在通过实现 WebMvcConfigurer，重写 addInterceptors 方法来添加 Inteceptor 的时候，原来运作良好的 Swagger 页面报错 404，在去掉 WebMvcConfigurer 后，立即恢复正常。

# 解决方案

1. 如果你是旧版本的 Swagger，可以使用这个方法解决：找到自己的 Swagger 版本对应的页面资源的位置，并通过重写自己实现的 WebMvcConfigurer 中的 addResourceHandlers 方法，手动配置 Swagger 页面的静态资源路径，使 Spring 可以成功找到 Swagger-ui.html 页面的资源。如：

```java
   @Override
   public void addResourceHandlers(ResourceHandlerRegistry registry) {
       registry.addResourceHandler("/**").addResourceLocations(
               "classpath:/static/");
       registry.addResourceHandler("Swagger-ui.html").addResourceLocations(
               "classpath:/META-INF/resources/");
       registry.addResourceHandler("/webjars/**").addResourceLocations(
               "classpath:/META-INF/resources/webjars/");
       super.addResourceHandlers(registry);
   }
```
2. （推荐）找到自己 Swagger 对应的 jar 包，找到与自己定义的 WebMvcConfigurer 发生冲突的，Swagger 自己实现的 WebMvcConfigurer。这个可能是在 Swagger 相关的包下 ，也有可能在 Springfox 或者 openapi 相关的某个包下。

   我使用的是 openapi，在我的版本中，是在 Springdoc-openapi-ui 包下的 org.Springdoc.webmvc.ui 下的 SwaggerWebMvcConfigurer 类，就是它冲突了。

   让自己的 WebMvcConfigurer 继承这个类即可。如：

```java
@Configuration
@Slf4j
public class InterceptorConfig extends SwaggerWebMvcConfigurer {


    public InterceptorConfig(SwaggerUiConfigParameters swaggerUiConfigParameters,
                             SwaggerIndexTransformer swaggerIndexTransformer,
                             Optional<ActuatorProvider> actuatorProvider) {
        super(swaggerUiConfigParameters, swaggerIndexTransformer, actuatorProvider);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
         …… add your interceptor ……
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        super.addResourceHandlers(registry);
    }
}
```

​	构造函数的这些参数，Spring 都是可以扫到的，不用再做其他的配置了。

# 原理

没啥好说的，Swagger 的配置和我们自己写的配置冲突了，Spring 选择了我们的配置，导致 Swagger 的配置失效。

我们继承了 Swagger 的配置，它又会生效了，就是到时候如果有更多的冲突，没法多继承，有点麻烦，可能要一个一个写过来，有点麻烦，我找不到更好的办法了。

# reference

[访问Swagger-ui.html 404报错一秒解决](https://blog.csdn.net/qq_41359998/article/details/124008437)

[Swagger-ui.html 404问题解决](https://dev-tang.com/post/2020/01/Swagger-ui-404.html)