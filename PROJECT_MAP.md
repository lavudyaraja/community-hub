# 🗺️ Community Hub - Complete Project Map
# ప్రాజెక్ట్ మ్యాప్ - సంపూర్ణ నిర్మాణం

---

## 📁 Complete File Structure (పూర్తి ఫైల్ నిర్మాణం)

```
community-hub/
│
├── 📄 Configuration Files
│   ├── package.json                    # Dependencies & scripts
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── next.config.ts                  # Next.js configuration
│   ├── postcss.config.mjs              # PostCSS configuration
│   ├── eslint.config.mjs               # ESLint configuration
│   ├── components.json                 # Shadcn UI configuration
│   └── vercel.json                     # Vercel deployment config
│
├── 📚 Documentation
│   ├── README.md                       # Basic setup guide
│   ├── PROJECT_OVERVIEW.md            # Detailed project overview
│   ├── DATABASE_SETUP.md               # Database setup instructions
│   ├── VERCEL_DEPLOYMENT.md            # Deployment guide
│   └── PROJECT_MAP.md                  # This file - Project map
│
├── 🗄️ Database Scripts (scripts/)
│   ├── init-db.ts                      # Initialize database
│   ├── push-schema.ts                  # Push main schema
│   ├── push-admin-schema.ts            # Push admin schema
│   ├── push-notifications-schema.ts    # Push notifications schema
│   ├── push-validation-queue-schema.ts # Push validation queue schema
│   ├── push-submission-comments-schema.ts # Push comments schema
│   ├── push-rejection-fields.ts        # Push rejection fields
│   ├── verify-admin-db.ts              # Verify admin database
│   └── add-*.sql                       # SQL migration files
│
├── 🎨 Public Assets (public/)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── 💻 Source Code (src/)
    │
    ├── 📱 App Router (app/)
    │   │
    │   ├── 🏠 Root Pages
    │   │   ├── page.tsx                # Landing page
    │   │   ├── layout.tsx              # Root layout
    │   │   ├── globals.css             # Global styles
    │   │   ├── favicon.ico             # Site icon
    │   │   ├── overview/               # Overview page
    │   │   └── new-board/              # New board page
    │   │
    │   ├── 🔐 Authentication (auth/)
    │   │   ├── login/
    │   │   │   └── page.tsx            # User login page
    │   │   ├── register/
    │   │   │   └── page.tsx            # User registration page
    │   │   ├── forgot/
    │   │   │   └── page.tsx            # Password reset page
    │   │   └── admin-auth/
    │   │       ├── login/
    │   │       │   └── page.tsx        # Admin login page
    │   │       └── register/
    │   │           └── page.tsx        # Admin registration page
    │   │
    │   ├── 👤 User Dashboard (dashboard/)
    │   │   ├── page.tsx                # Dashboard home
    │   │   ├── components/
    │   │   │   └── sidebar.tsx         # User sidebar navigation
    │   │   ├── upload/
    │   │   │   └── page.tsx            # File upload page
    │   │   ├── submissions/
    │   │   │   └── page.tsx            # User submissions list
    │   │   ├── status/
    │   │   │   └── page.tsx            # Submission status page
    │   │   ├── dataset-preview/
    │   │   │   ├── page.tsx            # Dataset preview page
    │   │   │   └── components/
    │   │   │       ├── image-view.tsx   # Image preview component
    │   │   │       ├── video-view.tsx  # Video preview component
    │   │   │       ├── audio-view.tsx  # Audio preview component
    │   │   │       ├── web-data-view.tsx # Document preview component
    │   │   │       ├── preview-header.tsx # Preview header
    │   │   │       └── preview-actions.tsx # Preview actions
    │   │   ├── notifications/
    │   │   │   └── page.tsx            # Notifications page
    │   │   ├── profile/
    │   │   │   └── page.tsx            # User profile page
    │   │   └── help/
    │   │       └── page.tsx            # Help & support page
    │   │
    │   ├── 👨‍💼 Admin Dashboard (admin-dashboard/)
    │   │   ├── page.tsx                # Admin dashboard home
    │   │   ├── components/
    │   │   │   └── sidebar.tsx         # Admin sidebar navigation
    │   │   ├── pending-submissions/
    │   │   │   └── page.tsx            # Pending submissions queue
    │   │   ├── validation-queue/
    │   │   │   └── page.tsx            # Validation queue page
    │   │   ├── validated-submissions/
    │   │   │   └── page.tsx            # Validated submissions list
    │   │   ├── rejected-submissions/
    │   │   │   ├── page.tsx            # Rejected submissions list
    │   │   │   └── [id]/
    │   │   │       └── page.tsx        # Rejection details page
    │   │   ├── volunteers/
    │   │   │   └── page.tsx            # Volunteers management
    │   │   ├── reports/
    │   │   │   └── page.tsx            # Reports & analytics
    │   │   ├── guidelines/
    │   │   │   └── page.tsx            # Admin guidelines
    │   │   ├── new-file/
    │   │   │   ├── page.tsx            # New file upload
    │   │   │   └── manual.tsx          # Manual file entry
    │   │   └── profile/
    │   │       └── page.tsx            # Admin profile page
    │   │
    │   ├── 🌍 Regional Hub (regional-hub/)
    │   │   ├── page.tsx                # Regional hub home
    │   │   ├── components/
    │   │   │   └── sidebar.tsx         # Regional hub sidebar
    │   │   ├── region-overview/
    │   │   │   └── page.tsx            # Region overview dashboard
    │   │   ├── ml-validation-queue/
    │   │   │   └── page.tsx            # ML validation queue
    │   │   ├── validated-datasets/
    │   │   │   └── page.tsx            # Validated datasets
    │   │   ├── rejected-datasets/
    │   │   │   └── page.tsx            # Rejected datasets
    │   │   ├── data-categories/
    │   │   │   └── page.tsx            # Data categories management
    │   │   ├── ml-models-status/
    │   │   │   └── page.tsx            # ML models status
    │   │   ├── export-to-iad/
    │   │   │   └── page.tsx            # Export to IAD
    │   │   └── local-hub/
    │   │       └── page.tsx            # Local hub management
    │   │
    │   └── 🔌 API Routes (api/)
    │       │
    │       ├── 🔐 Authentication APIs
    │       │   └── (handled by Next.js auth routes)
    │       │
    │       ├── 👤 User APIs
    │       │   └── submissions/
    │       │       ├── route.ts                    # GET/POST submissions
    │       │       ├── pending/
    │       │       │   └── route.ts                # GET pending submissions
    │       │       ├── validated/
    │       │       │   └── route.ts               # GET validated submissions
    │       │       ├── rejected/
    │       │       │   └── route.ts               # GET rejected submissions
    │       │       └── [id]/
    │       │           ├── route.ts               # GET/DELETE submission by ID
    │       │           ├── submit/
    │       │           │   └── route.ts           # POST submit submission
    │       │           ├── validate/
    │       │           │   └── route.ts           # POST validate submission
    │       │           ├── reject/
    │       │           │   └── route.ts          # POST reject submission
    │       │           ├── preview/
    │       │           │   └── route.ts           # GET submission preview
    │       │           └── comments/
    │       │               └── route.ts           # GET/POST comments
    │       │
    │       ├── 👨‍💼 Admin APIs
    │       │   ├── admin/
    │       │   │   ├── login/
    │       │   │   │   └── route.ts               # POST admin login
    │       │   │   ├── register/
    │       │   │   │   └── route.ts              # POST admin register
    │       │   │   ├── stats/
    │       │   │   │   └── route.ts              # GET admin statistics
    │       │   │   └── users/
    │       │   │       └── route.ts              # GET all users
    │       │   └── validation-queue/
    │       │       └── route.ts                   # GET validation queue
    │       │
    │       ├── 🔔 Notification APIs
    │       │   └── notifications/
    │       │       └── route.ts                   # GET/POST notifications
    │       │
    │       └── 🗄️ Database APIs
    │           ├── db/
    │           │   └── init/
    │           │       └── route.ts               # Initialize database
    │           └── migrate/
    │               └── route.ts                   # Run migrations
    │
    ├── 🧩 Components (components/)
    │   │
    │   ├── 👨‍💼 Admin Components
    │   │   └── admin/
    │   │       └── rejection-dialog.tsx          # Rejection dialog component
    │   │
    │   ├── 👤 User Components
    │   │   └── user/
    │   │       └── rejection-details-dialog.tsx  # Rejection details dialog
    │   │
    │   └── 🎨 UI Components (ui/)
    │       ├── accordion.tsx                      # Accordion component
    │       ├── alert-dialog.tsx                   # Alert dialog
    │       ├── alert.tsx                          # Alert component
    │       ├── avatar.tsx                         # Avatar component
    │       ├── badge.tsx                          # Badge component
    │       ├── button.tsx                         # Button component
    │       ├── card.tsx                           # Card component
    │       ├── chart.tsx                          # Chart component
    │       ├── dialog.tsx                         # Dialog component
    │       ├── form.tsx                           # Form component
    │       ├── input.tsx                          # Input component
    │       ├── label.tsx                          # Label component
    │       ├── select.tsx                         # Select component
    │       ├── table.tsx                          # Table component
    │       ├── tabs.tsx                           # Tabs component
    │       ├── textarea.tsx                       # Textarea component
    │       ├── toast.tsx / sonner.tsx             # Toast notifications
    │       └── ... (40+ UI components from Shadcn)
    │
    ├── 🗄️ Database Layer (database/)
    │   ├── connection.ts                         # Database connection
    │   ├── schema.sql                            # Complete SQL schema
    │   ├── setup.ts                              # Database setup
    │   ├── migrations.ts                         # Migration utilities
    │   ├── index.ts                              # Database exports
    │   │
    │   ├── 📊 Data Models
    │   │   ├── users.ts                          # User model & functions
    │   │   ├── admins.ts                         # Admin model & functions
    │   │   ├── submissions.ts                    # Submission model & functions
    │   │   ├── images.ts                         # Image model & functions
    │   │   ├── videos.ts                         # Video model & functions
    │   │   ├── audio.ts                          # Audio model & functions
    │   │   ├── web-data.ts                       # Web data model & functions
    │   │   ├── validation-queue.ts               # Validation queue model
    │   │   ├── notifications.ts                  # Notification model & functions
    │   │   └── comments.ts                       # Comments model & functions
    │   │
    │   └── README.md                             # Database documentation
    │
    ├── 🛠️ Utilities (lib/)
    │   ├── utils.ts                              # Utility functions
    │   ├── auth.ts                               # Authentication utilities
    │   └── db-client.ts                          # Database client wrapper
    │
    └── 🪝 Hooks (hooks/)
        └── use-mobile.ts                         # Mobile detection hook

```

