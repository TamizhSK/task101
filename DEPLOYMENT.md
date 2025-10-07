# Deployment Guide - ROI Calculator

This guide covers deploying the ROI Calculator as a full-stack application on **Vercel** with an external PostgreSQL database.

## 🚀 Quick Deployment (Recommended)

### Prerequisites
- GitHub account with your code pushed
- Vercel account (free tier works)
- Database provider account (Render, Supabase, or Neon)

## 📊 Database Setup

### Option 1: Render PostgreSQL (Free Tier Available)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "PostgreSQL"
3. Choose a name (e.g., `roi-calculator-db`)
4. Select free tier
5. Click "Create Database"
6. Copy the **External Database URL** (starts with `postgresql://`)

### Option 2: Supabase (Recommended - Free Tier)
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string under "Connection string"
5. Replace `[YOUR-PASSWORD]` with your actual password

### Option 3: Neon (Serverless PostgreSQL)
1. Go to [Neon](https://neon.tech)
2. Create new project
3. Copy the connection string from dashboard

## 🌐 Vercel Deployment

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect SvelteKit

### Step 2: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Database (Required)
DATABASE_URL=postgresql://username:password@host:5432/database

# App URL (Will be auto-set by Vercel, but you can override)
PUBLIC_APP_URL=https://your-app-name.vercel.app

# Email (Optional - for PDF reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 3: Deploy
1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Your app will be live at `https://your-app-name.vercel.app`

### Step 4: Initialize Database
After first deployment, run database setup:

1. Go to Vercel Dashboard → Your Project → Functions
2. Or use Vercel CLI locally:
```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npm run db:push
```

## 🔧 Configuration Files Explained

### `vercel.json`
```json
{
  "framework": "sveltekit",
  "functions": {
    "src/routes/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  }
}
```

### `svelte.config.js`
```javascript
import adapter from '@sveltejs/adapter-vercel';

const config = {
  kit: {
    adapter: adapter()
  }
};
```

## 📋 Post-Deployment Checklist

### ✅ Test Core Functionality
1. **ROI Calculator**: Enter values and click "Calculate ROI"
2. **Scenarios**: Save, load, and delete scenarios
3. **PDF Reports**: Generate and download reports
4. **Email**: Test email delivery (if configured)

### ✅ Verify API Endpoints
- `GET /api/scenarios` - List scenarios
- `POST /api/scenarios` - Create scenario
- `POST /api/simulate` - Calculate ROI
- `POST /api/report/generate` - Generate PDF

### ✅ Performance Check
- Page load speed
- API response times
- Mobile responsiveness

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if DATABASE_URL is correct
echo $DATABASE_URL

# Test connection locally
npm run db:push
```

### Build Failures
- Ensure Node.js 18.x is specified
- Check for TypeScript errors: `npm run check`
- Verify all dependencies: `npm install`

### API Errors
- Check Vercel function logs in dashboard
- Verify environment variables are set
- Test API endpoints individually

### Email Issues
- Use Gmail App Passwords (not regular password)
- Verify SMTP settings
- Check spam folder for test emails

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files to Git
- Use strong database passwords
- Rotate credentials regularly

### Database Security
- Enable SSL connections
- Use connection pooling
- Regular backups

## 📈 Performance Optimization

### Database
```sql
-- Add indexes for better performance
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at);
CREATE INDEX idx_email_captures_created_at ON email_captures(created_at);
```

### Vercel Functions
- Functions auto-scale and have cold start optimization
- 30-second timeout configured for PDF generation
- Regional deployment (iad1) for better performance

## 🔄 Updates and Maintenance

### Updating the App
1. Push changes to GitHub
2. Vercel auto-deploys from main branch
3. Monitor deployment in Vercel dashboard

### Database Migrations
```bash
# For schema changes
npx prisma db push

# For production migrations
npx prisma migrate deploy
```

## 💰 Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 100 serverless functions
- **Render PostgreSQL**: 1GB storage, 90 days retention
- **Supabase**: 500MB database, 2GB bandwidth

### Scaling Costs
- Vercel Pro: $20/month per member
- Render PostgreSQL: $7/month for 1GB
- Supabase Pro: $25/month per project

## 📞 Support

### Getting Help
- Vercel: [Documentation](https://vercel.com/docs)
- Render: [Documentation](https://render.com/docs)
- Supabase: [Documentation](https://supabase.com/docs)

### Common Resources
- [SvelteKit Deployment](https://kit.svelte.dev/docs/adapters)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)