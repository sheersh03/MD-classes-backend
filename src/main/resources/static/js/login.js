if (localStorage.getItem('accessToken')) {
    window.location.href = '/dashboard';
}

function switchTab(tab) {
    const btns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.form-panel');
    
    if (tab === 'signin') {
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
        document.getElementById('signinPanel').classList.add('active');
        document.getElementById('registerPanel').classList.remove('active');
    } else {
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
        document.getElementById('signinPanel').classList.remove('active');
        document.getElementById('registerPanel').classList.add('active');
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
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Invalid credentials');
        }
        
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
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
    const submitBtn = e.target.querySelector('button');
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        if (!response.ok) {
            const err = await response.json();
            let errMsg = err.message || 'Registration failed';
            if (err.fields && err.fields.length > 0) {
                const fieldErrors = err.fields.map(f => `${f.field}: ${f.message}`).join(', ');
                errMsg = `Validation failed: ${fieldErrors}`;
            }
            throw new Error(errMsg);
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
    } catch (err) {
        showToast(err.message);
    } finally {
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
    }
});