---

## 🔄 Data Flow Architecture (డేటా ఫ్లో ఆర్కిటెక్చర్)

### 1. User Submission Flow (యూజర్ సమర్పణ ఫ్లో)

```
User Dashboard
    ↓
Upload Page (dashboard/upload/page.tsx)
    ↓
File Selection & Preview
    ↓
POST /api/submissions
    ↓
Database Layer (database/submissions.ts)
    ↓
submissions table (status: 'pending')
    ↓
Type-specific table (images/videos/audio_files/web_data)
    ↓
Notification Created (notifications table)
    ↓
User Dashboard Updated
```

### 2. Admin Validation Flow (అడ్మిన్ వాలిడేషన్ ఫ్లో)

```
Admin Dashboard
    ↓
Pending Submissions Page (admin-dashboard/pending-submissions/page.tsx)
    ↓
GET /api/submissions/pending
    ↓
Admin Reviews Submission
    ↓
POST /api/submissions/[id]/validate OR /reject
    ↓
Database Update (submissions.status = 'validated'/'rejected')
    ↓
admin_actions table (audit log)
    ↓
Notification to User
    ↓
If Validated → validation_queue table
```

### 3. Regional Hub Processing Flow (రీజనల్ హబ్ ప్రాసెసింగ్ ఫ్లో)

