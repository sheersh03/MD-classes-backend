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
            <li><button class="nav-btn active" id="overviewNavBtn" onclick="switchPanel('overview')">Overview</button></li>
            <li><button class="nav-btn" id="studentsNavBtn" onclick="switchPanel('students')">Students Directory</button></li>
            <li><button class="nav-btn" id="syllabusNavBtn" onclick="switchPanel('syllabus-progress')">Syllabus Tracker</button></li>
            <li><button class="nav-btn" id="feesNavBtn" onclick="switchPanel('fees-tracker')">Fees Tracker</button></li>
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

        <div id="syllabusProgressPanel" class="content-panel">
            <div class="panel-header">
                <h1 class="panel-title">Syllabus Tracker</h1>
                <p class="panel-desc">Manage weekly syllabus completion progress and milestones.</p>
            </div>
            
            <div class="card">
                <h2 style="font-size: 20px; margin-bottom: 20px; font-weight: 600;">Update Weekly Progress</h2>
                <form id="updateSyllabusForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label class="form-label" for="progClass">Student Class</label>
                            <select id="progClass" class="form-input" required>
                                <option value="">Select Class</option>
                                <option value="Class 9">Class 9</option>
                                <option value="Class 10">Class 10</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="progSubject">Subject</label>
                            <select id="progSubject" class="form-input" required onchange="onProgSubjectChanged()">
                                <option value="">Loading subjects...</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group" id="progUnitContainer">
                            <label class="form-label" for="progUnit">Unit / Chapter</label>
                            <select id="progUnit" class="form-input" onchange="onProgUnitChanged()">
                                <option value="">Select Subject first</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="progTopics">Topics Covered</label>
                            <input type="text" id="progTopics" class="form-input" placeholder="e.g. Real Numbers, Euclid Lemma" required autocomplete="off">
                        </div>
                    </div>

                    <div class="form-group" id="availableTopicsGroup" style="display: none; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-color); border-radius: 12px; padding: 12px;">
                        <label class="form-label" style="font-size: 13px; margin-bottom: 8px;">Click to toggle topics into "Topics Covered":</label>
                        <div id="availableTopicsChips" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; align-items: end;">
                        <div class="form-group">
                            <label class="form-label" for="progWeek">Week Number</label>
                            <input type="number" id="progWeek" class="form-input" min="1" max="52" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="progPercent">Percent Completed (%)</label>
                            <input type="number" id="progPercent" class="form-input" min="0" max="100" required>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px; padding-bottom: 12px;">
                            <input type="checkbox" id="progMilestone" style="width: 20px; height: 20px; cursor: pointer;">
                            <label for="progMilestone" class="form-label" style="margin-bottom: 0; cursor: pointer; user-select: none;">Milestone Flag</label>
                        </div>
                    </div>

                    <button type="submit" class="action-btn" style="width: fit-content; padding: 12px 24px; align-self: flex-start; margin-top: 10px;">
                        Save Progress
                    </button>
                </form>
            </div>

            <!-- Curriculum Hierarchy: Subject -> Unit -> Topic -->
            <div class="card" style="margin-top: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h2 style="font-size: 20px; font-weight: 600;">Curriculum Management</h2>
                        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Manage Subjects, Units, and Topics in the database.</p>
                    </div>
                    <button type="button" class="action-btn" onclick="openAddSubjectModal()" style="font-size: 13px; padding: 10px 18px;">
                        + Add Subject
                    </button>
                </div>

                <div id="curriculumTreeView" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="loading-spinner">Loading curriculum...</div>
                </div>
            </div>

            <div class="card" style="margin-top: 25px;">
                <h2 style="font-size: 20px; margin-bottom: 15px; font-weight: 600;">Syllabus Status Directory</h2>
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <select id="filterClass" class="form-input" style="max-width: 200px;" onchange="loadProgressList()">
                        <option value="Class 10">Class 10</option>
                        <option value="Class 9">Class 9</option>
                    </select>
                    <select id="filterSubject" class="form-input" style="max-width: 200px;" onchange="loadProgressList()">
                        <option value="">Loading subjects...</option>
                    </select>
                </div>
                
                <div class="table-container" style="overflow-x: auto;">

                    <table class="student-table" style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 14px;">
                                <th style="padding: 12px 16px;">Week</th>
                                <th style="padding: 12px 16px;">Topics Covered</th>
                                <th style="padding: 12px 16px;">Completion</th>
                                <th style="padding: 12px 16px;">Milestone Status</th>
                                <th style="padding: 12px 16px;">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody id="progressListTableBody">
                            <tr>
                                <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 20px;">Select filters or click search to view progress.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="feesTrackerPanel" class="content-panel">
            <div class="panel-header">
                <h1 class="panel-title">Fees Tracker</h1>
                <p class="panel-desc">Monitor student fee status, record payments, and track outstanding balances.</p>
            </div>
            
            <div class="card">
                <h2 style="font-size: 20px; margin-bottom: 20px; font-weight: 600;">Fees Outstanding Directory</h2>
                <div class="table-container" style="overflow-x: auto;">
                    <table class="student-table" style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 14px;">
                                <th style="padding: 12px 16px;">ID</th>
                                <th style="padding: 12px 16px;">Student Name</th>
                                <th style="padding: 12px 16px;">Total Fee</th>
                                <th style="padding: 12px 16px;">Paid Amount</th>
                                <th style="padding: 12px 16px;">Pending Balance</th>
                                <th style="padding: 12px 16px;">Status</th>
                                <th style="padding: 12px 16px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="feesTableBody">
                            <tr>
                                <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading fee records...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card" style="margin-top: 25px;">
                <h2 style="font-size: 20px; margin-bottom: 20px; font-weight: 600;">Transaction History Ledger</h2>
                <div class="table-container" style="overflow-x: auto;">
                    <table class="student-table" style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 14px;">
                                <th style="padding: 12px 16px;">TXN ID</th>
                                <th style="padding: 12px 16px;">Student Name</th>
                                <th style="padding: 12px 16px;">Amount Paid</th>
                                <th style="padding: 12px 16px;">Payment Method</th>
                                <th style="padding: 12px 16px;">Transaction Reference</th>
                                <th style="padding: 12px 16px;">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody id="txnTableBody">
                            <tr>
                                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading transactions...</td>
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

    <!-- Manage Student Fees Modal -->
    <div id="manageFeesModal" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title">Manage Student Fees</h3>
                <button type="button" class="modal-close-btn" onclick="closeFeeModal()">&times;</button>
            </div>
            <form id="manageFeesForm">
                <input type="hidden" id="feeStdId">
                <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label class="form-label">Student Name</label>
                        <input type="text" id="feeStdName" class="form-input" disabled style="opacity: 0.8; cursor: not-allowed;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="feeStdEmail" class="form-input" disabled style="opacity: 0.8; cursor: not-allowed;">
                    </div>
                </div>
                
                <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label class="form-label" for="feeTotal">Total Assigned Fee (₹)</label>
                        <input type="number" id="feeTotal" class="form-input" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="feePaid">Total Paid Amount (₹)</label>
                        <input type="number" id="feePaid" class="form-input" min="0" required>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: var(--text-secondary);">Remaining Balance:</span>
                    <span id="feeRemainingText" style="font-size: 20px; font-weight: 800; color: var(--accent-secondary);">₹0</span>
                </div>

                <div class="modal-footer">
                    <button type="button" class="secondary-btn" onclick="closeFeeModal()">Cancel</button>
                    <button type="submit" class="submit-btn" style="margin: 0; padding: 12px 24px; background: var(--role-parent);">Save Fees</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Subject Modal -->
    <div id="addSubjectModal" class="modal-overlay" style="display: none;">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title">Create New Subject</h3>
                <button type="button" class="modal-close-btn" onclick="closeAddSubjectModal()">&times;</button>
            </div>
            <form id="addSubjectForm">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" for="newSubjectName">Subject Name</label>
                    <input type="text" id="newSubjectName" class="form-input" placeholder="e.g. Mathematics, Science" required autocomplete="off">
                </div>
                <div class="modal-footer">
                    <button type="button" class="secondary-btn" onclick="closeAddSubjectModal()">Cancel</button>
                    <button type="submit" class="submit-btn" style="margin: 0; padding: 12px 24px;">Create Subject</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Unit Modal -->
    <div id="addUnitModal" class="modal-overlay" style="display: none;">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title" id="addUnitModalTitle">Add Unit to Subject</h3>
                <button type="button" class="modal-close-btn" onclick="closeAddUnitModal()">&times;</button>
            </div>
            <form id="addUnitForm">
                <input type="hidden" id="unitTargetSubjectId">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" for="newUnitName">Unit / Chapter Name</label>
                    <input type="text" id="newUnitName" class="form-input" placeholder="e.g. Real Numbers, Polynomials" required autocomplete="off">
                </div>
                <div class="modal-footer">
                    <button type="button" class="secondary-btn" onclick="closeAddUnitModal()">Cancel</button>
                    <button type="submit" class="submit-btn" style="margin: 0; padding: 12px 24px;">Add Unit</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Topic Modal -->
    <div id="addTopicModal" class="modal-overlay" style="display: none;">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title" id="addTopicModalTitle">Add Topic to Unit</h3>
                <button type="button" class="modal-close-btn" onclick="closeAddTopicModal()">&times;</button>
            </div>
            <form id="addTopicForm">
                <input type="hidden" id="topicTargetUnitId">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" for="newTopicName">Topic Name</label>
                    <input type="text" id="newTopicName" class="form-input" placeholder="e.g. Introduction, Exercise 1.1" required autocomplete="off">
                </div>
                <div class="modal-footer">
                    <button type="button" class="secondary-btn" onclick="closeAddTopicModal()">Cancel</button>
                    <button type="submit" class="submit-btn" style="margin: 0; padding: 12px 24px;">Add Topic</button>
                </div>
            </form>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script src="/js/dashboard.js"></script>
</body>
</html>

