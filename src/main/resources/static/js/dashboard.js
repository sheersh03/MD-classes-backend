const token = localStorage.getItem('accessToken');
const userJson = localStorage.getItem('user');

if (!token || !userJson) {
    logout();
}

const user = JSON.parse(userJson);

document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = user.role;
document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

const badge = document.getElementById('userRole');
if (user.role === 'ADMIN') {
    badge.style.background = 'var(--role-admin)';
    badge.style.color = 'white';
} else if (user.role === 'TEACHER') {
    badge.style.background = 'var(--role-teacher)';
    badge.style.color = 'white';
} else if (user.role === 'STUDENT') {
    badge.style.background = 'var(--role-student)';
    badge.style.color = 'white';
} else {
    badge.style.background = 'var(--role-parent)';
    badge.style.color = 'white';
}

if (user.role === 'ADMIN') {
    document.getElementById('createStudentSection').style.display = 'block';
}

function switchPanel(panel) {
    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links .nav-btn').forEach(b => b.classList.remove('active'));

    if (panel === 'overview') {
        document.getElementById('overviewNavBtn').classList.add('active');
        document.getElementById('overviewPanel').classList.add('active');
    } else if (panel === 'students') {
        document.getElementById('studentsNavBtn').classList.add('active');
        document.getElementById('studentsPanel').classList.add('active');
        loadStudents();
    } else if (panel === 'syllabus-progress') {
        document.getElementById('syllabusNavBtn').classList.add('active');
        document.getElementById('syllabusProgressPanel').classList.add('active');
        loadSubjectDropdowns().then(() => {
            loadProgressList();
        });
        loadCurriculum();
    } else if (panel === 'fees-tracker') {

        document.getElementById('feesNavBtn').classList.add('active');
        document.getElementById('feesTrackerPanel').classList.add('active');
        loadFeesList();
    }
}

function showToast(msg, isSuccess = true) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(220, 38, 38, 0.95)';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

async function loadStudents() {
    const tbody = document.getElementById('studentTableBody');
    const secAlert = document.getElementById('secAlert');
    const tableSec = document.getElementById('studentTableSection');
    
    secAlert.style.display = 'none';
    tableSec.style.display = 'block';
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Loading students...</td></tr>';

    try {
        console.log(">>> [API REQUEST] GET /apiv1/students?page=0&size=50");
        const response = await fetch('/apiv1/students?page=0&size=50', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        console.log("<<< [API RESPONSE STATUS]:", response.status, response.statusText);

        if (response.status === 403) {
            console.error("<<< [API RESPONSE FORBIDDEN]");
            throw new Error('Access Denied (403): Spring Security has blocked this request. Your role (' + user.role + ') is not permitted to list all students.');
        }
        
        if (!response.ok) {
            console.error("<<< [API RESPONSE ERROR]");
            throw new Error('Failed to load students. Status: ' + response.status);
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);
        const studentsList = data.content || [];

        if (studentsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-secondary);">No enrolled students found.</td></tr>';
            return;
        }

        tbody.innerHTML = studentsList.map(s => `
            <tr>
                <td>${s.id}</td>
                <td style="font-weight: 600;">${s.name}</td>
                <td>${s.email}</td>
                <td><code style="background: rgba(139, 92, 246, 0.1); color: #c084fc; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 13px;">${s.password || 'N/A'}</code></td>
                <td>${s.phone || 'N/A'}</td>
                <td>${s.course || 'N/A'}</td>
                <td><span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px;">${s.batchId || 'N/A'}</span></td>
                <td><span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 8px; border-radius: 6px; font-weight: 600;">${s.studentClass || 'N/A'}</span></td>
                <td>
                    ${user.role === 'ADMIN' ? `
                        <div style="display: flex; gap: 6px;">
                            <button class="action-btn-mini edit-btn" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--accent-primary)'; this.style.color='white';" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.color='#c084fc';" onclick="openEditModal(${s.id}, '${s.name.replace(/'/g, "\\'")}', '${s.email.replace(/'/g, "\\'")}', '${(s.phone || '').replace(/'/g, "\\'")}', '${(s.course || '').replace(/'/g, "\\'")}', '${(s.batchId || '').replace(/'/g, "\\'")}', '${(s.studentClass || '').replace(/'/g, "\\'")}')">Edit</button>
                            <button class="action-btn-mini edit-btn" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--role-parent)'; this.style.color='white';" onmouseout="this.style.background='rgba(245, 158, 11, 0.2)'; this.style.color='#f59e0b';" onclick="openFeeModal(${s.id}, '${s.name.replace(/'/g, "\\'")}', '${s.email.replace(/'/g, "\\'")}')">Fees</button>
                        </div>
                    ` : '<span style="color: var(--text-secondary); font-size: 13px;">No actions</span>'}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #f87171;">Failed to load data. See message above.</td></tr>';
        secAlert.style.display = 'block';
        document.getElementById('secAlertMsg').textContent = err.message;
        tableSec.style.display = 'none';
    }
}

document.getElementById('createStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    submitBtn.textContent = 'Enrolling...';
    submitBtn.disabled = true;

    const payload = {
        name: document.getElementById('stdName').value.trim(),
        email: document.getElementById('stdEmail').value.trim(),
        password: document.getElementById('stdPassword').value,
        phone: document.getElementById('stdPhone').value.trim(),
        course: document.getElementById('stdCourse').value.trim(),
        batchId: document.getElementById('stdBatch').value.trim(),
        studentClass: document.getElementById('stdClass').value.trim()
    };

    try {
        console.log(">>> [API REQUEST] POST /apiv1/students");
        console.log("Request Payload:", payload);

        const response = await fetch('/apiv1/students', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        console.log("<<< [API RESPONSE STATUS]:", response.status, response.statusText);

        if (response.status === 403) {
            console.error("<<< [API RESPONSE FORBIDDEN]");
            throw new Error('Access Denied (403): Spring Security has blocked this request. Only ADMIN role can register new students.');
        }

        if (!response.ok) {
            const err = await response.json();
            console.error("<<< [API RESPONSE ERROR PAYLOAD]:", err);
            let errMsg = err.message || 'Failed to create student record';
            const fErrors = err.fieldErrors || err.fields;
            if (fErrors && fErrors.length > 0) {
                const fieldErrors = fErrors.map(f => `${f.field}: ${f.message}`).join(', ');
                errMsg = `Validation failed: ${fieldErrors}`;
            }
            throw new Error(errMsg);
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        showToast('Student enrolled successfully!', true);
        e.target.reset();
        loadStudents();
    } catch (err) {
        showToast(err.message, false);
    } finally {
        submitBtn.textContent = 'Enroll Student';
        submitBtn.disabled = false;
    }
});

function openEditModal(id, name, email, phone, course, batchId, studentClass) {
    document.getElementById('editStdId').value = id;
    document.getElementById('editStdName').value = name;
    document.getElementById('editStdEmail').value = email;
    document.getElementById('editStdPhone').value = phone === 'N/A' ? '' : phone;
    document.getElementById('editStdCourse').value = course === 'N/A' ? '' : course;
    document.getElementById('editStdBatch').value = batchId === 'N/A' ? '' : batchId;
    document.getElementById('editStdClass').value = studentClass === 'N/A' ? '' : studentClass;
    document.getElementById('editStdPassword').value = '';

    document.getElementById('editStudentModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editStudentModal').classList.remove('active');
}

document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editStdId').value;
    const name = document.getElementById('editStdName').value;
    const phone = document.getElementById('editStdPhone').value;
    const course = document.getElementById('editStdCourse').value;
    const batchId = document.getElementById('editStdBatch').value;
    const studentClass = document.getElementById('editStdClass').value;
    const password = document.getElementById('editStdPassword').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    const payload = { name, phone, course, batchId, studentClass };
    if (password && password.trim().length >= 8) {
        payload.password = password;
    } else if (password && password.trim().length > 0) {
        showToast('Password must be at least 8 characters long', false);
        submitBtn.textContent = 'Save Changes';
        submitBtn.disabled = false;
        return;
    }

    try {
        console.log(`>>> [API REQUEST] PUT /apiv1/students/${id}`);
        const response = await fetch(`/apiv1/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update student profile');
        }

        showToast('Student profile updated successfully!', true);
        closeEditModal();
        loadStudents();
    } catch (err) {
        showToast(err.message, false);
    } finally {
        submitBtn.textContent = 'Save Changes';
        submitBtn.disabled = false;
    }
});

