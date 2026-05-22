# Contus Authentication Platform

A secure, high-performance, and visually stunning decoupled authentication platform built using **Laravel 11** (Backend REST API) and **React 18 / Vite 5** (Frontend SPA). 

The application utilizes **Laravel Sanctum** for stateful token-based API authentication and **Lucide Icons** with a custom **Glassmorphic Elegant Dark UI** design system for a premium user experience.

---

## 🌟 Key Features Implemented
* **User Registration & Login**: Decoupled registration and login flows with instant state updates.
* **Stateful Token Management**: Personal access Bearer tokens handled via Sanctum middleware.
* **Token Rotation (Security)**: Dynamic one-click token rotation (refresh token) built directly into the client dashboard.
* **Administrative Stats Portal**: Real-time administrative statistics fetched from the server.
* **Upgraded strict validations**:
  * **Email**: Strict, RFC-compliant format email validation on the frontend and unique verification on the backend.
  * **Password**: Comprehensive password strength checks (**minimum 8 characters, at least one letter, one number, and one special character**) on both client validation and backend API request levels.
* **Password Visibility Toggle**: Independent show/hide password toggle buttons inside all password input fields.
* **Admin Control Center (Role-based access)**:
  * **User Directory**: Clean administrative directory layout displaying registered users' names, emails, access badges, and creation dates.
  * **Account Provisioning Form**: Interactive admin modal to instantly register accounts directly from the control hub.
* **SMTP Email Notifications**: Automatically dispatches a beautifully formatted Markdown email to newly provisioned users containing their credentials and login portal links.

### ⚡ Bonus Features Completed
* **Mock OAuth Social Sign-in**: Functional mockup login flows for **Google** and **GitHub** providing realistic profile seeding.
* **Premium Dark Mode Styling**: Tailored Outfit typography, vibrant violet-to-cyan color gradients, high-end transitions, micro-interactions, and glassmorphic overlays.

---

## 🛠️ Technology Stack
* **Backend**: Laravel 11, Sanctum (Stateful Tokens), MySQL Database
* **Frontend**: React 18, Vite 5, React Router DOM v6, Tailwind/CSS Custom Variables, Lucide Icons

---

## 📦 Project Setup & Installation

### Prerequisite Checklist
* PHP >= 8.2 (with Composer installed)
* Node.js >= 18.0 (with npm installed)
* MySQL Server running locally

---

### Step 1: Database Setup
1. Log into your MySQL database server and create a blank database:
   ```sql
   CREATE DATABASE contus_auth;
   ```

---

### Step 2: Backend (Laravel) Configuration & Launch
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Composer dependencies:
   ```bash
   composer install
   ```
3. Create your environment configuration file by copying the template:
   ```bash
   cp .env.example .env
   ```
4. Generate the application secure key:
   ```bash
   php artisan key:generate
   ```
5. Configure database credentials in your new `.env` file (lines 23-28):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=contus_auth
   DB_USERNAME=your_mysql_username
   DB_PASSWORD=your_mysql_password
   ```
6. Run migrations to initialize the tables and seed default users:
   ```bash
   php artisan migrate --seed
   ```
7. Run the local backend development server:
   ```bash
   php artisan serve
   ```
   *The backend will boot up at: `http://localhost:8000`*

---

### Step 3: SMTP Email Configuration
The system features an automated registration mail dispatcher. To configure a mail transport channel:
1. Open `backend/.env`.
2. Locate the `MAIL_*` keys and configure your SMTP service provider (e.g. Mailtrap, SendGrid, Gmail):
    ```env
    MAIL_MAILER=smtp
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USERNAME=bsanthoshkumar10@gmail.com
    MAIL_PASSWORD=your_gmail_app_password
    MAIL_ENCRYPTION=tls
    MAIL_FROM_ADDRESS="bsanthoshkumar10@gmail.com"
    MAIL_FROM_NAME="${APP_NAME}"
    ```
   *Note: If you want to log emails locally instead of sending, simply set `MAIL_MAILER=log`.Mails will print into `backend/storage/logs/laravel.log`.*

---

### Step 4: Frontend (React/Vite) Configuration & Launch
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm node modules:
   ```bash
   npm install
   ```
3. Start the local client development server:
   ```bash
   npm run dev -- --port=5173
   ```
   *The client dashboard will boot up at: `http://localhost:5173`*

---

## 🔑 Default Authentication Credentials
The database seeder provisions two default user profiles with varying role permissions for easy evaluation:

### 🛡️ Administrator Account
* **Email Address**: `admin@example.com`
* **Password**: `password123`
* **Access Level**: Full privileges, unlocks the Database Statistics card and Users control center.

### 👤 Standard User Account
* **Email Address**: `user@example.com`
* **Password**: `password123`
* **Access Level**: Restricted profile view only.

---

## 🧪 Testing the Platform
To verify backend routing rules, controller validation constraints, and database integration, run the PHPUnit test suite:
1. Open a terminal inside the `/backend` directory.
2. Run Laravel's testing suite:
   ```bash
   php artisan test
   ```