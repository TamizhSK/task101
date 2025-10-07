# Invoicing ROI Simulator — SvelteKit Full Stack Application

A lightweight ROI calculator that helps users visualize cost savings and payback when switching from manual to automated invoicing. Built as a 3-hour rapid prototype with full-stack functionality.

## Features

- **Interactive ROI Calculator**: Real-time calculations with favorable automation bias
- **Scenario Management**: Save, load, and delete named scenarios with CRUD operations
- **Email-Gated Reports**: PDF/HTML report generation requiring email capture
- **Responsive UI**: Modern interface built with Shadcn-UI components
- **Server-Side Validation**: Form validation using Zod schema validation
- **PostgreSQL Database**: Persistent storage for scenarios and calculations

## Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **UI Components**: Shadcn-Svelte for modern, accessible components
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod for client and server-side validation
- **PDF Generation**: PDFKit for report generation
- **Styling**: TailwindCSS
- **Deployment**: Vercel (frontend) + Render (database)

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (local or cloud)
- Git for version control

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/TamizhSK/task101.git
cd task101

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/roi_calculator"

# For development
PUBLIC_APP_URL="http://localhost:5173"

# Email service (optional for development)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed the database
npx prisma db seed
```

### 4. Development

```bash
# Start development server
npm run dev
# or
pnpm dev

# Open http://localhost:5173
```

## Project Structure

```
src/
├── lib/components/ui/          # Shadcn-UI components
├── lib/server/                 # Server-side utilities
├── lib/schemas/                # Zod validation schemas
├── lib/utils.ts                # Utility functions
├── routes/
│   ├── api/
│   │   ├── simulate/           # ROI calculation endpoint
│   │   ├── scenarios/          # Scenario CRUD endpoints
│   │   └── report/             # PDF generation endpoint
│   ├── +layout.svelte          # Root layout
│   ├── +page.svelte            # Main calculator UI
│   └── +page.server.ts         # Server-side logic
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── static/                     # Static assets
└── app.html                    # HTML template
```

## 🔧 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/simulate` | Calculate ROI metrics | ROI input parameters |
| POST | `/api/scenarios` | Save scenario | Scenario name + data |
| GET | `/api/scenarios` | List all scenarios | - |
| GET | `/api/scenarios/:id` | Get scenario by ID | - |
| DELETE | `/api/scenarios/:id` | Delete scenario | - |
| POST | `/api/report/generate` | Generate PDF report | Email + scenario data |

### Example Request: ROI Simulation

```bash
curl -X POST http://localhost:5173/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_invoice_volume": 2000,
    "num_ap_staff": 3,
    "avg_hours_per_invoice": 0.17,
    "hourly_wage": 30,
    "error_rate_manual": 0.5,
    "error_cost": 100,
    "time_horizon_months": 36,
    "one_time_implementation_cost": 50000
  }'
```

### Example Response

```json
{
  "monthly_savings": 8000,
  "payback_months": 6.25,
  "roi_percentage": 432.5,
  "cumulative_savings": 288000,
  "net_savings": 238000,
  "error_savings": 800,
  "labor_cost_saved": 30600
}
```

## Database Schema

The application uses a simple PostgreSQL schema managed by Prisma:

```prisma
model Scenario {
  id        String   @id @default(cuid())
  name      String
  data      Json     // Stores all input parameters
  results   Json     // Stores calculated results
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("scenarios")
}

model EmailCapture {
  id        String   @id @default(cuid())
  email     String
  createdAt DateTime @default(now())
  
  @@map("email_captures")
}
```

## ROI Calculation Logic

The application implements biased calculations to ensure automation always shows favorable results:

```typescript
// Internal constants (server-side only)
const CONSTANTS = {
  automated_cost_per_invoice: 0.20,
  error_rate_auto: 0.1, // 0.1%
  time_saved_per_invoice: 8, // minutes
  min_roi_boost_factor: 1.1 // 10% bias boost
};

// Core calculation
function calculateROI(inputs: ROIInputs): ROIResults {
  const labor_cost_manual = 
    inputs.num_ap_staff * 
    inputs.hourly_wage * 
    inputs.avg_hours_per_invoice * 
    inputs.monthly_invoice_volume;

  const auto_cost = 
    inputs.monthly_invoice_volume * CONSTANTS.automated_cost_per_invoice;

  const error_savings = 
    (inputs.error_rate_manual - CONSTANTS.error_rate_auto) * 
    inputs.monthly_invoice_volume * 
    inputs.error_cost;

  let monthly_savings = (labor_cost_manual + error_savings) - auto_cost;
  
  // Apply bias factor
  monthly_savings *= CONSTANTS.min_roi_boost_factor;

  // Calculate other metrics...
}
```

