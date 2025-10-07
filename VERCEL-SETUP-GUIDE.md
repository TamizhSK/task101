# 🚀 Vercel Database Setup - Step by Step

## ✅ Step 1: Clean vercel.json (DONE)
Removed all `@database_url` references from vercel.json

## 🔧 Step 2: Set Environment Variable in Vercel Dashboard

### Go to Vercel Dashboard:
1. Navigate to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project name
3. Go to **Settings** → **Environment Variables**

### Add DATABASE_URL Variable:
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:Sewy1324%40%23@host:port/task101`
- **Target**: ✅ Production ✅ Preview (uncheck Development if you want)

### ⚠️ Important Notes:
- **NO quotes** around the value in Vercel UI
- **URL encode special characters**: `@` becomes `%40`, `#` becomes `%23`
- Replace `host:port` with your actual database host and port

## 🔍 Your Database URL Format

Based on your .env, you need to replace `host:port` with your actual database details:

### If using local PostgreSQL:
```
postgresql://postgres:Sewy1324%40%23@localhost:5432/task101
```

### If using Render PostgreSQL:
```
postgresql://postgres:Sewy1324%40%23@dpg-xxxxx-a.oregon-postgres.render.com:5432/task101
```

### If using Supabase:
```
postgresql://postgres:Sewy1324%40%23@db.xxxxx.supabase.co:5432/postgres
```

## 📋 Complete Vercel Environment Variables Setup

Add these variables in Vercel Dashboard:

| Key | Value | Target |
|-----|-------|--------|
| `DATABASE_URL` | `postgresql://postgres:Sewy1324%40%23@YOUR_HOST:5432/task101` | Production, Preview |
| `PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production, Preview |
| `SMTP_HOST` | `smtp.gmail.com` | Production, Preview |
| `SMTP_PORT` | `587` | Production, Preview |
| `SMTP_USER` | `walkman1970s@gmail.com` | Production, Preview |
| `SMTP_PASS` | `bygxxwjrbskzjush` | Production, Preview |
| `SMTP_FROM` | `walkman1970s@gmail.com` | Production, Preview |

## 🎯 Step 3: Database Host Options

### Option A: Create Production Database on Render
1. Go to [render.com](https://render.com)
2. Create new PostgreSQL database
3. Database name: `task101`
4. User: `postgres` 
5. Password: `Sewy1324@#`
6. Copy the **External Database URL**
7. Use this format in Vercel:
   ```
   postgresql://postgres:Sewy1324%40%23@dpg-xxxxx-a.oregon-postgres.render.com:5432/task101
   ```

### Option B: Create Production Database on Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Set password: `Sewy1324@#`
4. Use this format in Vercel:
   ```
   postgresql://postgres:Sewy1324%40%23@db.xxxxx.supabase.co:5432/postgres
   ```

### Option C: Use Current Prisma Database
If you want to keep using your current Prisma database:
```
postgresql://9420c7044c718cc937c35174efdd12dc53b223f586ab5668d535c91450dc16f1:sk_dwwYG5_rE1m68EmMUA26N@db.prisma.io:5432/postgres
```

## 🚀 Step 4: Deploy and Test

1. **Save environment variables** in Vercel
2. **Trigger new deployment** (push to GitHub or click "Redeploy")
3. **Test the deployment**:
   - Visit: `https://your-app.vercel.app`
   - Test API: `https://your-app.vercel.app/api/scenarios`

## 🔍 Troubleshooting

### If you get connection errors:
1. **Check the host/port** in your DATABASE_URL
2. **Verify password encoding**: `@` = `%40`, `#` = `%23`
3. **Check Vercel function logs** in dashboard

### Test locally first:
```bash
# Update your .env with the same URL format
DATABASE_URL="postgresql://postgres:Sewy1324%40%23@YOUR_HOST:5432/task101"

# Test connection
npx prisma db push
```

## ✅ Final Checklist

- [ ] Removed `@database_url` from vercel.json ✅
- [ ] Added DATABASE_URL as environment variable in Vercel
- [ ] Used correct URL encoding for special characters
- [ ] Selected Production and Preview targets
- [ ] Triggered new deployment
- [ ] Tested the deployed app

---

**🎉 Once you complete these steps, your database should work perfectly on Vercel!**