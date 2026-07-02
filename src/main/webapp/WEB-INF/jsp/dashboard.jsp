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
                            <label class="form-label" for="stdName">Full Name</label>
                            <input type="text" id="stdName" class="form-input" required autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="stdEmail">Email Address</label>
                            <input type="email" id="stdEmail" class="form-input" required autocomplete="off">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label" for="stdPassword">Password (Min 8 chars)</label>
                            <input type="password" id="stdPassword" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="stdPhone">Phone (e.g. +91 99999 99999)</label>
                            <input type="text" id="stdPhone" class="form-input" required>
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label" for="stdCourse">Course (e.g. Physics)</label>
                            <input type="text" id="stdCourse" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="stdBatch">Batch ID (e.g. B-2026)</label>
                            <input type="text" id="stdBatch" class="form-input" required>
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label" for="stdClass">Class (e.g. Class 10)</label>
                            <input type="text" id="stdClass" class="form-input" required>
                        </div>
                        <div class="form-group">
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
                                <th>Password</th>
                                <th>Phone</th>
                                <th>Course</th>
                                <th>Batch ID</th>
                                <th>Class</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="studentTableBody">
                            <tr>
                                <td colspan="9" style="text-align: center; color: var(--text-secondary);">Loading students...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Student Modal -->
    <div id="editStudentModal" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title">Edit Student Profile</h3>
                <button type="button" class="modal-close-btn" onclick="closeEditModal()">&times;</button>
            </div>
            <form id="editStudentForm">
                <input type="hidden" id="editStdId">
                <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label class="form-label" for="editStdName">Full Name</label>
                        <input type="text" id="editStdName" class="form-input" required autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editStdEmail">Email Address</label>
                        <input type="email" id="editStdEmail" class="form-input" required disabled style="opacity: 0.6; cursor: not-allowed;" autocomplete="off">
                    </div>
                </div>
                <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label class="form-label" for="editStdPhone">Phone (e.g. +91 99999 99999)</label>
                        <input type="text" id="editStdPhone" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editStdPassword">New Password (Optional)</label>
                        <input type="password" id="editStdPassword" class="form-input">
                    </div>
                </div>
                <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label class="form-label" for="editStdCourse">Course</label>
                        <input type="text" id="editStdCourse" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editStdBatch">Batch ID</label>
                        <input type="text" id="editStdBatch" class="form-input" required>
                    </div>
                </div>
                <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label class="form-label" for="editStdClass">Class</label>
                        <input type="text" id="editStdClass" class="form-input" required>
                    </div>
                    <div class="form-group">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="secondary-btn" onclick="closeEditModal()">Cancel</button>
                    <button type="submit" class="submit-btn" style="margin: 0; padding: 12px 24px;">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script src="/js/dashboard.js"></script>
</body>
</html>
