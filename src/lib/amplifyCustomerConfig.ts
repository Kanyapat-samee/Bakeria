// src/config/amplifyCustomerConfig.ts

export const amplifyCustomerConfig = {
  Auth: {
    Cognito: {
      region: process.env.NEXT_PUBLIC_COGNITO_REGION!,
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID!,
    },
  },
}