```
Regional Hub Dashboard
    ↓
ML Validation Queue (regional-hub/ml-validation-queue/page.tsx)
    ↓
GET /api/validation-queue
    ↓
ML Model Processing
    ↓
Quality Scoring
    ↓
Regional Review
    ↓
Export to IAD (regional-hub/export-to-iad/page.tsx)
```

---

## 🗄️ Database Schema Map (డేటాబేస్ స్కీమా మ్యాప్)

### Core Tables & Relationships

```
users
├── id (PK)
├── email (UNIQUE)
├── name
├── password (hashed)
└── timestamps

    ↓ (1:N)

submissions
├── id (PK)
├── user_email (FK → users.email)
├── file_name
├── file_type (image/audio/video/document)
├── file_size
├── status (pending/validated/rejected/successful)
├── preview
└── timestamps

    ↓ (1:1)

Type-Specific Tables:
├── images
│   ├── id (PK)
│   ├── submission_id (FK → submissions.id)
│   ├── user_email
│   ├── preview_data (base64)
│   ├── width, height
│   └── mime_type
│
├── videos
│   ├── id (PK)
│   ├── submission_id (FK → submissions.id)
│   ├── preview_data (base64)
│   ├── duration
│   └── mime_type
│
├── audio_files
│   ├── id (PK)
│   ├── submission_id (FK → submissions.id)
│   ├── preview_data (base64)
│   ├── duration
│   └── mime_type
│
└── web_data
    ├── id (PK)
    ├── submission_id (FK → submissions.id)
    ├── preview_data
    ├── file_extension
    └── mime_type

admins
├── id (PK)
├── email (UNIQUE)
├── name
├── password (hashed)
├── admin_role (super_admin/validator_admin)
├── country
├── account_status (active/pending/suspended)
└── timestamps

    ↓ (1:N)

admin_actions (Audit Log)
├── id (PK)
├── admin_id (FK → admins.id)
├── action_type
├── target_type
├── target_id
├── description
├── ip_address
├── user_agent
└── created_at

notifications
├── id (PK)
├── user_email (FK → users.email)
├── type (success/error/info/warning)
├── title
├── message
├── read (boolean)
├── action_url
└── timestamps

validation_queue
├── id (PK)
├── submission_id (FK → submissions.id)
├── status
├── quality_score
└── timestamps
```

