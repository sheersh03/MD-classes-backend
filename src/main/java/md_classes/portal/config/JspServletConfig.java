package md_classes.portal.config;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRegistration;
import md_classes.portal.servlet.JspServlet;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;

import java.util.Set;

@Configuration
public class JspServletConfig implements ServletContextInitializer {

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        JspServlet jspServlet = new JspServlet();
        ServletRegistration.Dynamic registration = servletContext.addServlet("jspServlet", jspServlet);
        registration.setLoadOnStartup(1);

        // Scan for all JSP files under /WEB-INF/jsp/ and map them dynamically
        Set<String> jspPaths = servletContext.getResourcePaths("/WEB-INF/jsp/");
        if (jspPaths != null) {
            for (String path : jspPaths) {
                if (path.endsWith(".jsp")) {
                    String fileName = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
                    registration.addMapping("/" + fileName);
                    System.out.println("Dynamically mapped JspServlet to /" + fileName);
                }
            }
        } else {
            // Fallbacks for testing or non-exploded deployments where resources paths are not inspectable
            registration.addMapping("/login");
            registration.addMapping("/dashboard");
            registration.addMapping("/student-dashboard");
            registration.addMapping("/studentdashboard");
            registration.addMapping("/parent-dashboard");
            registration.addMapping("/parentdashboard");
            registration.addMapping("/class-dashboard");
            registration.addMapping("/classdashboard");
        }
        // Also map unhyphenated URL aliases for convenience
        registration.addMapping("/studentdashboard");
        registration.addMapping("/parentdashboard");
        registration.addMapping("/classdashboard");
    }
}
