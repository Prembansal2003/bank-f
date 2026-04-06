# Trusted Bank Management System — Frontend

A role-based single-page application built with **React 19**, **Vite**, and **Ant Design** that provides separate dashboards for Admins, Employees, and Customers of the Trusted Bank Management System.

---
<img width="1904" height="827" alt="Screenshot 2026-04-06 195025" src="https://github.com/user-attachments/assets/8d41056e-0971-469d-9bb8-ba990cac3513" />

<img width="1888" height="882" alt="Screenshot 2026-04-06 195040" src="https://github.com/user-attachments/assets/785f8678-b6a6-4ef0-81b0-306825bea561" />

<img width="1894" height="868" alt="Screenshot 2026-04-06 195144" src="https://github.com/user-attachments/assets/02387647-bf00-4041-b006-886a8d974250" />

<img width="1890" height="878" alt="Screenshot 2026-04-06 194857" src="https://github.com/user-attachments/assets/638c0e6b-5fe5-41b2-9de6-aaf6c430e0eb" />

<img width="1888" height="853" alt="Screenshot 2026-04-06 194946" src="https://github.com/user-attachments/assets/e1a0d482-54a0-4da6-8830-97a5141653ec" />

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Demo Credentials](#demo-credentials)
- [Role-Based Routing](#role-based-routing)
- [Pages & Features](#pages--features)
- [Shared Utilities (modules.js)](#shared-utilities-modulesjs)
- [API Integration](#api-integration)
- [PDF & Print Export](#pdf--print-export)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| UI library | Ant Design 5 + `@ant-design/icons` |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| HTTP client | Axios |
| Remote data | SWR (stale-while-revalidate) |
| Auth cookies | universal-cookie |
| Alerts | SweetAlert2 |
| PDF export | jsPDF + jspdf-autotable |
| Linting | ESLint 9 |

---

## Project Structure

```
bank-f-master/
├── index.html
├── src/
│   ├── App.jsx             # Root router — lazy-loads all pages
│   └── App.css
├── components/
│   ├── Admin/
│   │   ├── index.jsx               # Admin dashboard
│   │   ├── AdminNewAccount/        # Admin: open new customer account
│   │   ├── Branch/                 # Branch CRUD
│   │   ├── Branding/               # Bank branding settings
│   │   ├── Currency/               # Currency CRUD
│   │   ├── NewEmployee/            # Create / manage employees
│   │   └── NewTransaction/         # Admin: record a transaction
│   ├── Employee/
│   │   ├── index.jsx               # Employee dashboard
│   │   ├── EmployeeNewAccount/     # Employee: open new account
│   │   └── EmpTransaction/         # Employee: record a transaction
│   ├── Customer/
│   │   ├── index.jsx               # Customer dashboard
│   │   └── Transactions/           # Customer: view own transactions
│   ├── Shared/
│   │   ├── Dashboard/              # Summary cards used by all roles
│   │   ├── NewAccount/             # Shared account-creation form
│   │   ├── NewTransaction/         # Shared transaction form
│   │   └── TransactionTable/       # Reusable transaction data table
│   ├── Home/
│   │   ├── index.jsx               # Public home/landing page
│   │   └── Login/                  # Login form
│   ├── Guard/
│   │   └── index.jsx               # Route protection (token verify + role check)
│   ├── Layout/
│   │   ├── Adminlayout/
│   │   ├── Customerlayout/
│   │   ├── Employeelayout/
│   │   └── Homelayout/
│   ├── Loader/                     # Full-screen loading spinner
│   └── PageNotFound/               # 404 page
├── modules/
│   └── modules.js                  # Axios factory, fetchData, formatDate, PDF/print export
├── public/
│   ├── bank-img.jpg
│   └── banklogo.png
├── .env                            # VITE_BASEURL
├── eslint.config.js
└── package.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- The backend server must be running and accessible at the URL you set in `VITE_BASEURL`

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Base URL of the backend API — no trailing slash
VITE_BASEURL=http://localhost:3000
```

> Vite only exposes variables prefixed with `VITE_` to the browser bundle.

---

## Installation

```bash
# Extract / enter the project directory
cd bank-f-master

# Install dependencies
npm install
```

---

## Running the App

```bash
# Development server with hot-reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

The dev server starts on `http://localhost:5173` by default.

---

## Demo Credentials

Use the following admin account to log in and explore the full system:

| Field | Value |
|---|---|
| **Email** | `trusted2003@gmail.com` |
| **Password** | `Prem@2003` |
| **Role** | `admin` |

Enter these on the login page at `http://localhost:5173/`. After a successful login the app will redirect you automatically to the Admin Dashboard. From there you can manage branches, currencies, branding, employees, customer accounts, and transactions.

---

## Role-Based Routing

Routing is declared in `src/App.jsx` using React Router DOM v7. All routes use **lazy loading** wrapped in `<Suspense>` with a `<Loader>` fallback for optimal bundle splitting.

| Path | Role required | Component |
|---|---|---|
| `/` | Public | Home / Login |
| `/admin/` | `admin` | Admin Dashboard |
| `/admin/branding` | `admin` | Branding Settings |
| `/admin/branch` | `admin` | Branch Management |
| `/admin/currency` | `admin` | Currency Management |
| `/admin/new-employee` | `admin` | Create Employee |
| `/admin/new-account` | `admin` | Open Customer Account |
| `/admin/new-transaction` | `admin` | Record Transaction |
| `/employee/` | `employee` | Employee Dashboard |
| `/employee/new-account` | `employee` | Open Customer Account |
| `/employee/new-transaction` | `employee` | Record Transaction |
| `/customer/` | `customer` | Customer Dashboard |
| `/customer/transaction` | `customer` | View Transactions |
| `/*` | — | 404 Page Not Found |

### Route Guard

The `<Guard>` component (in `components/Guard/index.jsx`) protects every authenticated section. On mount it calls `GET /api/verify-token` using the cookie-stored JWT. If the token is missing, expired, or the decoded `userType` doesn't match the required `role` prop, the user is redirected to `/`.

---

## Pages & Features

### Public — Home / Login
- Displays bank branding (logo, name, tagline).
- Login form posts credentials to `/api/login` and stores the returned JWT as an `authToken` cookie.
- Redirects to the correct dashboard based on `userType` in the decoded token.

### Admin Dashboard
- **Summary cards** — total credits, total debits, account count, branch count.
- **Branding** — update bank name, tagline, logo, address, and social links.
- **Branch** — create, view, and delete bank branches.
- **Currency** — create, view, and delete supported currencies.
- **New Employee** — full employee registration form with profile photo upload.
- **New Account** — open a new customer bank account with document/signature uploads.
- **New Transaction** — credit or debit a customer account by account number.

### Employee Dashboard
- **Summary cards** — same as admin (filtered to employee's branch scope).
- **New Account** — open a customer account (same shared form as admin).
- **New Transaction** — record a transaction against any customer account.

### Customer Dashboard
- **Account summary** — current balance, total credits, total debits.
- **Transactions** — paginated table of own transactions with date-range filtering.
- **Export** — download transactions as a PDF or open a print-friendly HTML view.

---

## Shared Utilities (`modules/modules.js`)

A central helper module exported throughout the app:

### `http(accessToken?)`
Configures the Axios instance with `baseURL` from `VITE_BASEURL` and optionally attaches the Bearer token. Returns the Axios instance ready for use.

### `fetchData(api)`
SWR-compatible async fetcher. Reads the `authToken` cookie, attaches it to a GET request, and returns the response `data` object (or `null` on error).

### `trim(obj)`
Normalises form payloads before submission — trims whitespace, lowercases string values, and preserves date fields and sensitive fields (passwords, keys, file URLs) unchanged.

### `uploadFile(file, folderName)`
Sends a `multipart/form-data` POST to `/api/upload` with the target Cloudinary folder. Returns the upload result including the `secure_url`.

### `formatDate(d)`
Formats an ISO date string to `DD-MM-YYYY HH:MM:SS` for display in tables.

### `printBankTransactions(data)`
Opens a new browser tab with a styled HTML table of transactions and triggers the browser print dialog.

### `downloadTransaction(data)`
Generates a PDF using jsPDF and jspdf-autotable containing a transaction table and a summary block (Total Credit, Total Debit, Balance), then saves it as `Bank_Transactions.pdf`.

---

## API Integration

All API calls go through the `http()` helper which sets `axios.defaults.baseURL` to `VITE_BASEURL`. List/read endpoints use **SWR** for automatic caching and revalidation. Mutation endpoints (create, update, delete) call Axios directly and manually trigger SWR revalidation or local state updates on success.

Authentication is cookie-based on the client side — the JWT is stored in a browser cookie named `authToken` via `universal-cookie` and attached as a Bearer header on every request.

---

## PDF & Print Export

Transaction export is available on all dashboards that show a transaction table.

- **Print** — calls `printBankTransactions(data)`, which opens a styled HTML page in a new tab and triggers `window.print()`.
- **Download PDF** — calls `downloadTransaction(data)`, which uses jsPDF to generate a multi-section PDF with a transaction detail table and a credit/debit/balance summary table, saved locally as `Bank_Transactions.pdf`.

Install note (already in `package.json`):
```bash
npm install jspdf@2.5.1 jspdf-autotable@3.5.25
```