let cachedSubjectsList = [];

async function loadSubjectDropdowns() {
    try {
        const response = await fetch('/apiv1/subjects', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) return;
        cachedSubjectsList = await response.json();

        const progSubSelect = document.getElementById('progSubject');
        if (progSubSelect) {
            const currentVal = progSubSelect.value;
            progSubSelect.innerHTML = '<option value="">Select Subject</option>' + 
                cachedSubjectsList.map(s => `<option value="${s.subjectName}">${s.subjectName}</option>`).join('');
            if (currentVal && cachedSubjectsList.some(s => s.subjectName === currentVal)) {
                progSubSelect.value = currentVal;
            }
        }

        const filterSubSelect = document.getElementById('filterSubject');
        if (filterSubSelect) {
            const currentVal = filterSubSelect.value;
            filterSubSelect.innerHTML = '<option value="">Select Subject</option>' + 
                cachedSubjectsList.map(s => `<option value="${s.subjectName}">${s.subjectName}</option>`).join('');
            if (currentVal && cachedSubjectsList.some(s => s.subjectName === currentVal)) {
                filterSubSelect.value = currentVal;
            } else if (cachedSubjectsList.length > 0) {
                filterSubSelect.value = cachedSubjectsList[0].subjectName;
            }
        }
    } catch (e) {
        console.error("Failed to load subjects:", e);
    }
}

function onProgSubjectChanged() {
    const subName = document.getElementById('progSubject').value;
    const unitSelect = document.getElementById('progUnit');
    const topicsChipGroup = document.getElementById('availableTopicsGroup');
    const topicsChips = document.getElementById('availableTopicsChips');

    unitSelect.innerHTML = '<option value="">Select Unit / Chapter</option>';
    topicsChipGroup.style.display = 'none';
    topicsChips.innerHTML = '';

    if (!subName) return;

    const sub = cachedSubjectsList.find(s => s.subjectName === subName);
    if (!sub || !sub.units || sub.units.length === 0) {
        unitSelect.innerHTML = '<option value="">No units defined for this subject</option>';
        return;
    }

    unitSelect.innerHTML = '<option value="">Select Unit / Chapter</option>' + 
        sub.units.map(u => `<option value="${u.unitId}">${u.unitName}</option>`).join('');
}

