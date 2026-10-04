package md_classes.portal.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiPrefixFilter extends OncePerRequestFilter {

    private static final List<String> PATH_PREFIXES = List.of(
            "/quizzes",
            "/questions",
            "/subjects",
            "/units",
            "/topics",
            "/quiz-attempts",
            "/question-attempts",
            "/fees",
            "/syllabus-progress",
            "/students"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }

        if (!uri.startsWith("/apiv1/") && !uri.equals("/apiv1")) {
            for (String prefix : PATH_PREFIXES) {
                if (uri.equals(prefix) || uri.startsWith(prefix + "/")) {
                    request.getRequestDispatcher("/apiv1" + uri).forward(request, response);
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
