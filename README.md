# Bellcorp Event Management

A full-stack event platform where users can discover events, register or cancel in real time, and manage activity from a personal dashboard.  
Creators can publish new events through a creator-only flow.

## Product Concept

Bellcorp Event Management solves a common problem: event discovery, registration, and user tracking are often split across tools and hard to scale.

This project combines:

- Fast event discovery (search + filters + pagination)
- Secure authentication and protected actions
- Atomic registration logic to prevent overbooking
- Creator-focused event publishing

## Marketing Positioning

### One-line pitch
**From discovery to attendance in minutes: one platform to explore, register, and manage events.**

### Why this product matters

- **For users:** Find relevant events quickly and keep registrations organized.
- **For creators:** Publish events directly and control capacity.
- **For teams/businesses:** Use a clean, scalable full-stack architecture.

### Ideal use cases

- College clubs and campus communities
- Startup communities and meetup groups
- Workshops and bootcamps
- Internal company events

## Core Features

### Authentication

- User registration
- User login
- JWT-based session handling
- Protected routes for authenticated users

### Event Discovery

- Browse available events
- View detailed event information
- Search with flexible text queries
- Filter by category, location, and date range
- Pagination for large event collections
- URL-based filter state persistence

### Event Registration

- Register for events (authenticated users)
- Cancel registrations
- Duplicate registration prevention
- Capacity-aware registration checks

### Creator Flow

- Register with a `Register as a creator` checkbox
- Creator-only route access
- Create new events from `/events/create`

### User Dashboard

- Total registrations
- Upcoming events summary
- Past event history
- Quick cancel action for upcoming events

## Tech Stack

- **Frontend:** React, React Router, Axios, CSS
- **Backend:** Node.js, Express, JWT, bcryptjs
- **Database:** MongoDB with Mongoose
- **Build tooling:** Vite

## Architecture Overview

```text
root/
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- routes/
|   |   `-- styles/
|   `-- package.json
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- server.js
|   `-- package.json
`-- README.md
```

## API Summary

Base URL: `http://localhost:5055/api`

- `POST /auth/register` - Create user account (`isCreator` supported)
- `POST /auth/login` - Login and get token
- `GET /events` - List events with search/filter/pagination
- `GET /events/:id` - Get single event details
- `POST /events` - Create event (creator-only)
- `POST /events/:id/register` - Register for event (auth required)
- `DELETE /events/:id/register` - Cancel registration (auth required)
- `GET /dashboard` - Logged-in user dashboard

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas (or local MongoDB)

### 1) Clone and enter project

```bash
git clone <your-repo-url>
cd "Bellcorp Event Management"
```

### 2) Configure environment variables

Create `server/.env`:

```env
PORT=5055
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5055/api
```

### 3) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 4) Run backend

From `server/`:

```bash
npm start
```

### 5) Run frontend

From `client/`:

```bash
npm run dev
```

Open: `http://localhost:5173`

## How to Use (Demo Flow)

1. Register a normal user and login.
2. Explore events using search and filters.
3. Register for an event and verify dashboard updates.
4. Cancel registration from events list or dashboard.
5. Register another account with `Register as a creator` checked.
6. Login as creator and open `Create Event`.
7. Publish a new event and verify it appears in event listing.

## Build for Production

From `client/`:

```bash
npm run build
```

## Deployment Notes

- Frontend can be deployed on Vercel or Netlify.
- Backend can be deployed on Render or Railway.
- Update `VITE_API_BASE_URL` in frontend deployment settings to your live backend URL.

## Security Notes

- Never commit real secrets in `.env` files.
- Rotate database credentials and `JWT_SECRET` before production deployment.

## Future Enhancements

- Event image uploads
- Creator analytics dashboard
- Email notifications and reminders
- Role-based admin panel
- Automated tests and CI pipeline

## License

This project is currently for assignment/demo usage. Add a formal license if you plan to open source it.
