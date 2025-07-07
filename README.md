# 🥐 Bakeria

**Bakeria** is a full-stack e-commerce web application for a modern bakery, built with **Next.js** and **TypeScript**. It features user authentication, a persistent shopping cart, and order management — all powered by **AWS DynamoDB** and **AWS Amplify**.

**🔗Live Demo**: [https://main.d3149rt8ngwjhp.amplifyapp.com]
---

## Key Features

- **Shopping Cart**  
  Add, remove, and update items. Cart is saved per user in **DynamoDB**, persisting across sessions.

- **Authentication & Roles**  
  Role-based access (`customer`, `admin`, `employee`) via **AWS Amplify Auth (Cognito)**.

- **Order Management**  
  Customers can place orders; admins and employees can view and update all orders stored in **DynamoDB**.

- **Admin Dashboard**  
  View real-time **order volume and revenue** by week, month, or year. Built with **Recharts** and supports **data aggregation** by time period.

- **AWS Integration**  
  - **Auth**: Amplify Auth (Cognito)  
  - **Data**: DynamoDB for cart and orders  
  - **Storage**: Amazon S3 for product images

## 🛠️ Tech Stack

- **Next.js** with Server-Side Rendering (SSR)
- **TypeScript** for type safety and developer productivity
- **React Context API** for global state management (auth, cart)
- **AWS SDK v3** for interacting with cloud services
- **AWS Amplify** for authentication and environment config
- **Amazon DynamoDB** for cart and order persistence
- **Amazon S3** for hosting product images
- **Recharts** for visualizing order analytics on the admin dashboard

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Visit the app
http://localhost:3000
```

## ☁️ AWS Setup

To enable full functionality of **Bakeria**, you need to configure the following AWS services:

---

### 1. AWS Cognito (via Amplify Auth)

- **Used for authentication**
- Create a **User Pool** and enable **email login**
- Define user groups:
  - `admin`
  - `employee`
  - `customer` (default)

#### 📌 Required Configuration

```ts
// amplifyAdminConfig.ts
export const amplifyAdminConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID',
      userPoolClientId: 'YOUR_CLIENT_ID',
      identityPoolId: 'YOUR_IDENTITY_POOL_ID',
      region: 'ap-southeast-1',
    },
  },
}
```

### 2. DynamoDB Tables

| Table Name      | Partition Key | Sort Key  | Used For              |
| --------------- | ------------- | --------- | --------------------- |
| `BakeriaCarts`  | `userId`      | *(none)*  | Persist user carts    |
| `BakeriaOrders` | `userId`      | `orderId` | Store all user orders |
| `Products`      | `id`          | *(none)*  | Product catalog data  |

### 3. Amazon S3 (optional but recommended)

- Use S3 to host product images

- Bucket example: xxxx-xxxx-xxxx.s3.ap-southeast-1.amazonaws.com

- Ensure objects are publicly accessible

### 4. Environment Variables (Local or Amplify Console)

Example

```
ACCESS_KEY_ID=your_aws_access_key
SECRET_ACCESS_KEY=your_aws_secret_key
```

### 5. IAM Permission

To enable this app to function correctly with AWS services, ensure the IAM user or role used for deployment and runtime has the following capabilities:

- **Read and write access to DynamoDB**  
  Required to store and retrieve user carts and order data from DynamoDB tables.

- **Access to AWS Amplify**  
  Necessary if you're deploying the app via AWS Amplify Console and using Amplify for backend environment configuration.

- **(Optional) Access to S3 for static content**  
  If your product images or assets are hosted on Amazon S3, grant read access to the corresponding S3 bucket.

> Note: It’s recommended to follow the principle of least privilege and only grant the exact permissions needed.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

## 📄 License

This project is intended for **learning and demonstration purposes only**.  
