import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb'
import { fetchAuthSession } from 'aws-amplify/auth'
import { CartItem } from '@/context/CartContext'

// 🔐 Create a DynamoDB client only if credentials exist
async function getClient(): Promise<DynamoDBClient | null> {
  const session = await fetchAuthSession({ forceRefresh: true })

  if (!session.credentials) {
    console.warn('No AWS credentials — skipping DynamoDB')
    return null
  }

  return new DynamoDBClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: session.credentials.accessKeyId,
      secretAccessKey: session.credentials.secretAccessKey,
      sessionToken: session.credentials.sessionToken,
    },
  })
}

export async function saveUserCart(userId: string, cart: CartItem[]): Promise<void> {
  const client = await getClient()
  if (!client) return

  try {
    await client.send(
      new PutItemCommand({
        TableName: 'BakeriaCarts',
        Item: {
          userId: { S: userId },
          cart: { S: JSON.stringify(cart) },
        },
      })
    )
    console.log(`🛒 Saved cart for user: ${userId}`)
  } catch (err) {
    console.error('❌ Error saving cart to DynamoDB:', err)
  }
}

export async function loadUserCart(userId: string): Promise<CartItem[]> {
  const client = await getClient()
  if (!client) return []

  try {
    const result = await client.send(
      new GetItemCommand({
        TableName: 'BakeriaCarts',
        Key: { userId: { S: userId } },
      })
    )

    const raw = result.Item?.cart?.S as string | undefined
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed as CartItem[]
      } else {
        console.warn('⚠️ Loaded cart is not an array')
        return []
      }
    } catch (err) {
      console.error('Failed to parse cart JSON:', err)
      return []
    }
  } catch (err) {
    console.error('Error loading cart from DynamoDB:', err)
    return []
  }
}