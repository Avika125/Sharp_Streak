# Sharp Streaks: The Gen Z Productivity FOMO Engine 🚀

Sharp Streaks is a gamified daily habit tracker designed to leverage psychology and reward systems to drive consistency. Built for Gen Z, it uses a dark-themed aesthetic, real-time "Flash Challenges," and a scarcity-driven marketplace.

## 🌟 Core Features

### 1. The 24-Hour Challenge
- **Streak Logic**: Complete your daily task within a 24-hour window or your streak resets to 0.
- **Rewarding System**:
    - Daily Completion: +10 Coins.
    - 3-Day Bonus: +20 Coins (30 total).
    - 7-Day Bonus: +50 Coins (60 total).
    - 30-Day Legend: +100 Coins + "Legend" status.

### 2. The 60-Second Sharpness (Flash Challenges)
- **Sharp Hour**: A random 1-hour window daily where a gold banner appears.
- **Timed Quiz**: Users have 60 seconds to answer habit-forming or knowledge-based questions for high coin rewards.

### 3. The Shadow Shop
- A scarcity-driven marketplace appearing at random intervals for 15 minutes.
- Purchase **Streak Freezes** to protect your streak from accidental resets.
- Inventory is tracked in a secure user ledger.

### 4. Social Synergy (Friend Rewards)
- **Link Up**: Sync your daily challenge with a friend for 24 hours.
- **Synergy Bonus**: Earn **+5 extra coins** (+50% base) if BOTH you and your friend complete your tasks.
- **Accountability**: Real-time status indicators show if your partner has finished their work.

### 5. Smart Notifications
- Automated reminders at 8 PM and 10 PM (Streak Warning) to drive urgency and FOMO.

## 🛠️ Tech Stack

- **Mobile**: React Native (Expo) + Dark Mode Gen Z UI.
- **Backend**: Node.js + Express + TypeScript.
- **Database**: PostgreSQL (Local/NeonDB) with Transactional Ledger.
- **Auth**: Firebase Authentication.
- **Scheduler**: Node-cron for notification logic and random event triggering.

## 🏗️ Architecture (Service Pattern)

The backend follows a service-oriented architecture:
- `StreakService`: Enforces habit logic and streak resets.
- `WalletService`: Manages coin transactions and balance ledger.
- `FlashChallengeService`: Handles randomized daily quiz sessions.
- `NotificationService`: Manages FCM token registration and push logic.

## 📊 Database Schema

- **`users`**: Main user profiles, streak data, and coin balances.
- **`transactions`**: Immutable ledger of all coin earnings and expenditures.
- **`flash_challenges`**: Pool of questions for "Sharp Hour."
- **`flash_sessions`**: Tracks active and past randomized challenge windows.
- **`flash_attempts`**: records user quiz results and time-taken for leaderboards.

---

## 🚀 Setup & Installation

### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` with your `DATABASE_URL`.
4. `npx ts-node src/db/setup.ts` (Applies Schema)
5. `npx ts-node src/server.ts` (Starts Server)

### Mobile
1. `cd mobile`
2. `npm install`
3. Update `src/api/client.ts` with your computer's local IP address.
4. `npx expo start`

---

## 🛠️ Known Limitations (Development)
- **Push Notifications**: Requires a "Development Build" on Android/iOS as per Expo Go SDK 53+ policies. Reminders are logged to the console in development mode.
