# Punchly - Enterprise Digital Snagging Platform

## Project Vision
Punchly is a professional, enterprise-grade digital snagging and handover platform designed specifically for the real estate industry. It replaces manual, PDF-based snag lists with a modern, mobile-first digital solution.

## Problem Statement
Real estate developers and contractors currently struggle with:
- Manual, paper-based snag lists that get lost or damaged
- Inconsistent documentation across projects
- Difficult tracking of snag resolution status
- Poor communication between on-site engineers and management
- Lack of visual documentation with photos
- Time-consuming report generation

## Solution
A comprehensive digital platform that provides:
1. **Mobile-First Web Application** - Engineers can log snags on-site using their phones
2. **Image Engine** - Photo uploads with canvas-based annotations for precise issue marking
3. **Report Engine** - Auto-generates branded PDF reports with QR codes linking to digital versions
4. **Role-Based Access Control** - Separate interfaces for Admins and Engineers
5. **Real-Time Updates** - Instant status tracking and updates across the team

## Technical Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (100% type-safe)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Architecture**: Responsive Web Design (mobile-optimized)

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Row-Level Security (RLS)
- **Storage**: Supabase Storage (for photos/documents)
- **Hosting**: Vercel (recommended for Next.js)

### Key Libraries & Tools
- **UI Components**: shadcn/ui (professional, accessible components)
- **Image Processing**: Canvas API for annotations
- **PDF Generation**: jsPDF or react-pdf
- **QR Codes**: qrcode library
- **Forms**: React Hook Form + Zod validation

## Database Schema

### Core Tables

#### 1. profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text, unique)
- `full_name` (text)
- `role` (enum: 'admin', 'engineer')
- `company_name` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 2. projects
- `id` (uuid, primary key)
- `name` (text)
- `description` (text, nullable)
- `location` (text)
- `client_name` (text)
- `status` (enum: 'active', 'completed', 'on_hold')
- `created_by` (uuid, references profiles.id)
- `start_date` (date)
- `target_completion_date` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 3. units
- `id` (uuid, primary key)
- `project_id` (uuid, references projects.id)
- `unit_number` (text)
- `unit_type` (text, e.g., "1BR", "2BR", "Villa")
- `floor` (text/integer)
- `block` (text, nullable)
- `status` (enum: 'pending', 'in_progress', 'completed')
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 4. snags
- `id` (uuid, primary key)
- `unit_id` (uuid, references units.id)
- `project_id` (uuid, references projects.id)
- `title` (text)
- `description` (text)
- `category` (enum: 'electrical', 'plumbing', 'finishing', 'structural', 'hvac', 'other')
- `priority` (enum: 'low', 'medium', 'high', 'critical')
- `status` (enum: 'open', 'in_progress', 'resolved', 'verified')
- `location` (text, e.g., "Living Room", "Master Bedroom")
- `photo_url` (text, nullable)
- `annotated_photo_url` (text, nullable)
- `reported_by` (uuid, references profiles.id)
- `assigned_to` (uuid, references profiles.id, nullable)
- `resolved_at` (timestamp, nullable)
- `verified_at` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 5. reports
- `id` (uuid, primary key)
- `project_id` (uuid, references projects.id)
- `unit_id` (uuid, references units.id, nullable)
- `report_type` (enum: 'unit_snag_list', 'project_summary', 'handover')
- `pdf_url` (text)
- `qr_code_url` (text)
- `generated_by` (uuid, references profiles.id)
- `generated_at` (timestamp)
- `created_at` (timestamp)

## User Roles & Permissions

### Admin
- Manage all projects and units
- Manage staff (create/edit/delete engineer accounts)
- View all snags across all projects
- Generate reports
- Assign snags to engineers
- Full dashboard access

### Engineer
- View assigned projects
- Log new snags
- Update snag status
- Upload and annotate photos
- View their own snag history
- Limited dashboard (own work only)

## Development Phases

### Phase 1 (Current) - Foundation ✅
- [x] Project initialization
- [x] CLAUDE.md documentation
- [x] Database schema design
- [x] Professional landing page

### Phase 2 - Authentication & RBAC
- [ ] Supabase setup and configuration
- [ ] Authentication pages (login/signup)
- [ ] Role-based middleware
- [ ] Admin dashboard layout
- [ ] Engineer dashboard layout

### Phase 3 - Core Features
- [ ] Project management (CRUD)
- [ ] Unit management (CRUD)
- [ ] Snag logging interface (mobile-optimized)
- [ ] Photo upload functionality
- [ ] Basic status tracking

### Phase 4 - Image Engine
- [ ] Canvas-based photo annotation
- [ ] Drawing tools (pen, shapes, text)
- [ ] Annotation save/load
- [ ] Image compression/optimization

### Phase 5 - Report Engine
- [ ] PDF report templates
- [ ] QR code generation
- [ ] Branded report styling
- [ ] Report hosting pages
- [ ] Email delivery

### Phase 6 - Polish & Launch
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Security audit
- [ ] User testing
- [ ] Production deployment

## Key Features Roadmap

### Must-Have (MVP)
- User authentication with role-based access
- Project and unit management
- Snag logging with photos
- Basic status tracking
- Simple PDF report generation

### Should-Have (V1.1)
- Photo annotations with canvas
- QR code linking
- Email notifications
- Advanced filtering/search
- Bulk operations

### Nice-to-Have (V2.0)
- Mobile native apps (React Native)
- Offline mode with sync
- Analytics dashboard
- Integration with project management tools
- Custom branding per client

## Design Principles

1. **Mobile-First**: Every interface must work perfectly on phones
2. **Speed**: Fast load times, optimistic UI updates
3. **Professional**: Enterprise-grade look and feel
4. **Simple**: Minimal clicks to complete tasks
5. **Reliable**: No data loss, auto-save everything
6. **Accessible**: WCAG 2.1 AA compliance

## File Structure
```
punchly/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── projects/
│   │   │   ├── staff/
│   │   │   └── reports/
│   │   └── engineer/
│   │       ├── snags/
│   │       └── my-projects/
│   ├── api/
│   ├── page.tsx (landing)
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── forms/
│   ├── layout/
│   └── features/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── types/
├── public/
└── CLAUDE.md (this file)
```

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Brand Guidelines
- **Primary Color**: Professional blue (#0066CC or similar)
- **Secondary Color**: Trust-building gray (#64748B)
- **Accent Color**: Success green (#10B981)
- **Typography**: Clean, modern sans-serif (Inter or similar)
- **Tone**: Professional, trustworthy, efficient

## Security Considerations
- Row-Level Security (RLS) on all Supabase tables
- Input validation with Zod schemas
- XSS prevention in user-generated content
- Secure file uploads (size/type validation)
- HTTPS only in production
- Regular dependency updates

## Performance Targets
- Lighthouse score: 90+ across all metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s

## Browser Support
- Chrome/Edge (last 2 versions)
- Safari (last 2 versions)
- Firefox (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

---

**Last Updated**: 2026-02-05
**Project Owner**: Non-technical Founder
**Development Partner**: Claude (Senior Full-Stack Engineer)
