package md_classes.portal.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class LoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(LoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            
            request.setAttribute("startTime", System.currentTimeMillis());
            
            log.info("==> [CONTROLLER] Calling: {}.{}() | Request: {} {}", 
                    controllerName, 
                    methodName, 
                    request.getMethod(), 
                    request.getRequestURI());
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            
            Long startTime = (Long) request.getAttribute("startTime");
            long duration = startTime != null ? (System.currentTimeMillis() - startTime) : 0;
            
            if (ex != null) {
                log.error("<== [CONTROLLER] Finished: {}.{}() | Status: {} | Duration: {}ms | Exception: {}", 
                        controllerName, 
                        methodName, 
                        response.getStatus(), 
                        duration, 
                        ex.getMessage());
            } else {
                log.info("<== [CONTROLLER] Finished: {}.{}() | Status: {} | Duration: {}ms", 
                        controllerName, 
                        methodName, 
                        response.getStatus(), 
                        duration);
            }
        }
    }
}
