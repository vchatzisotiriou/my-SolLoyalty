# SolLoyalty: Blockchain-Based Loyalty Rewards

SolLoyalty is a comprehensive loyalty reward system built on the Solana blockchain. It allows businesses to reward customers with custom cryptocurrency tokens (SPL tokens) for purchases and promotional activities, which customers can then redeem for rewards or discounts.

![SolLoyalty](https://via.placeholder.com/800x400?text=SolLoyalty+Platform)

## Features

- **Token Creation**: Businesses can create custom SPL tokens on the Solana blockchain
- **Rewards Management**: Create and manage various rewards that customers can redeem with tokens
- **Customer Dashboard**: Customers can view their token balance and available rewards
- **Business Portal**: Businesses can monitor token distribution and customer activity
- **Wallet Integration**: Seamlessly connects with Solana wallets for secure transactions
- **Transaction History**: Complete record of token earnings and redemptions

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js with Express
- **Blockchain**: Solana Web3.js for blockchain interactions
- **State Management**: React Context API, TanStack Query
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Service and utility functions
│   │   ├── pages/       # Page components
│   │   ├── App.tsx      # Main application component
│   │   └── main.tsx     # Entry point
│   └── index.html       # HTML template
│
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data storage implementation
│   └── vite.ts          # Vite server configuration
│
└── shared/              # Shared code between client and server
    └── schema.ts        # Database schema and types
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Solana CLI tools (for blockchain interactions)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/solloyalty.git
   cd solloyalty
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

### For Businesses

1. Connect your Solana wallet to create an account
2. Create your custom loyalty token
3. Set up rewards that customers can redeem with tokens
4. Monitor customer activity and token distribution through the Business Portal

### For Customers

1. Connect your Solana wallet to access the platform
2. Earn tokens through purchases and promotions at participating businesses
3. View your token balance and available rewards
4. Redeem tokens for rewards offered by businesses

## Development

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000

# Solana Configuration
SOLANA_NETWORK=devnet

# Optional: Add your Solana wallet private key for development
# SOLANA_PRIVATE_KEY=your_private_key
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Future Roadmap

- **Advanced Tokenomics**: Implement token staking, vesting, and burning mechanisms
- **Multi-merchant Support**: Allow customers to use tokens across different businesses
- **Analytics Dashboard**: Provide businesses with insights on program effectiveness
- **Mobile App**: Develop native mobile applications for iOS and Android
- **Integrations**: Connect with popular POS systems and e-commerce platforms

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Solana](https://solana.com/) - The blockchain platform powering our token system
- [React](https://reactjs.org/) - The web framework used
- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful UI components
- [TanStack Query](https://tanstack.com/query) - For efficient data fetching

---

Created with ❤️ by [Your Name]