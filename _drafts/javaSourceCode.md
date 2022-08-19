```

package java.lang.reflect;


public interface GenericArrayType extends Type {

    Type getGenericComponentType();
}

```

```

package java.lang.reflect;


public interface ParameterizedType extends Type {

    Type[] getActualTypeArguments();


    Type getRawType();


    Type getOwnerType();
}

```

```
package java.lang.reflect;


public interface TypeVariable<D extends GenericDeclaration> extends Type, AnnotatedElement {

    Type[] getBounds();


    D getGenericDeclaration();


    String getName();


     AnnotatedType[] getAnnotatedBounds();
}
```

```
package java.lang.reflect;


public interface WildcardType extends Type {

    Type[] getUpperBounds();


    Type[] getLowerBounds();
    // one or many? Up to language spec; currently only one, but this API
    // allows for generalization.
}
```

```
import java.lang.annotation.*;

/**
 * LogAnnotation
 *
 * @author Tiger
 * @version V1.0
 * @date 2020年3月18日
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LogAnnotation {
    /**
     * 模块
     */
    String title() default "";

    /**
     * 功能
     */
    String action() default "";
}

```

```
import com.alibaba.fastjson.JSON;
import com.saicfc.ofs.ordercenter.dataexchange.audi.common.annotation.LogAnnotation;
import com.saicfc.ofs.ordercenter.dataexchange.audi.model.SysLog;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * 日志切面
 *
 * @author Tiger
 * @version V1.0
 * @date 2021年6月18日
 */
@Aspect
@Component
@Slf4j
public class SysLogAspect {

    /**
     * 此处的切点是注解的方式 只要出现 @LogAnnotation注解都会进入
     */
    @Pointcut("@annotation(com.saicfc.ofs.ordercenter.dataexchange.audi.common.annotation.LogAnnotation)")
    public void logPointCut() {

    }

    /**
     * 环绕增强,相当于MethodInterceptor
     */
    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        long beginTime = System.currentTimeMillis();
        SysLog sysLog = new SysLog();
        //请求的方法名
        String className = point.getTarget().getClass().getName();
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        String methodName = signature.getName();
        sysLog.setMethod(className + "." + methodName + "()");

        // 方法调用前，打印请求参数
        try {
            //请求的参数
            Object[] args = point.getArgs();
            //去除掉不能序列化的参数
            List<Object> arguments = new ArrayList<>();
            String params = null;
            if (args != null && args.length != 0) {
                for (int i = 0; i < args.length; i++) {
                    if (args[i] instanceof ServletRequest || args[i] instanceof ServletResponse || args[i] instanceof MultipartFile) {
                        continue;
                    }
                    arguments.add(args[i]);
                }
                params = JSON.toJSONString(arguments);
            }
            sysLog.setParams(params);

            log.info("调用方法： {}, 请求参数： {}", sysLog.getMethod(), sysLog.getParams());
        } catch (Exception e) {
            log.error("调用方法： " + sysLog.getMethod(), e);
        }

        // 实际调用方法, 如果发生异常则抛出
        Object result = point.proceed();

        // 方法调用后，打印响应结果
        try {
            LogAnnotation logAnnotation = method.getAnnotation(LogAnnotation.class);
            if (logAnnotation != null) {
                //注解上的描述
                sysLog.setOperation(logAnnotation.title() + "-" + logAnnotation.action());
            }

            String resultParam = JSON.toJSONString(result);
            sysLog.setResult(resultParam);
            //执行时长(毫秒)
            long time = System.currentTimeMillis() - beginTime;
            sysLog.setDuring(time);
            log.info("调用方法： {}， 响应结果： {}，响应时间{}ms",
                    sysLog.getMethod(), sysLog.getResult(), sysLog.getDuring());
        } catch (Exception e) {
            log.error("调用方法： " + sysLog.getMethod(), e);
        }

        return result;
    }

}
```
