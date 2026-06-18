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
        const response = await fetch('/api/students?page=0&size=50', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.status === 403) {
            throw new Error('Access Denied (403): Spring Security has blocked this request. Your role (' + user.role + ') is not permitted to list all students.');
        }
        
        if (!response.ok) {
            throw new Error('Failed to load students. Status: ' + response.status);
        }

        const data = await response.json();
        const studentsList = data.content || [];

        if (studentsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No enrolled students found.</td></tr>';
            return;
        }

        tbody.innerHTML = studentsList.map(s => `
            <tr>
                <td>${s.id}</td>
                <td style="font-weight: 600;">${s.name}</td>
                <td>${s.email}</td>
                <td>${s.phone || 'N/A'}</td>
                <td>${s.course || 'N/A'}</td>
                <td><span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px;">${s.batchId || 'N/A'}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #f87171;">Failed to load data. See message above.</td></tr>';
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
        batchId: document.getElementById('stdBatch').value
    };

    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 403) {
            throw new Error('Access Denied (403): Spring Security has blocked this request. Only ADMIN role can register new students.');
        }

        if (!response.ok) {
            const err = await response.json();
            let errMsg = err.message || 'Failed to create student record';
            if (err.fields && err.fields.length > 0) {
                const fieldErrors = err.fields.map(f => `${f.field}: ${f.message}`).join(', ');
                errMsg = `Validation failed: ${fieldErrors}`;
            }
            throw new Error(errMsg);
        }

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

function logout() {
    localStorage.clear();
    window.location.href = '/login';
}
