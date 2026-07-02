package md_classes.portal.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JspServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String uri = req.getRequestURI();
        String contextPath = req.getContextPath();
        String path = uri.substring(contextPath.length());

        switch (path) {
            case "/":
            case "/login":
                req.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(req, resp);
                break;
            case "/dashboard":
                req.getRequestDispatcher("/WEB-INF/jsp/dashboard.jsp").forward(req, resp);
                break;
            case "/student-dashboard":
                req.getRequestDispatcher("/WEB-INF/jsp/student-dashboard.jsp").forward(req, resp);
                break;
            case "/parent-dashboard":
                req.getRequestDispatcher("/WEB-INF/jsp/parent-dashboard.jsp").forward(req, resp);
                break;
            case "/class-dashboard":
                req.getRequestDispatcher("/WEB-INF/jsp/class-dashboard.jsp").forward(req, resp);
                break;
            default:
                resp.sendError(HttpServletResponse.SC_NOT_FOUND);
                break;
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String uri = req.getRequestURI();
        String contextPath = req.getContextPath();
        String path = uri.substring(contextPath.length());

        if ("/login".equals(path)) {
            // Forward login form post or JSON login post to Spring MVC's DispatcherServlet
            req.getServletContext().getNamedDispatcher("dispatcherServlet").forward(req, resp);
        } else {
            resp.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
        }
    }
}
