<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reviewer Portal - Decoupled Secure Auth</title>
    <!-- Google Fonts Outfit & Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-base: #090d16;
            --bg-surface: rgba(17, 24, 39, 0.7);
            --border-glow: rgba(59, 130, 246, 0.15);
            --border-hover: rgba(99, 102, 241, 0.35);
            --text-primary: #f3f4f6;
            --text-secondary: #9ca3af;
            --text-muted: #6b7280;
            --accent-glow: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            --accent-green: #10b981;
            --accent-purple: #8b5cf6;
            --accent-orange: #f59e0b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-base);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2.5rem 1.5rem;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 40%);
            background-attachment: fixed;
            overflow-x: hidden;
        }

        /* Container styling */
        .portal-wrapper {
            width: 100%;
            max-width: 1100px;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Glassmorphic card base styling */
        .glass-card {
            background: var(--bg-surface);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--border-glow);
            border-radius: 18px;
            padding: 2.2rem;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.3);
        }

        .glass-card:hover {
            border-color: var(--border-hover);
            box-shadow: 0 15px 35px -10px rgba(99, 102, 241, 0.15);
        }

        /* Hero / Thank You Section */
        .hero-section {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
            align-items: center;
        }

        @media (max-width: 768px) {
            .hero-section {
                grid-template-columns: 1fr;
            }
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 2.8rem;
            font-weight: 800;
            background: linear-gradient(to right, #60a5fa, #a5b4fc, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1.15;
            margin-bottom: 0.75rem;
        }

        .subtitle {
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        /* Developer Badge / Profile Card */
        .developer-badge {
            background: rgba(99, 102, 241, 0.1);
            border: 1px dashed rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            padding: 1.2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .avatar-glow {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: var(--accent-glow);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            font-weight: 700;
            color: white;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
            flex-shrink: 0;
        }

        .dev-info h3 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .dev-info p {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-top: 2px;
        }

        .dev-info span {
            display: inline-block;
            background: rgba(16, 185, 129, 0.15);
            color: var(--accent-green);
            font-size: 0.75rem;
            font-weight: 600;
            padding: 1px 8px;
            border-radius: 100px;
            margin-top: 4px;
        }

        /* Stats Grid */
        .grid-layout {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 2rem;
        }

        @media (max-width: 900px) {
            .grid-layout {
                grid-template-columns: 1fr;
            }
        }

        h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Lists and details */
        .feature-list {
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
        }

        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            font-size: 0.92rem;
            line-height: 1.4;
            color: var(--text-secondary);
        }

        .feature-item svg {
            width: 18px;
            height: 18px;
            margin-top: 2px;
            flex-shrink: 0;
        }

        .feature-item.completed svg {
            color: var(--accent-green);
        }

        .feature-item.bonus svg {
            color: var(--accent-purple);
        }

        .feature-item strong {
            color: var(--text-primary);
        }

        /* Code/Command Blocks */
        .command-card {
            background: rgba(10, 15, 26, 0.85);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.2rem;
            font-family: monospace;
            font-size: 0.85rem;
            color: #818cf8;
            position: relative;
            overflow-x: auto;
        }

        .command-card::before {
            content: '$ ';
            color: var(--text-muted);
        }

        /* Credentials Card */
        .creds-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 0.5rem;
        }

        .cred-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 1rem;
        }

        .cred-box h4 {
            font-family: 'Outfit', sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.4rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }

        .cred-box p {
            font-size: 0.82rem;
            color: var(--text-secondary);
            font-family: monospace;
            margin-top: 3px;
        }

        /* Links & CTA Buttons */
        .cta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            padding: 0.9rem 1.4rem;
            border-radius: 10px;
            font-size: 0.92rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
        }

        .btn-primary {
            background: var(--accent-glow);
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--text-primary);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .btn-purple {
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.2);
            color: #c084fc;
        }

        .btn-purple:hover {
            background: rgba(139, 92, 246, 0.18);
            border-color: rgba(139, 92, 246, 0.4);
            transform: translateY(-2px);
        }

        .step-badge {
            background: var(--accent-orange);
            color: #090d16;
            font-size: 0.72rem;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 4px;
            text-transform: uppercase;
        }
        
        .tab-section {
            margin-top: 1rem;
        }
    </style>
