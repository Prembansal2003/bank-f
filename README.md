# 🌐 Trusted Bank — Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

A modern banking frontend built with **React 19**, **Vite**, and **Ant Design**. Supports three user roles — Admin, Employee, and Customer — each with dedicated dashboards, protected routing, and full banking operations.

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Default Login Credentials](#-default-login-credentials)
- [Routing Architecture](#-routing-architecture)
- [Role-Based Access](#-role-based-access)
- [Key Components](#-key-components)
- [Utilities](#-utilities-modulesjs)
- [Deployment](#-deployment)

---

## 🚀 Features

- **JWT Authentication** — Cookie-based token storage with auto-verification on every route
- **Role-Based Routing** — Guard component protects all routes by user type
- **Customer Account Management** — Create, edit, toggle active, delete with photo/signature/document uploads
- **Transaction Engine** — Credit/Debit entries with live balance update and customer lookup by account number
- **Dashboard** — Summary cards for credits, debits, total transactions, and running balance
- **Transaction Reports** — Paginated table with date filtering, account filtering, PDF export, and print
- **File Uploads** — Photo, signature, and document upload to Cloudinary with live preview
- **Responsive UI** — Ant Design components with Tailwind utility classes
- **SWR Data Fetching** — Stale-while-revalidate for branding and configuration data

---

## 🛠 Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Build Tool | Vite | 7 |
| UI Library | Ant Design | 5 |
| Styling | Tailwind CSS | 4 |
| Routing | React Router DOM | 7 |
| HTTP Client | Axios | 1.13 |
| Data Fetching | SWR | 2.3 |
| Auth | jsonwebtoken | 9 |
| Cookie Management | universal-cookie | 8 |
| PDF Export | jsPDF + jsPDF-AutoTable | 2.5 / 3.5 |
| Alerts | SweetAlert2 | 2 |

---

## 📂 Project Structure

```
bank-f/
├── src/
│   ├── App.jsx                         # Route definitions with lazy loading
│   └── main.jsx                        # React entry point
│
├── components/
│   ├── Admin/
│   │   ├── index.jsx                   # Admin dashboard page
│   │   ├── AdminNewAccount/            # Wraps NewAccount in Admin layout
│   │   ├── Branch/                     # Branch CRUD management
│   │   ├── Branding/                   # Branding & bank settings
│   │   ├── Currency/                   # Currency management
│   │   ├── NewEmployee/                # Create / manage staff accounts
│   │   └── NewTransaction/             # Wraps NewTransaction in Admin layout
│   │
│   ├── Employee/
│   │   ├── index.jsx                   # Employee dashboard page
│   │   ├── EmployeeNewAccount/         # Wraps NewAccount in Employee layout
│   │   └── EmpTransaction/             # Wraps NewTransaction in Employee layout
│   │
│   ├── Customer/
│   │   ├── index.jsx                   # Customer dashboard page
│   │   └── Transactions/               # Customer transaction history view
│   │
│   ├── Shared/
│   │   ├── NewAccount/                 # Full customer account management (shared by Admin + Employee)
│   │   ├── NewTransaction/             # Transaction creation (shared by Admin + Employee)
│   │   ├── Dashboard/                  # Summary cards (shared by all roles)
│   │   └── TransactionTable/           # Paginated, filterable, exportable table
│   │
│   ├── Layout/
│   │   ├── Adminlayout/                # Sidebar + header for Admin
│   │   ├── Employeelayout/             # Sidebar + header for Employee
│   │   ├── Customerlayout/             # Sidebar + header for Customer
│   │   └── Homelayout/                 # Layout for login/home pages
│   │
│   ├── Guard/
│   │   └── index.jsx                   # JWT verification + role-based route protection
│   │
│   ├── Home/
│   │   ├── index.jsx                   # Landing/home page
│   │   └── Login/                      # Login form
│   │
│   ├── Loader/                         # Loading spinner component
│   └── PageNotFound/                   # 404 page
│
├── modules/
│   └── modules.js                      # Shared utilities (http, trim, uploadFile, formatDate, PDF, print)
│
├── .env                                # Environment configuration
├── vite.config.js
└── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- Trusted Bank Backend running (see backend README)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/bank-f.git
cd bank-f

# 2. Install dependencies
npm install

# 3. Create .env file (see section below)

# 4. Start development server
npm run dev
```

App runs on **http://localhost:5173** by default.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BASEURL=http://localhost:8080
```

For production, replace with your deployed backend URL:

```env
VITE_BASEURL=https://your-backend.onrender.com
```

---

## 🔑 Default Login Credentials

On first backend startup, an Admin account is seeded automatically using the `ADMIN_USER` value from the backend `.env`.

| Role | Email | Password |
|---|---|---|
| Admin | `trusted2003@gmail.com` (or your `ADMIN_USER`) | `123456` |
| Employee | Created by Admin via New Employee form | Received by email |
| Customer | Created by Admin/Employee via New Account form | Received by email |

---

## 🚦 Routing Architecture

Defined in `src/App.jsx` using **React Router v7** with lazy-loaded components.

```
/                              → Home page
/admin                         → Admin dashboard        [Guard: admin]
/admin/branding                → Bank branding settings [Guard: admin]
/admin/branch                  → Branch management      [Guard: admin]
/admin/currency                → Currency management    [Guard: admin]
/admin/new-employee            → Create staff accounts  [Guard: admin]
/admin/new-account             → Open customer account  [Guard: admin]
/admin/new-transaction         → Create transaction     [Guard: admin]

/employee                      → Employee dashboard     [Guard: employee]
/employee/new-account          → Open customer account  [Guard: employee]
/employee/new-transaction      → Create transaction     [Guard: employee]

/customer                      → Customer dashboard     [Guard: customer]
/customer/transaction          → View transactions      [Guard: customer]

/*                             → 404 Page Not Found
```

---

## 🛡 Role-Based Access

The `Guard` component (`components/Guard/index.jsx`) runs on every protected route:

1. Reads the `authToken` cookie
2. Calls `GET /api/verify-token` with the token
3. Checks `userType` from session storage matches the required role
4. Redirects to `/` if token is invalid or role does not match

No protected page is accessible without a valid JWT and matching role.

---

## 🧩 Key Components

### `Shared/NewAccount`
The main customer account management screen, shared between Admin and Employee roles.

- **Create** — Opens a modal form with account number auto-assigned from branding config
- **Edit** — Pre-fills form with existing customer data; password/email/accountNo are locked
- **Toggle Active** — Enable or disable customer login access
- **Delete** — Removes customer record and linked login account (Admin only)
- **Upload** — Photo, signature, document uploaded to Cloudinary with live preview
- **Search** — Filters the table by name, email, mobile, address, account number, branch, and balance

### `Shared/NewTransaction`
Credit and Debit transaction creation:

- Lookup customer by account number
- Displays customer details before confirming
- Updates `finalBalance` on the customer record after each transaction

### `Shared/Dashboard`
Summary cards displaying:
- Total credits
- Total debits
- Transaction count
- Current balance

### `Shared/TransactionTable`
Full-featured transaction history:
- Paginated results
- Filter by date range
- Filter by account number or branch
- **Export to PDF** using jsPDF + AutoTable
- **Print** directly from browser

### `Admin/NewEmployee`
Staff account creation and management:
- Create Admin or Employee accounts
- Assign to a branch
- Toggle active status
- Edit or delete staff

---

## 🧰 Utilities (`modules/modules.js`)

| Utility | Description |
|---|---|
| `http(token)` | Returns an Axios instance with `Authorization: Bearer <token>` header and base URL from `VITE_BASEURL` |
| `trim(obj)` | Recursively trims whitespace from all string values in a form object |
| `uploadFile(file, folder)` | Uploads a file to Cloudinary via `POST /api/upload` and returns the file URL |
| `formatDate(dateStr)` | Formats an ISO date string to a readable `DD/MM/YYYY` format |
| `exportPDF(data)` | Generates a formatted PDF of transaction data using jsPDF + AutoTable |
| `printTable(data)` | Opens a styled print window with transaction table |

---

## 🚀 Deployment

### Build for production

```bash
npm run build
```

This generates a `/dist` folder with static assets.

### Deploy `/dist` to any static host

| Platform | Notes |
|---|---|
| **Vercel** | Connect GitHub repo, auto-deploys on push |
| **Netlify** | Drag and drop `/dist` or connect repo |
| **Cloudflare Pages** | Fast global CDN, free tier available |

### Important: update `.env` before building

```env
VITE_BASEURL=https://your-production-backend-url.com
```

### React Router — fix 404 on refresh

When deploying to Vercel or Netlify, add a redirect rule so all routes serve `index.html`:

**Netlify** (`public/_redirects`):
```
/* /index.html 200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
