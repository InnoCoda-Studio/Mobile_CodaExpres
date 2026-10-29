🚴‍♂️ CodaExpress — Next-Gen Logistics & On-Demand Dispatch System
CodaExpress is a full-stack, real-time logistics and dispatch platform engineered for urban delivery and automated errand fulfillment. Built with a decoupled architecture featuring a React Native cross-platform mobile app, a Next.js customer booking portal, and a robust Django REST Framework backend.

🌟 Key Platform Features
🛒 1. "Buy-For-Me" Market Errand Engine
On-Demand Purchasing: Customers can request riders to make market purchases and localized procurement on their behalf.

Dynamic Time-Based Demurrage Tracker: Built-in countdown algorithms track market dwell time in real time. Service fees adjust dynamically based on market congestion, waiting time, and total procurement duration.

📦 2. Smart Pickup & Drop-Off Dispatch
Instant Booking: Seamless booking portal for point-to-point delivery routing.

Tiered Driver KYC & Onboarding: Secure identity verification for dispatch riders.

💳 3. Integrated Wallet & Direct Payments
Prepaid Wallet Architecture: Instant wallet-to-wallet transfers enabling customers to pay riders directly within the app.

Automated Transaction Ledger: Real-time balance calculations, automated payouts, and demurrage adjustments.

🛠 Tech Stack
Backend & API: Python, Django, Django REST Framework (DRF), PostgreSQL (Supabase)

Mobile App: React Native, Expo, NativeWind

Web Portal: Next.js, TypeScript, Tailwind CSS

Media Pipelines & Cloud: Cloudinary (Asynchronous Asset Optimization), Render, Vercel

State Management & Async Tasks: RESTful API Webhooks, Real-Time Geo-Location Tracking

🚧 Active Development Status
This repository contains the frontend architecture (React Native / Next.js) for CodaExpress. Active development is underway for production deployment.

[x] Phase 1: Core Mobile UI / NativeWind Component System & Wallet Interfaces

[x] Phase 2: Django REST Framework API Endpoints & Multi-Tiered KYC Integration

[/] Phase 3: Real-Time Demurrage Algorithm & Location Tracking Integration (In Progress)

[ ] Phase 4: AWS / Cloud Infrastructure Deployment & Production Launch

⚙️ Local Setup Instructions
1. Clone the Repository
Bash
git clone https://github.com/InnoCoda/coda-express-frontend.git
cd coda-express-frontend

3. Install Dependencies
Bash
npm install
# or
yarn install
3. Environment Configuration
Create a .env.local file in the root directory:

Code snippet
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
4. Run Development Server
Bash
npm run dev
# or for mobile app
npx expo start
🔗 Platform Links & Ecosystem
Engineering Agency: innocoda.com

Lead Engineer Portfolio: me.innocoda.com
