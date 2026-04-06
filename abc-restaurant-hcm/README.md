# ABC Restaurant HCM Frontend

ABC Restaurant HCM Frontend is a React + Vite web application for restaurant human capital management workflows. The application includes authentication, dashboard views, scheduling, employee availability, employee management, payroll, reimbursements, notifications, and profile management.

## Tech Stack

- React 18
- Vite
- React Router
- Supabase
- Axios
- Material UI
- Font Awesome

## Main Features

- User login with Supabase authentication
- Role-based route protection
- Dashboard for authenticated users
- Employee availability management
- Employee management for manager/admin roles
- Payroll access for manager/finance/admin roles
- Reimbursement tracking
- Notifications
- User profile management
- Schedule creation and viewing

## Project Structure

```text
abc-restaurant-hcm/
  public/
  src/
    api/
    components/
    context/
    layouts/
    pages/
  index.html
  package.json
  vite.config.js
```

## Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm 9 or later
- Access to the team Supabase project
- Required environment variables in `.env.development`

## Environment Variables

Create or update `abc-restaurant-hcm/.env.development` with valid values:

```env
VITE_API_URL=http://localhost:8080/api
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Notes:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for authentication and database access.
- `VITE_API_URL` is used for the backend API when applicable.
- This project currently uses Supabase client access in the frontend and also invokes Supabase Edge Functions for some employee actions.

## Installation

From the `abc-restaurant-hcm` folder:

```bash
npm install
```

## Run in Development

```bash
npm run dev
```

Vite will start a local development server. Open the local URL shown in the terminal, typically:

```text
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Authentication and Login

- Users must log in with valid credentials that exist in the connected Supabase Auth project.
- Access to some pages depends on the authenticated user's role.
- If your instructor needs login access, provide one or more test accounts in the separate submission document.

Recommended accounts to provide in the separate submission document:

- Admin account
- Manager account
- Employee account

For each account, include:

- Email
- Password
- Role
- Any notes needed for testing

## Important Routes

- `/login`
- `/dashboard`
- `/schedule`
- `/availability`
- `/employees`
- `/payroll`
- `/reimbursements`
- `/profile`
- `/view-schedule`
- `/notifications`

## Known Setup Notes

- The project depends on Supabase configuration being available at runtime.
- Some employee management actions invoke Supabase Edge Functions such as `Create-Employee` and `update-employee`.
- If those functions or related backend resources are not deployed in the target environment, some features will not work.

## Submission Notes

For final submission, include:

- Source code repository link
- Compressed final source code folder
- Separate README `.docx` with run instructions and login details
- Project Closure Report
- Minutes of Meeting after Sprint 7

Suggested compressed source folder name format:

```text
W26_T<team#>_ABC_Restaurant_HCM
```

## Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
