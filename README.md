# HireMe

A full-stack job portal that connects students looking for jobs and internships with recruiters hunting for fresh talent. Students build a portfolio profile, upload a resume and apply to jobs. Recruiters post jobs, review applicants and manage the hiring pipeline, all in one place.

Built with **React, Express, Node.js, Sequelize and MySQL**, and secured with **JWT authentication**.

## Features

### Authentication

- Register as a **Student** or **Recruiter** with name, email, password and an optional profile photo
- Password rules enforced on the server (minimum 6 characters, 1 capital letter, 1 number, 1 special character)
- Role-based login with JWT, redirecting to the right dashboard
- JWT stored in `localStorage`, with protected routes built using React Router `<Outlet />`
- **Auto-logout** when the token expires
- Change the profile photo any time

### Student

- Portfolio-style profile: bio, location, GitHub and LinkedIn links
- Skills, education and experience lists
- Resume upload and replace (PDF only, max 5 MB)
- Browse open jobs with **search and filters** (title, job type, location)
- Apply to a job with a cover note
- Track every application with a status timeline (antd `Steps`)
- **Toast notification** when an application status changes (the dashboard checks for updates every 20 seconds)

### Recruiter

- Post, edit, close, reopen and delete job postings
- Dashboard with all posted jobs and the **applicant count** per job
- View each applicant's profile summary, cover note and **resume download link**
- Update an applicant's status with one click, with only the valid next step shown
- Filter applicants by status

### Application status flow

```
applied  ->  reviewed  ->  shortlisted  ->  rejected
                 |                              ^
                 +------------------------------+
```

| Current status | Can move to           |
| -------------- | --------------------- |
| applied        | reviewed              |
| reviewed       | shortlisted, rejected |
| shortlisted    | rejected              |
| rejected       | (final)               |

The backend enforces these rules, and the frontend only shows the valid buttons.

---

## Tech Stack

| Layer          | Technologies                                                      |
| -------------- | ----------------------------------------------------------------- |
| Frontend       | React (Vite), React Router, Ant Design, Lucide icons, `fetch` API |
| Backend        | Node.js, Express, Sequelize, mysql2                               |
| Database       | MySQL                                                             |
| Auth and files | JSON Web Tokens, bcrypt, Multer                                   |

---

## Project Structure

```
HireMe/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── db/
│   │   ├── index.js              # Sequelize connection
│   │   └── models/
│   │       ├── User.js
│   │       ├── Job.js
│   │       ├── Application.js
│   │       └── index.js          # associations
│   ├── middlewares/
│   │   ├── auth.js               # checkToken, isRoleAllowed
│   │   └── multerConfig.js       # photo and resume uploads
│   ├── routes/
│   │   ├── auth-routes.js
│   │   ├── profile-routes.js
│   │   ├── job-routes.js
│   │   └── application-routes.js
│   └── uploads/                  # created automatically (photos, resumes)
│
└── frontend/
    └── src/
        ├── main.jsx              # theme, router and AuthProvider
        ├── App.jsx               # all routes, with protected routes and Outlet
        ├── context/
        │   └── auth-context.jsx  # user, token, login, logout, auto-logout
        ├── utils/
        │   ├── api.js            # API URL, authFetch (adds the JWT header)
        │   ├── constants.js
        │   └── helpers.js
        ├── components/           # Navbar, Layout, ProtectedRoute, JobCard,
        │                         # ApplyModal, ProfileCard, StatusSteps,
        │                         # ChangePhotoModal
        └── pages/                # Login, Register, Dashboard, Jobs, JobDetails,
                                  # Profile, PostJob, Applicants
```

---

## Database Design

| Table            | Purpose                              | Key fields                                                                                                                                                           |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Users**        | Students and recruiters in one table | name, email (unique), password (hashed), role, profileImageUrl, bio, location, githubUrl, linkedinUrl, skills (JSON), education (JSON), experience (JSON), resumeUrl |
| **Jobs**         | Job postings                         | title, company, location, type, description, skillsRequired (JSON), deadline, isActive, recruiterId                                                                  |
| **Applications** | A student's application to a job     | jobId, studentId, coverNote, status                                                                                                                                  |

