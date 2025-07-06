import type { NextApiRequest, NextApiResponse } from 'next'
import { getDynamoDbDocClient } from '@/lib/aws'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDynamoDbDocClient()
    const command = new ScanCommand({ TableName: 'Products' })
    const result = await db.send(command)

    res.status(200).json(result.Items ?? [])
  } catch (error) {
    console.error('DynamoDB error:', error)
    res.status(500).json({ error: 'Failed to load products' })
  }
}