---

## 🔌 API Endpoints Map (API ఎండ్‌పాయింట్‌లు మ్యాప్)

### User APIs

| Method | Endpoint | Description | File Location |
|--------|----------|-------------|---------------|
| GET | `/api/submissions` | Get user's submissions | `api/submissions/route.ts` |
| POST | `/api/submissions` | Create new submission | `api/submissions/route.ts` |
| GET | `/api/submissions/pending` | Get pending submissions | `api/submissions/pending/route.ts` |
| GET | `/api/submissions/validated` | Get validated submissions | `api/submissions/validated/route.ts` |
| GET | `/api/submissions/rejected` | Get rejected submissions | `api/submissions/rejected/route.ts` |
| GET | `/api/submissions/[id]` | Get submission details | `api/submissions/[id]/route.ts` |
| DELETE | `/api/submissions/[id]` | Delete submission | `api/submissions/[id]/route.ts` |
| GET | `/api/submissions/[id]/preview` | Get submission preview | `api/submissions/[id]/preview/route.ts` |
| GET | `/api/submissions/[id]/comments` | Get submission comments | `api/submissions/[id]/comments/route.ts` |
| POST | `/api/submissions/[id]/comments` | Add comment | `api/submissions/[id]/comments/route.ts` |

### Admin APIs

| Method | Endpoint | Description | File Location |
|--------|----------|-------------|---------------|
| POST | `/api/admin/login` | Admin login | `api/admin/login/route.ts` |
| POST | `/api/admin/register` | Admin registration | `api/admin/register/route.ts` |
| GET | `/api/admin/stats` | Get dashboard statistics | `api/admin/stats/route.ts` |
| GET | `/api/admin/users` | Get all users | `api/admin/users/route.ts` |
| POST | `/api/submissions/[id]/validate` | Validate submission | `api/submissions/[id]/validate/route.ts` |
| POST | `/api/submissions/[id]/reject` | Reject submission | `api/submissions/[id]/reject/route.ts` |
| GET | `/api/validation-queue` | Get validation queue | `api/validation-queue/route.ts` |

### Notification APIs

| Method | Endpoint | Description | File Location |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | `api/notifications/route.ts` |
| POST | `/api/notifications` | Create notification | `api/notifications/route.ts` |
| PUT | `/api/notifications/[id]` | Update notification | `api/notifications/route.ts` |

### Database APIs

| Method | Endpoint | Description | File Location |
|--------|----------|-------------|---------------|
| POST | `/api/db/init` | Initialize database | `api/db/init/route.ts` |
| POST | `/api/migrate` | Run migrations | `api/migrate/route.ts` |

---

## 🎯 Feature Map by Module (మాడ్యూల్ వారీగా ఫీచర్ మ్యాప్)

