<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MD Classes - Student Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/student-dashboard.css">
</head>
<body>
    <div class="sidebar">
        <div class="brand">MD Portal</div>
        
        <div class="user-profile">
            <div class="avatar" id="userAvatar">S</div>
            <div class="user-details">
                <div class="user-name" id="userName">Student Name</div>
                <div class="user-role-badge" id="userRole">Student</div>
            </div>
        </div>

        <ul class="nav-links">
            <li><button class="nav-btn active" id="btn-overview" onclick="switchPanel('overview')">Overview</button></li>
            <li><button class="nav-btn" id="btn-syllabus" onclick="switchPanel('syllabus')">Syllabus</button></li>
            <li><button class="nav-btn" id="btn-schedule" onclick="switchPanel('schedule')">Class Schedule</button></li>
            <li><button class="nav-btn" id="btn-announcements" onclick="switchPanel('announcements')">Announcements</button></li>
            <li><button class="nav-btn logout-btn" onclick="logout()">Logout</button></li>
        </ul>
    </div>

    <div class="main-content">
        <!-- Overview Panel -->
        <div id="overviewPanel" class="content-panel active">
            <div class="panel-header">
                <h1 class="panel-title">Student Overview</h1>
                <p class="panel-desc" id="overviewSubtitle">Welcome to your dashboard. Track your course, attendance, and weekly lectures.</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon-wrapper std-course-color">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div class="stat-val" id="statCourse">Loading...</div>
                    <div class="stat-label">Enrolled Course</div>
                    <div class="stat-sub" id="statBatch">Batch: --</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper std-attendance-color">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div class="stat-val" id="statAttendance">--%</div>
                    <div class="stat-label">Attendance</div>
                    <div class="stat-sub">Minimum Required: 85.0%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper std-gpa-color">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                    </div>
                    <div class="stat-val" id="statGpa">--</div>
                    <div class="stat-label">Average Score / GPA</div>
                    <div class="stat-sub">Excellent Performance</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper std-fees-color">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div class="stat-val" id="statFees">--</div>
                    <div class="stat-label">Outstanding Fees</div>
                    <div class="stat-sub" id="payFeesContainer">
                        <button class="action-btn-mini edit-btn" style="background: rgba(236, 72, 153, 0.2); color: #f472b6; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 11px; margin-top: 5px; display: none;" id="payOnlineBtn" onclick="openPaymentModal()">Pay Online</button>
                    </div>
                </div>
            </div>

            <div class="dashboard-details-row">
                <div class="card profile-info-card">
                    <h2 class="card-title">User Account Details</h2>
                    <div class="info-list">
                        <div class="info-item">
                            <span class="info-label">Full Name:</span>
                            <span class="info-value" id="profileName">--</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Registered Email:</span>
                            <span class="info-value" id="profileEmail">--</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Portal Access:</span>
                            <span class="info-value text-accent" id="profileRole">STUDENT</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Contact Number:</span>
                            <span class="info-value" id="profilePhone">--</span>
                        </div>
                        <div class="info-item" id="studentClassItem">
                            <span class="info-label">Assigned Class:</span>
                            <span class="info-value text-accent" id="profileClass">--</span>
                        </div>
                        <div class="info-item" id="subjectsItem" style="display: none;">
                            <span class="info-label">Enrolled Subjects:</span>
                            <span class="info-value" id="profileSubjects" style="line-height: 1.5; color: #10b981; font-weight: 500;">--</span>
                        </div>
                    </div>
                </div>

                <div class="card action-card">
                    <h2 class="card-title">Quick Actions</h2>
                    <p class="action-desc">Interact directly with class administration or check files.</p>
                    <div class="action-buttons-grid">
                        <button class="action-btn" onclick="showToast('Syllabus download started!', true)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download Syllabus
                        </button>
                        <button class="action-btn" onclick="showToast('Support request submitted!', true)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            Contact Admin
                        </button>
                        <button class="action-btn secondary" onclick="switchPanel('schedule')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            View Lectures
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Syllabus Panel -->
        <div id="syllabusPanel" class="content-panel">
            <div class="panel-header">
                <h1 class="panel-title">Syllabus</h1>
                <p class="panel-desc">Download syllabus PDFs for your board and class subjects.</p>
            </div>

            <div class="card">
                <div class="board-tabs" style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <button class="board-tab active" id="btn-board-CBSE" onclick="switchBoard('CBSE')">CBSE Board</button>
                    <button class="board-tab" id="btn-board-UP" onclick="switchBoard('UP')">UP Board</button>
                    <button class="board-tab" id="btn-board-ICSE" onclick="switchBoard('ICSE')">ICSE Board</button>
                </div>
                <div id="syllabusSubjectsList" class="subjects-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;">
                    <div class="loading-spinner">Loading syllabus directory...</div>
                </div>
            </div>
        </div>

        <!-- Schedule Panel -->
        <div id="schedulePanel" class="content-panel">
            <div class="panel-header">
                <h1 class="panel-title">Weekly Schedule</h1>
                <p class="panel-desc">Time table and lecture details of your ongoing batch.</p>
            </div>

            <div class="card">
                <div class="schedule-list" id="scheduleListContainer">
                    <div class="loading-spinner">Loading class schedule...</div>
                </div>
            </div>
        </div>

        <!-- Announcements Panel -->
        <div id="announcementsPanel" class="content-panel">
            <div class="panel-header">
                <h1 class="panel-title">Announcements Board</h1>
                <p class="panel-desc">Stay updated with the latest updates from teachers and administrators.</p>
            </div>

            <div class="announcements-grid" id="announcementsContainer">
                <div class="loading-spinner">Loading announcements...</div>
            </div>
        </div>
    </div>

    <!-- Syllabus Progress Modal -->
    <div id="progressModal" class="modal-overlay" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(8, 9, 13, 0.8); backdrop-filter: blur(12px); align-items: center; justify-content: center;">
        <div class="modal-card" style="background: rgba(22, 26, 39, 0.95); border: 1px solid var(--border-color); border-radius: 20px; width: 90%; max-width: 550px; padding: 25px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                <h3 class="modal-title" id="progressModalTitle" style="font-size: 20px; font-weight: 700; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Weekly Progress</h3>
                <button type="button" class="modal-close-btn" onclick="closeProgressModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; transition: color 0.2s;">&times;</button>
            </div>
            <div id="progressModalBody" style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; padding-right: 5px;">
                <!-- Loaded Dynamically -->
            </div>
        </div>
    </div>

    <!-- Online Card Payment Modal -->
    <div id="paymentModal" class="modal-overlay" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(8, 9, 13, 0.8); backdrop-filter: blur(12px); align-items: center; justify-content: center;">
        <div class="modal-card" style="background: rgba(22, 26, 39, 0.95); border: 1px solid var(--border-color); border-radius: 20px; width: 90%; max-width: 500px; padding: 25px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
                <h3 class="modal-title" style="font-size: 20px; font-weight: 700; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Online Fee Payment Gateway</h3>
                <button type="button" class="modal-close-btn" onclick="closePaymentModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; transition: color 0.2s;">&times;</button>
            </div>
            
            <form id="cardPaymentForm" style="display: flex; flex-direction: column; gap: 15px;">
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: var(--text-secondary);">Total Outstanding:</span>
                    <span id="paymentOutstandingText" style="font-size: 18px; font-weight: 800; color: var(--std-fees);">₹0</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);" for="paymentAmount">Payment Amount (₹)</label>
                    <input type="number" id="paymentAmount" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; color: var(--text-primary); outline: none; font-size: 15px;" min="1" required>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);" for="cardName">Cardholder Name</label>
                    <input type="text" id="cardName" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; color: var(--text-primary); outline: none; font-size: 15px;" placeholder="John Doe" required>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);" for="cardNumber">Card Number</label>
                    <input type="text" id="cardNumber" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; color: var(--text-primary); outline: none; font-size: 15px;" placeholder="4111 2222 3333 4444" pattern="^[0-9 ]{13,19}$" required>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);" for="cardExpiry">Expiry (MM/YY)</label>
                        <input type="text" id="cardExpiry" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; color: var(--text-primary); outline: none; font-size: 15px;" placeholder="12/28" pattern="^(0[1-9]|1[0-2])\/[0-9]{2}$" required>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 13px; font-weight: 600; color: var(--text-secondary);" for="cardCvv">CVV</label>
                        <input type="password" id="cardCvv" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; color: var(--text-primary); outline: none; font-size: 15px;" placeholder="***" pattern="^[0-9]{3,4}$" required>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                    <button type="button" onclick="closePaymentModal()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 20px; color: var(--text-primary); cursor: pointer; font-weight: 600; transition: background 0.2s;">Cancel</button>
                    <button type="submit" id="paySubmitBtn" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border: none; border-radius: 10px; padding: 10px 25px; color: white; cursor: pointer; font-weight: 700; transition: opacity 0.2s;">Complete Transaction</button>
                </div>
            </form>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script src="/js/student-dashboard.js"></script>
</body>
</html>
