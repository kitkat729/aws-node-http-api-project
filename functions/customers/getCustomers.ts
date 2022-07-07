import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { ProxyHandler } from './types'

/**
 * Get all customers
 * @returns {APIGatewayProxyResultV2}
 */
const handler: ProxyHandler = async (): Promise<APIGatewayProxyResultV2> => {
  const dynamoDb = new DynamoDB.DocumentClient()
  const scanParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE
  } as DynamoDB.DocumentClient.ScanInput

  const result: DynamoDB.DocumentClient.ScanOutput = await dynamoDb.scan(scanParams).promise()

  return {
    "statusCode": 200,
    "body": JSON.stringify({
      total: result.Count,
      items: await result.Items?.map(customer => {
        return {
          name: customer.primary_key,
          email: customer.email
        }
      })
    })
  }
}

export default handler