### User Dashboard Module

| Feature | Page/Component | API Endpoint | Database Table |
|---------|---------------|--------------|----------------|
| File Upload | `dashboard/upload/page.tsx` | `POST /api/submissions` | `submissions`, `images/videos/audio_files/web_data` |
| View Submissions | `dashboard/submissions/page.tsx` | `GET /api/submissions` | `submissions` |
| Submission Status | `dashboard/status/page.tsx` | `GET /api/submissions` | `submissions` |
| Dataset Preview | `dashboard/dataset-preview/page.tsx` | `GET /api/submissions/[id]/preview` | Type-specific tables |
| Notifications | `dashboard/notifications/page.tsx` | `GET /api/notifications` | `notifications` |
| Profile | `dashboard/profile/page.tsx` | - | `users` |
| Help | `dashboard/help/page.tsx` | - | - |

### Admin Dashboard Module

| Feature | Page/Component | API Endpoint | Database Table |
|---------|---------------|--------------|----------------|
| Dashboard Overview | `admin-dashboard/page.tsx` | `GET /api/admin/stats` | Multiple tables |
| Pending Submissions | `admin-dashboard/pending-submissions/page.tsx` | `GET /api/submissions/pending` | `submissions` |
| Validation Queue | `admin-dashboard/validation-queue/page.tsx` | `GET /api/validation-queue` | `validation_queue` |
| Validated Submissions | `admin-dashboard/validated-submissions/page.tsx` | `GET /api/submissions/validated` | `submissions` |
| Rejected Submissions | `admin-dashboard/rejected-submissions/page.tsx` | `GET /api/submissions/rejected` | `submissions` |
| Validate Submission | `admin-dashboard/pending-submissions/page.tsx` | `POST /api/submissions/[id]/validate` | `submissions`, `admin_actions` |
| Reject Submission | `admin-dashboard/pending-submissions/page.tsx` | `POST /api/submissions/[id]/reject` | `submissions`, `admin_actions` |
| Volunteers Management | `admin-dashboard/volunteers/page.tsx` | `GET /api/admin/users` | `users` |
| Reports | `admin-dashboard/reports/page.tsx` | `GET /api/admin/stats` | Multiple tables |
| Guidelines | `admin-dashboard/guidelines/page.tsx` | - | - |
| Profile | `admin-dashboard/profile/page.tsx` | - | `admins` |

### Regional Hub Module

| Feature | Page/Component | API Endpoint | Database Table |
|---------|---------------|--------------|----------------|
| Region Overview | `regional-hub/region-overview/page.tsx` | `GET /api/validation-queue` | `validation_queue` |
| ML Validation Queue | `regional-hub/ml-validation-queue/page.tsx` | `GET /api/validation-queue` | `validation_queue` |
| Validated Datasets | `regional-hub/validated-datasets/page.tsx` | `GET /api/submissions/validated` | `submissions` |
| Rejected Datasets | `regional-hub/rejected-datasets/page.tsx` | `GET /api/submissions/rejected` | `submissions` |
| Data Categories | `regional-hub/data-categories/page.tsx` | - | - |
| ML Models Status | `regional-hub/ml-models-status/page.tsx` | - | - |
| Export to IAD | `regional-hub/export-to-iad/page.tsx` | - | `submissions` |
| Local Hub | `regional-hub/local-hub/page.tsx` | - | - |

---

## 🔗 Component Dependencies (కాంపోనెంట్ డిపెండెన్సీలు)

### User Dashboard Components

```
dashboard/page.tsx
├── components/sidebar.tsx
├── components/ui/card.tsx
├── components/ui/button.tsx
└── components/ui/chart.tsx

dashboard/upload/page.tsx
├── components/ui/input.tsx
├── components/ui/button.tsx
├── components/ui/card.tsx
└── components/ui/progress.tsx

dashboard/dataset-preview/page.tsx
├── components/image-view.tsx
├── components/video-view.tsx
├── components/audio-view.tsx
├── components/web-data-view.tsx
├── components/preview-header.tsx
└── components/preview-actions.tsx
```

### Admin Dashboard Components

