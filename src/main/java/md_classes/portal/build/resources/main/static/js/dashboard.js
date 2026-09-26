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
        loadProgressList();
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
        name: document.getElementById('stdName').value,
        email: document.getElementById('stdEmail').value,
        password: document.getElementById('stdPassword').value,
        phone: document.getElementById('stdPhone').value,
        course: document.getElementById('stdCourse').value,
        batchId: document.getElementById('stdBatch').value,
        studentClass: document.getElementById('stdClass').value
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
            if (err.fields && err.fields.length > 0) {
                const fieldErrors = err.fields.map(f => `${f.field}: ${f.message}`).join(', ');
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

// Bind updateSyllabusForm handler
setTimeout(() => {
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
                    const err = await response.json();
                    let errMsg = err.message || 'Failed to update syllabus progress';
                    if (err.fields && err.fields.length > 0) {
                        const fieldErrors = err.fields.map(f => `${f.field}: ${f.message}`).join(', ');
                        errMsg = `Validation failed: ${fieldErrors}`;
                    }
                    throw new Error(errMsg);
                }

                showToast(`Syllabus progress for Week ${weekNumber} saved successfully!`, true);
                e.target.reset();
                document.getElementById('filterClass').value = studentClass;
                document.getElementById('filterSubject').value = subject;
                loadProgressList();
            } catch (err) {
                showToast(err.message, false);
            } finally {
                submitBtn.textContent = 'Save Progress';
                submitBtn.disabled = false;
            }
        });
    }
}, 500);

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
    document.getElementById('manageFeesModal').style.display = 'none';
}

function updateRemainingDisplay() {
    const total = parseInt(document.getElementById('feeTotal').value) || 0;
    const paid = parseInt(document.getElementById('feePaid').value) || 0;
    const remaining = Math.max(0, total - paid);
    document.getElementById('feeRemainingText').textContent = '₹' + remaining.toLocaleString();
}

// Bind live changes for remaining display
setTimeout(() => {
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
                    const err = await response.json();
                    let errMsg = err.message || 'Failed to update student fee record';
                    if (err.fields && err.fields.length > 0) {
                        const fieldErrors = err.fields.map(f => `${f.field}: ${f.message}`).join(', ');
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
}, 500);
