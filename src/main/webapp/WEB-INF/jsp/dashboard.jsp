<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/dashboard.css">
</head>
<body>
    <div class="sidebar">
        <div class="brand">MD Portal</div>
        
        <div class="user-profile">
            <div class="avatar" id="userAvatar">U</div>
            <div class="user-details">
                <div class="user-name" id="userName">User Name</div>
                <div class="user-role-badge" id="userRole">Role</div>
            </div>
        </div>

        <ul class="nav-links">
            <li><button class="nav-btn active" onclick="switchPanel('overview')">Overview</button></li>
            <li><button class="nav-btn" id="studentsNavBtn" onclick="switchPanel('students')">Students Directory</button></li>
            <li><button class="nav-btn logout-btn" onclick="logout()">Logout</button></li>
        </ul>
    </div>

    <div class="main-content">
        <div id="overviewPanel" class="content-panel active">
            <div class="panel-header">
                <h1 class="panel-title">Overview</h1>
                <p class="panel-desc">Quick summary of the MD Classes management portal.</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-val" id="statClassCount">4</div>
                    <div class="stat-label">Defined Roles</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" style="color: #ec4899;">Active</div>
                    <div class="stat-label">API Status</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" style="color: #3b82f6;">Postgres</div>
                    <div class="stat-label">Database Type</div>
                </div>
            </div>

            <div class="card">
                <h2 style="font-size: 20px; margin-bottom: 15px; font-weight: 600;">Welcome to MD Classes Portal</h2>
                <p style="color: var(--text-secondary); line-height: 1.6; font-size: 15px;">
                    This client-side dashboard communicates with your Spring Boot backend REST APIs using the JWT token stored securely in your local storage. Depending on the role of your registered account (Admin, Teacher, Student, or Parent), Spring Security will allow or restrict your actions dynamically.
                </p>
            </div>
        </div>

        <div id="studentsPanel" class="content-panel">
            <div class="panel-header">
                <h1 class="panel-title">Students Directory</h1>
                <p class="panel-desc">Browse classes, view students, or enroll new student records.</p>
            </div>

            <div id="secAlert" class="alert-card" style="display: none;">
                <div class="alert-title">Access Denied (Spring Security PreAuthorize)</div>
                <div id="secAlertMsg" class="alert-desc">You are not authorized to view this resource.</div>
            </div>

            <div class="card" id="createStudentSection" style="display: none;">
                <h2 style="font-size: 20px; margin-bottom: 20px; font-weight: 600;">Register New Student</h2>
                <form id="createStudentForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <input type="text" id="stdName" class="form-input" placeholder="Full Name" required autocomplete="off">
                        </div>
                        <div class="form-group">
                            <input type="email" id="stdEmail" class="form-input" placeholder="Email Address" required autocomplete="off">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <input type="password" id="stdPassword" class="form-input" placeholder="Password (Min 8 chars)" required>
                        </div>
                        <div class="form-group">
                            <input type="text" id="stdPhone" class="form-input" placeholder="Phone (e.g. +91 99999 99999)" required>
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <input type="text" id="stdCourse" class="form-input" placeholder="Course (e.g. Physics)" required>
                        </div>
                        <div class="form-group">
                            <input type="text" id="stdBatch" class="form-input" placeholder="Batch ID (e.g. B-2026)" required>
                        </div>
                    </div>
                    <button type="submit" class="submit-btn">Enroll Student</button>
                </form>
            </div>

            <div class="card" id="studentTableSection">
                <h2 style="font-size: 20px; margin-bottom: 20px; font-weight: 600;">Enrolled Students</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Course</th>
                                <th>Batch ID</th>
                            </tr>
                        </thead>
                        <tbody id="studentTableBody">
                            <tr>
                                <td colspan="6" style="text-align: center; color: var(--text-secondary);">Loading students...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script src="/js/dashboard.js"></script>
</body>
</html>
