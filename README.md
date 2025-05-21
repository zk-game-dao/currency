# @zk-game-dao/currency: Multi-Currency Authentication & Ledger Interface for Internet Computer

The currency library is a comprehensive solution for handling authentication and ledger interactions on the Internet Computer Protocol (ICP), providing seamless integration with various token types, including native IC tokens and chain-fusion (ck) tokens.

## 🌟 Features

- **Multi-Currency Support**: Interact with ICP, CKBTC, CKETH, CKUSDC, CKUSDT, and other ICRC-1 tokens
- **Authentication System**: Multiple auth methods including Internet Identity, Web3Auth, and Sign-In with Bitcoin (SIWB)
- **Chain Fusion Integration**: Convert native tokens (BTC, ETH) to their canister (ck) versions
- **Semi-Custodial Wallets**: Manage user funds with secure, semi-custodial wallet solutions
- **Transaction Management**: Handle deposits, withdrawals, and transfers across different ledgers
- **React Hooks & Components**: Ready-to-use React components for wallet connectivity

## 🏗️ Architecture Overview

The library uses a modular architecture designed for flexibility, security, and ease of integration:

### Core Components

- **Authentication Module**: Handles user authentication through multiple providers
- **Currency Managers**: Type-specific handlers for different token standards
- **Ledger Interfaces**: Standardized interfaces for interacting with various IC ledgers
- **Context Providers**: React context providers for authentication and currency configuration
- **Hooks & Utilities**: Helper functions and React hooks for common currency operations

## 🛠️ Technical Components

### Authentication System

The library supports multiple authentication methods:

```
Authentication
├── Internet Identity
├── Web3Auth
└── Sign-In with Bitcoin (SIWB)
```

### Currency Management

Currency types are managed through a structured hierarchy:

```
CurrencyType
├── Real
│   ├── ICP
│   ├── GenericICRC1
│   ├── CKETHToken
│   │   ├── ETH
│   │   ├── USDC
│   │   ├── USDT
│   │   └── BTC
│   └── BTC
└── Fake (for in-game currencies)
```

## 📋 Prerequisites

- Node.js (version 18 or later)
- React (version 19 or later)
- Internet Computer SDK (dfx version 0.24.2 or later)
- Various IC canister interfaces (CKBTC, CKETH, etc.)

## 🚀 Getting Started

### Installation

```bash
npm install @zk-game-dao/currency
```

### Basic Usage

1. Import and wrap your application with the currency context provider:

```jsx
import { ProvideCurrencyContext } from '@zk-game-dao/currency';

function App() {
  return (
    <ProvideCurrencyContext>
      <YourApplication />
    </ProvideCurrencyContext>
  );
}
```

2. Use authentication hooks to manage user login:

```jsx
import { useAuth } from '@zk-game-dao/currency';

function LoginButton() {
  const { login, isLoggingIn } = useAuth();
  
  return (
    <button 
      onClick={() => login('google')} 
      disabled={isLoggingIn}
    >
      {isLoggingIn ? 'Logging in...' : 'Login with Google'}
    </button>
  );
}
```

3. Access currency managers for token operations:

```jsx
import { useTokenManager, Currency } from '@zk-game-dao/currency';

function BalanceDisplay() {
  const icpManager = useTokenManager({ ICP: null });
  const [balance, setBalance] = useState(0);
  
  useEffect(() => {
    async function fetchBalance() {
      const accountBalance = await icpManager.accountBalance();
      setBalance(accountBalance);
    }
    
    if (icpManager) {
      fetchBalance();
    }
  }, [icpManager]);
  
  return <div>ICP Balance: {balance}</div>;
}
```

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/zk-game-dao/currency-library.git
cd currency-library
```

2. Install dependencies:
```bash
npm install
```

4. Run development server:
```bash
npm run storybook
```

## 💻 Core Components

### Authentication Module

The authentication module provides interfaces for multiple login methods:

```typescript
// Internet Identity
type AuthDataInternetIdentity = {
  type: "ii";
  provider: AuthClient;
  // Additional II-specific fields
}

// Web3Auth
type AuthDataWeb3Auth = {
  type: "web3auth";
  provider: IProvider;
  // Additional Web3Auth-specific fields
}

// Sign-In with Bitcoin
type AuthDataSiwb = {
  type: "siwb";
  provider: SiwbProvider;
  // Additional SIWB-specific fields
}
```

### Currency Managers

Currency managers provide a consistent interface for different token types:

```typescript
type CurrencyManager = {
  meta: CurrencyMeta;
  currencyType: CurrencyType;
}

type CurrencyMeta = {
  decimals: number;
  thousands: number;
  transactionFee: bigint;
  metadata?: IcrcTokenMetadata;
  icon?: string;
  symbol: string;
  alternatives?: Record<string, CurrencyMeta>;
}
```

### Ledger Interactions

The library supports various ledger operations:

```typescript
// Fetch allowance
async function fetchAllowance: (
  currencyType: CurrencyType,
  receiver: CurrencyReceiver,
  authData: AuthData
) => Promise<AllowanceResult>

// Set allowance
async function setAllowance: (
  currencyType: CurrencyType,
  receiver: CurrencyReceiver,
  amount: bigint,
  authData: AuthData,
  expires_at: Date
) => Promise<SetAllowanceResult>

// Get account balance
async function fetchBalance(
  ledger: Principal,
  owner: Principal,
  subaccount?: Option<Uint8Array>
): Promise<u128>

// Transfer funds
async function transferTo(
  currencyType: CurrencyType,
  receiver: CurrencyReceiver,
  amount: bigint,
  authData: AuthData
): Promise<TransferResult>
```

## 📁 Library Structure

```
.
├── package.json               # Package configuration
├── ui/                        # React components and hooks
│   ├── auth/                  # Authentication components
│   ├── components/            # UI components
│   ├── context/               # React context providers
│   ├── hooks/                 # React hooks
│   ├── icons/                 # Token and UI icons
│   ├── queries/               # API query functions
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
└── src/                       # Rust backend integration
    ├── types                  # Type definitions
    ├── lib.rs                 # Main library entry point
    ├── query.rs               # Ledger query functions
    ├── transfer.rs            # Transfer functions
    └── currency_error.rs      # Error handling
    └── ...
```

## 🔄 Usage Examples

### Authentication

```typescript
import { useAuth } from '@zk-game-dao/currency';

// Login with Internet Identity
const { login } = useAuth();
await login('ii');

// Login with Web3Auth
await login('google');  // or 'facebook', 'twitter', etc.

// Login with Bitcoin (SIWB)
await login('siwb');

// Get current authentication data
const { authData } = useAuth();
if (authData) {
  console.log('Logged in as:', authData.principal.toString());
}
```

### Transfer Funds

```typescript
import { Principal } from '@dfinity/principal';
import { transferTo, type AuthData } from '@zk-game-dao/currency';

async function sendFunds(authData: AuthData) {
  const recipient = Principal.fromText('aaaaa-aa');
  const amount = 100000000n; // 1 ICP
  
  const blockHeight = await transferTo({ Real: { ICP: null } }, recipient, amount, authData);
  
  console.log('Transfer successful! Block height:', blockHeight);
}
```

## 🛣️ Roadmap

- [ ] Integrate with more authentication providers
- [ ] Add transaction history based on ledger transactions
- [ ] Enhance wallet management features

## 🤝 Contributing

Contributions are welcome! Please read our Contributing Guide for details on our code of conduct and the process for submitting pull requests.
