const token = localStorage.getItem('accessToken');
const userJson = localStorage.getItem('user');

if (!token || !userJson) {
    logout();
}

const user = JSON.parse(userJson);

// Enforce role check client-side
if (user.role !== 'STUDENT') {
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
badge.style.background = 'var(--role-student)';
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
    } else if (panel === 'syllabus') {
        document.getElementById('btn-syllabus').classList.add('active');
        document.getElementById('syllabusPanel').classList.add('active');
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
        console.log(">>> [API REQUEST] GET /apiv1/student-dashboard/overview");
        const response = await fetch('/apiv1/student-dashboard/overview', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        console.log("<<< [API RESPONSE STATUS]:", response.status, response.statusText);

        if (response.status === 403) {
            console.error("<<< [API RESPONSE FORBIDDEN]");
            throw new Error('Access Denied (403): Your account role is not authorized to access this student dashboard.');
        }

        if (!response.ok) {
            console.error("<<< [API RESPONSE ERROR]");
            throw new Error('Failed to retrieve dashboard data. Status: ' + response.status);
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

        // Render Class and Subjects
        currentStudentClass = data.studentDetails.studentClass || 'Not Assigned';
        document.getElementById('profileClass').textContent = currentStudentClass;
        
        const subjectsItem = document.getElementById('subjectsItem');
        activeSubjectsList = data.subjects || [];
        if (activeSubjectsList.length > 0) {
            document.getElementById('profileSubjects').textContent = activeSubjectsList.join(', ');
            subjectsItem.style.display = 'flex';
        } else {
            subjectsItem.style.display = 'none';
        }
        renderSyllabusDirectory();

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

let activeBoard = 'CBSE';
let activeSubjectsList = [];
let currentStudentClass = '';

function switchBoard(boardName) {
    activeBoard = boardName;
    document.querySelectorAll('.board-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`btn-board-${boardName}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    renderSyllabusDirectory();
}

function renderSyllabusDirectory() {
    const container = document.getElementById('syllabusSubjectsList');
    if (!container) return;
    
    if (activeSubjectsList.length === 0) {
        container.innerHTML = '<div class="loading-spinner" style="grid-column: 1/-1; padding: 20px;">No subjects found for syllabus download. Ensure your class is registered.</div>';
        return;
    }
    
    container.innerHTML = activeSubjectsList.map(subject => {
        let iconSvg = '';
        const nameLower = subject.toLowerCase();
        if (nameLower.includes('math')) {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #6366f1;"><path d="M4 9h16M4 15h16M10 3L6 21M18 3l-4 18"/></svg>`;
        } else if (nameLower.includes('science')) {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #10b981;"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5M12 2v10M9 6l3-3 3 3"/></svg>`;
        } else if (nameLower.includes('social') || nameLower.includes('gk') || nameLower.includes('knowledge')) {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #3b82f6;"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>`;
        } else if (nameLower.includes('computer')) {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #f59e0b;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
        } else {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ec4899;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
        }
        
        const normalizedBoard = activeBoard.toLowerCase();
        const normalizedClass = (currentStudentClass || '').toLowerCase().replace(/class\s*/g, '').trim();
        const normalizedSubject = subject.toLowerCase().replace(/\s+/g, '_');
        
        let downloadUrl = `/syllabus/syllabus_placeholder.pdf?board=${activeBoard}&subject=${encodeURIComponent(subject)}`;
        if (normalizedBoard === 'cbse' && (normalizedClass === '9' || normalizedClass === 'class 9' || normalizedClass === 'class9')) {
            downloadUrl = `/syllabus/cbse_9_${normalizedSubject}.pdf`;
        }
        
        return `
            <div class="subject-syllabus-card">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 12px; display: inline-flex;">
                            ${iconSvg}
                        </div>
                        <span style="font-size: 11px; font-weight: 700; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 8px; border-radius: 20px; text-transform: uppercase;">
                            ${activeBoard}
                        </span>
                    </div>
                    <div class="subject-syllabus-title">${subject}</div>
                    <div class="subject-syllabus-meta">Syllabus curriculum for grade study</div>
                </div>
                <a href="${downloadUrl}" download="${activeBoard}_Class_9_${subject}_Syllabus.pdf" class="download-syllabus-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download PDF
                </a>
            </div>
        `;
    }).join('');
}

loadDashboardData();
