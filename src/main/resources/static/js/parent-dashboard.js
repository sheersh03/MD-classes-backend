const token = localStorage.getItem('accessToken');
const userJson = localStorage.getItem('user');
let studentId = 0;

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
        container.innerHTML = '<div class="loading-spinner" style="grid-column: 1/-1; padding: 20px;">No subjects found for syllabus download. Ensure child\'s class is registered.</div>';
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
        if (normalizedBoard === 'cbse') {
            if (normalizedClass === '9' || normalizedClass === 'class 9' || normalizedClass === 'class9') {
                downloadUrl = `/syllabus/cbse_9_${normalizedSubject}.pdf`;
            } else if (normalizedClass === '10' || normalizedClass === 'class 10' || normalizedClass === 'class10') {
                downloadUrl = `/syllabus/cbse_10_${normalizedSubject}.pdf`;
            }
        }
        
        const classClean = normalizedClass ? `Class_${normalizedClass.toUpperCase()}` : 'Syllabus';
        
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
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="${downloadUrl}" download="${activeBoard}_${classClean}_${subject}_Syllabus.pdf" class="download-syllabus-btn" style="flex: 1; margin: 0; justify-content: center; font-size: 13px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        PDF
                    </a>
                    <button onclick="showSyllabusProgress('${subject}')" class="download-syllabus-btn" style="flex: 1; margin: 0; justify-content: center; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); color: #a78bfa; font-size: 13px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;"><path d="M12 20h9M3 20v-8c0-2.2 1.8-4 4-4h10c2.2 0 4 1.8 4 4v8M3 12h18M3 8V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v3"/></svg>
                        Progress
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

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
    } else if (panel === 'syllabus') {
        document.getElementById('btn-syllabus').classList.add('active');
        document.getElementById('syllabusPanel').classList.add('active');
        renderSyllabusDirectory();
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
        studentId = data.studentDetails.id || 0;
        document.getElementById('statCourse').textContent = data.studentDetails.course;
        document.getElementById('statBatch').textContent = 'Batch: ' + data.studentDetails.batchId;
        document.getElementById('statAttendance').textContent = data.attendance;
        document.getElementById('statGpa').textContent = data.gpa;
        document.getElementById('statFees').textContent = data.pendingFees;

        const payBtn = document.getElementById('payOnlineBtn');
        if (data.pendingFees !== 'Nil' && payBtn) {
            payBtn.style.display = 'inline-block';
        } else if (payBtn) {
            payBtn.style.display = 'none';
        }
        document.getElementById('profilePhone').textContent = data.studentDetails.phone || 'N/A';

        document.getElementById('linkedStudentName').textContent = data.studentDetails.studentName || 'N/A';

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

async function showSyllabusProgress(subject) {
    const modal = document.getElementById('progressModal');
    const title = document.getElementById('progressModalTitle');
    const body = document.getElementById('progressModalBody');

    title.textContent = `${subject} - Weekly Syllabus Progress`;
    body.innerHTML = '<div class="loading-spinner">Loading progress timeline...</div>';
    modal.style.display = 'flex';

    try {
        console.log(`>>> [API REQUEST] GET /apiv1/syllabus-progress?subject=${encodeURIComponent(subject)}`);
        const response = await fetch(`/apiv1/syllabus-progress?subject=${encodeURIComponent(subject)}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve weekly progress details');
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        if (data.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-secondary); margin-bottom: 15px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p style="font-size: 15px; font-weight: 500;">No weekly syllabus progress has been uploaded by the admin for this subject yet.</p>
                </div>
            `;
            return;
        }

        body.innerHTML = data.map(p => {
            const milestoneBadge = p.isMilestone ? 
                '<span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(245, 158, 11, 0.2);">🏆 Milestone Reached</span>' : 
                '';

            return `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 14px; padding: 15px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; font-size: 15px; color: var(--text-primary);">Week ${p.weekNumber}</span>
                        ${milestoneBadge}
                    </div>
                    <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
                        <strong>Topics:</strong> ${p.topicsCovered || 'Not Specified'}
                    </div>
                    <div style="margin-top: 5px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Completion progress</span>
                            <span style="font-weight: 700; color: var(--role-student);">${p.percentCompleted}%</span>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; height: 6px; width: 100%;">
                            <div style="background: #10b981; width: ${p.percentCompleted}%; height: 100%; border-radius: 10px;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        body.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #ef4444;">
                <p>Error: ${err.message}</p>
            </div>
        `;
    }
}

function closeProgressModal() {
    document.getElementById('progressModal').style.display = 'none';
}

function logout() {
    localStorage.clear();
    window.location.href = '/login';
}

loadDashboardData();

// Payment Modal Helpers
let currentOutstandingVal = 0;

function openPaymentModal() {
    const feeStr = document.getElementById('statFees').textContent;
    const numericVal = parseInt(feeStr.replace(/[^\d]/g, '')) || 0;
    currentOutstandingVal = numericVal;

    document.getElementById('paymentOutstandingText').textContent = feeStr;
    document.getElementById('paymentAmount').value = numericVal;
    document.getElementById('paymentAmount').max = numericVal;

    document.getElementById('cardName').value = '';
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCvv').value = '';

    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

setTimeout(() => {
    const paymentForm = document.getElementById('cardPaymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseInt(document.getElementById('paymentAmount').value);
            if (amount <= 0 || amount > currentOutstandingVal) {
                showToast('Invalid payment amount requested', false);
                return;
            }

            const submitBtn = document.getElementById('paySubmitBtn');
            submitBtn.textContent = 'Processing Payment...';
            submitBtn.disabled = true;

            try {
                console.log(">>> [API REQUEST] POST /apiv1/fees/pay");
                const response = await fetch('/apiv1/fees/pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ amount })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Payment processing failed');
                }

                const txData = await response.json();
                console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", txData);

                showToast(`Payment of ₹${amount} successful! Ref: ${txData.transactionReference}`, true);
                closePaymentModal();
                loadDashboardData();
            } catch (err) {
                showToast(err.message, false);
            } finally {
                submitBtn.textContent = 'Complete Transaction';
                submitBtn.disabled = false;
            }
        });
    }
}, 500);

async function loadStudentTransactions() {
    const tbody = document.getElementById('studentTxnTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 15px;">Loading transaction history...</td></tr>';

    try {
        console.log(`>>> [API REQUEST] GET /apiv1/fees/student/${studentId}/transactions`);
        const response = await fetch(`/apiv1/fees/student/${studentId}/transactions`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve transaction records');
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 15px;">No payments recorded yet.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(tx => {
            const date = new Date(tx.createdAt).toLocaleDateString();
            let methodText = tx.paymentMethod === 'CARD_ONLINE' ? '💳 Card Payment' : '✍️ Manual';
            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px 12px;"><code style="font-family: monospace; font-size: 11px;">${tx.transactionReference}</code></td>
                    <td style="padding: 10px 12px; color: #10b981; font-weight: 700;">₹${tx.amount.toLocaleString()}</td>
                    <td style="padding: 10px 12px; font-size: 12px;">${methodText}</td>
                    <td style="padding: 10px 12px; font-size: 12px; color: var(--text-secondary);">${date}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444; padding: 15px;">Error: ${err.message}</td></tr>`;
    }
}
