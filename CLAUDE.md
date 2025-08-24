# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## Project Overview

This is a professional portfolio website built with Next.js 14, TypeScript, and Tailwind CSS. It features a modern dark design with green accents and utilizes a "brutalist" design system with custom UI components. The project includes a complete admin dashboard for content management with Firebase integration for dynamic content.

## Development Commands

```bash
# Development
npm run dev                 # Start development server (http://localhost:3000)
npm run build              # Build for production
npm start                  # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix ESLint issues
npm run format             # Format with Prettier
npm run format:check       # Check Prettier formatting
npm run type-check         # TypeScript type checking
```

## Architecture

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Firebase Firestore with user-isolated data structure
- **Authentication**: Firebase Auth with route protection middleware
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Library**: Custom brutalist components built on Radix UI primitives

### Project Structure

```
app/                       # Next.js App Router pages
├── layout.tsx            # Root layout with metadata
├── page.tsx              # Homepage with all sections
├── auth/                 # Authentication pages
│   ├── login/page.tsx    # Login page
│   ├── register/page.tsx # Registration page
│   └── forgot-password/page.tsx # Password recovery
├── admin/                # Admin dashboard (protected routes)
│   ├── layout.tsx        # Admin layout with sidebar
│   ├── page.tsx          # Admin dashboard overview
│   ├── profile/page.tsx  # Profile management
│   ├── projects/page.tsx # Projects CRUD management
│   └── blog/page.tsx     # Blog posts management
├── blog/                 # Public blog section
│   ├── page.tsx          # Blog listing page
│   └── [slug]/page.tsx   # Individual blog post
└── projects/             # Public projects section
    └── [slug]/page.tsx   # Individual project page

components/
├── sections/             # Public page sections
│   ├── navigation.tsx    # Main navigation
│   ├── hero-section.tsx  # Hero/about section
│   ├── projects-section.tsx
│   ├── blog-section.tsx
│   ├── contact-section.tsx
│   ├── tech-section.tsx  # Technology showcase
│   └── footer.tsx
├── admin/                # Admin dashboard components
│   ├── admin-layout.tsx  # Admin layout wrapper
│   ├── admin-header.tsx  # Admin header with user menu
│   ├── admin-sidebar.tsx # Admin navigation sidebar
│   ├── admin-dashboard.tsx # Dashboard overview
│   ├── profile-management.tsx # Profile CRUD interface
│   ├── profile-form.tsx  # Profile editing form
│   ├── profile-preview.tsx # Profile preview component
│   ├── projects-management.tsx # Projects CRUD interface
│   ├── projects-list.tsx # Projects listing with actions
│   ├── project-form.tsx  # Project creation/editing form
│   ├── project-filters.tsx # Projects filtering component
│   ├── blog-management.tsx # Blog posts CRUD interface
│   ├── blog-list.tsx     # Blog posts listing
│   ├── blog-form.tsx     # Blog post creation/editing
│   └── blog-filters.tsx  # Blog filtering and search
├── auth/                 # Authentication components
│   ├── auth-guard.tsx    # Route protection component
│   ├── auth-guard-wrapper.tsx # Auth wrapper for admin
│   ├── login-form.tsx    # Login form component
│   ├── register-form.tsx # Registration form
│   └── forgot-password-form.tsx # Password recovery form
└── ui/                   # Reusable UI components
    ├── brutalist-card.tsx    # Custom card component
    ├── brutalist-button.tsx  # Custom button component
    ├── button.tsx        # Standard button
    ├── card.tsx          # Standard card
    ├── project-tag.tsx   # Project technology tags
    ├── social-icon.tsx   # Social media icons
    └── tech-icon.tsx     # Technology icons

lib/
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── firebase/             # Firebase configuration
│   ├── config.ts         # Firebase app configuration
│   ├── auth.ts           # Authentication utilities
│   ├── firestore.ts      # Firestore utilities
│   └── storage.ts        # Firebase Storage utilities
├── services/             # Data services (Firebase integration)
│   ├── profile-service.ts # Profile CRUD operations
│   ├── projects-service.ts # Projects CRUD operations
│   └── blog-service.ts   # Blog posts CRUD operations
├── types/                # TypeScript type definitions
│   ├── profile.ts        # Profile and hero content types
│   ├── project.ts        # Project data types
│   └── blog.ts           # Blog post types
└── utils.ts              # Utility functions (cn helper)
```