## Component Architecture

### Main Calculator Component (`+page.svelte`)
- Real-time input validation
- Dynamic results display
- Scenario save/load functionality

### UI Components (Shadcn-Svelte)
- `Button`, `Input`, `Card` for form elements
- `Dialog` for scenario management
- `Toast` for user feedback
- `Table` for results display

### Form Validation (`schemas/roi.ts`)
```typescript
export const roiSchema = z.object({
  scenario_name: z.string().min(1).max(50),
  monthly_invoice_volume: z.number().min(1).max(100000),
  num_ap_staff: z.number().min(1).max(50),
  avg_hours_per_invoice: z.number().min(0.01).max(10),
  hourly_wage: z.number().min(1).max(200),
  error_rate_manual: z.number().min(0).max(100),
  error_cost: z.number().min(0).max(10000),
  time_horizon_months: z.number().min(1).max(120),
  one_time_implementation_cost: z.number().min(0).max(1000000).optional()
});
```

## Shadcn-UI Setup

The project uses shadcn-svelte for consistent, accessible components:

```bash
# Initialize shadcn-svelte
npx shadcn-svelte@latest init

# Add required components
npx shadcn-svelte@latest add button input card dialog toast table
```

Components are configured with:
- **Style**: Default
- **Base color**: Slate
- **CSS file**: `src/app.css`
- **Tailwind config**: `tailwind.config.js`
- **Component alias**: `$lib/components`
- **Utils alias**: `$lib/utils`

## Deployment

### Environment Variables

For production deployment, set these environment variables:

```env
# Production Database URL (Render PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"

# Application URL
PUBLIC_APP_URL="https://your-app.vercel.app"

# Email service for PDF reports
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASS="your-api-key"
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Build command (automatically detected)
npm run build

# Output directory
build
```

### Database (Render PostgreSQL)

1. Create a PostgreSQL instance on Render
2. Copy the internal database URL
3. Run migrations in production:

```bash
# Deploy migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Test specific API endpoints
curl -X GET http://localhost:5173/api/scenarios
```

## Security Considerations

- Input validation on both client and server
- SQL injection prevention via Prisma
- Rate limiting on API endpoints
- Email validation before PDF generation
- Environment variable protection

## Development Notes

### Key Features Implemented
- ✅ Real-time ROI calculations with bias factor
- ✅ Scenario CRUD operations
- ✅ Email-gated PDF report generation
- ✅ Responsive UI with Shadcn components
- ✅ Form validation with Zod
- ✅ PostgreSQL integration with Prisma

### Performance Optimizations
- Server-side calculations for security
- Efficient database queries with Prisma
- Optimized bundle size with SvelteKit
- CDN-ready static assets

### Accessibility
- ARIA labels on form elements
- Keyboard navigation support
- Screen reader compatible
- High contrast color scheme

## Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

**Deployment Issues**
- Ensure all environment variables are set
- Check database migrations are applied
- Verify API endpoints are accessible

## Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Shadcn-Svelte Components](https://www.shadcn-svelte.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Validation](https://zod.dev)
- [PDFKit Documentation](https://pdfkit.org)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


**Built with ❤️ by TamizhSK
#
# 🚀 Quick Deployment Guide

### Pre-Deployment Check
```bash
# Run deployment checklist
npm run deploy:check
```

### 1. Database Setup (Choose One)

#### Option A: Render PostgreSQL (Free Tier)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create new PostgreSQL database
3. Copy the external connection string

#### Option B: Supabase (Recommended)
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database

### 2. Vercel Deployment
1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Set environment variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   PUBLIC_APP_URL=https://your-app.vercel.app
   SMTP_HOST=smtp.gmail.com (optional)
   SMTP_PORT=587 (optional)
   SMTP_USER=your-email@gmail.com (optional)
   SMTP_PASS=your-app-password (optional)
   ```
4. Deploy!

### 3. Post-Deployment
```bash
# Initialize database (run once)
npx prisma db push
```

**🎉 Your ROI Calculator is now live!**

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)