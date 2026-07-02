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
    const btns = document.querySelectorAll('.nav-btn');
    const panels = document.querySelectorAll('.content-panel');
    
    panels.forEach(p => p.classList.remove('active'));
    btns.forEach(b => b.classList.remove('active'));

    if (panel === 'overview') {
        btns[0].classList.add('active');
        document.getElementById('overviewPanel').classList.add('active');
    } else if (panel === 'students') {
        btns[1].classList.add('active');
        document.getElementById('studentsPanel').classList.add('active');
        loadStudents();
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
                        <button class="action-btn-mini edit-btn" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--accent-primary)'; this.style.color='white';" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.color='#c084fc';" onclick="openEditModal(${s.id}, '${s.name.replace(/'/g, "\\'")}', '${s.email.replace(/'/g, "\\'")}', '${(s.phone || '').replace(/'/g, "\\'")}', '${(s.course || '').replace(/'/g, "\\'")}', '${(s.batchId || '').replace(/'/g, "\\'")}', '${(s.studentClass || '').replace(/'/g, "\\'")}')">Edit</button>
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

function logout() {
    localStorage.clear();
    window.location.href = '/login';
}
