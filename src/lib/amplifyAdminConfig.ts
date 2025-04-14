export const amplifyAdminConfig = {
  Auth: {
    Cognito: {
      region: process.env.NEXT_PUBLIC_COGNITO_ADMIN_REGION!,
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_ADMIN_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_ADMIN_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_COGNITO_ADMIN_IDENTITY_POOL_ID!,
    },
  },
}

  