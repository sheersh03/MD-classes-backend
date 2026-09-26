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

async function loadCurriculum() {
    const container = document.getElementById('curriculumTreeView');
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner">Loading curriculum hierarchy...</div>';

    try {
        const response = await fetch('/apiv1/subjects', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw new Error('Failed to load curriculum');
        cachedSubjectsList = await response.json();

        if (cachedSubjectsList.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; color: var(--text-secondary); border: 1px dashed var(--border-color); border-radius: 12px;">
                    <p style="margin-bottom: 12px; font-size: 15px;">No subjects defined yet in the database.</p>
                    <button type="button" class="action-btn" onclick="openAddSubjectModal()" style="font-size: 13px; padding: 8px 16px;">Create First Subject</button>
                </div>
            `;
            return;
        }

        container.innerHTML = cachedSubjectsList.map(s => {
            const unitsHtml = (s.units && s.units.length > 0) ? s.units.map(u => {
                const topicsHtml = (u.topics && u.topics.length > 0) ? u.topics.map(t => `
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 16px; padding: 4px 10px; font-size: 12px;">
                        <span>📖 ${t.topicName}</span>
                        <button type="button" onclick="deleteTopic(${t.topicId})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0 2px; font-size: 14px; line-height: 1;" title="Delete Topic">&times;</button>
                    </div>
                `).join('') : '<span style="color: var(--text-secondary); font-size: 12px; font-style: italic;">No topics added to this unit yet.</span>';

                const safeUnitName = u.unitName.replace(/'/g, "\\'");
                return `
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; margin-top: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
                            <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">📁 Unit: ${u.unitName}</span>
                            <div style="display: flex; gap: 6px;">
                                <button type="button" onclick="openAddTopicModal(${u.unitId}, '${safeUnitName}')" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">+ Add Topic</button>
                                <button type="button" onclick="deleteUnit(${u.unitId})" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">Delete</button>
                            </div>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                            ${topicsHtml}
                        </div>
                    </div>
                `;
            }).join('') : '<p style="color: var(--text-secondary); font-size: 13px; font-style: italic; margin-top: 6px;">No units created yet for this subject.</p>';

            const safeSubjectName = s.subjectName.replace(/'/g, "\\'");
            return `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 14px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <span style="font-size: 16px; font-weight: 700; color: var(--accent-primary);">📚 ${s.subjectName}</span>
                            <span style="font-size: 12px; color: var(--text-secondary); margin-left: 8px;">(${s.units ? s.units.length : 0} Units)</span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" onclick="openAddUnitModal(${s.subjectId}, '${safeSubjectName}')" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: #a78bfa; padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">+ Add Unit</button>
                            <button type="button" onclick="deleteSubject(${s.subjectId})" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">Delete</button>
                        </div>
                    </div>
                    <div>
                        ${unitsHtml}
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        container.innerHTML = `<div style="color: #ef4444; padding: 15px;">Error loading curriculum: ${e.message}</div>`;
    }
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
