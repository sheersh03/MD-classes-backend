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

// Curriculum & Syllabus Tracking State
let activeBoard = 'CBSE';
let activeSubjectsList = [];
let currentStudentClass = '';
let cachedCurriculum = [];
let cachedProgressList = [];
let activeModalSubject = '';
let activeModalTab = 'curriculum';

async function loadCurriculumAndProgress() {
    try {
        console.log(">>> [API REQUEST] Loading Child's Curriculum and Progress");
        const [subRes, progRes] = await Promise.allSettled([
            fetch('/apiv1/subjects', {
                headers: { 'Authorization': 'Bearer ' + token }
            }),
            fetch('/apiv1/syllabus-progress', {
                headers: { 'Authorization': 'Bearer ' + token }
            })
        ]);

        if (subRes.status === 'fulfilled' && subRes.value.ok) {
            cachedCurriculum = await subRes.value.json();
            console.log("<<< [API CURRICULUM RECEIVED]:", cachedCurriculum);
        } else {
            console.warn("Could not retrieve curriculum hierarchy", subRes);
        }

        if (progRes.status === 'fulfilled' && progRes.value.ok) {
            cachedProgressList = await progRes.value.json();
            console.log("<<< [API PROGRESS RECEIVED]:", cachedProgressList);
        } else {
            console.warn("Could not retrieve progress records", progRes);
        }

        // Calculate Overview Banner Metrics
        let totalUnits = 0;
        let totalTopics = 0;
        const allSubjectsSet = new Set(activeSubjectsList);
        
        cachedCurriculum.forEach(s => {
            allSubjectsSet.add(s.subjectName);
            if (s.units) {
                totalUnits += s.units.length;
                s.units.forEach(u => {
                    if (u.topics) totalTopics += u.topics.length;
                });
            }
        });

        const totalMilestones = cachedProgressList.filter(p => p.isMilestone).length;

        const statSub = document.getElementById('statCurriculumSubjects');
        const statUnits = document.getElementById('statCurriculumUnits');
        const statTopics = document.getElementById('statCurriculumTopics');
        const statMiles = document.getElementById('statCurriculumMilestones');

        if (statSub) statSub.textContent = allSubjectsSet.size;
        if (statUnits) statUnits.textContent = totalUnits;
        if (statTopics) statTopics.textContent = totalTopics;
        if (statMiles) statMiles.textContent = totalMilestones;

        renderSyllabusDirectory();
    } catch (err) {
        console.error("Error loading curriculum & progress:", err);
        renderSyllabusDirectory();
    }
}

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

    // Combine subjects from student details and database curriculum
    const subjectMap = new Map();
    activeSubjectsList.forEach(name => {
        subjectMap.set(name.toLowerCase(), { name, curriculum: null });
    });
    cachedCurriculum.forEach(sub => {
        const key = sub.subjectName.toLowerCase();
        if (subjectMap.has(key)) {
            subjectMap.get(key).curriculum = sub;
        } else {
            subjectMap.set(key, { name: sub.subjectName, curriculum: sub });
        }
    });

    const displayList = Array.from(subjectMap.values());

    if (displayList.length === 0) {
        container.innerHTML = '<div class="loading-spinner" style="grid-column: 1/-1; padding: 20px;">No subjects found. Ensure child\'s class is registered.</div>';
        return;
    }

    container.innerHTML = displayList.map((item, idx) => {
        const subject = item.name;
        const cur = item.curriculum;
        const safeSubName = subject.replace(/'/g, "\\'");
        const drawerId = `currDrawer_${idx}`;
        const btnToggleId = `currToggleBtn_${idx}`;

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

        // Units and Topics counts
        const units = cur && cur.units ? cur.units : [];
        const unitsCount = units.length;
        let topicsCount = 0;
        units.forEach(u => { topicsCount += (u.topics ? u.topics.length : 0); });

        // Weekly progress records for this subject
        const subProgress = cachedProgressList.filter(p => p.subject && p.subject.toLowerCase() === subject.toLowerCase());
        const hasMilestone = subProgress.some(p => p.isMilestone);
        
        let completionPct = 0;
        let lastWeekNum = 0;
        if (subProgress.length > 0) {
            const latest = subProgress[subProgress.length - 1];
            completionPct = latest.percentCompleted || 0;
            lastWeekNum = latest.weekNumber || 0;
        }

        // Extract covered topics from weekly progress records
        const coveredTopicsMap = new Map();
        subProgress.forEach(p => {
            if (p.topicsCovered) {
                p.topicsCovered.split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
                    coveredTopicsMap.set(t.toLowerCase(), p.weekNumber);
                });
            }
        });

        // Build inline units and topics HTML
        let unitsDrawerHtml = '';
        if (unitsCount > 0) {
            const unitsListHtml = units.map(u => {
                const uTopics = u.topics || [];
                const topicsPills = uTopics.length > 0 ? uTopics.map(t => {
                    const isCovered = coveredTopicsMap.has(t.topicName.toLowerCase());
                    const weekCovered = coveredTopicsMap.get(t.topicName.toLowerCase());
                    return isCovered ? 
                        `<span class="topic-pill covered" title="Covered in Week ${weekCovered}">✓ ${t.topicName}</span>` :
                        `<span class="topic-pill pending">⏳ ${t.topicName}</span>`;
                }).join('') : '<span style="color: var(--text-secondary); font-size: 11px; font-style: italic;">No topics yet</span>';

                return `
                    <div class="card-unit-block">
                        <div class="card-unit-title">
                            <span>📁 ${u.unitName}</span>
                            <span style="font-size: 11px; color: var(--text-secondary);">${uTopics.length} topics</span>
                        </div>
                        <div class="card-topics-wrap">
                            ${topicsPills}
                        </div>
                    </div>
                `;
            }).join('');

            unitsDrawerHtml = `
                <div id="${drawerId}" class="card-curriculum-drawer" style="display: none;">
                    ${unitsListHtml}
                </div>
            `;
        }

        return `
            <div class="subject-syllabus-card">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 12px; display: inline-flex;">
                            ${iconSvg}
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            ${hasMilestone ? '<span style="font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 3px 8px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.25);">🏆 Milestone</span>' : ''}
                            <span style="font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 8px; border-radius: 20px; text-transform: uppercase;">
                                ${activeBoard}
                            </span>
                        </div>
                    </div>

                    <div class="subject-syllabus-title">${subject}</div>
                    
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                        <span class="curriculum-badge">
                            📁 ${unitsCount} Units • 📖 ${topicsCount} Topics
                        </span>
                        ${lastWeekNum > 0 ? `<span style="font-size: 11px; color: var(--text-secondary);">Week ${lastWeekNum} Active</span>` : ''}
                    </div>

                    <!-- Progress Bar -->
                    <div style="margin-bottom: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Child's Syllabus Progress</span>
                            <span style="font-weight: 700; color: #f59e0b;">${completionPct}%</span>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; height: 6px; width: 100%; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #f59e0b, #ec4899); width: ${completionPct}%; height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
                        </div>
                    </div>

                    ${unitsCount > 0 ? `
                        <button type="button" id="${btnToggleId}" onclick="toggleInlineCurriculum('${drawerId}', '${btnToggleId}')" style="background: none; border: none; color: #fbbf24; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                            Explore Units & Topics ▾
                        </button>
                    ` : '<span style="font-size: 12px; color: var(--text-secondary); font-style: italic; display: block; margin-bottom: 8px;">Curriculum being configured</span>'}

                    ${unitsDrawerHtml}
                </div>

                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button type="button" onclick="openSyllabusModal('${safeSubName}')" class="download-syllabus-btn" style="flex: 1; margin: 0; justify-content: center; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 13px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;"><path d="M12 20h9M3 20v-8c0-2.2 1.8-4 4-4h10c2.2 0 4 1.8 4 4v8M3 12h18M3 8V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v3"/></svg>
                        Track Progress
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleInlineCurriculum(drawerId, btnId) {
    const drawer = document.getElementById(drawerId);
    const btn = document.getElementById(btnId);
    if (!drawer) return;

    if (drawer.style.display === 'none' || drawer.style.display === '') {
        drawer.style.display = 'flex';
        if (btn) btn.innerHTML = 'Hide Units & Topics ▴';
    } else {
        drawer.style.display = 'none';
        if (btn) btn.innerHTML = 'Explore Units & Topics ▾';
    }
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
        loadCurriculumAndProgress();
    } else if (panel === 'quizzes') {
        document.getElementById('btn-quizzes').classList.add('active');
        document.getElementById('quizzesPanel').classList.add('active');
        loadChildQuizAttempts();
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
        loadCurriculumAndProgress();

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

// Modal management
async function openSyllabusModal(subject) {
    activeModalSubject = subject;
    activeModalTab = 'curriculum';

    const modal = document.getElementById('progressModal');
    const title = document.getElementById('progressModalTitle');
    title.textContent = `${subject} - Child's Syllabus Tracking`;
    modal.style.display = 'flex';

    // Update tab button classes
    const tabCurr = document.getElementById('modalTabCurriculum');
    const tabWeek = document.getElementById('modalTabWeekly');
    if (tabCurr) tabCurr.classList.add('active');
    if (tabWeek) tabWeek.classList.remove('active');

    // Fetch fresh progress for this subject if needed
    try {
        console.log(`>>> [API REQUEST] GET /apiv1/syllabus-progress?subject=${encodeURIComponent(subject)}`);
        const res = await fetch(`/apiv1/syllabus-progress?subject=${encodeURIComponent(subject)}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            cachedProgressList = cachedProgressList.filter(p => !p.subject || p.subject.toLowerCase() !== subject.toLowerCase()).concat(data);
        }
    } catch (e) {
        console.warn("Could not refresh subject progress:", e);
    }

    renderModalTabContent();
}

// Backward compatible alias
function showSyllabusProgress(subject) {
    openSyllabusModal(subject);
}

function switchModalTab(tabName) {
    activeModalTab = tabName;
    const tabCurr = document.getElementById('modalTabCurriculum');
    const tabWeek = document.getElementById('modalTabWeekly');

    if (tabName === 'curriculum') {
        if (tabCurr) tabCurr.classList.add('active');
        if (tabWeek) tabWeek.classList.remove('active');
    } else {
        if (tabCurr) tabCurr.classList.remove('active');
        if (tabWeek) tabWeek.classList.add('active');
    }

    renderModalTabContent();
}

function renderModalTabContent() {
    const body = document.getElementById('progressModalBody');
    if (!body) return;

    const subject = activeModalSubject;
    const cur = cachedCurriculum.find(s => s.subjectName.toLowerCase() === subject.toLowerCase());
    const progressRecords = cachedProgressList.filter(p => p.subject && p.subject.toLowerCase() === subject.toLowerCase());

    // Gather covered topics map (topicName -> weekNumber)
    const coveredTopicsMap = new Map();
    progressRecords.forEach(p => {
        if (p.topicsCovered) {
            p.topicsCovered.split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
                coveredTopicsMap.set(t.toLowerCase(), p.weekNumber);
            });
        }
    });

    if (activeModalTab === 'curriculum') {
        // Render Subject -> Unit -> Topic Tree
        if (!cur || !cur.units || cur.units.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; padding: 35px 20px; color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-secondary); margin-bottom: 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">No Units or Topics Configured Yet</p>
                    <p style="font-size: 13px;">The school has not added specific chapter units or topics for <strong>${subject}</strong> yet.</p>
                </div>
            `;
            return;
        }

        let totalSubjectTopics = 0;
        let totalCoveredSubjectTopics = 0;

        cur.units.forEach(u => {
            const uTopics = u.topics || [];
            totalSubjectTopics += uTopics.length;
            uTopics.forEach(t => {
                if (coveredTopicsMap.has(t.topicName.toLowerCase())) {
                    totalCoveredSubjectTopics++;
                }
            });
        });

        const overallPct = totalSubjectTopics > 0 ? Math.round((totalCoveredSubjectTopics / totalSubjectTopics) * 100) : 0;

        const headerMetrics = `
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Curriculum Coverage</div>
                    <div style="font-size: 18px; font-weight: 800; color: #f59e0b;">${totalCoveredSubjectTopics} of ${totalSubjectTopics} Topics Covered (${overallPct}%)</div>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 8px; border-radius: 6px; font-weight: 600; margin-right: 6px;">✓ Covered</span>
                    <span style="background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); padding: 4px 8px; border-radius: 6px; font-weight: 500;">⏳ Upcoming</span>
                </div>
            </div>
        `;

        const unitsListHtml = cur.units.map(u => {
            const uTopics = u.topics || [];
            let coveredInUnit = 0;
            const topicsHtml = uTopics.length > 0 ? uTopics.map(t => {
                const isCovered = coveredTopicsMap.has(t.topicName.toLowerCase());
                if (isCovered) coveredInUnit++;
                const weekNum = coveredTopicsMap.get(t.topicName.toLowerCase());
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-size: 13px;">
                        <span style="color: var(--text-primary);">📖 ${t.topicName}</span>
                        ${isCovered ? 
                            `<span class="topic-pill covered">✓ Covered in Week ${weekNum}</span>` : 
                            `<span class="topic-pill pending">⏳ Upcoming</span>`}
                    </div>
                `;
            }).join('') : '<span style="color: var(--text-secondary); font-size: 12px; font-style: italic;">No topics defined under this unit.</span>';

            const unitPct = uTopics.length > 0 ? Math.round((coveredInUnit / uTopics.length) * 100) : 0;

            return `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 15px; color: var(--text-primary);">📁 Unit: ${u.unitName}</span>
                        <span style="font-size: 12px; font-weight: 600; color: #f59e0b;">${coveredInUnit} / ${uTopics.length} Covered (${unitPct}%)</span>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 6px; height: 5px; width: 100%; margin-bottom: 10px; overflow: hidden;">
                        <div style="background: #f59e0b; width: ${unitPct}%; height: 100%; border-radius: 6px;"></div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${topicsHtml}
                    </div>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${headerMetrics}
                ${unitsListHtml}
            </div>
        `;
    } else {
        // Render Weekly Progress Timeline Tab
        if (progressRecords.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; padding: 35px 20px; color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-secondary); margin-bottom: 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">No Weekly Progress Logged Yet</p>
                    <p style="font-size: 13px;">The administrator has not recorded weekly progress entries for <strong>${subject}</strong> yet.</p>
                </div>
            `;
            return;
        }

        body.innerHTML = progressRecords.map(p => {
            const milestoneBadge = p.isMilestone ? 
                '<span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(245, 158, 11, 0.2);">🏆 Milestone Reached</span>' : 
                '';

            const formattedDate = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            }) : '';

            return `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 14px; padding: 15px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; font-size: 15px; color: var(--text-primary);">Week ${p.weekNumber}</span>
                        ${milestoneBadge}
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
                        <strong style="color: var(--text-primary);">Topics Covered:</strong> ${p.topicsCovered || 'Not Specified'}
                    </div>
                    <div style="margin-top: 5px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Weekly Progress</span>
                            <span style="font-weight: 700; color: #f59e0b;">${p.percentCompleted}%</span>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; height: 6px; width: 100%;">
                            <div style="background: linear-gradient(90deg, #f59e0b, #ec4899); width: ${p.percentCompleted}%; height: 100%; border-radius: 10px;"></div>
                        </div>
                    </div>
                    ${formattedDate ? `<div style="font-size: 11px; color: var(--text-secondary); text-align: right; margin-top: 2px;">Recorded on ${formattedDate}</div>` : ''}
                </div>
            `;
        }).join('');
    }
}

function closeProgressModal() {
    const modal = document.getElementById('progressModal');
    if (modal) modal.style.display = 'none';
}

function logout() {
    localStorage.clear();
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
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

async function loadChildQuizAttempts() {
    const tableBody = document.getElementById('parentQuizAttemptsTableBody');
    if (!tableBody) return;

    if (!studentId) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 25px;">Child student ID not resolved yet.</td></tr>`;
        return;
    }

    try {
        const res = await fetch(`/apiv1/quiz-attempts?studentId=${studentId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) throw new Error('Failed to load child quiz attempts');
        const attempts = await res.json();

        const totalAttempts = attempts.length;
        let avgScore = 0;
        let bestScore = 0;
        let passedCount = 0;

        if (totalAttempts > 0) {
            const sumPct = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
            avgScore = Math.round(sumPct / totalAttempts);
            bestScore = Math.round(Math.max(...attempts.map(a => a.percentage || 0)));
            passedCount = attempts.filter(a => (a.percentage || 0) >= 50).length;
        }

        const statTotal = document.getElementById('statParentTotalAttempts');
        const statAvg = document.getElementById('statParentAvgScore');
        const statBest = document.getElementById('statParentBestScore');
        const statPassed = document.getElementById('statParentPassedQuizzes');

        if (statTotal) statTotal.textContent = totalAttempts;
        if (statAvg) statAvg.textContent = `${avgScore}%`;
        if (statBest) statBest.textContent = `${bestScore}%`;
        if (statPassed) statPassed.textContent = passedCount;

        if (totalAttempts === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
                        <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 4px;">No Quiz Attempts Recorded</div>
                        <div style="font-size: 13px;">Your child has not attempted any quizzes yet.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = attempts.map(att => {
            const pct = Math.round(att.percentage || 0);
            let pctColor = '#ef4444';
            let pctBg = 'rgba(239, 68, 68, 0.15)';
            if (pct >= 80) {
                pctColor = '#34d399';
                pctBg = 'rgba(16, 185, 129, 0.15)';
            } else if (pct >= 50) {
                pctColor = '#fbbf24';
                pctBg = 'rgba(245, 158, 11, 0.15)';
            }

            const dateStr = att.completedAt ? new Date(att.completedAt).toLocaleString() : (att.startedAt ? new Date(att.startedAt).toLocaleString() : '--');

            return `
                <tr style="border-bottom: 1px solid var(--border-color); font-size: 13px;">
                    <td style="padding: 14px; font-weight: 700; color: var(--text-secondary);">#${att.attemptId}</td>
                    <td style="padding: 14px; font-weight: 600; color: #ffffff;">${escapeParentHtml(att.quizTitle || 'Practice Quiz')}</td>
                    <td style="padding: 14px; color: var(--text-secondary);">${dateStr}</td>
                    <td style="padding: 14px; font-weight: 600;">${att.score} / ${att.totalMarks}</td>
                    <td style="padding: 14px;">
                        <span style="background: ${pctBg}; color: ${pctColor}; padding: 3px 10px; border-radius: 8px; font-weight: 700; font-size: 12px;">
                            ${pct}%
                        </span>
                    </td>
                    <td style="padding: 14px;">
                        <span style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                            ${att.status || 'COMPLETED'}
                        </span>
                    </td>
                    <td style="padding: 14px; text-align: right;">
                        <button type="button" onclick="viewChildQuizAttempt(${att.attemptId})" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.35); color: #c4b5fd; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            👁️ View Report
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 25px;">Failed to load attempts: ${err.message}</td></tr>`;
    }
}

async function viewChildQuizAttempt(attemptId) {
    const modal = document.getElementById('parentQuizReviewModal');
    const content = document.getElementById('parentQuizReviewModalContent');
    if (!modal || !content) return;

    modal.style.display = 'flex';
    content.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="loading-spinner">Loading child report...</div></div>`;

    try {
        const res = await fetch(`/apiv1/quiz-attempts/${attemptId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Failed to load attempt details');
        const att = await res.json();

        const pct = Math.round(att.percentage || 0);
        const qaList = att.questionAttempts || [];
        const correct = att.correctAnswersCount !== undefined ? att.correctAnswersCount : qaList.filter(q => q.isCorrect).length;

        const itemsHtml = qaList.map((qa, idx) => {
            const isAnswered = qa.selectedAnswer && qa.selectedAnswer.trim() !== '';
            const isCorrect = qa.isCorrect;
            const borderCol = !isAnswered ? '#f59e0b' : (isCorrect ? '#10b981' : '#ef4444');

            return `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-left: 4px solid ${borderCol}; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 13px; color: var(--text-secondary);">Question ${idx + 1}</span>
                        <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; ${isCorrect ? 'background: rgba(16,185,129,0.15); color: #34d399;' : 'background: rgba(239,68,68,0.15); color: #f87171;'}">
                            ${isCorrect ? `✓ Correct (+${qa.marksAwarded || qa.questionMarks || 1} mk)` : '✗ Incorrect (0 mk)'}
                        </span>
                    </div>
                    <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 12px; line-height: 1.5;">
                        ${escapeParentHtml(qa.questionText || '')}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 10px;">
                        <div style="background: rgba(255, 255, 255, 0.02); padding: 8px 12px; border-radius: 8px;">
                            <span style="color: var(--text-secondary);">Child's Answer: </span>
                            <strong style="color: ${isCorrect ? '#34d399' : (isAnswered ? '#f87171' : '#fbbf24')};">
                                ${escapeParentHtml(qa.selectedAnswer || 'Not Answered')}
                            </strong>
                        </div>
                        <div style="background: rgba(16, 185, 129, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                            <span style="color: var(--text-secondary);">Correct Answer: </span>
                            <strong style="color: #34d399;">${escapeParentHtml(qa.correctAnswer || '')}</strong>
                        </div>
                    </div>
                    ${qa.explanation ? `
                        <div style="background: rgba(99, 102, 241, 0.08); border-left: 3px solid #818cf8; padding: 8px 12px; border-radius: 0 8px 8px 0; font-size: 12px; color: #c7d2fe;">
                            💡 <strong>Explanation: </strong>${escapeParentHtml(qa.explanation)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        content.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 11px; font-weight: 700; color: var(--accent-secondary); text-transform: uppercase;">
                            Child Assessment Report
                        </div>
                        <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 2px 0 0;">${escapeParentHtml(att.quizTitle || 'Topic Quiz')}</h2>
                    </div>
                    <button type="button" onclick="closeParentQuizReviewModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 26px; cursor: pointer;">&times;</button>
                </div>

                <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 22px;">
                    <div style="font-size: 42px; font-weight: 900; background: linear-gradient(135deg, #10b981, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px;">
                        ${pct}%
                    </div>
                    <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 10px;">
                        Score: ${att.score} / ${att.totalMarks} Marks (${correct} of ${qaList.length} Correct)
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">Detailed Questions Review</h3>
                    <div style="max-height: 380px; overflow-y: auto; padding-right: 6px;">
                        ${itemsHtml}
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 14px;">
                    <button type="button" onclick="closeParentQuizReviewModal()" style="background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-color); color: #ffffff; padding: 10px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;">
                        Close Report
                    </button>
                </div>
            </div>
        `;
    } catch (err) {
        content.innerHTML = `<div style="text-align: center; padding: 30px; color: #ef4444;">Failed to load report: ${err.message}</div>`;
    }
}

function closeParentQuizReviewModal() {
    const modal = document.getElementById('parentQuizReviewModal');
    if (modal) modal.style.display = 'none';
}

function escapeParentHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
