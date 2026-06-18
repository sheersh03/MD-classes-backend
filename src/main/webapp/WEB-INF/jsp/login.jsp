<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/login.css">
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="header">
                <div class="logo">MD Portal</div>
                <div class="subtitle">Access your local development workspace</div>
            </div>
            
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab('signin')">Sign In</button>
                <button class="tab-btn" onclick="switchTab('register')">Register</button>
            </div>

            <!-- Sign In Panel -->
            <div id="signinPanel" class="form-panel active">
                <form id="signinForm">
                    <div class="form-group">
                        <input type="email" id="signinEmail" class="form-input" placeholder=" " required autocomplete="off">
                        <label for="signinEmail" class="form-label">Email Address</label>
                    </div>
                    <div class="form-group">
                        <input type="password" id="signinPassword" class="form-input" placeholder=" " required>
                        <label for="signinPassword" class="form-label">Password</label>
                    </div>
                    <button type="submit" class="submit-btn">Sign In</button>
                </form>
            </div>

            <!-- Register Panel -->
            <div id="registerPanel" class="form-panel">
                <form id="registerForm">
                    <div class="form-group">
                        <input type="text" id="regName" class="form-input" placeholder=" " required autocomplete="off">
                        <label for="regName" class="form-label">Full Name</label>
                    </div>
                    <div class="form-group">
                        <input type="email" id="regEmail" class="form-input" placeholder=" " required autocomplete="off">
                        <label for="regEmail" class="form-label">Email Address</label>
                    </div>
                    <div class="form-group">
                        <input type="password" id="regPassword" class="form-input" placeholder=" " required>
                        <label for="regPassword" class="form-label">Password (Min 8 chars)</label>
                    </div>
                    <div class="form-group select-wrapper">
                        <select id="regRole" required>
                            <option value="" disabled selected hidden>Select Role</option>
                            <option value="ADMIN">Admin</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="STUDENT">Student</option>
                            <option value="PARENT">Parent</option>
                        </select>
                    </div>
                    <button type="submit" class="submit-btn">Create Account</button>
                </form>
            </div>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <script src="/js/login.js"></script>
</body>
</html>