function onProgUnitChanged() {
    const subName = document.getElementById('progSubject').value;
    const unitId = parseInt(document.getElementById('progUnit').value);
    const topicsChipGroup = document.getElementById('availableTopicsGroup');
    const topicsChips = document.getElementById('availableTopicsChips');

    topicsChipGroup.style.display = 'none';
    topicsChips.innerHTML = '';

    if (!unitId || !subName) return;

    const sub = cachedSubjectsList.find(s => s.subjectName === subName);
    if (!sub || !sub.units) return;

    const unit = sub.units.find(u => u.unitId === unitId);
    if (!unit || !unit.topics || unit.topics.length === 0) {
        topicsChips.innerHTML = '<span style="color: var(--text-secondary); font-size: 13px;">No topics defined under this unit yet.</span>';
        topicsChipGroup.style.display = 'block';
        return;
    }

    topicsChipGroup.style.display = 'block';
    topicsChips.innerHTML = unit.topics.map(t => {
        const safeName = t.topicName.replace(/'/g, "\\'");
        return `<button type="button" class="topic-chip" onclick="toggleTopicChip('${safeName}', this)" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: #c4b5fd; padding: 5px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
            + ${t.topicName}
        </button>`;
    }).join('');
}

function toggleTopicChip(topicName, btn) {
    const input = document.getElementById('progTopics');
    let currentTopics = input.value ? input.value.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    if (currentTopics.includes(topicName)) {
        currentTopics = currentTopics.filter(t => t !== topicName);
        btn.style.background = 'rgba(139, 92, 246, 0.15)';
        btn.style.color = '#c4b5fd';
        btn.textContent = '+ ' + topicName;
    } else {
        currentTopics.push(topicName);
        btn.style.background = '#8b5cf6';
        btn.style.color = '#ffffff';
        btn.textContent = '✓ ' + topicName;
    }
    input.value = currentTopics.join(', ');
}

let cachedTeacherTopicProgress = [];
let cachedTeacherWeeklySyllabus = [];
let activeCurriculumClass = 'Class 10';
let activeUnitStatusFilter = 'ALL';

function onCurriculumClassChanged() {
    const sel = document.getElementById('curriculumClassSelect');
    if (sel) {
        activeCurriculumClass = sel.value;
    }
    loadCurriculum();
}

function setCurriculumUnitFilter(filter) {
    activeUnitStatusFilter = filter;
    ['ALL', 'IN_PROGRESS', 'COMPLETED', 'NOT_STARTED'].forEach(f => {
        const btnId = f === 'ALL' ? 'filterUnitAll' :
                      f === 'IN_PROGRESS' ? 'filterUnitInProgress' :
                      f === 'COMPLETED' ? 'filterUnitCompleted' : 'filterUnitNotStarted';
        const b = document.getElementById(btnId);
        if (b) {
            if (f === filter) b.classList.add('active');
            else b.classList.remove('active');
        }
    });
    renderCurriculumTree();
}

async function loadCurriculum() {
    const container = document.getElementById('curriculumTreeView');
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner">Loading curriculum and syllabus status...</div>';

    try {
        const [subRes, progRes, syllRes] = await Promise.allSettled([
            fetch('/apiv1/subjects', {
                headers: { 'Authorization': 'Bearer ' + token }
            }),
            fetch('/apiv1/student-topic-progress', {
                headers: { 'Authorization': 'Bearer ' + token }
            }),
            fetch(`/apiv1/syllabus-progress?studentClass=${encodeURIComponent(activeCurriculumClass)}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
        ]);

        if (subRes.status === 'fulfilled' && subRes.value.ok) {
            cachedSubjectsList = await subRes.value.json();
        } else {
            throw new Error('Failed to load curriculum subjects');
        }

        if (progRes.status === 'fulfilled' && progRes.value.ok) {
            cachedTeacherTopicProgress = await progRes.value.json();
        } else {
            cachedTeacherTopicProgress = [];
        }

        if (syllRes.status === 'fulfilled' && syllRes.value.ok) {
            cachedTeacherWeeklySyllabus = await syllRes.value.json();
        } else {
            cachedTeacherWeeklySyllabus = [];
        }

        renderCurriculumTree();
    } catch (e) {
        container.innerHTML = `<div style="color: #ef4444; padding: 15px;">Error loading curriculum: ${e.message}</div>`;
    }
}

function renderCurriculumTree() {
    const container = document.getElementById('curriculumTreeView');
    if (!container) return;

    if (!cachedSubjectsList || cachedSubjectsList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary); border: 1px dashed var(--border-color); border-radius: 12px;">
                <p style="margin-bottom: 12px; font-size: 15px;">No subjects defined yet in the database.</p>
                <button type="button" class="action-btn" onclick="openAddSubjectModal()" style="font-size: 13px; padding: 8px 16px;">Create First Subject</button>
            </div>
        `;
        return;
    }

    // Build set of covered topics from weekly progress records
    const coveredWeeklyTopicsSet = new Set();
    cachedTeacherWeeklySyllabus.forEach(wp => {
        if (wp.topicsCovered) {
            wp.topicsCovered.split(',').forEach(item => {
                const clean = item.trim().toLowerCase();
                if (clean) coveredWeeklyTopicsSet.add(clean);
            });
        }
    });

    // Compute curriculum-wide syllabus metrics
    let totalUnitsCount = 0;
    let completedUnitsCount = 0;
    let inProgressUnitsCount = 0;
    let notStartedUnitsCount = 0;
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;
    let totalProgressSum = 0;

    cachedSubjectsList.forEach(s => {
        const units = s.units || [];
        totalUnitsCount += units.length;
        units.forEach(u => {
            const uTopics = u.topics || [];
            totalTopicsCount += uTopics.length;
            let uSum = 0;
            let uDone = 0;

            uTopics.forEach(t => {
                const match = cachedTeacherTopicProgress.find(p => p.topicId === t.topicId || (p.topic && p.topic.topicId === t.topicId));
                let pct = 0;
                if (match) {
                    pct = match.progressPercentage != null ? match.progressPercentage : (match.completed ? 100 : 0);
                } else if (coveredWeeklyTopicsSet.has(t.topicName.trim().toLowerCase())) {
                    pct = 100;
                }
                uSum += pct;
                totalProgressSum += pct;
                if (pct >= 100) {
                    uDone++;
                    completedTopicsCount++;
                }
            });

            const uPct = uTopics.length > 0 ? Math.round(uSum / uTopics.length) : 0;
            if (uPct >= 100 || (uDone === uTopics.length && uTopics.length > 0)) {
                completedUnitsCount++;
            } else if (uPct > 0) {
                inProgressUnitsCount++;
            } else {
                notStartedUnitsCount++;
            }
        });
    });

    // Render live Curriculum Syllabus Summary Banner
    const banner = document.getElementById('curriculumSummaryBanner');
    if (banner) {
        const overallPct = totalTopicsCount > 0 ? Math.round(totalProgressSum / totalTopicsCount) : 0;
        banner.innerHTML = `
            <div class="curriculum-summary-item">
                <span class="curriculum-summary-label">Target Class</span>
                <span class="curriculum-summary-value" style="color: var(--accent-primary); font-size: 16px;">🎓 ${activeCurriculumClass}</span>
            </div>
            <div class="curriculum-summary-item">
                <span class="curriculum-summary-label">Overall Syllabus Coverage</span>
                <span class="curriculum-summary-value" style="color: #34d399; font-size: 16px;">💧 ${overallPct}% Complete</span>
            </div>
            <div class="curriculum-summary-item">
                <span class="curriculum-summary-label">Units Breakdown</span>
                <span class="curriculum-summary-value" style="font-size: 13px; font-weight: 600; line-height: 1.4;">
                    <span style="color: #34d399;">✓ ${completedUnitsCount} Completed</span> • 
                    <span style="color: #38bdf8;">⏳ ${inProgressUnitsCount} In Progress</span> • 
                    <span style="color: #94a3b8;">○ ${notStartedUnitsCount} Pending</span>
                </span>
            </div>
            <div class="curriculum-summary-item">
                <span class="curriculum-summary-label">Curricular Topics</span>
                <span class="curriculum-summary-value" style="font-size: 16px;">${completedTopicsCount} / ${totalTopicsCount} Topics</span>
            </div>
        `;
    }

    // Render Subjects and Units hierarchy
    container.innerHTML = cachedSubjectsList.map(s => {
        const units = s.units || [];
        const filteredUnits = units.filter(u => {
            if (activeUnitStatusFilter === 'ALL') return true;
            const uTopics = u.topics || [];
            let uSum = 0;
            let uDone = 0;
            uTopics.forEach(t => {
                const match = cachedTeacherTopicProgress.find(p => p.topicId === t.topicId || (p.topic && p.topic.topicId === t.topicId));
                let pct = match ? (match.progressPercentage != null ? match.progressPercentage : (match.completed ? 100 : 0)) : (coveredWeeklyTopicsSet.has(t.topicName.trim().toLowerCase()) ? 100 : 0);
                uSum += pct;
                if (pct >= 100) uDone++;
            });
            const uPct = uTopics.length > 0 ? Math.round(uSum / uTopics.length) : 0;
            if (activeUnitStatusFilter === 'COMPLETED') return uPct >= 100 || (uDone === uTopics.length && uTopics.length > 0);
            if (activeUnitStatusFilter === 'IN_PROGRESS') return uPct > 0 && uPct < 100;
            if (activeUnitStatusFilter === 'NOT_STARTED') return uPct === 0;
            return true;
        });

        const unitsHtml = (units.length > 0) ? (
            filteredUnits.length > 0 ? filteredUnits.map(u => {
                const uTopics = u.topics || [];
                let unitProgressSum = 0;
                let completedCount = 0;
                let inProgressCount = 0;

                const topicsHtml = (uTopics.length > 0) ? uTopics.map(t => {
                    const match = cachedTeacherTopicProgress.find(p => p.topicId === t.topicId || (p.topic && p.topic.topicId === t.topicId));
                    let tPct = 0;
                    let tStatus = 'Not_Started';

                    if (match) {
                        tPct = match.progressPercentage != null ? match.progressPercentage : (match.completed ? 100 : 0);
                        tStatus = match.status || (tPct >= 100 ? 'Completed' : (tPct > 0 ? 'In_Progress' : 'Not_Started'));
                    } else if (coveredWeeklyTopicsSet.has(t.topicName.trim().toLowerCase())) {
                        tPct = 100;
                        tStatus = 'Completed';
                    }

                    unitProgressSum += tPct;
                    if (tPct >= 100 || tStatus === 'Completed') {
                        completedCount++;
                    } else if (tPct > 0) {
                        inProgressCount++;
                    }

                    const isDone = tPct >= 100 || tStatus === 'Completed';
                    const isInProg = !isDone && tPct > 0;
                    const safeTopicName = t.topicName.replace(/'/g, "\\'");
                    const safeSubName = s.subjectName.replace(/'/g, "\\'");

                    let chipClass = 'topic-syllabus-chip';
                    let statusIcon = '○';
                    let statusColor = '#94a3b8';
                    let nextStatusAction = '100% Complete';

                    if (isDone) {
                        chipClass += ' is-completed';
                        statusIcon = '✓';
                        statusColor = '#34d399';
                        nextStatusAction = 'Reset to 0%';
                    } else if (isInProg) {
                        chipClass += ' is-inprogress';
                        statusIcon = '⏳';
                        statusColor = '#38bdf8';
                        nextStatusAction = 'Complete (100%)';
                    }

                    return `
                        <div class="${chipClass}">
                            <span style="font-weight: 600; color: ${statusColor};">${statusIcon}</span>
                            <span style="color: var(--text-primary); font-weight: 500;">${t.topicName}</span>
                            <span style="font-size: 11px; font-weight: 700; color: ${statusColor}; background: rgba(255, 255, 255, 0.05); padding: 2px 6px; border-radius: 6px;">${tPct}%</span>
                            
                            <button type="button" class="topic-status-toggle-btn" onclick="cycleTopicProgress(${t.topicId}, ${tPct})" title="Click to cycle syllabus status (${nextStatusAction})">
                                ${isDone ? 'Undo' : (isInProg ? 'Done' : 'Start')}
                            </button>
                            
                            <button type="button" onclick="quickFillWeeklyTopic('${safeTopicName}', '${safeSubName}', ${u.unitId})" style="background: none; border: none; color: #c4b5fd; cursor: pointer; padding: 0 3px; font-size: 12px;" title="Insert into Weekly Progress Form">📝</button>
                            <button type="button" onclick="deleteTopic(${t.topicId})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0 3px; font-size: 14px; line-height: 1;" title="Delete Topic">&times;</button>
                        </div>
                    `;
                }).join('') : '<span style="color: var(--text-secondary); font-size: 12px; font-style: italic;">No topics added to this unit yet.</span>';

                const unitPct = uTopics.length > 0 ? Math.round(unitProgressSum / uTopics.length) : 0;
                const safeUnitName = u.unitName.replace(/'/g, "\\'");

                // Determine unit syllabus status badge
                let unitStatusBadge = '';
                if (unitPct >= 100 || (completedCount === uTopics.length && uTopics.length > 0)) {
                    unitStatusBadge = '<span class="syllabus-status-badge status-completed">✓ Completed</span>';
                } else if (unitPct > 0) {
                    unitStatusBadge = `<span class="syllabus-status-badge status-inprogress">⏳ In Progress (${unitPct}%)</span>`;
                } else {
                    unitStatusBadge = '<span class="syllabus-status-badge status-notstarted">○ Not Started</span>';
                }

                return `
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; margin-top: 10px; transition: border-color 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary);">📁 Unit: ${u.unitName}</span>
                                ${unitStatusBadge}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <div class="unit-fluid-stats">
                                    <span class="unit-fluid-badge">
                                        <span class="fluid-droplet">💧</span>
                                        <strong>${unitPct}%</strong>
                                    </span>
                                    <span class="unit-topics-count">${completedCount} / ${uTopics.length} Topics</span>
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <button type="button" class="unit-action-btn btn-complete" onclick="markUnitProgress(${u.unitId}, 100)" title="Mark entire unit as Completed (100%)">⚡ Complete</button>
                                    <button type="button" class="unit-action-btn btn-reset" onclick="markUnitProgress(${u.unitId}, 0)" title="Reset unit to Not Started (0%)">🔄 Reset</button>
                                    <button type="button" class="unit-action-btn btn-add" onclick="openAddTopicModal(${u.unitId}, '${safeUnitName}')">+ Topic</button>
                                    <button type="button" class="unit-action-btn btn-del" onclick="deleteUnit(${u.unitId})">Delete</button>
                                </div>
                            </div>
                        </div>

                        <!-- Thin Cylindrical Line with Dynamic Liquid Fluid -->
                        <div class="unit-cylinder-tube" title="Unit Progress: ${unitPct}%">
                            <div class="unit-cylinder-fluid" style="width: ${unitPct}%;"></div>
                        </div>

                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                            ${topicsHtml}
                        </div>
                    </div>
                `;
            }).join('') : `<p style="color: var(--text-secondary); font-size: 13px; font-style: italic; margin-top: 8px; padding: 10px;">No units match filter "${activeUnitStatusFilter}".</p>`
        ) : '<p style="color: var(--text-secondary); font-size: 13px; font-style: italic; margin-top: 8px;">No units created yet for this subject.</p>';

        const safeSubjectName = s.subjectName.replace(/'/g, "\\'");
        return `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 14px; padding: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <span style="font-size: 16px; font-weight: 700; color: var(--accent-primary);">📚 ${s.subjectName}</span>
                        <span style="font-size: 12px; color: var(--text-secondary); margin-left: 8px;">(${units.length} Units)</span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" onclick="openAddUnitModal(${s.subjectId}, '${safeSubjectName}')" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: #a78bfa; padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">+ Add Unit</button>
                        <button type="button" onclick="deleteSubject(${s.subjectId})" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 5px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">Delete</button>
                    </div>
                </div>
                <div>
                    ${unitsHtml}
                </div>
            </div>
        `;
    }).join('');
}

async function markUnitProgress(unitId, percentage) {
    try {
        const url = `/apiv1/student-topic-progress/unit/${unitId}?percentage=${percentage}&studentClass=${encodeURIComponent(activeCurriculumClass)}`;
        console.log(`>>> [API REQUEST] PUT ${url}`);
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update unit syllabus progress');
        }

        showToast(percentage >= 100 ? 'Unit marked as Completed! Syllabus status updated.' : 'Unit reset to 0% (Not Started).', true);
        loadCurriculum();
    } catch (e) {
        showToast(e.message, false);
    }
}

async function cycleTopicProgress(topicId, currentPct) {
    let nextPct = 100;
    let nextStatus = 'Completed';
    if (currentPct >= 100) {
        nextPct = 0;
        nextStatus = 'Not_Started';
    } else if (currentPct > 0) {
        nextPct = 100;
        nextStatus = 'Completed';
    } else {
        nextPct = 100;
        nextStatus = 'Completed';
    }

    try {
        const url = `/apiv1/student-topic-progress?studentClass=${encodeURIComponent(activeCurriculumClass)}`;
        console.log(`>>> [API REQUEST] PUT ${url} (topicId=${topicId}, pct=${nextPct})`);
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                topicId: topicId,
                progressPercentage: nextPct,
                status: nextStatus
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update topic syllabus progress');
        }

        showToast(nextPct >= 100 ? 'Topic marked as Completed!' : 'Topic reset to Not Started.', true);
        loadCurriculum();
    } catch (e) {
        showToast(e.message, false);
    }
}

function quickFillWeeklyTopic(topicName, subjectName, unitId) {
    const classSel = document.getElementById('progClass');
    const subSel = document.getElementById('progSubject');
    const topicsInput = document.getElementById('progTopics');
    
    if (classSel) classSel.value = activeCurriculumClass;
    if (subSel) {
        subSel.value = subjectName;
        onProgSubjectChanged();
        const unitSel = document.getElementById('progUnit');
        if (unitSel && unitId) {
            unitSel.value = unitId;
            onProgUnitChanged();
        }
    }
    
    if (topicsInput) {
        let current = topicsInput.value ? topicsInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (!current.includes(topicName)) {
            current.push(topicName);
            topicsInput.value = current.join(', ');
        }
    }

    // Scroll to the update weekly progress form smoothly
    const formCard = document.getElementById('updateSyllabusForm');
    if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast(`Added "${topicName}" to Weekly Progress form!`, true);
}

function openAddSubjectModal() {
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.getElementById('newSubjectName').value = '';
        setTimeout(() => document.getElementById('newSubjectName').focus(), 50);
    }
}
function closeAddSubjectModal() {
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openAddUnitModal(subjectId, subjectName) {
    const modal = document.getElementById('addUnitModal');
    if (modal) {
        document.getElementById('unitTargetSubjectId').value = subjectId;
        document.getElementById('addUnitModalTitle').textContent = `Add Unit to ${subjectName}`;
        document.getElementById('newUnitName').value = '';
        modal.classList.add('active');
        modal.style.display = 'flex';
        setTimeout(() => document.getElementById('newUnitName').focus(), 50);
    }
}
function closeAddUnitModal() {
    const modal = document.getElementById('addUnitModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function openAddTopicModal(unitId, unitName) {
    const modal = document.getElementById('addTopicModal');
    if (modal) {
        document.getElementById('topicTargetUnitId').value = unitId;
        document.getElementById('addTopicModalTitle').textContent = `Add Topic to ${unitName}`;
        document.getElementById('newTopicName').value = '';
        modal.classList.add('active');
        modal.style.display = 'flex';
        setTimeout(() => document.getElementById('newTopicName').focus(), 50);
    }
}
function closeAddTopicModal() {
    const modal = document.getElementById('addTopicModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

async function deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this Subject and all its units/topics?')) return;
    try {
        const res = await fetch(`/apiv1/subjects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Failed to delete subject');
        showToast('Subject deleted successfully', true);
        loadSubjectDropdowns();
        loadCurriculum();
    } catch (e) {
        showToast(e.message, false);
    }
}

async function deleteUnit(id) {
    if (!confirm('Are you sure you want to delete this Unit and all its topics?')) return;
    try {
        const res = await fetch(`/apiv1/units/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Failed to delete unit');
        showToast('Unit deleted successfully', true);
        loadSubjectDropdowns();
        loadCurriculum();
    } catch (e) {
        showToast(e.message, false);
    }
}

async function deleteTopic(id) {
    if (!confirm('Are you sure you want to delete this Topic?')) return;
    try {
        const res = await fetch(`/apiv1/topics/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Failed to delete topic');
        showToast('Topic deleted successfully', true);
        loadSubjectDropdowns();
        loadCurriculum();
    } catch (e) {
        showToast(e.message, false);
    }
}

async function loadProgressList() {
    const tbody = document.getElementById('progressListTableBody');
    if (!tbody) return;

    const studentClass = document.getElementById('filterClass').value;
    const subject = document.getElementById('filterSubject').value;

    if (!studentClass || !subject) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 20px;">Please select both Class and Subject.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading progress...</td></tr>';

    try {
        console.log(`>>> [API REQUEST] GET /apiv1/syllabus-progress?studentClass=${encodeURIComponent(studentClass)}&subject=${encodeURIComponent(subject)}`);
        const response = await fetch(`/apiv1/syllabus-progress?studentClass=${encodeURIComponent(studentClass)}&subject=${encodeURIComponent(subject)}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            throw new Error('Failed to load syllabus progress list');
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 20px;">No weekly syllabus progress has been recorded for this selection.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(p => {
            const milestoneText = p.isMilestone ? 
                '<span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">🏆 Milestone Flag</span>' : 
                '<span style="color: var(--text-secondary); font-size: 12px;">--</span>';
            
            const lastUpdated = new Date(p.updatedAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            return `
                <tr style="border-bottom: 1px solid var(--border-color); font-size: 14px;">
                    <td style="padding: 14px 16px; font-weight: 700;">Week ${p.weekNumber}</td>
                    <td style="padding: 14px 16px; color: var(--text-secondary); max-width: 250px; white-space: normal; word-break: break-word;">${p.topicsCovered || 'N/A'}</td>
                    <td style="padding: 14px 16px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="background: rgba(255,255,255,0.05); border-radius: 10px; height: 8px; width: 80px;">
                                <div style="background: var(--accent-primary); width: ${p.percentCompleted}%; height: 100%; border-radius: 10px;"></div>
                            </div>
                            <span style="font-weight: 600; font-size: 13px;">${p.percentCompleted}%</span>
                        </div>
                    </td>
                    <td style="padding: 14px 16px;">${milestoneText}</td>
                    <td style="padding: 14px 16px; color: var(--text-secondary); font-size: 12px;">${lastUpdated}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        showToast(err.message, false);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">Error: ${err.message}</td></tr>`;
    }
}

// Bind updateSyllabusForm and Curriculum modals handlers
const syllabusForm = document.getElementById('updateSyllabusForm');
if (syllabusForm) {
    syllabusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentClass = document.getElementById('progClass').value;
        const subject = document.getElementById('progSubject').value;
        const weekNumber = parseInt(document.getElementById('progWeek').value);
        const percentCompleted = parseInt(document.getElementById('progPercent').value);
        const isMilestone = document.getElementById('progMilestone').checked;
        const topicsCovered = document.getElementById('progTopics').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        const payload = { studentClass, subject, weekNumber, percentCompleted, isMilestone, topicsCovered };

        try {
            console.log(">>> [API REQUEST] PUT /apiv1/syllabus-progress");
            const response = await fetch('/apiv1/syllabus-progress', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                let errMsg = err.message || 'Failed to update syllabus progress';
                const fErrors = err.fieldErrors || err.fields;
                if (fErrors && fErrors.length > 0) {
                    const fieldErrors = fErrors.map(f => `${f.field}: ${f.message}`).join(', ');
                    errMsg = `Validation failed: ${fieldErrors}`;
                }
                throw new Error(errMsg);
            }

            showToast(`Syllabus progress for Week ${weekNumber} saved successfully!`, true);
            e.target.reset();
            document.getElementById('filterClass').value = studentClass;
            document.getElementById('filterSubject').value = subject;
            document.getElementById('availableTopicsGroup').style.display = 'none';
            loadProgressList();
        } catch (err) {
            showToast(err.message, false);
        } finally {
            submitBtn.textContent = 'Save Progress';
            submitBtn.disabled = false;
        }
    });
}

const addSubForm = document.getElementById('addSubjectForm');
if (addSubForm) {
    addSubForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subjectName = document.getElementById('newSubjectName').value.trim();
        if (!subjectName) return;
        try {
            const res = await fetch('/apiv1/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ subjectName })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to create subject');
            }
            showToast('Subject created successfully!', true);
            closeAddSubjectModal();
            loadSubjectDropdowns();
            loadCurriculum();
        } catch (err) {
            showToast(err.message, false);
        }
    });
}

const addUForm = document.getElementById('addUnitForm');
if (addUForm) {
    addUForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subjectId = parseInt(document.getElementById('unitTargetSubjectId').value);
        const unitName = document.getElementById('newUnitName').value.trim();
        if (!unitName || !subjectId) return;
        try {
            const res = await fetch('/apiv1/units', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ subjectId, unitName })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to add unit');
            }
            showToast('Unit added successfully!', true);
            closeAddUnitModal();
            loadSubjectDropdowns();
            loadCurriculum();
        } catch (err) {
            showToast(err.message, false);
        }
    });
}

const addTForm = document.getElementById('addTopicForm');
if (addTForm) {
    addTForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const unitId = parseInt(document.getElementById('topicTargetUnitId').value);
        const topicName = document.getElementById('newTopicName').value.trim();
        if (!topicName || !unitId) return;
        try {
            const res = await fetch('/apiv1/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ unitId, topicName })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to add topic');
            }
            showToast('Topic added successfully!', true);
            closeAddTopicModal();
            loadSubjectDropdowns();
            loadCurriculum();
        } catch (err) {
            showToast(err.message, false);
        }
    });
}