**Relationships**

- One recruiter (User) has many Jobs
- One student (User) has many Applications
- One Job has many Applications (deleting a job deletes its applications)
- Students and Jobs are **many-to-many** through Applications
- A unique index on `(jobId, studentId)` stops a student from applying to the same job twice

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MySQL 8 (or a compatible server)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Create the database

```sql
CREATE DATABASE hireme;
```

The tables are created automatically by Sequelize when the server starts.

### 3. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (use `.env.example` as a guide):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hireme
JWT_SECRET=paste_a_long_random_string_here
JWT_EXPIRES_IN=1d
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the server:

```bash
node server.js
```

You should see `Database connected` and `Database Synced`. The API runs on `http://localhost:3000`.

### 4. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app opens on `http://localhost:5173`.

The backend address is set in `frontend/src/utils/api.js`:

```javascript
export const API_URL = 'http://localhost:3000';
```

Change it if your backend runs on a different port or host.

---

## API Reference

All routes except register and login need the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint             | Access    | Description                                        |
| ------ | -------------------- | --------- | -------------------------------------------------- |
| POST   | `/api/auth/register` | Public    | Register (multipart form, optional `profileImage`) |
| POST   | `/api/auth/login`    | Public    | Login and receive a JWT                            |
| GET    | `/api/auth/me`       | Logged in | Current user's full profile                        |

### Profile

| Method | Endpoint              | Access             | Description                                                      |
| ------ | --------------------- | ------------------ | ---------------------------------------------------------------- |
| PUT    | `/api/profile/update` | Student            | Update name, bio, location, links, skills, education, experience |
| POST   | `/api/profile/resume` | Student            | Upload or replace the resume (`resume` field, PDF)               |
| POST   | `/api/profile/photo`  | Student, Recruiter | Change the profile photo (`profileImage` field)                  |

### Jobs

| Method | Endpoint                            | Access            | Description                                             |
| ------ | ----------------------------------- | ----------------- | ------------------------------------------------------- |
| POST   | `/api/jobs`                         | Recruiter         | Create a job                                            |
| GET    | `/api/jobs?search=&type=&location=` | Logged in         | Open jobs (active and not past the deadline)            |
| GET    | `/api/jobs/my`                      | Recruiter         | Own jobs with applicant counts                          |
| GET    | `/api/jobs/:id`                     | Logged in         | Single job with recruiter details                       |
| PUT    | `/api/jobs/:id`                     | Recruiter (owner) | Edit a job, extend the deadline, or close and reopen it |
| DELETE | `/api/jobs/:id`                     | Recruiter (owner) | Delete a job                                            |

### Applications

| Method | Endpoint                         | Access            | Description                                |
| ------ | -------------------------------- | ----------------- | ------------------------------------------ |
| POST   | `/api/applications/apply/:jobId` | Student           | Apply to a job with an optional cover note |
| GET    | `/api/applications/my`           | Student           | Own applications with job details          |
| GET    | `/api/applications/job/:jobId`   | Recruiter (owner) | Applicants of a job with their profiles    |
| PUT    | `/api/applications/:id/status`   | Recruiter (owner) | Update an application's status             |

---

## Security Notes

- Passwords are hashed with **bcrypt** and never returned by the API
- JWT secret and database credentials live in `.env`, which is not committed
- Role checks (`isRoleAllowed`) and **ownership checks** make sure recruiters can only edit their own jobs and see their own applicants
- The user id always comes from the token, never from the request body
- Profile updates accept only a fixed list of fields, so a user cannot change their own `role`
- File uploads are limited by type and size, and old files are deleted when replaced

---

## Future Improvements

- Remove profile photo option
- Real-time notifications with WebSockets
- Email notifications for status changes
- Pagination for jobs and applicants
- Protected (login-only) access to resume files
- Password reset

---

## Author

**Your Name**
GitHub: [@your-username](https://github.com/your-username)

---

## License

This project is for learning purposes.
