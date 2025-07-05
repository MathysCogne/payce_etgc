# Payce 💸

**Send crypto to anyone, anywhere, with just a phone number.**

_Submission for the ETHGlobal Cannes Hackathon (Privy & Mantle Tracks)_

---

## The Problem

Crypto is powerful, but it's not easy. Asking a friend for their 42-character wallet address is intimidating. Explaining gas fees, seed phrases, and network configurations to a newcomer is a non-starter. We need a way to make sending crypto as simple as sending a Venmo or a text message.

## The Solution: Payce

Payce is a web application that bridges this gap. It allows any crypto user to send USDC on the Mantle network to anyone in the world using only their phone number.

**For the recipient, the experience is magic.** They receive a text message with a link. They can log in with just their email, and a secure, non-custodial wallet is instantly created for them behind the scenes thanks to **Privy**. They can then claim their funds without ever needing to understand gas fees, thanks to our **Mantle**-powered Sponsor Wallet.

### Key Features

- **Phone Number Transfers**: No more `0x...` addresses. Just enter a phone number and an amount.
- **Gas-less for Recipients**: Recipients don't need native tokens (MNT) to withdraw their funds. Our Sponsor Wallet handles the gas fees.
- **Seamless Onboarding with Privy**: New users can create a secure, self-custody wallet just by logging in with their email or a social account. No complex setup required.
- **Secure by Design**: OTP verification via SMS ensures that only the rightful owner of the phone number can claim the funds.
- **Fast & Cheap Transactions**: Built on **Mantle** to ensure transfers are quick and affordable.

## How to Run This Project Locally

### Prerequisites

- Node.js (v18 or later)
- pnpm
- A Supabase project for the database
- A Textbelt account for SMS notifications
- A Privy account for authentication

### 1. Clone the repository

```bash
git clone [your-repo-url]
cd payce_etgc
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project by copying the example:

```bash
cp .env.example .env.local
```



### 4. Set up the database

Go to the SQL Editor in your Supabase dashboard and execute the script found in:
`supabase/migrations/0000_create_transfers_table.sql`

This will create the necessary `transfers` table.

### 5. Run the development server

```bash
pnpm dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

---

## The Team

-  **Emre Dedemoglu**
-  **Mathys Cogné-Foucault**
