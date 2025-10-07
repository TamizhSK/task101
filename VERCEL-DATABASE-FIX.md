# 🔧 Vercel Database Connection Fix

## Current Database URL Format (Working Locally)
```
postgresql://9420c7044c718cc937c35174efdd12dc53b223f586ab5668d535c91450dc16f1:sk_dwwYG5_rE1m68EmMUA26N@db.prisma.io:5432/postgres?sslmode=require
```

## 🎯 Vercel Environment Variable Setup

### Step 1: Copy This Exact URL to Vercel
**Important: Remove the quotes when pasting in Vercel UI**

```
postgresql://9420c7044c718cc937c35174efdd12dc53b223f586ab5668d535c91450dc16f1:sk_dwwYG5_rE1m68EmMUA26N@db.prisma.io:5432/postgres?sslmode=require
```

### Step 2: Vercel Dashboard Settings
1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: (paste the URL above WITHOUT quotes)
   - **Environments**: Check all (Production, Preview, Development)

### Step 3: Alternative URLs to Try

If the above doesn't work, try these variations:

**Option A: With connection pooling**
```
postgresql://9420c7044c718cc937c35174efdd12dc53b223f586ab5668d535c91450dc16f1:sk_dwwYG5_rE1m68EmMUA26N@db.prisma.io:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1
```

**Option B: With timeout**
```
postgresql://9420c7044c718cc937c35174efdd12dc53b223f586ab5668d535c91450dc16f1:sk_dwwYG5_rE1m68EmMUA26N@db.prisma.io:5432/postgres?sslmode=require&connect_timeout=60
```

**Option C: With schema specification**
```
postgresql://9420c7044c718cc937c35174efdd12dc53b223f586ab5668d535c91450dc16f1:sk_dwwYG5_rE1m68EmMUA26N@db.prisma.io:5432/postgres?sslmode=require&schema=public
```

## 🚨 Common Vercel Database Errors & Fixes

### Error: "Invalid DATABASE_URL"
**Fix**: Remove quotes when entering in Vercel UI

### Error: "Connection timeout"
**Fix**: Add `&connect_timeout=60` to URL

### Error: "SSL required"
**Fix**: Ensure `?sslmode=require` is in URL

### Error: "Too many connections"
**Fix**: Add `&connection_limit=1` to URL

## 🔄 Alternative: Switch to Production Database

If Prisma's hosted DB continues to have issues, switch to:

### Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. New project → Get connection string
3. Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require`

### Render PostgreSQL
1. Create account at [render.com](https://render.com)
2. New PostgreSQL database
3. Copy "External Database URL"

### Neon (Serverless)
1. Create account at [neon.tech](https://neon.tech)
2. New project → Copy connection string

## 🧪 Test Database Connection

After setting up in Vercel:

1. **Trigger a deployment** (push to GitHub)
2. **Check Vercel function logs** for database errors
3. **Test API endpoint**: `https://your-app.vercel.app/api/scenarios`

## 📋 Deployment Checklist

- [ ] Database URL set in Vercel (without quotes)
- [ ] All environments selected (Prod, Preview, Dev)
- [ ] Prisma schema pushed to database
- [ ] Deployment triggered
- [ ] API endpoints tested

## 🆘 Still Having Issues?

### Debug Steps:
1. **Check Vercel function logs** in dashboard
2. **Test locally** with same DATABASE_URL
3. **Try alternative database providers**
4. **Contact me** with specific error messages

### Quick Test:
```bash
# Test connection locally
npx prisma db pull

# If successful, the URL format is correct
```

---

**💡 Pro Tip**: Prisma's hosted database is great for development but consider switching to Supabase or Render for production reliability.