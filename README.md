# Bakeria

Bakeria is a full-stack e-commerce web application for a bakery, built with [Next.js](https://nextjs.org) and TypeScript. It features user authentication, a persistent shopping cart, and order management with AWS DynamoDB.

## Features

- 🛒 **Shopping Cart**: Customers can add, remove, and update items in their shopping cart. Cart data is saved for each user in DynamoDB and persists across sessions.
- 👤 **User Authentication**: Secure login, with roles for customers, admins, and employees.
- 📦 **Order Management**: Customers can checkout and place orders. Orders are stored in DynamoDB. Admins and employees can view and update all orders.
- 🔐 **AWS Integration**: Uses AWS Amplify for authentication and DynamoDB for storing carts and orders.
- ⚡ **Modern Stack**: Built with Next.js, React, TypeScript, and AWS SDK.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the app by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

API routes are available at [http://localhost:3000/api/*](http://localhost:3000/api/hello), and can be modified in `pages/api`.

## Project Structure

- `src/context/CartContext.tsx` — Handles cart state and persistence for each user.
- `src/lib/userCart.ts` — Logic to save/load cart data in DynamoDB.
- `src/lib/storeOrder.ts` — Logic to store user orders in DynamoDB.
- `src/lib/adminStoreOrder.ts` — Admin endpoints to manage orders.
- `src/context/AuthContext.tsx` and `src/context/AdminAuthContext.tsx` — Handle user and admin authentication via AWS Amplify.

## AWS Setup

- Requires AWS Amplify and DynamoDB tables (`BakeriaCarts`, `BakeriaOrders`).
- Make sure to configure your AWS credentials and Amplify settings.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

## License

This project is for learning and demonstration purposes.
