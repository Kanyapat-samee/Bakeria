# Bakeria

## Description

Bakeria is a full-stack web application for managing an online bakery. It combines frontend and backend in a single monolithic codebase, allowing customers to browse products, manage their cart, and place orders. Admins can track and update orders through a simple dashboard with basic analytics.

# Demo

https://main.dtptxc8mgej38.amplifyapp.com/

## Features

- User authentication using AWS Cognito
- Persistent cart stored per user session
- Checkout with delivery or pickup options
- Order tracking and admin status updates
- Admin dashboard with sales analytics
- Product images hosted on Amazon S3
- Responsive design with reusable components

## Technologies Used

**Frontend**

- Next.js (React Framework)
- TypeScript
- Tailwind CSS

**Backend and Integration**

- AWS Amplify (Cognito Authentication)
- AWS SDK v3
- Amazon DynamoDB (Product, Cart, and Order storage)
- Amazon S3 (Image Hosting)
- Recharts (Charting for admin analytics)