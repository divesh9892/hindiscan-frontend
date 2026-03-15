# 🇮🇳 HindiScan Frontend Interface 🎨

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

The sleek, highly responsive, and interactive user interface for HindiScan. Built with Next.js App Router and Tailwind CSS, this frontend delivers a seamless experience for uploading documents, tracking AI extraction progress in real-time, and securely managing billing.

## ✨ Core UX & Architecture Features

- **Real-Time Polling Engine:** Implements intelligent, non-blocking asynchronous polling to the backend to provide users with a buttery-smooth progress bar during heavy AI document extraction.
- **Enterprise Adapter UI:** Features a completely custom, state-driven Mock Payment Modal that mirrors the Razorpay SDK checkout flow, allowing for rigorous end-to-end billing tests without touching real payment gateways.
- **Secure File Handling:** Integrates advanced blob parsing and CORS header extraction to ensure downloaded Excel files inherit the AI's dynamically generated intelligent filenames.
- **Role-Based Access Control:** Utilizes Clerk Authentication middleware to seamlessly route standard users to the dashboard while dynamically rendering an Enterprise Admin God-Mode console for authorized accounts.
- **Double-Stringification Resilience:** Editor payloads are meticulously normalized before transmission to guarantee valid JSON traversal by the backend pipeline.

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Authentication:** Clerk React SDK
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`)
- **HTTP Client:** Axios (Custom Interceptors)
- **Toasts/Notifications:** Sonner

---

## 🚀 Local Development Setup

### 1. Clone the Repository

git clone https://github.com/divesh9892/hindiscan-frontend.git
cd hindiscan-frontend

### 2. Install Dependencies

npm install

# or

yarn install

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and configure the following:

# API Connection

NEXT_PUBLIC_API_URL=http://localhost:8400/api/v1

# Authentication (Clerk)

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

### 4. Run the Development Server

npm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🏗️ Building for Production

To test the highly-optimized production build locally before deploying to Vercel:

1. Compile the application:
   npm run build

2. Start the production server:
   npm run start
