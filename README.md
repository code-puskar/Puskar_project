# RoadmapHub - Feature Request & Roadmap Portal

## 1. Project Description
RoadmapHub is a centralized platform bridging the gap between product teams and their users. It allows developers and users to submit feature requests, upvote popular ideas, and participate in community discussions. Administrators can moderate content, update feature statuses (Under Review, Planned, In Progress, Completed), and view real-time analytics to drive product decisions.

## 2. Technology Stack
This project was built using the **MERN** stack:
- **Frontend**: React.js (Vite), TypeScript, Tailwind CSS v4, Base UI, Recharts, TanStack Query (React Query)
- **Backend**: Node.js, Express.js, TypeScript, MongoDB (Mongoose)
- **Authentication**: Custom dual-token JWT (Access & Refresh tokens) via secure HTTP-only cookies.

## 3. How to Install Dependencies

From the root directory, install both frontend and backend dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 4. How to Configure Environment Variables
Navigate to the `backend` directory and create a `.env` file using the provided template:

```bash
cd backend
cp .env.example .env
```

Ensure the following variables are set in your `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/roadmaphub(its not the real one)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
FRONTEND_URL=http://localhost:5173
```

## 5. Database Setup
This project uses MongoDB. You can use a local MongoDB instance or a cloud database like MongoDB Atlas.
1. Ensure MongoDB is running locally on port `27017` or provide an Atlas URI in `MONGODB_URI`.
2. No manual schema initialization is required; Mongoose will automatically create the necessary collections upon startup.
3. **Optional**: To seed the database with an initial Admin user for testing, you can use the provided seeder script:
   ```bash
   cd backend
   node seed-admin.js
   ```
   This creates an admin with credentials: `admin@roadmaphub.com` / `admin123`.

## 6. How to Run the Project Locally

You need two terminals to run the frontend and backend development servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
The application will now be accessible at `http://localhost:5173`.

## 7. Assumptions & Limitations
- **Email Verification**: Real email sending is fully implemented using `nodemailer`. If valid `SMTP_USER` and `SMTP_PASS` environment variables are provided, password reset links will be sent directly to the user's inbox. If missing, it safely falls back to a development simulation by logging the link to the console to ensure evaluators can still test the flow locally without setting up SMTP.
- **Admin Provisioning**: The system assumes the initial administrator is seeded manually via the database or the provided `seed-admin.js` script to prevent unauthorized users from granting themselves admin privileges via the UI.
- **Media Uploads**: Markdown is fully supported for rich text formatting in feature requests and comments. However, direct image file uploads are disabled to avoid requiring external cloud storage (AWS S3) configuration for local testing.

## 8. Live Demo
The application has been successfully deployed to Vercel:
- **Frontend URL**: https://roadmaphub-frontend.vercel.app
- **Backend API**: https://roadmaphub-backend.vercel.app
