# Unibridge Product Requirements Document (PRD)

## 1. Overview

Unibridge is a web-based mentorship and academic guidance platform that connects students with mentors, supports session booking and management, provides AI-assisted guidance, and includes admin tools for platform operations.

The application serves three primary user types:
- **Mentees**: students seeking guidance
- **Mentors**: experienced users offering support
- **Admins**: operators managing users, payouts, and platform integrity

The product is implemented as a React/Vite frontend with an Express backend, Firebase authentication, Firestore persistence, and optional Gemini-powered AI assistance.

---

## 2. Problem Statement

Students often need timely, trustworthy guidance on academic paths, school choices, and career decisions. Existing support channels are fragmented, informal, or hard to access. Mentors also need a structured way to present themselves, receive requests, and manage sessions. Platform operators need visibility into users, roles, and payouts.

Unibridge solves this by providing:
- role-based onboarding,
- mentor discovery and matching,
- session booking and management,
- AI-supported guidance,
- and admin operations tooling.

---

## 3. Goals and Objectives

### Primary Goals
1. Help mentees find relevant mentors quickly
2. Enable mentors to onboard and manage their mentoring workflow
3. Support booking and management of private and group sessions
4. Provide AI assistance for quick guidance and support
5. Give admins oversight over users and payouts

### Secondary Goals
- Build trust through profiles, ratings, and legal pages
- Reduce friction in mentor discovery
- Provide a scalable backend foundation for future product growth

---

## 4. Target Users

### 4.1 Mentee
A student looking for help with:
- school decisions
- course selection
- academic planning
- mentorship and personal guidance

### 4.2 Mentor
A university student or experienced peer who wants to:
- offer advice
- build visibility
- manage booking requests
- host group or private sessions

### 4.3 Admin
A platform operator who needs to:
- review users
- assign or update roles
- manage payout workflows
- monitor platform health

---

## 5. Product Scope

### In Scope
- public landing page
- onboarding and authentication
- mentee dashboard
- mentor dashboard
- admin dashboard
- mentor discovery and recommendation
- session booking and request workflows
- group sessions
- ratings and reviews
- AI mentor-response assistant
- contact form
- privacy policy and terms pages

### Out of Scope
- native mobile apps
- full calendar integrations
- in-app video calling
- advanced financial reporting
- multi-tenant enterprise support

---

## 6. Core User Journeys

### 6.1 Mentee Journey
1. Visits landing page
2. Chooses login or onboarding
3. Creates an account
4. Completes mentee onboarding
5. Views dashboard
6. Browses mentors
7. Books a session
8. Attends the session
9. Rates the mentor

### 6.2 Mentor Journey
1. Visits landing page
2. Registers as mentor
3. Completes mentor onboarding
4. Sets profile, skills, and availability
5. Views requests and proposals
6. Accepts or manages sessions
7. Hosts private or group sessions
8. Reviews history and payouts

### 6.3 Admin Journey
1. Logs in as admin
2. Views user management
3. Reviews users and roles
4. Manages payout-related workflows
5. Oversees platform activity

### 6.4 AI Guidance Journey
1. User opens AI Command Center
2. Sends a natural-language question
3. Backend generates a response using Gemini or fallback logic
4. User receives guidance in chat format

---

## 7. Functional Requirements

## 7.1 Authentication & Authorization

### Requirements
- Users can register as **MENTEE**, **MENTOR**, or **ADMIN**
- Authentication is powered by Firebase Auth
- Backend verifies JWT/id tokens
- Role-based access controls protect dashboards and admin routes
- Sessions expire safely and trigger logout behavior

### Acceptance Criteria
- A user can sign up and receive role-specific access
- Unauthorized users cannot access protected routes
- Expired tokens trigger auto-logout

---

## 7.2 Onboarding

### Requirements
- Separate onboarding flows for mentees and mentors
- Collect relevant profile information based on role
- Persist onboarding data to Firestore
- Route users to the correct dashboard after completion

### Mentee Fields
- name
- email
- password
- school
- class level
- dream course
- selected vibes

### Mentor Fields
- name
- email
- password
- university
- university name / abbreviation
- level
- bio
- skills
- selected vibes
- response time

### Acceptance Criteria
- User completes role-specific onboarding successfully
- Data is saved to the correct profile collection
- User is redirected to the relevant dashboard

---

## 7.3 User Profile Management

### Requirements
- Users can view and update their profile
- Mentors can update mentor-specific profile details
- Mentees can update mentee-specific profile details
- Admins can update title and role-related metadata where allowed

### Acceptance Criteria
- Profile changes persist in Firestore
- Updated profile data is reflected in UI
- User role determines which profile data is displayed

---

## 7.4 Mentor Discovery and Matching

### Requirements
- Display mentor cards with summary info
- Surface mentor ratings and review counts
- Provide a “Why this mentor?” explanation when available
- Support matching signals such as:
  - course match
  - skill match
  - shared vibes
  - availability score

### Acceptance Criteria
- Users can browse mentors visually
- Recommendation reasoning is understandable
- Mentor cards show enough detail to support selection

---

## 7.5 Session Booking and Management

### Requirements
- Mentees can request or book sessions
- Mentors can review incoming requests
- Sessions can be created and listed
- Session lifecycle should support scheduling, rescheduling, and completion

### Acceptance Criteria
- A mentee can initiate a booking request
- A mentor can respond to the request
- Sessions appear in the correct dashboard views
- Session state changes are tracked

