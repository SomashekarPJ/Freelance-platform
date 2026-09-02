# FreelanceHub

FreelanceHub is a MERN freelance marketplace MVP. Clients can publish jobs, freelancers can bid, accepted bids become contracts, and project communication stays inside the app.

## Features

- Client and freelancer authentication
- Job posting and public job browsing
- Freelancer bid submission
- Client bid acceptance
- Contract tracking for active, delivered, and approved work
- Basic user-to-user messaging
- Stripe PaymentIntent flow for test payments
- Responsive redesigned React interface

## Tech Stack

- React 18 and React Router
- Custom CSS design system
- Express and Node.js
- MongoDB with Mongoose
- Optional in-memory MongoDB fallback for development
- Stripe SDK and Stripe Elements

## Project Structure

```text
freelance-platform/
  client/   React frontend
  server/   Express API, MongoDB models, routes, middleware
```

## Prerequisites

- Node.js 18 through 25
- npm
- MongoDB Atlas connection string, local MongoDB, or the built-in in-memory fallback
- Stripe test secret key and publishable key if testing payments

## Setup

Install dependencies:

```bash
npm run install:all
```

Create the backend environment file:

```bash
cp server/.env.example server/.env
```

Create the frontend environment file:

```bash
cp client/.env.example client/.env
```

Update the values in both `.env` files for your machine.

## Run Locally

Start the API:

```bash
npm run server
```

Start the React app in a second terminal:

```bash
npm run client
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## Environment Variables

Backend `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/freelance-platform
USE_LOCAL_MONGO=false
JWT_SECRET=replace_with_a_long_random_secret
STRIPE_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

Frontend `client/.env`:

```env
REACT_APP_API=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE=pk_test_replace_me
```

## Build

```bash
npm run build
```

The production frontend build is generated in `client/build/`. That folder is ignored by Git and should be generated during deployment.

## Smoke Test

With the backend running:

```bash
npm run smoke
```

The smoke test registers sample users, posts a job, places a bid, accepts it, and fetches the created contract.

## GitHub Notes

- Do not commit `.env` files or real credentials.
- `client/build/` is generated output and is ignored.
- GitHub Actions runs dependency installation and a client production build on pushes and pull requests.
