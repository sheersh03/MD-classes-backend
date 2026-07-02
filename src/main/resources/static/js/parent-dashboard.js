const token = localStorage.getItem('accessToken');
const userJson = localStorage.getItem('user');

if (!token || !userJson) {
    logout();
}

const user = JSON.parse(userJson);

// Enforce role check client-side
if (user.role !== 'PARENT') {
    logout();
}

// Initialize Profile UI
document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = user.role;
document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

document.getElementById('profileName').textContent = user.name;
document.getElementById('profileEmail').textContent = user.email;
document.getElementById('profileRole').textContent = user.role;

const badge = document.getElementById('userRole');
badge.style.background = 'var(--role-parent)';
badge.style.color = 'white';

// Navigation flow
function switchPanel(panel) {
    const btns = document.querySelectorAll('.nav-links .nav-btn');
    const panels = document.querySelectorAll('.content-panel');
    
    panels.forEach(p => p.classList.remove('active'));
    btns.forEach(b => b.classList.remove('active'));

    if (panel === 'overview') {
        document.getElementById('btn-overview').classList.add('active');
        document.getElementById('overviewPanel').classList.add('active');
    } else if (panel === 'schedule') {
        document.getElementById('btn-schedule').classList.add('active');
        document.getElementById('schedulePanel').classList.add('active');
    } else if (panel === 'announcements') {
        document.getElementById('btn-announcements').classList.add('active');
        document.getElementById('announcementsPanel').classList.add('active');
    }
}

// Toast alerts helper
function showToast(msg, isSuccess = true) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(220, 38, 38, 0.95)';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

// Load data from REST API
async function loadDashboardData() {
    try {
        console.log(">>> [API REQUEST] GET /apiv1/parent-dashboard/overview");
        const response = await fetch('/apiv1/parent-dashboard/overview', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        console.log("<<< [API RESPONSE STATUS]:", response.status, response.statusText);

        if (response.status === 403) {
            console.error("<<< [API RESPONSE FORBIDDEN]");
            throw new Error('Access Denied (403): Your account role is not authorized to access this parent portal.');
        }

        if (!response.ok) {
            console.error("<<< [API RESPONSE ERROR]");
            throw new Error('Failed to retrieve child dashboard data. Status: ' + response.status);
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        // Update Stats
        document.getElementById('statCourse').textContent = data.studentDetails.course;
        document.getElementById('statBatch').textContent = 'Batch: ' + data.studentDetails.batchId;
        document.getElementById('statAttendance').textContent = data.attendance;
        document.getElementById('statGpa').textContent = data.gpa;
        document.getElementById('statFees').textContent = data.pendingFees;
        document.getElementById('profilePhone').textContent = data.studentDetails.phone || 'N/A';

        document.getElementById('linkedStudentName').textContent = data.studentDetails.studentName || 'N/A';

        // Render Class and Subjects
        const studentClass = data.studentDetails.studentClass || 'Not Assigned';
        document.getElementById('profileClass').textContent = studentClass;
        
        const subjectsItem = document.getElementById('subjectsItem');
        if (data.subjects && data.subjects.length > 0) {
            document.getElementById('profileSubjects').textContent = data.subjects.join(', ');
            subjectsItem.style.display = 'flex';
        } else {
            subjectsItem.style.display = 'none';
        }

        // Render Schedule
        const scheduleContainer = document.getElementById('scheduleListContainer');
        if (data.upcomingClasses && data.upcomingClasses.length > 0) {
            scheduleContainer.innerHTML = data.upcomingClasses.map(c => `
                <div class="schedule-item">
                    <div class="day-badge">${c.day}</div>
                    <div class="schedule-details">
                        <div class="schedule-time">${c.time}</div>
                        <div class="schedule-title">${c.title}</div>
                        <div class="schedule-meta">Location: <strong>${c.room}</strong> | Instructor: <strong>${c.instructor}</strong></div>
                    </div>
                </div>
            `).join('');
        } else {
            scheduleContainer.innerHTML = '<div class="loading-spinner">No scheduled lectures found.</div>';
        }

        // Render Announcements
        const announcementsContainer = document.getElementById('announcementsContainer');
        if (data.announcements && data.announcements.length > 0) {
            announcementsContainer.innerHTML = data.announcements.map(a => `
                <div class="announcement-card">
                    <div class="announcement-header">
                        <span class="announcement-tag ${a.type}">${a.type}</span>
                        <span class="announcement-date">${a.date}</span>
                    </div>
                    <h3 class="announcement-title" style="margin-bottom: 8px;">${a.title}</h3>
                    <p class="announcement-body">${a.content}</p>
                </div>
            `).join('');
        } else {
            announcementsContainer.innerHTML = '<div class="loading-spinner">No recent announcements.</div>';
        }

    } catch (err) {
        showToast(err.message, false);
        document.getElementById('statCourse').textContent = 'Error';
        document.getElementById('statAttendance').textContent = '--';
        document.getElementById('statGpa').textContent = '--';
        document.getElementById('statFees').textContent = '--';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/login';
}

loadDashboardData();
