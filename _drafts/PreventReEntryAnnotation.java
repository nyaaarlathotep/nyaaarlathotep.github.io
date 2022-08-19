

import java.lang.annotation.*;

/**
 * 防止重入注解类
 *
 * @author yuegenhua
 * @Version $Id: PreventReEntryAnnotation.java, v 0.1 2022-01 16:28 yuegenhua Exp $$
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PreventReEntryAnnotation {
}