---

## 7.6 Group Sessions

### Requirements
- Mentors can create group sessions
- Mentees can browse available group sessions
- Group sessions appear in dashboards and lists

### Acceptance Criteria
- A mentor can create a group session
- Group sessions are visible to mentees
- Group session details are correctly stored and displayed

---

## 7.7 Ratings and Reviews

### Requirements
- Mentees can rate mentors after sessions
- Ratings update mentor profile metrics
- Mentor profile should display rating summaries

### Acceptance Criteria
- Ratings are submitted successfully
- Rating counts and averages are reflected in mentor data
- Ratings influence trust and profile visibility

---

## 7.8 AI Command Center

### Requirements
- Users can submit free-text questions
- Backend returns AI-generated responses
- Gemini is used when configured
- Fallback response is used if AI is unavailable

### Acceptance Criteria
- The assistant responds to user questions
- The app remains functional without Gemini credentials
- AI output is rendered in readable form

---

## 7.9 Contact Support

### Requirements
- Users can submit contact messages
- Messages are saved in backend storage
- Messages can be reviewed later by admins/operators

### Acceptance Criteria
- Contact form validates input
- Submission returns success feedback
- Messages are stored in Firestore

---

## 7.10 Admin Functions

### Requirements
- Admin can log in securely
- Admin can list users
- Admin can change user roles
- Admin can access payout-related dashboards
- Admin routes must be protected by role checks

### Acceptance Criteria
- Non-admins are blocked from admin pages
- Admin sees a complete user list
- Admin can update role successfully
- Admin payout workflow is accessible

---

## 8. Information Architecture

### Public Pages
- Landing page
- Privacy Policy
- Terms of Service
- Contact form section

### Auth Pages
- Login modal
- Mentor onboarding
- Mentee onboarding
- Admin login

### Dashboard Pages
- Mentee dashboard
- Mentor dashboard
- Admin dashboard

### Support / Utility Pages
- AI Command Center
- Dev login helper
- Session modals
- Profile modals
- Rating modals

---

## 9. Data Model

### 9.1 Collections
Likely Firestore collections include:
- `users`
- `mentorProfiles`
- `menteeProfiles`
- `adminProfiles`
- `sessions`
- `groupSessions`
- `privateBookingRequests`
- `payouts`
- `contactMessages`

### 9.2 User Schema
- uid
- name
- email
- role
- createdAt
- updatedAt

### 9.3 Mentor Profile Schema
- userId
- university
- universityName
- universityAbbr
- level
- bio
- skills
- selectedVibes
- rating
- reviews
- responseTime
- sessionPrice

### 9.4 Mentee Profile Schema
- userId
- school
- classLevel
- dreamCourse
- selectedVibes

### 9.5 Admin Profile Schema
- userId
- title

---

## 10. Technical Requirements

### Frontend
- React 19
- React Router
- Tailwind CSS
- React Hot Toast
- React Markdown
- React Select
- Vite

### Backend
- Express
- Firebase Admin SDK
- Firestore
- Zod validation
- Gemini API integration
- role-based middleware

### Environments
- Development mode proxies `/api` requests to local backend
- Backend supports a mock mode for local testing when Firebase is unavailable
- Production uses real Firebase services

---

## 11. Non-Functional Requirements

### Performance
- Pages should load quickly on typical student mobile/laptop connections
- Mentor lists and dashboards should remain responsive

### Reliability
- AI failures should degrade gracefully
- Authentication errors should be handled cleanly
- Session and profile operations should fail safely

### Security
- Use Firebase token verification
- Restrict admin routes
- Avoid exposing secrets to frontend
- Validate all incoming request payloads

### Usability
- Flows should be simple and low-friction
- UI should be understandable for first-time users
- Mentor recommendation reasons should be explainable

### Maintainability
- Modular route and component structure
- Shared API utilities
- Test coverage for key flows

---

## 12. Success Metrics

### Acquisition
- Landing page conversion rate
- Signup completion rate by role

### Activation
- Percentage of users completing onboarding
- First mentor profile view after signup

### Engagement
- Sessions booked
- Group sessions created/joined
- AI chat usage
- Ratings submitted

### Marketplace Health
- Active mentors
- Active mentees
- Session completion rate
- Mentor response time

### Operations
- Admin role change actions
- Payout approvals
- Support message resolution time

---

## 13. Risks and Dependencies

### Dependencies
- Firebase Auth
- Firestore
- Gemini API
- Backend deployment
- Frontend routing correctness

### Risks
- API key misconfiguration
- role inconsistencies between auth claims and Firestore user records
- session data model drift over time
- payout workflow complexity
- localStorage-based UI state persistence can become stale

---

## 14. MVP Definition

### MVP Must Include
- public landing page
- mentor and mentee signup/login
- role-based onboarding
- mentor discovery
- session booking
- mentor and mentee dashboards
- basic ratings
- AI guidance assistant
- admin login and user management
- legal pages

### MVP Exit Criteria
- A mentee can create an account, find a mentor, and book a session
- A mentor can onboard and manage sessions
- An admin can manage users and access payout dashboard
- AI assistant can respond even when Gemini is unavailable

---

## 15. Future Enhancements
- In-app messaging
- calendar synchronization
- reminders/notifications
- payments and wallet features
- analytics dashboard
- mobile app
- search filters and better recommendations
- richer AI tutoring modes
- video calls