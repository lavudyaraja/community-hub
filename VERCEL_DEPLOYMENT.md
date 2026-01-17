# Vercel Deployment Guide

## Step 1: Push to GitHub ✅
Code has been successfully pushed to: `https://github.com/lavudyaraja/community-hub.git`

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**: Visit [https://vercel.com](https://vercel.com)

2. **Sign in**: Use your GitHub account to sign in

3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select `lavudyaraja/community-hub`
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Environment Variables**:
   Add the following environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
     ```
     postgresql://neondb_owner:npg_FKfar7I6QGle@ep-hidden-cloud-ahkj741s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```

6. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Option B: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add Environment Variable**:
   ```bash
   vercel env add DATABASE_URL
   ```
   Paste your database connection string when prompted.

5. **Redeploy with Environment Variable**:
   ```bash
   vercel --prod
   ```

## Step 3: Initialize Database on Vercel

After deployment, you need to initialize the database:

1. **Option 1: Use API Route**:
   Visit: `https://your-app.vercel.app/api/db/init`
   This will create all necessary tables.

2. **Option 2: Run Script Locally**:
   ```bash
   npx tsx scripts/push-admin-schema.ts
   ```

## Important Notes

- ✅ `.env.local` files are automatically ignored (in .gitignore)
- ✅ Environment variables must be set in Vercel dashboard
- ✅ Database connection string should be kept secure
- ✅ Vercel automatically builds on every push to main branch

## Post-Deployment Checklist

- [ ] Database initialized
- [ ] Environment variables set
- [ ] Test admin registration
- [ ] Test user registration
- [ ] Test file upload
- [ ] Test admin validation workflow

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify database connection string is correct
4. Check that all dependencies are in `package.json`
