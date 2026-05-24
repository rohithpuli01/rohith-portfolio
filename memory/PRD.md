# Rohith Puli Portfolio - PRD

## Original Problem Statement
Build a Portfolio website for Rohith Puli (Motion Graphic Designer) with editable content, Google login for admin, cool Gen Z aesthetic with Lime Green & Neon accents.

## User Personas
- **Rohith (Admin)**: Edits all portfolio content via admin panel after Google login
- **Visitors/Clients**: View portfolio, browse gallery, spin lucky wheel, submit contact form

## Core Requirements
- About Me section with bio, tools, skills, experience
- Projects carousel with moving frames
- Full-visibility Gallery with lightbox
- Resume with timeline design
- Lucky Wheel of Discount
- Contact form with email integration (Resend)
- Admin panel for all content CRUD
- Google OAuth (Emergent-managed)
- Social media links

## What's Been Implemented (May 24, 2025)
- Full-stack portfolio with FastAPI backend + React frontend + MongoDB
- All 7 sections: Hero, About, Projects, Gallery, Resume, Lucky Wheel, Contact
- Google OAuth admin authentication
- Admin panel with full CRUD for all sections
- File upload support (base64 stored in MongoDB)
- Contact form with Resend email integration
- Lucky Wheel spin with random prize selection
- Dark Neo-Brutalist design with #CCFF00 lime green accents
- Film strip project frames, torn-edge hero, bento grid layouts
- Testing: 100% backend (14/14), 95% frontend pass rate

## Prioritized Backlog
### P0 - Done
- All core sections implemented
- Admin CRUD panel
- Google Auth
- Contact email

### P1 - Next
- Rate limiting on wheel/contact endpoints
- Resume file upload/download
- Gallery video support (actual video player)
- Image optimization/compression

### P2 - Future
- Analytics dashboard for admin
- SEO meta tags
- PWA support
- Custom domain setup