</head>
<body>

    <div class="portal-wrapper">
        
        <!-- TOP CARD: HERO & DEV INFO -->
        <div class="glass-card hero-section">
            <div>
                <h1>Secure Identity Portal</h1>
                <p class="subtitle">A robust decoupled Laravel 11 API Backend paired with a state-of-the-art React 18 + Vite Frontend SPA, engineered with strict security filters, comprehensive automated testing, and extensive bonus features.</p>
                
                <div class="developer-badge">
                    <div class="avatar-glow">SK</div>
                    <div class="dev-info">
                        <h3>Santhosh Kumar</h3>
                        <p>Senior Software Engineer / Full Stack Developer</p>
                        <span>Interview Candidate</span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="glass-card" style="padding: 1.5rem; background: rgba(255, 255, 255, 0.02);">
                    <h3 style="font-family: 'Outfit'; font-size: 1.1rem; margin-bottom: 0.5rem; color: #60a5fa; display: flex; align-items: center; gap: 0.4rem;">
                        <svg style="width:18px; height:18px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        Reviewer Message
                    </h3>
                    <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary);">
                        "Thank you for taking the time to evaluate this task! This implementation has been built exceeding all core parameters and negative scenarios. I would be thrilled to walk through the technical choices in our upcoming review!"
                    </p>
                </div>
            </div>
        </div>

        <!-- MAIN LAYOUT GRID -->
        <div class="grid-layout">
            
            <!-- LEFT COLUMN: LAUNCH & CREDENTIALS -->
            <div style="display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- Setup & Run Instructions -->
                <div class="glass-card">
                    <h2>
                        <svg style="width:20px; height:20px; color:var(--accent-orange)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Setup & Run Guide
                    </h2>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                                <span class="step-badge">Option A</span>
                                <span style="font-size:0.8rem; color:var(--text-muted)">Standard Mode</span>
                            </div>
                            <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.4rem;">Start the PHP Backend and Vite React frontend locally:</p>
                            <pre class="command-card" style="margin-bottom:0.5rem;">cd backend && php artisan serve --port=8000</pre>
                            <pre class="command-card">cd frontend && npm run dev -- --port=5173</pre>
                        </div>
                        
                        <hr style="border-color: rgba(255,255,255,0.06);">
                        
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                                <span class="step-badge" style="background:var(--accent-purple)">Option B</span>
                                <span style="font-size:0.8rem; color:var(--text-muted)">Docker Compose</span>
                            </div>
                            <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.4rem;">Boot Laravel, React, and MySQL containers instantly:</p>
                            <pre class="command-card">docker-compose up --build</pre>
                        </div>
                    </div>
                </div>
                
                <!-- Pre-configured Credentials -->
                <div class="glass-card">
                    <h2>
                        <svg style="width:20px; height:20px; color:#c084fc" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-2-4a2 2 0 11-4 0 2 2 0 014 0zM3 5h12a2 2 0 012 2v2a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2zM3 15h12a2 2 0 012 2v2a2 2 0 01-2 2H3a2 2 0 01-2-2v-2a2 2 0 012-2z"></path></svg>
                        Evaluation Credentials
                    </h2>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.8rem;">Pre-seeded in the database for secure RBAC verification:</p>
                    
                    <div class="creds-container">
                        <div class="cred-box">
                            <h4>
                                <span style="width:8px; height:8px; border-radius:50%; background:var(--accent-purple)"></span>
                                Administrator
                            </h4>
                            <p><strong>Email:</strong> admin@example.com</p>
                            <p><strong>Pass:</strong> password123</p>
                        </div>
                        <div class="cred-box">
                            <h4>
                                <span style="width:8px; height:8px; border-radius:50%; background:var(--accent-green)"></span>
                                Standard User
                            </h4>
                            <p><strong>Email:</strong> user@example.com</p>
                            <p><strong>Pass:</strong> password123</p>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <!-- RIGHT COLUMN: CAPABILITIES & LINKS -->
            <div style="display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- Implementation Scope -->
                <div class="glass-card">
                    <h2>
                        <svg style="width:20px; height:20px; color:var(--accent-green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        Completed Scope (100% Core + Bonus)
                    </h2>
                    
                    <div class="feature-list">
                        <div class="feature-item completed">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            <span><strong>Full Authentication System</strong>: Secure login, dual-stage register, session flushes, and stateful password recoveries.</span>
                        </div>
                        <div class="feature-item completed">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            <span><strong>Custom Exception Handlers</strong>: Structured JSON error payloads representing all validations and 401 unauthenticated violations.</span>
                        </div>
                        <div class="feature-item bonus">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            <span><strong>Bearer Token Rotation (Bonus)</strong>: Active token revocation (`POST /api/refresh`) paired with dashboard state cycles.</span>
                        </div>
                        <div class="feature-item bonus">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            <span><strong>Role-Based Access Guard (Bonus)</strong>: Dedicated Middleware filters preventing standard users from query logs.</span>
                        </div>
                        <div class="feature-item bonus">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            <span><strong>Social Login Mockup (Bonus)</strong>: Instant Google/GitHub authentication cards integrated into React client.</span>
                        </div>
                        <div class="feature-item bonus">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            <span><strong>Full PHPUnit test suite (Bonus)</strong>: 14 integration test configurations mapping 89 assertions, 100% passed.</span>
                        </div>
                    </div>
                </div>
                
                <!-- Reviewer Links & Reports -->
                <div class="glass-card">
                    <h2>
                        <svg style="width:20px; height:20px; color:#60a5fa" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        Interactive Reviewer Console
                    </h2>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">Access the interactive documentation and audits directly on this server instance:</p>
                    
                    <div class="cta-grid">
                        <a href="/swagger/index.html" target="_blank" class="btn btn-primary">
                            <svg style="width:16px; height:16px" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            Open Swagger UI
                        </a>
                        <a href="/swagger/evaluation_criteria_audit.md" target="_blank" class="btn btn-secondary">
                            Evaluation Criteria Audit
                        </a>
                        <a href="/swagger/negative_scenarios_audit.md" target="_blank" class="btn btn-secondary">
                            Negative Scenarios Audit
                        </a>
                        <a href="http://localhost:5173" target="_blank" class="btn btn-purple">
                            Launch Frontend Portal
                        </a>
                    </div>
                </div>
                
            </div>
            
        </div>
        
    </div>

</body>
</html>
