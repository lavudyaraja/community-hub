# Database Setup

This project uses Neon PostgreSQL database for storing all data.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file** in the root directory with your database connection string:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_FKfar7I6QGle@ep-hidden-cloud-ahkj741s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

3. **Run migrations** (schema will be created automatically on first API call):
   - The schema is defined in `src/database/schema.sql`
   - Migrations run automatically when the server starts

## Database Schema

### Tables

1. **users** - Stores user information
   - id (SERIAL PRIMARY KEY)
   - email (VARCHAR, UNIQUE)
   - name (VARCHAR)
   - password (VARCHAR)
   - created_at, updated_at (TIMESTAMP)

2. **submissions** - Stores uploaded file submissions
   - id (VARCHAR PRIMARY KEY)
   - user_email (VARCHAR, FOREIGN KEY to users.email)
   - file_name (VARCHAR)
   - file_type (VARCHAR: 'image', 'audio', 'video', 'document')
   - file_size (BIGINT)
   - status (VARCHAR)
   - preview (TEXT) - Base64 encoded preview data
   - created_at, updated_at (TIMESTAMP)

## API Routes

- `GET /api/submissions?userEmail=...` - Get all submissions for a user
- `POST /api/submissions` - Create a new submission
- `DELETE /api/submissions/[id]?userEmail=...` - Delete a submission
- `GET /api/submissions/[id]` - Get a single submission

## Client Functions

Use `@/lib/db-client` for client-side database operations:
- `getUserSubmissions(userEmail)` - Fetch user submissions
- `createSubmission(data)` - Create new submission
- `deleteSubmission(id, userEmail)` - Delete submission

## Migration

The database schema is automatically created when the API routes are first accessed. The schema includes:
- Tables with proper constraints
- Indexes for performance
- Triggers for auto-updating timestamps
