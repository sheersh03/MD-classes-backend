const savedToken = localStorage.getItem('accessToken');
const savedUser = localStorage.getItem('user');
if (savedToken && savedUser) {
    try {
        const u = JSON.parse(savedUser);
        if (u.role === 'STUDENT') {
            window.location.href = '/student-dashboard';
        } else if (u.role === 'PARENT') {
            window.location.href = '/parent-dashboard';
        } else {
            window.location.href = '/dashboard';
        }
    } catch (e) {
        localStorage.clear();
    }
}

function switchTab(tab) {
    switchPanel(tab);
}

function switchPanel(panel) {
    const panels = document.querySelectorAll('.form-panel');
    const tabsContainer = document.querySelector('.tabs');
    const btns = document.querySelectorAll('.tab-btn');

    panels.forEach(p => p.classList.remove('active'));
    
    if (panel === 'signin') {
        tabsContainer.style.display = 'flex';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
        document.getElementById('signinPanel').classList.add('active');
    } else if (panel === 'register') {
        tabsContainer.style.display = 'flex';
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
        document.getElementById('registerPanel').classList.add('active');
    } else if (panel === 'forgot') {
        tabsContainer.style.display = 'none';
        document.getElementById('forgotPanel').classList.add('active');
        document.getElementById('devTokenBox').style.display = 'none';
        document.getElementById('forgotForm').reset();
    } else if (panel === 'reset') {
        tabsContainer.style.display = 'none';
        document.getElementById('resetPanel').classList.add('active');
    }
}

function showToast(msg, isError = true) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = isError ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
}

document.getElementById('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.textContent = 'Authenticating...';
    submitBtn.disabled = true;

    try {
        const reqPayload = { email, password };
        console.log(">>> [API REQUEST] POST /apiv1/auth/login");
        console.log("Request Payload:", reqPayload);

        const response = await fetch('/apiv1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqPayload)
        });
        
        console.log("<<< [API RESPONSE STATUS]:", response.status, response.statusText);
        
        if (!response.ok) {
            const err = await response.json();
            console.error("<<< [API RESPONSE ERROR PAYLOAD]:", err);
            throw new Error(err.message || 'Invalid credentials');
        }
        
        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
        if (data.user && data.user.role === 'STUDENT') {
            window.location.href = '/student-dashboard';
        } else if (data.user && data.user.role === 'PARENT') {
            window.location.href = '/parent-dashboard';
        } else {
            window.location.href = '/dashboard';
        }
    } catch (err) {
        showToast(err.message);
    } finally {
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const studentEmail = document.getElementById('regStudentEmail').value;
    const studentClass = document.getElementById('regStudentClass').value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    try {
        const reqPayload = { name, email, password, role, studentEmail, studentClass };
        console.log(">>> [API REQUEST] POST /apiv1/auth/register");
        console.log("Request Payload:", reqPayload);

        const response = await fetch('/apiv1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqPayload)
        });

        console.log("<<< [API RESPONSE STATUS]:", response.status, response.statusText);

        if (!response.ok) {
            const err = await response.json();
            console.error("<<< [API RESPONSE ERROR PAYLOAD]:", err);
            let errMsg = err.message || 'Registration failed';
            if (err.fields && err.fields.length > 0) {
                const fieldErrors = err.fields.map(f => `${f.field}: ${f.message}`).join(', ');
                errMsg = `Validation failed: ${fieldErrors}`;
            }
            throw new Error(errMsg);
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
        if (data.user && data.user.role === 'STUDENT') {
            window.location.href = '/student-dashboard';
        } else if (data.user && data.user.role === 'PARENT') {
            window.location.href = '/parent-dashboard';
        } else {
            window.location.href = '/dashboard';
        }
    } catch (err) {
        showToast(err.message);
    } finally {
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
});

document.getElementById('regRole').addEventListener('change', (e) => {
    const emailGroup = document.getElementById('regStudentEmailGroup');
    const emailInput = document.getElementById('regStudentEmail');
    const classGroup = document.getElementById('regStudentClassGroup');
    const classInput = document.getElementById('regStudentClass');
    
    if (e.target.value === 'PARENT') {
        emailGroup.style.display = 'block';
        emailInput.required = true;
    } else {
        emailGroup.style.display = 'none';
        emailInput.required = false;
        emailInput.value = '';
    }

    if (e.target.value === 'STUDENT') {
        classGroup.style.display = 'block';
        classInput.required = true;
    } else {
        classGroup.style.display = 'none';
        classInput.required = false;
        classInput.value = '';
    }
});

document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    const submitBtn = document.getElementById('forgotSubmitBtn');
    submitBtn.textContent = 'Generating...';
    submitBtn.disabled = true;

    try {
        console.log(">>> [API REQUEST] POST /apiv1/auth/forgot-password");
        const response = await fetch('/apiv1/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Email not found or registration error');
        }

        const data = await response.json();
        console.log("<<< [API RESPONSE SUCCESS PAYLOAD]:", data);
        
        // Transition directly to the reset panel, pre-filling the token
        switchPanel('reset');
        document.getElementById('resetToken').value = data.token;
        document.getElementById('resetNewPassword').value = '';
        document.getElementById('resetNewPassword').focus();
        showToast('Password reset token generated. Please enter your new password.', false);
    } catch (err) {
        showToast(err.message, true);
    } finally {
        submitBtn.textContent = 'Request Reset Token';
        submitBtn.disabled = false;
    }
});

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('resetToken').value;
    const newPassword = document.getElementById('resetNewPassword').value;
    const submitBtn = e.target.querySelector('button');
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    try {
        console.log(">>> [API REQUEST] POST /apiv1/auth/reset-password");
        const response = await fetch('/apiv1/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to reset password. Token may be expired.');
        }

        showToast('Password reset successfully! Please sign in.', false);
        switchPanel('signin');
    } catch (err) {
        showToast(err.message, true);
    } finally {
        submitBtn.textContent = 'Reset Password';
        submitBtn.disabled = false;
    }
});