```
admin-dashboard/page.tsx
├── components/sidebar.tsx
├── components/ui/card.tsx
├── components/ui/chart.tsx
└── components/ui/table.tsx

admin-dashboard/pending-submissions/page.tsx
├── components/admin/rejection-dialog.tsx
├── components/ui/dialog.tsx
├── components/ui/button.tsx
└── components/ui/table.tsx
```

---

## 🛠️ Technology Stack Map (టెక్నాలజీ స్టాక్ మ్యాప్)

### Frontend Stack

```
Next.js 16.1.3
├── React 19.2.3
├── TypeScript 5
├── Tailwind CSS 4
├── Shadcn UI Components
├── Recharts (Data Visualization)
├── Lucide React (Icons)
├── React Hook Form (Forms)
├── Zod (Validation)
└── Sonner (Toast Notifications)
```

### Backend Stack

```
Next.js API Routes
├── PostgreSQL (Neon Cloud)
├── pg (PostgreSQL Client)
├── JWT (Authentication)
└── bcrypt (Password Hashing)
```

### Development Tools

```
├── ESLint (Linting)
├── TypeScript (Type Checking)
├── tsx (TypeScript Execution)
└── Vercel (Deployment)
```

---

## 📊 Status Flow Diagram (స్టేటస్ ఫ్లో డయాగ్రామ్)

```
Submission Status Flow:

[Created]
    ↓
pending ──────────→ validated ──────────→ validation_queue
    │                      │
    │                      ↓
    │                 successful
    │
    ↓
rejected
```

### Status Transitions

1. **pending** → **validated** (Admin approval)
2. **pending** → **rejected** (Admin rejection)
3. **validated** → **validation_queue** (ML processing)
4. **validated** → **successful** (Final approval)

---

## 🔐 Authentication Flow Map (ఆథెంటికేషన్ ఫ్లో మ్యాప్)

### User Authentication

```
/auth/login/page.tsx
    ↓
POST /api/auth/login
    ↓
lib/auth.ts (verify credentials)
    ↓
database/users.ts (check user)
    ↓
JWT Token Generated
    ↓
Token stored in localStorage
    ↓
Redirect to /dashboard
```

### Admin Authentication

```
/auth/admin-auth/login/page.tsx
    ↓
POST /api/admin/login
    ↓
lib/auth.ts (verify admin credentials)
    ↓
database/admins.ts (check admin)
    ↓
JWT Token Generated
    ↓
Token stored in localStorage
    ↓
Redirect to /admin-dashboard
```

---

## 📝 Key Files Reference (ముఖ్యమైన ఫైళ్లు రిఫరెన్స్)

### Configuration
- `package.json` - All dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration

### Database
- `src/database/schema.sql` - Complete database schema
- `src/database/connection.ts` - Database connection setup
- `src/database/*.ts` - Individual table models

### Authentication
- `src/lib/auth.ts` - Authentication utilities
- `src/app/auth/**` - Authentication pages

### Core Features
- `src/app/dashboard/**` - User dashboard pages
- `src/app/admin-dashboard/**` - Admin dashboard pages
- `src/app/regional-hub/**` - Regional hub pages
- `src/app/api/**` - All API routes

---

## 🚀 Quick Navigation Guide (త్వరిత నావిగేషన్ గైడ్)

### To Add a New Feature:

1. **New Page**: Add to `src/app/[module]/[feature]/page.tsx`
2. **New API**: Add to `src/app/api/[module]/[feature]/route.ts`
3. **New Component**: Add to `src/components/[category]/[component].tsx`
4. **New Database Table**: 
   - Add SQL to `src/database/schema.sql`
   - Create model in `src/database/[table-name].ts`
5. **Update Schema**: Run `npx tsx scripts/push-schema.ts`

### To Debug:

1. **Database Issues**: Check `src/database/connection.ts`
2. **API Issues**: Check `src/app/api/[route]/route.ts`
3. **Component Issues**: Check `src/components/[component].tsx`
4. **Authentication Issues**: Check `src/lib/auth.ts`

---

## 📌 Important Notes (ముఖ్యమైన గమనికలు)

1. **File Types Supported**: image, audio, video, document
2. **Max File Size**: 100MB (configurable)
3. **Database**: PostgreSQL (Neon Cloud recommended)
4. **Deployment**: Vercel (automatic on git push)
5. **Environment Variables**: `DATABASE_URL` required

---

*Last Updated: 2024*
*Version: 0.1.0*
*Project: Community Hub*
