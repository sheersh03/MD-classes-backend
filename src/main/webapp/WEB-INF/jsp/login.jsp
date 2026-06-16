<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portal Login - Bypass Mode</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700;800&display=swap"
            rel="stylesheet">
        <link rel="stylesheet" href="${pageContext.request.contextPath}/css/login.css">
    </head>

    <body>

        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>

        <div class="container">
            <!-- Login Card -->
            <div class="card" id="cardContainer">
                <!-- Phase 1: Login Form -->
                <div id="loginFormContainer">
                    <div class="header">
                        <div class="logo-icon">
                            <svg viewBox="0 0 24 24">
                                <path
                                    d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                        </div>
                        <h1>Portal Sign In</h1>
                        <p class="subtitle">Enter your email and password to log in.</p>
                        <div>
                            <span class="badge-bypass">Bypass Mode Active</span>
                        </div>
                    </div>

                    <form id="loginForm">
                        <div class="form-group">
                            <label class="form-label" for="email">Email Address</label>
                            <div class="input-wrapper">
                                <input class="form-input" type="email" id="email" name="email" required
                                    placeholder="name@company.com">
                                <span class="input-icon">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="password">Password</label>
                            <div class="input-wrapper">
                                <input class="form-input" type="password" id="password" name="password" required
                                    placeholder="••••••••">
                                <span class="input-icon">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                                    </svg>
                                </span>
                                <button type="button" class="btn-toggle-password" id="togglePassword">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24" id="eyeIcon">
                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="btn-submit" id="submitBtn">
                            <span class="spinner" id="spinner"></span>
                            <span id="btnText">Sign In</span>
                        </button>
                    </form>
                </div>

                <!-- Phase 2: Success / Results -->
                <div class="results-container" id="resultsContainer">
                    <div class="success-checkmark">
                        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="3"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 style="text-align: center;">Credentials Captured</h1>
                    <p class="subtitle" style="text-align: center;">The login server accepted the input without
                        executing
                        authentication checks.</p>

                    <div class="captured-credentials">
                        <div class="credential-item">
                            <div class="cred-label">Captured Email</div>
                            <div class="cred-val-container">
                                <span class="cred-value" id="displayEmail">email@example.com</span>
                                <button class="btn-copy" onclick="copyText('displayEmail')">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24">
                                        <path
                                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 8h1a2 2 0 002-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2 2v3a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="credential-item">
                            <div class="cred-label">Captured Password</div>
                            <div class="cred-val-container">
                                <span class="cred-value" id="displayPassword">password123</span>
                                <button class="btn-copy" onclick="copyText('displayPassword')">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24">
                                        <path
                                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 8h1a2 2 0 002-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2 2v3a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button class="btn-back" id="backBtn">Submit Another Login</button>
                </div>
            </div>
        </div>

        <script src="${pageContext.request.contextPath}/js/login.js"></script>
    </body>

    </html>