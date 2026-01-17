# Community Hub

A comprehensive data submission and validation platform built with Next.js 16, TypeScript, and PostgreSQL.

## Features

- **User Dashboard**: Upload and manage data submissions
- **Admin Dashboard**: Validate, approve, or reject submissions
- **Validation Hub**: Automated and manual validation workflows
- **Database Integration**: PostgreSQL database with Neon
- **Authentication**: Secure user and admin authentication
- **File Support**: Images, Audio, Video, and Documents

## Tech Stack

- **Framework**: Next.js 16.1.3 with Turbopack
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lavudyaraja/community-hub.git
cd community-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
```

4. Initialize the database:
```bash
npx tsx scripts/push-admin-schema.ts
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
community-hub/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── admin-dashboard/  # Admin pages
│   │   ├── dashboard/         # User dashboard pages
│   │   ├── auth/             # Authentication pages
│   │   └── api/              # API routes
│   ├── components/        # React components
│   ├── database/         # Database functions
│   └── lib/              # Utility functions
├── scripts/              # Database setup scripts
└── public/               # Static assets
```

## Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup instructions.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
4. Deploy!

The application will be automatically deployed on every push to the main branch.

## API Routes

- `GET /api/submissions` - Get user submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions/pending` - Get pending submissions (admin)
- `POST /api/submissions/[id]/validate` - Validate submission (admin)
- `POST /api/submissions/[id]/reject` - Reject submission (admin)

## License

MIT
