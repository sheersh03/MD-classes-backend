const token = localStorage.getItem('accessToken');
const userJson = localStorage.getItem('user');
let studentId = 0;

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
        loadCurriculumAndProgress();
    } else if (panel === 'schedule') {
        document.getElementById('btn-schedule').classList.add('active');
        document.getElementById('schedulePanel').classList.add('active');
    } else if (panel === 'announcements') {
        document.getElementById('btn-announcements').classList.add('active');
        document.getElementById('announcementsPanel').classList.add('active');
    } else if (panel === 'quizzes') {
        document.getElementById('btn-quizzes').classList.add('active');
        document.getElementById('quizzesPanel').classList.add('active');
        loadStudentQuizAttempts();
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

// Curriculum & Syllabus Tracking State
let activeBoard = 'CBSE';
let activeSubjectsList = [];
let currentStudentClass = '';
let cachedCurriculum = [];
let cachedProgressList = [];
let cachedStudentAttempts = [];
let activeModalSubject = '';
let activeModalTab = 'curriculum';

// HTML escaping utility for safe rendering
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Check student's quiz status for a topic
// Rule: if child number/marks percentage is < 70%, student can reattempt; otherwise marked as completed
function getTopicQuizStatus(topicId, topicName) {
    if (!cachedStudentAttempts || cachedStudentAttempts.length === 0) {
        return { attempted: false, bestPercentage: null, bestAttempt: null, canReattempt: false, isCompleted: false };
    }

    const matchingAttempts = cachedStudentAttempts.filter(att => {
        if (topicId && att.topicId && Number(att.topicId) === Number(topicId)) return true;
        if (topicName && att.quizTitle && att.quizTitle.toLowerCase().includes(topicName.toLowerCase())) return true;
        return false;
    });

    if (matchingAttempts.length === 0) {
        return { attempted: false, bestPercentage: null, bestAttempt: null, canReattempt: false, isCompleted: false };
    }

    let bestAttempt = matchingAttempts[0];
    for (const att of matchingAttempts) {
        if ((att.percentage || 0) > (bestAttempt.percentage || 0)) {
            bestAttempt = att;
        }
    }

    const bestPercentage = Math.round(bestAttempt.percentage || 0);
    const isCompleted = bestPercentage >= 70;
    const canReattempt = bestPercentage < 70;

    return {
        attempted: true,
        bestPercentage,
        bestAttempt,
        canReattempt,
        isCompleted
    };
}

async function loadCurriculumAndProgress() {
    try {
        console.log(">>> [API REQUEST] Loading Curriculum, Weekly Progress, and Quiz Attempts");
        const currentToken = localStorage.getItem('accessToken') || token;
        const [subRes, progRes, attRes] = await Promise.allSettled([
            fetch('/apiv1/subjects', {
                headers: { 'Authorization': 'Bearer ' + currentToken },
                credentials: 'include'
            }),
            fetch('/apiv1/syllabus-progress', {
                headers: { 'Authorization': 'Bearer ' + currentToken },
                credentials: 'include'
            }),
            fetch('/apiv1/quiz-attempts/my-attempts' + (studentId ? `?studentId=${studentId}` : ''), {
                headers: { 'Authorization': 'Bearer ' + currentToken },
                credentials: 'include'
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

        if (attRes.status === 'fulfilled' && attRes.value.ok) {
            cachedStudentAttempts = await attRes.value.json();
            console.log("<<< [API ATTEMPTS RECEIVED]:", cachedStudentAttempts);
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
        container.innerHTML = '<div class="loading-spinner" style="grid-column: 1/-1; padding: 20px;">No subjects found for syllabus tracking. Ensure your class is registered.</div>';
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
        
        // Latest progress percentage or calculated from covered topics
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
                    const safeTName = t.topicName.replace(/'/g, "\\'");
                    const quizStatus = getTopicQuizStatus(t.topicId, t.topicName);

                    let quizAction = '';
                    if (t.topicId) {
                        if (quizStatus.isCompleted) {
                            quizAction = `<span class="topic-quiz-completed-badge" style="font-size: 10px; padding: 2px 6px; margin-left: 4px;" title="Scored ${quizStatus.bestPercentage}% (≥70%)">✅ ${quizStatus.bestPercentage}%</span>`;
                        } else if (quizStatus.canReattempt) {
                            quizAction = `<button type="button" class="topic-quiz-btn btn-pill reattempt" onclick="event.stopPropagation(); startTopicQuiz(${t.topicId}, '${safeTName}', '${safeSubName}')" style="margin-left: 4px;" title="Score is ${quizStatus.bestPercentage}% (<70%). Click to reattempt quiz!">🔄 Reattempt (${quizStatus.bestPercentage}%)</button>`;
                        } else {
                            quizAction = `<button type="button" class="topic-quiz-btn btn-pill" onclick="event.stopPropagation(); startTopicQuiz(${t.topicId}, '${safeTName}', '${safeSubName}')" title="Attempt Quiz on ${safeTName}">📝 Quiz</button>`;
                        }
                    }

                    return isCovered ? 
                        `<span class="topic-pill covered" title="Covered in Week ${weekCovered}">✓ ${t.topicName} ${quizAction}</span>` :
                        `<span class="topic-pill pending">⏳ ${t.topicName} ${quizAction}</span>`;
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

        // Board PDF download link
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
                        <div style="display: flex; gap: 6px; align-items: center;">
                            ${hasMilestone ? '<span style="font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 3px 8px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.25);">🏆 Milestone</span>' : ''}
                            <span style="font-size: 11px; font-weight: 700; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 8px; border-radius: 20px; text-transform: uppercase;">
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
                            <span>Syllabus Completion</span>
                            <span style="font-weight: 700; color: #10b981;">${completionPct}%</span>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; height: 6px; width: 100%; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #10b981, #6366f1); width: ${completionPct}%; height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
                        </div>
                    </div>

                    ${unitsCount > 0 ? `
                        <button type="button" id="${btnToggleId}" onclick="toggleInlineCurriculum('${drawerId}', '${btnToggleId}')" style="background: none; border: none; color: #a78bfa; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                            Explore Units & Topics ▾
                        </button>
                    ` : '<span style="font-size: 12px; color: var(--text-secondary); font-style: italic; display: block; margin-bottom: 8px;">Curriculum being configured</span>'}

                    ${unitsDrawerHtml}
                </div>

                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="${downloadUrl}" download="${activeBoard}_${classClean}_${subject}_Syllabus.pdf" class="download-syllabus-btn" style="flex: 1; margin: 0; justify-content: center; font-size: 13px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        PDF
                    </a>
                    <button type="button" onclick="openSyllabusModal('${safeSubName}')" class="download-syllabus-btn" style="flex: 1; margin: 0; justify-content: center; background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.25); color: #a78bfa; font-size: 13px;">
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

// Modal management
async function openSyllabusModal(subject) {
    activeModalSubject = subject;
    activeModalTab = 'curriculum';

    const modal = document.getElementById('progressModal');
    const title = document.getElementById('progressModalTitle');
    title.textContent = `${subject} - Syllabus Tracking`;
    modal.style.display = 'flex';

    // Update tab button classes
    const tabCurr = document.getElementById('modalTabCurriculum');
    const tabWeek = document.getElementById('modalTabWeekly');
    if (tabCurr) tabCurr.classList.add('active');
    if (tabWeek) tabWeek.classList.remove('active');

    // Fetch fresh progress and attempts for this subject if needed
    const currentToken = localStorage.getItem('accessToken') || token;
    try {
        console.log(`>>> [API REQUEST] Refreshing progress and attempts for: ${subject}`);
        const [pRes, aRes] = await Promise.allSettled([
            fetch(`/apiv1/syllabus-progress?subject=${encodeURIComponent(subject)}`, {
                headers: { 'Authorization': 'Bearer ' + currentToken },
                credentials: 'include'
            }),
            fetch('/apiv1/quiz-attempts/my-attempts' + (studentId ? `?studentId=${studentId}` : ''), {
                headers: { 'Authorization': 'Bearer ' + currentToken },
                credentials: 'include'
            })
        ]);

        if (pRes.status === 'fulfilled' && pRes.value.ok) {
            const data = await pRes.value.json();
            cachedProgressList = cachedProgressList.filter(p => !p.subject || p.subject.toLowerCase() !== subject.toLowerCase()).concat(data);
        }
        if (aRes.status === 'fulfilled' && aRes.value.ok) {
            cachedStudentAttempts = await aRes.value.json();
        }
    } catch (e) {
        console.warn("Could not refresh subject progress or attempts:", e);
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
                    <p style="font-size: 13px;">The teacher has not added specific chapter units or topics for <strong>${subject}</strong> yet.</p>
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
                    <div style="font-size: 18px; font-weight: 800; color: #10b981;">${totalCoveredSubjectTopics} of ${totalSubjectTopics} Topics Covered (${overallPct}%)</div>
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
                const safeTName = t.topicName.replace(/'/g, "\\'");
                const safeSubName = subject.replace(/'/g, "\\'");
                const quizStatus = getTopicQuizStatus(t.topicId, t.topicName);

                let quizSection = '';
                if (t.topicId) {
                    if (quizStatus.isCompleted) {
                        // Score >= 70%: marked as completed
                        quizSection = `
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span class="topic-quiz-completed-badge" title="Scored ${quizStatus.bestPercentage}% (Requirement: ≥ 70%)">
                                    ✅ Completed (${quizStatus.bestPercentage}%)
                                </span>
                                ${quizStatus.bestAttempt ? `
                                    <button type="button" onclick="viewPastQuizAttempt(${quizStatus.bestAttempt.attemptId})" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;" title="Review Answers">
                                        👁️ Review
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    } else if (quizStatus.canReattempt) {
                        // Score < 70%: allow student to reattempt the quiz!
                        quizSection = `
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span class="topic-quiz-reattempt-badge" title="Score is ${quizStatus.bestPercentage}% which is less than 70%. Reattempt allowed!">
                                    Score: ${quizStatus.bestPercentage}% (&lt;70%)
                                </span>
                                <button type="button" class="topic-quiz-btn reattempt" onclick="startTopicQuiz(${t.topicId}, '${safeTName}', '${safeSubName}')" title="Reattempt Quiz to score 70% or more">
                                    🔄 Reattempt Quiz
                                </button>
                                ${quizStatus.bestAttempt ? `
                                    <button type="button" onclick="viewPastQuizAttempt(${quizStatus.bestAttempt.attemptId})" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;" title="Review Previous Attempt">
                                        👁️
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    } else {
                        // Not attempted yet
                        quizSection = `
                            <button type="button" class="topic-quiz-btn" onclick="startTopicQuiz(${t.topicId}, '${safeTName}', '${safeSubName}')">
                                📝 Attempt Quiz
                            </button>
                        `;
                    }
                }

                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; font-size: 13px; gap: 10px;">
                        <span style="color: var(--text-primary); font-weight: 500;">📖 ${t.topicName}</span>
                        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
                            ${isCovered ? 
                                `<span class="topic-pill covered">✓ Week ${weekNum}</span>` : 
                                `<span class="topic-pill pending">⏳ Upcoming</span>`}
                            ${quizSection}
                        </div>
                    </div>
                `;
            }).join('') : '<span style="color: var(--text-secondary); font-size: 12px; font-style: italic;">No topics defined under this unit.</span>';

            const unitPct = uTopics.length > 0 ? Math.round((coveredInUnit / uTopics.length) * 100) : 0;

            return `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 15px; color: var(--text-primary);">📁 Unit: ${u.unitName}</span>
                        <span style="font-size: 12px; font-weight: 600; color: #10b981;">${coveredInUnit} / ${uTopics.length} Covered (${unitPct}%)</span>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 6px; height: 5px; width: 100%; margin-bottom: 10px; overflow: hidden;">
                        <div style="background: #10b981; width: ${unitPct}%; height: 100%; border-radius: 6px;"></div>
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
                            <span style="font-weight: 700; color: #10b981;">${p.percentCompleted}%</span>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; height: 6px; width: 100%;">
                            <div style="background: #10b981; width: ${p.percentCompleted}%; height: 100%; border-radius: 10px;"></div>
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

// ==========================================================
// Quiz Attempt & Evaluation Engine
// ==========================================================
let currentQuizState = {
    topicId: null,
    topicName: '',
    subjectName: '',
    quiz: null,
    questions: [],
    currentIndex: 0,
    answers: {},       // questionIndex -> optionKey ('A'|'B'|'C'|'D')
    timerSeconds: 0,
    timerInterval: null
};

async function startTopicQuiz(topicId, topicName, subjectName) {
    const modal = document.getElementById('quizModal');
    const content = document.getElementById('quizModalContent');
    if (!modal || !content) return;

    modal.style.display = 'flex';
    content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div class="loading-spinner" style="font-size: 16px; color: var(--accent-primary);">Loading quiz for ${topicName}...</div>
        </div>
    `;

    try {
        console.log(`>>> [API REQUEST] Fetching quizzes for topicId: ${topicId}`);
        const res = await fetch(`/apiv1/quizzes?topicId=${topicId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            throw new Error(`Failed to load quizzes (Status: ${res.status})`);
        }

        const quizzes = await res.json();
        console.log("<<< [API RESPONSE QUIZZES]:", quizzes);

        if (!quizzes || quizzes.length === 0) {
            renderNoQuizAvailable(topicName, subjectName);
            return;
        }

        renderQuizIntro(topicId, topicName, subjectName, quizzes);
    } catch (err) {
        console.error("Quiz load error:", err);
        content.innerHTML = `
            <div style="text-align: center; padding: 30px 20px;">
                <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
                <h3 style="font-size: 18px; color: #f87171; margin-bottom: 8px;">Unable to Load Quiz</h3>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">${err.message || 'Please check your connection and try again.'}</p>
                <button type="button" onclick="closeQuizModal()" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: white; padding: 8px 20px; border-radius: 10px; cursor: pointer;">Close</button>
            </div>
        `;
    }
}

function renderNoQuizAvailable(topicName, subjectName) {
    const content = document.getElementById('quizModalContent');
    content.innerHTML = `
        <div style="text-align: center; padding: 35px 20px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.3); margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                ${subjectName} • Topic Assessment
            </div>
            <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 10px;">${topicName}</h2>
            <p style="font-size: 14px; color: var(--text-secondary); max-width: 440px; margin: 0 auto 24px; line-height: 1.6;">
                No practice quiz has been published for this topic yet. Your teachers will add questions soon.
            </p>
            <button type="button" onclick="closeQuizModal()" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); border: none; color: white; padding: 10px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                Understood, Return
            </button>
        </div>
    `;
}

function renderQuizIntro(topicId, topicName, subjectName, quizzes) {
    const content = document.getElementById('quizModalContent');
    const selectedQuiz = quizzes[0];
    const totalQ = selectedQuiz.questions ? selectedQuiz.questions.length : (selectedQuiz.totalQuestions || 0);
    const timeLimit = selectedQuiz.timeLimitMinutes || 10;

    content.innerHTML = `
        <div>
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                <div>
                    <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                        <span>📚 ${subjectName}</span> • <span>📖 ${topicName}</span>
                    </div>
                    <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0;">${selectedQuiz.title}</h2>
                </div>
                <button type="button" onclick="closeQuizModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 26px; cursor: pointer; line-height: 1;">&times;</button>
            </div>

            <!-- Description -->
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
                ${selectedQuiz.description || 'Test your understanding and master key concepts covered in this topic. Review explanations upon completion.'}
            </p>

            <!-- Quiz Information Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 14px; margin-bottom: 28px;">
                <div style="background: rgba(255, 255, 255, 0.025); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; text-align: center;">
                    <div style="font-size: 22px; margin-bottom: 4px;">❓</div>
                    <div style="font-size: 18px; font-weight: 800; color: var(--text-primary);">${totalQ}</div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Questions</div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.025); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; text-align: center;">
                    <div style="font-size: 22px; margin-bottom: 4px;">⏱️</div>
                    <div style="font-size: 18px; font-weight: 800; color: #38bdf8;">${timeLimit} Mins</div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Time Limit</div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.025); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; text-align: center;">
                    <div style="font-size: 22px; margin-bottom: 4px;">🎯</div>
                    <div style="font-size: 18px; font-weight: 800; color: #34d399;">MCQ</div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Format</div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.025); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; text-align: center;">
                    <div style="font-size: 22px; margin-bottom: 4px;">💡</div>
                    <div style="font-size: 18px; font-weight: 800; color: #fbbf24;">Instant</div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Explanations</div>
                </div>
            </div>

            <!-- Start Button -->
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button type="button" onclick="closeQuizModal()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;">
                    Cancel
                </button>
                <button type="button" onclick="beginQuizAttempt(${selectedQuiz.quizId}, '${topicName.replace(/'/g, "\\'")}', '${subjectName.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; padding: 12px 30px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);">
                    Start Quiz Now 🚀
                </button>
            </div>
        </div>
    `;
}

async function beginQuizAttempt(quizId, topicName, subjectName) {
    const content = document.getElementById('quizModalContent');
    content.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="loading-spinner">Preparing questions...</div></div>`;

    try {
        console.log(`>>> [API REQUEST] GET /apiv1/quizzes/${quizId} and questions`);
        const [quizRes, qRes] = await Promise.all([
            fetch(`/apiv1/quizzes/${quizId}`, { headers: { 'Authorization': 'Bearer ' + token } }),
            fetch(`/apiv1/questions?quizId=${quizId}`, { headers: { 'Authorization': 'Bearer ' + token } })
        ]);

        const quizData = quizRes.ok ? await quizRes.json() : { quizId, title: 'Topic Quiz' };
        let questions = qRes.ok ? await qRes.json() : [];

        if ((!questions || questions.length === 0) && quizData.questions && quizData.questions.length > 0) {
            questions = quizData.questions;
        }

        if (!questions || questions.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 35px 20px;">
                    <div style="font-size: 40px; margin-bottom: 12px;">📝</div>
                    <h3 style="font-size: 20px; color: white; margin-bottom: 8px;">No Questions Added Yet</h3>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">This quiz has not been populated with questions yet.</p>
                    <button type="button" onclick="closeQuizModal()" style="background: rgba(255,255,255,0.08); border: 1px solid var(--border-color); color: white; padding: 10px 24px; border-radius: 12px; cursor: pointer;">Close</button>
                </div>
            `;
            return;
        }

        currentQuizState = {
            topicId: quizData.topicId,
            topicName: topicName,
            subjectName: subjectName,
            quiz: quizData,
            questions: questions,
            currentIndex: 0,
            answers: {},
            startedAt: new Date().toISOString(),
            timerSeconds: (quizData.timeLimitMinutes || 10) * 60,
            timerInterval: null
        };

        startQuizTimer();
        renderActiveQuiz();
    } catch (e) {
        console.error("Error loading quiz questions:", e);
        content.innerHTML = `<div style="text-align: center; color: #f87171; padding: 30px;">Failed to initialize questions: ${e.message}</div>`;
    }
}

function startQuizTimer() {
    if (currentQuizState.timerInterval) {
        clearInterval(currentQuizState.timerInterval);
    }

    currentQuizState.timerInterval = setInterval(() => {
        currentQuizState.timerSeconds--;
        updateTimerDisplay();

        if (currentQuizState.timerSeconds <= 0) {
            clearInterval(currentQuizState.timerInterval);
            showToast('Time is up! Submitting quiz automatically...', false);
            submitQuizAttempt();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElem = document.getElementById('quizTimerDisplay');
    if (!timerElem) return;

    const totalSecs = Math.max(0, currentQuizState.timerSeconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timerElem.textContent = `⏱️ ${formatted}`;

    if (totalSecs <= 60) {
        timerElem.classList.add('urgent');
    } else {
        timerElem.classList.remove('urgent');
    }
}

function renderActiveQuiz() {
    const content = document.getElementById('quizModalContent');
    const { questions, currentIndex, answers, quiz, topicName, subjectName } = currentQuizState;
    const q = questions[currentIndex];
    const totalQ = questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPct = Math.round((answeredCount / totalQ) * 100);

    const rawOptions = [
        { key: 'A', text: q.optionA },
        { key: 'B', text: q.optionB },
        { key: 'C', text: q.optionC },
        { key: 'D', text: q.optionD }
    ].filter(o => o.text && o.text.trim() !== '');

    const selectedKey = answers[currentIndex] || null;

    const jumpBubblesHtml = questions.map((item, idx) => {
        let classes = 'quiz-jump-bubble';
        if (idx === currentIndex) classes += ' current';
        else if (answers[idx] !== undefined) classes += ' answered';

        return `<button type="button" class="${classes}" onclick="jumpToQuizQuestion(${idx})">${idx + 1}</button>`;
    }).join('');

    content.innerHTML = `
        <div>
            <!-- Top Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--accent-secondary); text-transform: uppercase;">
                        ${subjectName} • ${topicName}
                    </span>
                    <h3 style="font-size: 18px; font-weight: 800; color: #ffffff; margin: 2px 0 0;">${quiz.title}</h3>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div id="quizTimerDisplay" class="quiz-timer-badge">⏱️ --:--</div>
                    <button type="button" onclick="confirmExitQuiz()" style="background: none; border: none; color: var(--text-secondary); font-size: 22px; cursor: pointer;">&times;</button>
                </div>
            </div>

            <!-- Progress & Question Tracker -->
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
                    <span>Question <strong>${currentIndex + 1}</strong> of <strong>${totalQ}</strong></span>
                    <span>${answeredCount} of ${totalQ} Answered (${progressPct}%)</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; height: 6px; width: 100%; overflow: hidden; margin-bottom: 14px;">
                    <div style="background: linear-gradient(90deg, #6366f1, #8b5cf6); width: ${progressPct}%; height: 100%; transition: width 0.3s ease;"></div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${jumpBubblesHtml}
                </div>
            </div>

            <!-- Question Card -->
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 18px; padding: 22px; margin-bottom: 22px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                    <span style="font-size: 12px; font-weight: 700; background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 4px 10px; border-radius: 8px;">
                        Q${currentIndex + 1}
                    </span>
                    <span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">
                        Marks: ${q.marks || 1}
                    </span>
                </div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff; line-height: 1.6; margin-bottom: 20px;">
                    ${q.questionText}
                </div>

                <!-- Options -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${rawOptions.map(opt => {
                        const isSelected = selectedKey === opt.key;
                        return `
                            <div class="quiz-option-card ${isSelected ? 'selected' : ''}" onclick="selectQuizOption(${currentIndex}, '${opt.key}')">
                                <div class="quiz-option-letter">${opt.key}</div>
                                <div class="quiz-option-text">${opt.text}</div>
                                ${isSelected ? '<span style="color: #a855f7; font-size: 18px; font-weight: 700;">✓</span>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Bottom Navigation -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button type="button" onclick="prevQuizQuestion()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; ${currentIndex === 0 ? 'opacity: 0.4; pointer-events: none;' : ''}">
                    ⬅ Previous
                </button>

                <div style="display: flex; gap: 10px;">
                    <button type="button" onclick="submitQuizAttempt()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: white; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                        Finish & Submit ✅
                    </button>

                    ${currentIndex < totalQ - 1 ? `
                        <button type="button" onclick="nextQuizQuestion()" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
                            Next ➡
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    updateTimerDisplay();
}

function selectQuizOption(qIdx, optionKey) {
    currentQuizState.answers[qIdx] = optionKey;
    renderActiveQuiz();
}

function jumpToQuizQuestion(qIdx) {
    currentQuizState.currentIndex = qIdx;
    renderActiveQuiz();
}

function nextQuizQuestion() {
    if (currentQuizState.currentIndex < currentQuizState.questions.length - 1) {
        currentQuizState.currentIndex++;
        renderActiveQuiz();
    }
}

function prevQuizQuestion() {
    if (currentQuizState.currentIndex > 0) {
        currentQuizState.currentIndex--;
        renderActiveQuiz();
    }
}

function confirmExitQuiz() {
    if (confirm('Are you sure you want to exit? Your progress in this attempt will be lost.')) {
        closeQuizModal();
    }
}

async function submitQuizAttempt() {
    if (currentQuizState.timerInterval) {
        clearInterval(currentQuizState.timerInterval);
    }

    const { questions, answers, quiz, topicName, subjectName } = currentQuizState;
    const content = document.getElementById('quizModalContent');
    if (content) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div class="loading-spinner" style="margin-bottom: 16px;"></div>
                <h3 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Submitting Quiz Attempt...</h3>
                <p style="color: var(--text-secondary); font-size: 13px;">Your answers are being evaluated and recorded on the server.</p>
            </div>
        `;
    }

    // Build payload conforming to QuizAttemptRequest
    const answersPayload = questions.map((q, idx) => {
        const selectedLetter = answers[idx] || null;
        let selectedText = null;
        if (selectedLetter === 'A') selectedText = q.optionA;
        else if (selectedLetter === 'B') selectedText = q.optionB;
        else if (selectedLetter === 'C') selectedText = q.optionC;
        else if (selectedLetter === 'D') selectedText = q.optionD;

        return {
            questionId: q.questionId || q.id,
            selectedOption: selectedLetter,
            selectedAnswer: selectedText
        };
    });

    const payload = {
        quizId: quiz.quizId || quiz.id,
        status: 'COMPLETED',
        startedAt: currentQuizState.startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        answers: answersPayload
    };

    try {
        console.log(">>> [API REQUEST] POST /apiv1/quiz-attempts", payload);
        const res = await fetch('/apiv1/quiz-attempts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Server error occurred during quiz evaluation');
        }

        const attemptResult = await res.json();
        console.log(">>> [API RESPONSE] /apiv1/quiz-attempts:", attemptResult);

        renderQuizAttemptResults(attemptResult, topicName, subjectName);
        showToast('Quiz submitted & graded successfully! 🎉', true);

        // Refresh quiz history and syllabus tracking
        loadStudentQuizAttempts();
        loadCurriculumAndProgress();
    } catch (err) {
        console.warn("Backend quiz attempt API error, falling back to client evaluation:", err);
        fallbackLocalEvaluation();
    }
}

function fallbackLocalEvaluation() {
    const { questions, answers, quiz, topicName, subjectName } = currentQuizState;
    let earnedMarks = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const evaluatedQuestions = questions.map((q, idx) => {
        const selectedLetter = answers[idx];
        const marks = q.marks || 1;
        totalMarks += marks;

        let selectedText = null;
        if (selectedLetter === 'A') selectedText = q.optionA;
        else if (selectedLetter === 'B') selectedText = q.optionB;
        else if (selectedLetter === 'C') selectedText = q.optionC;
        else if (selectedLetter === 'D') selectedText = q.optionD;

        if (!selectedLetter) {
            skippedCount++;
            return {
                questionId: q.questionId || q.id,
                questionText: q.questionText,
                selectedAnswer: null,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                isCorrect: false,
                marksAwarded: 0,
                questionMarks: marks
            };
        }

        const correctAns = (q.correctAnswer || '').trim().toLowerCase();
        const letterMatches = selectedLetter.toLowerCase() === correctAns;
        const textMatches = selectedText && selectedText.trim().toLowerCase() === correctAns;

        if (letterMatches || textMatches) {
            correctCount++;
            earnedMarks += marks;
            return {
                questionId: q.questionId || q.id,
                questionText: q.questionText,
                selectedAnswer: `(${selectedLetter}) ${selectedText || ''}`,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                isCorrect: true,
                marksAwarded: marks,
                questionMarks: marks
            };
        } else {
            wrongCount++;
            return {
                questionId: q.questionId || q.id,
                questionText: q.questionText,
                selectedAnswer: `(${selectedLetter}) ${selectedText || ''}`,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                isCorrect: false,
                marksAwarded: 0,
                questionMarks: marks
            };
        }
    });

    const localAttemptResult = {
        quizId: quiz.quizId || quiz.id,
        quizTitle: quiz.title,
        score: earnedMarks,
        totalMarks: totalMarks,
        percentage: totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0,
        totalQuestions: questions.length,
        correctAnswersCount: correctCount,
        questionAttempts: evaluatedQuestions
    };

    renderQuizAttemptResults(localAttemptResult, topicName, subjectName);
    loadStudentQuizAttempts();
    loadCurriculumAndProgress();
}

function renderQuizAttemptResults(attempt, topicName, subjectName) {
    const content = document.getElementById('quizModalContent');
    if (!content) return;

    const quizTitle = attempt.quizTitle || (currentQuizState && currentQuizState.quiz ? currentQuizState.quiz.title : 'Topic Quiz');
    const topicDisplay = topicName || (currentQuizState ? currentQuizState.topicName : 'Curriculum Assessment');
    const subjectDisplay = subjectName || (currentQuizState ? currentQuizState.subjectName : 'Subject');

    const totalMarks = attempt.totalMarks || 0;
    const earnedMarks = attempt.score || 0;
    const percentage = attempt.percentage !== undefined ? Math.round(attempt.percentage) : (totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0);

    const qaList = attempt.questionAttempts || [];
    const totalQ = attempt.totalQuestions || qaList.length;
    const correct = attempt.correctAnswersCount !== undefined ? attempt.correctAnswersCount : qaList.filter(q => q.isCorrect).length;
    const answeredCount = qaList.filter(q => q.selectedAnswer && q.selectedAnswer.trim() !== '').length;
    const wrong = answeredCount - correct;
    const skipped = totalQ - answeredCount;

    let performanceBadge = '';
    let performanceText = '';
    if (percentage >= 80) {
        performanceBadge = '🏆 Outstanding Mastery!';
        performanceText = 'Mastery achieved! You scored in the top tier for this topic.';
    } else if (percentage >= 50) {
        performanceBadge = '👍 Good Effort!';
        performanceText = 'Solid understanding. Review the explanations below to perfect your understanding.';
    } else {
        performanceBadge = '📚 Needs Improvement';
        performanceText = 'Review the syllabus notes and study materials for this topic, then retake the test.';
    }

    const reviewItemsHtml = qaList.map((qa, idx) => {
        const isAnswered = qa.selectedAnswer && qa.selectedAnswer.trim() !== '';
        const cardClass = !isAnswered ? 'unanswered' : (qa.isCorrect ? 'correct' : 'incorrect');

        const statusBadge = !isAnswered ?
            '<span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">Skipped</span>' :
            (qa.isCorrect ?
                `<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">✓ Correct (+${qa.marksAwarded || qa.questionMarks || 1})</span>` :
                '<span style="background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">✗ Incorrect (0 marks)</span>');

        return `
            <div class="quiz-review-card ${cardClass}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <span style="font-weight: 700; font-size: 13px; color: var(--text-secondary);">Question ${idx + 1}</span>
                    ${statusBadge}
                </div>
                <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 12px; line-height: 1.5;">
                    ${escapeHtml(qa.questionText || '')}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 12px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px;">
                        <span style="color: var(--text-secondary);">Your Answer: </span>
                        <strong style="color: ${qa.isCorrect ? '#34d399' : (isAnswered ? '#f87171' : '#fbbf24')};">
                            ${escapeHtml(qa.selectedAnswer || 'Not Answered')}
                        </strong>
                    </div>
                    <div style="background: rgba(16, 185, 129, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <span style="color: var(--text-secondary);">Correct Answer: </span>
                        <strong style="color: #34d399;">${escapeHtml(qa.correctAnswer || '')}</strong>
                    </div>
                </div>

                ${qa.explanation ? `
                    <div style="background: rgba(99, 102, 241, 0.08); border-left: 3px solid #818cf8; padding: 8px 12px; border-radius: 0 8px 8px 0; font-size: 12px; color: #c7d2fe; line-height: 1.5;">
                        <strong>💡 Explanation: </strong>${escapeHtml(qa.explanation)}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    const quizId = attempt.quizId || (currentQuizState && currentQuizState.quiz ? currentQuizState.quiz.quizId : null);

    content.innerHTML = `
        <div>
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--accent-secondary); text-transform: uppercase;">
                        ${subjectDisplay} • ${topicDisplay}
                    </div>
                    <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 2px 0 0;">Quiz Report: ${escapeHtml(quizTitle)}</h2>
                </div>
                <button type="button" onclick="closeQuizModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 26px; cursor: pointer;">&times;</button>
            </div>

            <!-- Score Hero Card -->
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; font-size: 12px; font-weight: 700; background: rgba(168, 85, 247, 0.25); color: #e9d5ff; padding: 4px 14px; border-radius: 20px; margin-bottom: 10px;">
                    ${performanceBadge}
                </div>
                <div style="font-size: 48px; font-weight: 900; background: linear-gradient(135deg, #10b981, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; margin-bottom: 6px;">
                    ${percentage}%
                </div>
                <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">
                    Score: ${earnedMarks} / ${totalMarks} Marks
                </div>
                <p style="font-size: 13px; color: var(--text-secondary); max-width: 440px; margin: 0 auto 16px;">
                    ${performanceText}
                </p>

                <!-- Metrics breakdown -->
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <div style="font-size: 13px;">
                        <span style="color: var(--text-secondary);">Correct: </span>
                        <strong style="color: #34d399;">${correct}</strong>
                    </div>
                    <div style="font-size: 13px;">
                        <span style="color: var(--text-secondary);">Incorrect: </span>
                        <strong style="color: #f87171;">${wrong}</strong>
                    </div>
                    <div style="font-size: 13px;">
                        <span style="color: var(--text-secondary);">Skipped: </span>
                        <strong style="color: #fbbf24;">${skipped}</strong>
                    </div>
                </div>
            </div>

            <!-- Answer Review Accordion -->
            <div style="margin-bottom: 24px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>Detailed Answer Key & Server Explanations</span>
                </h3>
                <div style="max-height: 380px; overflow-y: auto; padding-right: 6px;">
                    ${reviewItemsHtml}
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                <button type="button" onclick="closeQuizModal()" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 10px 22px; border-radius: 12px; font-weight: 600; cursor: pointer;">
                    Close
                </button>
                ${quizId ? `
                    <button type="button" onclick="beginQuizAttempt(${quizId}, '${topicDisplay.replace(/'/g, "\\'")}', '${subjectDisplay.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                        🔄 Retake Quiz
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Button action on 'Total Attempts' card: smoothly reveals and focuses assessment submissions
function showAssessmentSubmissions() {
    console.log(">>> [UI] Showing Assessment Submissions section");
    // Ensure Quizzes panel is active
    switchPanel('quizzes');

    // Scroll to the Assessment Submissions card
    const card = document.getElementById('assessmentSubmissionsCard');
    if (card) {
        card.style.display = 'block';
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        card.classList.remove('card-highlight-pulse');
        void card.offsetWidth; // Trigger reflow for animation restart
        card.classList.add('card-highlight-pulse');
        setTimeout(() => {
            card.classList.remove('card-highlight-pulse');
        }, 4500);
    }

    // Refresh assessment submissions
    loadStudentQuizAttempts();
}

async function loadStudentQuizAttempts() {
    const tableBody = document.getElementById('quizAttemptsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                <div class="loading-spinner" style="font-size: 14px; margin-bottom: 8px;">Loading assessment submissions...</div>
            </td>
        </tr>
    `;

    const currentToken = localStorage.getItem('accessToken') || token;
    let attempts = null;
    let fetchError = null;

    // 1. Try my-attempts with studentId query param if available
    const myAttemptsUrl = '/apiv1/quiz-attempts/my-attempts' + (studentId ? `?studentId=${studentId}` : '');
    try {
        console.log(`>>> [API REQUEST] GET ${myAttemptsUrl}`);
        const res = await fetch(myAttemptsUrl, {
            headers: { 'Authorization': 'Bearer ' + currentToken },
            credentials: 'include'
        });
        if (res.ok) {
            attempts = await res.json();
            console.log("<<< [API RESPONSE SUCCESS] my-attempts:", attempts);
        } else {
            console.warn(`my-attempts returned status ${res.status}`);
        }
    } catch (e) {
        console.warn("my-attempts fetch failed, attempting fallback:", e);
        fetchError = e;
    }

    // 2. Fallback to /apiv1/quiz-attempts?studentId=... if needed
    if (!attempts && studentId) {
        try {
            console.log(`>>> [API REQUEST FALLBACK] GET /apiv1/quiz-attempts?studentId=${studentId}`);
            const fbRes = await fetch(`/apiv1/quiz-attempts?studentId=${studentId}`, {
                headers: { 'Authorization': 'Bearer ' + currentToken },
                credentials: 'include'
            });
            if (fbRes.ok) {
                attempts = await fbRes.json();
                console.log("<<< [API RESPONSE SUCCESS] fallback student attempts:", attempts);
            }
        } catch (e) {
            console.warn("Fallback attempts fetch failed:", e);
            fetchError = e;
        }
    }

    // 3. If still null, try /apiv1/quiz-attempts/my-attempts without parameters as final fallback
    if (!attempts) {
        try {
            const resNoParam = await fetch('/apiv1/quiz-attempts/my-attempts', {
                headers: { 'Authorization': 'Bearer ' + currentToken },
                credentials: 'include'
            });
            if (resNoParam.ok) {
                attempts = await resNoParam.json();
            }
        } catch (e) {
            fetchError = e;
        }
    }

    if (!attempts) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #ef4444; padding: 25px;">
                    <div style="margin-bottom: 8px;">⚠️ Failed to load assessment submissions: ${fetchError ? fetchError.message : 'Unable to connect to server.'}</div>
                    <button type="button" onclick="loadStudentQuizAttempts()" style="background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); color: #a5b4fc; padding: 6px 16px; border-radius: 8px; font-size: 12px; cursor: pointer;">
                        🔄 Try Again
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    // Cache attempts for topic evaluations and syllabus progress
    cachedStudentAttempts = attempts;

    // Calculate aggregate statistics
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

    const statTotal = document.getElementById('statTotalAttempts');
    const statAvg = document.getElementById('statAverageScore');
    const statBest = document.getElementById('statBestScore');
    const statPassed = document.getElementById('statPassedQuizzes');

    if (statTotal) statTotal.textContent = totalAttempts;
    if (statAvg) statAvg.textContent = `${avgScore}%`;
    if (statBest) statBest.textContent = `${bestScore}%`;
    if (statPassed) statPassed.textContent = passedCount;

    if (totalAttempts === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
                    <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 4px;">No Quiz Attempts Yet</div>
                    <div style="font-size: 13px;">Navigate to the Syllabus Tracker to start practicing topic quizzes!</div>
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
                <td style="padding: 14px; font-weight: 600; color: #ffffff;">${escapeHtml(att.quizTitle || 'Practice Quiz')}</td>
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
                    <button type="button" onclick="viewPastQuizAttempt(${att.attemptId})" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.35); color: #c4b5fd; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        👁️ Review Answers
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function viewPastQuizAttempt(attemptId) {
    const modal = document.getElementById('quizModal');
    const content = document.getElementById('quizModalContent');
    if (!modal || !content) return;

    modal.style.display = 'flex';
    content.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="loading-spinner">Loading attempt report...</div>
        </div>
    `;

    const currentToken = localStorage.getItem('accessToken') || token;
    try {
        const res = await fetch(`/apiv1/quiz-attempts/${attemptId}`, {
            headers: { 'Authorization': 'Bearer ' + currentToken },
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch attempt details');
        const attempt = await res.json();
        renderQuizAttemptResults(attempt, 'Quiz Assessment', attempt.quizTitle || 'Topic Quiz');
    } catch (err) {
        content.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #ef4444;">
                <p>Failed to load attempt: ${err.message}</p>
                <button type="button" onclick="closeQuizModal()" style="margin-top: 15px; padding: 8px 18px; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; border: none; cursor: pointer;">Close</button>
            </div>
        `;
    }
}

function closeQuizModal() {
    if (currentQuizState && currentQuizState.timerInterval) {
        clearInterval(currentQuizState.timerInterval);
    }
    const modal = document.getElementById('quizModal');
    if (modal) modal.style.display = 'none';
}

