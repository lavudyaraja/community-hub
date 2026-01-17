# Database Setup Instructions

## Neon PostgreSQL Database Integration

This project now uses Neon PostgreSQL database instead of localStorage for all data storage.

## Setup Steps

### 1. Install Dependencies

```bash
npm install pg @types/pg
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with your Neon database connection string:

```env
DATABASE_URL=postgresql://neondb_owner:npg_FKfar7I6QGle@ep-hidden-cloud-ahkj741s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Database Schema

The database schema is automatically created when you first access the API routes. The schema includes:

- **users** table - User information
- **submissions** table - File uploads and metadata
- Indexes for performance
- Triggers for auto-updating timestamps

### 4. Run Migrations (Optional)

You can manually trigger migrations by visiting:
```
http://localhost:3000/api/migrate
```

Or run the setup script:
```bash
npx tsx src/database/setup.ts
```

## Database Structure

### Submissions Table

```sql
CREATE TABLE submissions (
  id VARCHAR(255) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'successful',
  preview TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Routes

- `GET /api/submissions?userEmail=...` - Get all submissions for a user
- `POST /api/submissions` - Create a new submission
- `DELETE /api/submissions/[id]?userEmail=...` - Delete a submission
- `GET /api/submissions/[id]` - Get a single submission
- `GET /api/migrate` - Run database migrations

## Client Functions

Use `@/lib/db-client` for client-side operations:

```typescript
import { getUserSubmissions, createSubmission, deleteSubmission } from '@/lib/db-client';

// Get submissions
const submissions = await getUserSubmissions(userEmail);

// Create submission
await createSubmission({
  id: 'unique-id',
  userEmail: 'user@example.com',
  fileName: 'file.jpg',
  fileType: 'image',
  fileSize: 1024000,
  preview: 'data:image/jpeg;base64,...'
});

// Delete submission
await deleteSubmission(id, userEmail);
```

## Migration from localStorage

All localStorage usage for submissions has been removed and replaced with database calls. The following pages have been updated:

- ✅ `/dashboard/upload` - Now saves to database
- ✅ `/dashboard/dataset-preview` - Now loads from database
- ✅ `/dashboard` - Now loads from database

## Notes

- Preview data (base64) is stored in the database for images, videos, and audio files
- Large previews (>2MB for documents) are automatically excluded to prevent database bloat
- All queries are user-scoped for security
- Database connection uses connection pooling for performance
