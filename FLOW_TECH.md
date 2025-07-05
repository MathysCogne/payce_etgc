# Payce - Technical Flow Deep Dive

**Project for ETHGlobal Cannes - Privy & Mantle Tracks**

## 1. Elevator Pitch

**Payce** is the simplest way to send crypto to anyone, anywhere, just by using their phone number. We eliminate the complexity of wallet addresses and gas fees for the recipient, making crypto transfers as easy as sending a text message. By leveraging **Privy** for seamless user onboarding and **Mantle** for fast, low-cost transactions, Payce bridges the gap between Web3's power and Web2's simplicity.

## 2. Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS with shadcn/ui components
- **Blockchain Core**: Mantle Sepolia Testnet
- **Web3 Libraries**: `viem` & `wagmi` for robust blockchain interaction
- **Authentication & Embedded Wallets**: **Privy** for password-less login and instant, non-custodial wallet creation for new users.
- **Database**: Supabase for storing transfer data
- **Notifications**: Textbelt for SMS delivery of OTPs and claim links

## 3. Core Architecture: The "Sponsor Wallet" Pattern

To solve the classic "gas problem" for recipients (who have no native tokens to pay for withdrawal), we've implemented a **Sponsor Wallet (or Relayer)** architecture.

1.  **Central Sponsor Wallet**: We maintain a single, central wallet that is pre-funded with MNT (for gas) and a reserve of USDC.
2.  **Sender's Role**: The sender's only job is to send USDC to this Sponsor Wallet. This is a single, simple transaction.
3.  **Backend's Role**: Our backend uses the Sponsor Wallet's private key to "sponsor" the final transaction, paying the MNT gas fees to send the USDC from the Sponsor Wallet to the final recipient.

This creates a "gas-less" experience for the recipient and a simple, one-transaction experience for the sender.

## 4. Step-by-Step User & System Flow

Here is a detailed breakdown of a complete transfer.

---

### **Part 1: The Sender Initiates the Transfer**

1.  **Connect Wallet (`Sender`)**: The sender visits Payce and connects their existing wallet (e.g., MetaMask) using the **Privy** modal.
2.  **Enter Details (`Sender`)**: The sender inputs the recipient's phone number and the amount of USDC to send on the homepage.
3.  **Fund the Sponsor (`Sender`)**:
    - The user clicks "Send". The frontend triggers a standard ERC20 `transfer` transaction.
    - **Destination**: The Sponsor Wallet address.
    - **Asset**: The specified amount of USDC on the Mantle network.
    - The sender signs and pays the gas fee for this single transaction with their own MNT.
4.  **Create the Transfer Record (`Backend`)**:
    - Upon successful transaction confirmation, the frontend calls the `/api/create-transfer` endpoint.
    - The backend creates a new record in the `transfers` table in Supabase, storing the sender's address, recipient's phone number, amount, transaction hash, and a newly generated unique `claim_hash`. The status is set to `funded`.
5.  **Notify the Recipient (`Backend`)**:
    - The backend then calls the `sendSMS` function.
    - An SMS is sent to the recipient containing a unique claim link: `https://payce.app/claim/[claim_hash]`.

---

### **Part 2: The Recipient Claims the Funds**

1.  **Open Claim Page (`Recipient`)**: The recipient clicks the link in the SMS and lands on the claim page. The page fetches the transfer details from Supabase and displays the amount they are about to receive.
2.  **Login with Privy (`Recipient`)**:
    - The user is prompted to connect. They can use jejich email, a social account, or an existing wallet.
    - If the user is new to Web3, **Privy** seamlessly creates a new, non-custodial embedded wallet for them, associated with their login method. No seed phrases, no complexity.
3.  **Request OTP (`Recipient`)**:
    - Once logged in, the recipient clicks "Claim Funds".
    - The frontend calls the `/api/send-otp` endpoint.
4.  **Send OTP (`Backend`)**:
    - The backend generates a 6-digit OTP.
    - It **hashes** the OTP and stores the hash and a 10-minute expiry timestamp in the corresponding `transfers` record in Supabase.
    - It sends the clear-text OTP to the recipient via SMS.
5.  **Verify & Withdraw (`Recipient` & `Backend`)**:
    - The recipient enters the 6-digit code on the page.
    - They click "Verify & Claim". The frontend calls `/api/execute-claim` with the `claim_hash` and the OTP.
    - The backend hashes the submitted OTP and verifies three things:
        1. Does the hash match the one in the database?
        2. Has the OTP expired?
        3. Is the transfer status `funded`?
6.  **Execute the Final Transfer (`Backend`)**:
    - If all checks pass, the backend loads the **Sponsor Wallet's private key** from environment variables.
    - It constructs and signs a new transaction on the server using `viem`.
    - **Action**: Send the original USDC amount from the Sponsor Wallet to the recipient's wallet address (provided by Privy).
    - The backend pays the MNT gas fees for this final transaction.
7.  **Confirmation**: The recipient receives the USDC in their wallet, and the frontend shows a success message. The transfer status in Supabase is updated to `claimed`.

---

## 5. How We Use the Bounties

- **Privy**: Privy is the cornerstone of our user experience. It allows us to onboard users who have never touched crypto before. The ability to create an embedded wallet from a simple email or social login is the magic that makes Payce accessible to everyone.
- **Mantle**: We chose Mantle for its low transaction fees and high throughput. The Sponsor Wallet architecture is only viable on a low-cost network. Mantle's EVM compatibility allowed us to build quickly with familiar tools like `viem` and `wagmi`. 