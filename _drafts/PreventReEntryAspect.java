


import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.reflections.Reflections;
import org.reflections.scanners.FieldAnnotationsScanner;
import org.reflections.scanners.MethodAnnotationsScanner;
import org.reflections.scanners.MethodParameterScanner;
import org.reflections.scanners.SubTypesScanner;
import org.reflections.util.ConfigurationBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;



/**
 * 防止重入切片
 *
 * @author yuegenhua
 * @Version $Id: PreventReEntryAspect.java, v 0.1 2022-01 16:32 yuegenhua Exp $$
 */
@Aspect
@Component
@Slf4j
public class PreventReEntryAspect {
    @Pointcut("@annotation(com.saicfc.efsw.reportform.efswbizreportformservice.common.annotation.PreventReEntryAnnotation)")
    public void logPointCut() {
    }

    private final HashMap<String, AtomicInteger> entryCtrlMap = new HashMap<>();

    @Autowired(required = false)
    public void init() {
        log.info("PreventReEntryAspect init start");
        Reflections reflections = new Reflections(new ConfigurationBuilder()
                // 指定路径URL
                .forPackages("com.saicfc.efsw.reportform.efswbizreportformservice.controller")
                // 添加 方法注解扫描工具
                .addScanners(new MethodAnnotationsScanner())

        );
        Set<Method> methodSet = reflections.getMethodsAnnotatedWith(PreventReEntryAnnotation.class);
        for (Method method : methodSet) {
            entryCtrlMap.put(method.getName(), new AtomicInteger(0));
        }
        log.info("PreventReEntryAspect init end");
    }

    @Around("logPointCut()")
    public Object around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        Object result = null;
        MethodSignature signature = (MethodSignature) proceedingJoinPoint.getSignature();
        AtomicInteger atomicInteger = entryCtrlMap.get(signature.getMethod().getName());
        int now = atomicInteger.getAndIncrement();
        if (now == 0) {
            try {
                result = proceedingJoinPoint.proceed();
            } finally {
                atomicInteger.decrementAndGet();
            }
        } else {
            atomicInteger.decrementAndGet();
            log.info("方法执行结束前重入, method:{}", signature.getMethod().getName());
            throw new RfsException(RE_ENTRY_ERROR);
        }

        return result;
    }
}