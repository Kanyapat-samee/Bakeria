import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/aws'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const command = new ScanCommand({ TableName: 'Products' })
    const result = await db.send(command)

    console.log('DynamoDB result:', JSON.stringify(result, null, 2))

    res.status(200).json(Array.isArray(result.Items) ? result.Items : [])
  } catch (error) {
    console.error('DynamoDB error:', error)
    res.status(500).json({ error: 'Failed to load products' })
  }
}
