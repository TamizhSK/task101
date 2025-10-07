# Deployment Guide

This ROI Calculator application is designed to be deployed with:
- **Frontend**: Vercel (SvelteKit)
- **Backend**: Render (Node.js API routes)
- **Database**: PostgreSQL (Render or external provider)

## Prerequisites

1. GitHub repository with your code
2. Vercel account
3. Render account
4. PostgreSQL database (Render PostgreSQL or external provider)

## Database Setup

### Option 1: Render PostgreSQL
1. Go to Render Dashboard
2. Create a new PostgreSQL database
3. Copy the connection string

### Option 2: External PostgreSQL Provider
- Use services like Supabase, PlanetScale, or AWS RDS
- Get the connection string

## Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to Vercel Dashboard
   - Import your GitHub repository
   - Select the SvelteKit framework preset

2. **Environment Variables**
   Set these in Vercel Dashboard > Settings > Environment Variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   PUBLIC_APP_URL=https://your-app.vercel.app
   SMTP_HOST=your-smtp-host
   SMTP_PORT=587
   SMTP_USER=your-email
   SMTP_PASS=your-password
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - The build command is: `npm run build`
   - Output directory: `.svelte-kit/output/client`

## Backend API Routes

The SvelteKit API routes will be deployed as Vercel serverless functions:
- `/api/simulate` - ROI calculations
- `/api/scenarios` - Scenario management
- `/api/scenarios/[id]` - Individual scenario operations
- `/api/report/generate` - PDF report generation

## Database Migration

After deployment, run Prisma migrations:

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PUBLIC_APP_URL` | Your app's public URL | `https://roi-calc.vercel.app` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password/app password | `your-app-password` |

## Post-Deployment Checklist

1. ✅ Verify database connection
2. ✅ Test ROI calculations
3. ✅ Test scenario save/load/delete
4. ✅ Test PDF report generation
5. ✅ Test email functionality (if SMTP configured)
6. ✅ Check responsive design on mobile

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check if database allows external connections
   - Run `npx prisma db push` to sync schema

2. **Build Failures**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

3. **API Route Errors**
   - Verify environment variables are set
   - Check Vercel function logs
   - Ensure Prisma client is generated

4. **Email Issues**
   - Verify SMTP credentials
   - Check if using app passwords (Gmail)
   - Test with a simple email service first

## Performance Optimization

1. **Database**
   - Add indexes for frequently queried fields
   - Use connection pooling for production

2. **Frontend**
   - Images are optimized automatically by Vercel
   - Static assets are cached via CDN

3. **API Routes**
   - Vercel functions have cold start optimization
   - Consider caching for heavy calculations

## Monitoring

- Use Vercel Analytics for frontend performance
- Monitor API route performance in Vercel Dashboard
- Set up database monitoring if using external provider

## Security

1. **Environment Variables**
   - Never commit .env files
   - Use strong database passwords
   - Rotate SMTP credentials regularly

2. **Database**
   - Use SSL connections in production
   - Limit database user permissions
   - Regular backups

3. **API Security**
   - Input validation is implemented via Zod schemas
   - Rate limiting can be added if needed
   - CORS is handled by SvelteKit