function logout() {
    localStorage.clear();
    window.location.href = '/login';
}

// Fees Tracker helper functions
async function loadFeesList() {
    const tbody = document.getElementById('feesTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading fee status records...</td></tr>';

    try {
        console.log(">>> [API REQUEST] GET /apiv1/fees");
        const response = await fetch('/apiv1/fees', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve fee records');
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 20px;">No students enrolled yet.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(f => {
            const pending = f.remainingFee;
            let statusBadge = '<span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px;">Paid</span>';
            if (pending > 0) {
                if (f.paidAmount === 0) {
                    statusBadge = '<span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px;">Unpaid</span>';
                } else {
                    statusBadge = '<span style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 12px;">Partial</span>';
                }
            }

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 14px 16px;">${f.studentId}</td>
                    <td style="padding: 14px 16px; font-weight: 600;">${f.studentName}</td>
                    <td style="padding: 14px 16px;">₹${f.totalFee.toLocaleString()}</td>
                    <td style="padding: 14px 16px; color: #10b981;">₹${f.paidAmount.toLocaleString()}</td>
                    <td style="padding: 14px 16px; color: ${pending > 0 ? '#ef4444' : 'var(--text-secondary)'}; font-weight: 700;">₹${pending.toLocaleString()}</td>
                    <td style="padding: 14px 16px;">${statusBadge}</td>
                    <td style="padding: 14px 16px;">
                        <button class="action-btn-mini edit-btn" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--role-parent)'; this.style.color='white';" onmouseout="this.style.background='rgba(245, 158, 11, 0.2)'; this.style.color='#f59e0b';" onclick="openFeeModal(${f.studentId}, '${f.studentName.replace(/'/g, "\\'")}', '')">Manage</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        loadTransactionsList();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 20px;">Error: ${err.message}</td></tr>`;
    }
}

async function loadTransactionsList() {
    const tbody = document.getElementById('txnTableBody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading transactions...</td></tr>';

    try {
        console.log(">>> [API REQUEST] GET /apiv1/fees/transactions");
        const response = await fetch('/apiv1/fees/transactions', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve transactions');
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 20px;">No transactions recorded yet.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(tx => {
            const date = new Date(tx.createdAt).toLocaleString();
            let methodBadge = '';
            if (tx.paymentMethod === 'CARD_ONLINE') {
                methodBadge = '<span style="background: rgba(139, 92, 246, 0.15); color: #c084fc; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11px;">💳 Card Payment</span>';
            } else {
                methodBadge = '<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11px;">✍️ Manual Record</span>';
            }

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 14px 16px;">#${tx.transactionId}</td>
                    <td style="padding: 14px 16px; font-weight: 600;">${tx.studentName}</td>
                    <td style="padding: 14px 16px; color: #10b981; font-weight: 700;">₹${tx.amount.toLocaleString()}</td>
                    <td style="padding: 14px 16px;">${methodBadge}</td>
                    <td style="padding: 14px 16px;"><code style="font-family: monospace; font-size: 12px; opacity: 0.8;">${tx.transactionReference}</code></td>
                    <td style="padding: 14px 16px; font-size: 13px; color: var(--text-secondary);">${date}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 20px;">Error: ${err.message}</td></tr>`;
    }
}

async function openFeeModal(studentId, name, email) {
    const modal = document.getElementById('manageFeesModal');
    document.getElementById('feeStdId').value = studentId;
    document.getElementById('feeStdName').value = name;
    document.getElementById('feeStdEmail').value = email || 'Enrolled Student';

    document.getElementById('feeTotal').value = 0;
    document.getElementById('feePaid').value = 0;
    document.getElementById('feeRemainingText').textContent = '₹0';

    modal.classList.add('active');
    modal.style.display = 'flex';

    try {
        console.log(`>>> [API REQUEST] GET /apiv1/fees/student/${studentId}`);
        const response = await fetch(`/apiv1/fees/student/${studentId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('feeTotal').value = data.totalFee;
            document.getElementById('feePaid').value = data.paidAmount;
            updateRemainingDisplay();
        }
    } catch (err) {
        console.error('Failed to pre-populate student fees:', err);
    }
}

function closeFeeModal() {
    const modal = document.getElementById('manageFeesModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function updateRemainingDisplay() {
    const total = parseInt(document.getElementById('feeTotal').value) || 0;
    const paid = parseInt(document.getElementById('feePaid').value) || 0;
    const remaining = Math.max(0, total - paid);
    document.getElementById('feeRemainingText').textContent = '₹' + remaining.toLocaleString();
}

// Bind live changes for remaining display
const feeTotalInput = document.getElementById('feeTotal');
const feePaidInput = document.getElementById('feePaid');
if (feeTotalInput && feePaidInput) {
    feeTotalInput.addEventListener('input', updateRemainingDisplay);
    feePaidInput.addEventListener('input', updateRemainingDisplay);
}

const manageFeesForm = document.getElementById('manageFeesForm');
if (manageFeesForm) {
    manageFeesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = parseInt(document.getElementById('feeStdId').value);
        const totalFee = parseInt(document.getElementById('feeTotal').value) || 0;
        const paidAmount = parseInt(document.getElementById('feePaid').value) || 0;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        const payload = { studentId, totalFee, paidAmount };

        try {
            console.log(">>> [API REQUEST] PUT /apiv1/fees");
            const response = await fetch('/apiv1/fees', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                let errMsg = err.message || 'Failed to update student fee record';
                const fErrors = err.fieldErrors || err.fields;
                if (fErrors && fErrors.length > 0) {
                    const fieldErrors = fErrors.map(f => `${f.field}: ${f.message}`).join(', ');
                    errMsg = `Validation failed: ${fieldErrors}`;
                }
                throw new Error(errMsg);
            }

            showToast('Student fee record updated successfully!', true);
            closeFeeModal();
            if (document.getElementById('feesTrackerPanel').classList.contains('active')) {
                loadFeesList();
            } else {
                loadStudents();
            }
        } catch (err) {
            showToast(err.message, false);
        } finally {
            submitBtn.textContent = 'Save Fees';
            submitBtn.disabled = false;
        }
    });
}