### Design System

The project uses a custom "brutalist" design system with:

- **Color Scheme**: Dark theme with green accent (`--accent-green: #10b981`)
- **Typography**: Monospace fonts (JetBrains Mono, Space Mono)
- **Components**: Custom variants of standard UI patterns
- **CSS Variables**: Defined in `globals.css` for consistent theming

Key CSS variables:

```css
--bg-primary: #0f1419 /* Main background */ --bg-secondary: #1a1f2e
  /* Card backgrounds */ --bg-tertiary: #252a39 /* Elevated surfaces */
  --text-primary: #f8fafc /* Primary text */ --text-secondary: #cbd5e1
  /* Secondary text */ --accent-green: #10b981 /* Primary accent */;
```

### Firebase Data Structure

The project uses Firebase Firestore with user-isolated data structure:

```
/stores/{userUID}/
├── profile/
│   └── data          # PersonalInfo, ContactInfo, HeroContent
├── projects/         # Collection of project documents
│   ├── {projectId}   # Individual project data
│   └── ...
└── blog/             # Collection of blog post documents
    ├── {postId}      # Individual blog post data
    └── ...
```

Key Features:

- **User Isolation**: Each user's data is stored under their UID
- **Type Safety**: Full TypeScript interfaces for all data structures
- **Real-time Updates**: Firebase real-time listeners for live data
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality

### Route Structure

**Public Routes:**

- `/` - Homepage with all sections (hero, projects, blog, contact)
- `/blog` - Blog listing page with search functionality
- `/blog/[slug]` - Individual blog post pages
- `/projects/[slug]` - Individual project detail pages

**Authentication Routes:**

- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/auth/forgot-password` - Password recovery page

**Admin Routes (Protected):**

- `/admin` - Admin dashboard overview with statistics
- `/admin/profile` - Profile and hero content management
- `/admin/projects` - Projects CRUD management interface
- `/admin/blog` - Blog posts management system

**Route Protection:**

- Admin routes protected by `AuthGuard` component
- Middleware adds security headers for admin routes
- Automatic redirects for unauthenticated users

## Code Conventions

### Component Patterns

- Use `'use client'` directive for client components with interactivity
- Prefer TypeScript interfaces for prop definitions
- Use `forwardRef` for components that need ref forwarding
- Export named functions for sections, default for pages

### Styling

- Use Tailwind CSS classes with custom design tokens
- Implement responsive design with mobile-first approach
- Use `cn()` utility function for conditional class merging
- Follow the brutalist design system color scheme

### File Organization

- Group related components in appropriate directories
- Use descriptive file names with kebab-case
- Keep components focused and single-responsibility
- Extract reusable UI patterns into `components/ui/`
- Admin components go in `components/admin/`
- Auth components go in `components/auth/`
- Data services go in `lib/services/`
- Type definitions go in `lib/types/`

## Next.js Configuration

### Important Settings

- **Images**: Configured for Picsum Photos remote patterns
- **Fonts**: Local Geist fonts loaded via Next.js font optimization
- **TypeScript**: Strict mode enabled with path aliasing (`@/*`)

### Path Aliasing

- `@/*` maps to project root for clean imports
- Use absolute imports for all internal modules

## Development Guidelines

### Responsive Design

- Mobile-first approach with responsive breakpoints
- Test on various screen sizes during development
- Ensure touch-friendly interactions on mobile

### Animations

- Use Framer Motion for smooth animations
- Keep animations subtle and purposeful
- Implement proper loading states

### Performance

- Optimize images using Next.js Image component
- Use proper loading strategies for content
- Implement smooth scrolling for navigation

### Accessibility

- Ensure semantic HTML structure
- Provide appropriate ARIA labels
- Test keyboard navigation
- Maintain sufficient color contrast

## Content Structure & Data Types

### Profile Data (Hero Section)

Complete profile data structure for hero section content:

```typescript
interface ProfileData {
  id?: string
  personalInfo: PersonalInfo // Name, title, profile image
  contactInfo: ContactInfo // Social media links
  heroContent: HeroContent // Description, introduction, hobbies
  updatedAt: Date
}

interface PersonalInfo {
  name: string
  title: string
  profileImage: string
}

interface ContactInfo {
  github: string
  linkedin: string
  upwork: string
}

interface HeroContent {
  description: string
  introduction: string
  hobbies: string
}
```

### Projects

Complete project data structure with Firebase integration:

```typescript
interface Project {
  id?: string
  title: string
  company?: string
  description: string
  longDescription?: string
  technologies: string[]
  image: string
  liveUrl?: string
  githubUrl?: string
  date: string
  category: string
  slug: string
  featured: boolean
  status: 'active' | 'archived' | 'draft'
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### Blog Posts

Complete blog post data structure with CMS features:

```typescript
interface BlogPost {
  id?: string
  title: string
  excerpt: string
  content: string
  slug: string
  category: string
  featured: boolean
  publishedAt?: Date
  status: 'draft' | 'published' | 'archived'
  readTime: string // Auto-calculated
  featuredImage?: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

## Firebase Services

### Authentication Context

Global authentication state management:

```typescript
// lib/contexts/auth-context.tsx
const { user, loading, login, register, logout, resetPassword } = useAuth()
```

### Data Services

Each content type has a dedicated service class:

```typescript
// lib/services/profile-service.ts
profileService.getProfile(userUID)
profileService.updateProfile(userUID, profileData)

// lib/services/projects-service.ts
projectsService.getProjects(userUID, filter?)
projectsService.createProject(userUID, projectData)
projectsService.updateProject(userUID, projectId, projectData)
projectsService.deleteProject(userUID, projectId)

// lib/services/blog-service.ts
blogService.getPosts(userUID, filter?)
blogService.createPost(userUID, postData)
blogService.updatePost(userUID, postId, postData)
blogService.deletePost(userUID, postId)
```

## Admin Dashboard Features

### Profile Management

- Edit personal information (name, title, profile image)
- Manage contact info (social media links)
- Update hero section content (description, introduction, hobbies)
- Real-time preview of changes

### Projects Management

- Full CRUD operations for portfolio projects
- Advanced filtering (category, status, featured)
- Search functionality across title and description
- Drag-and-drop ordering support
- Image upload and management
- Technology tags management

### Blog Management

- Complete CMS for blog posts
- Rich text editor with markdown support
- Auto-excerpt generation from content
- SEO optimization (meta title, description)
- Tag system for content organization
- Status workflow (draft → published → archived)
- Featured posts management
- Read time calculation
- Advanced search and filtering

### Dashboard Overview

- Statistics for all content types
- Quick access to recent items
- Status indicators and counts
- Responsive design for mobile and desktop

## Important Development Notes

### Completed Tasks (Task Master)

- ✅ **Task 1-5**: Firebase setup, authentication, and admin infrastructure
- ✅ **Task 6**: Hero section content management (Profile system)
- ✅ **Task 7**: Projects CRUD management system
- ✅ **Task 8**: Blog posts management interface

### Next Priority Tasks

- **Task 10**: Migrate static content to dynamic Firestore data
  - Create custom hooks for data fetching
  - Update public sections to use Firebase data
  - Implement loading states and error handling

### Key Implementation Patterns

**Admin Components:**

- All admin components are in `components/admin/`
- Use `useAuth()` context for user authentication
- Follow consistent CRUD patterns across all management interfaces
- Implement proper loading states and error handling

**Firebase Integration:**

- User-isolated data structure: `/stores/{userUID}/...`
- All services extend base CRUD operations
- Use TypeScript interfaces for complete type safety
- Implement proper error handling and user feedback

**Form Patterns:**

- Consistent form styling with brutalist design system
- Real-time validation and preview capabilities
- Auto-generation features (slugs, excerpts, read time)
- Proper disabled states during API operations

### Security Considerations

- Admin routes protected by middleware and AuthGuard
- User data isolation at Firebase level
- Proper authentication state management
- Security headers for admin routes

### Performance Optimizations

- Firebase real-time listeners for live updates
- Proper loading states for better UX
- Image optimization with Next.js Image component
- Efficient filtering and search implementations
