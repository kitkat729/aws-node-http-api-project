import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'

/**
 * Get all customers
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (): Promise<APIGatewayProxyResultV2> => {
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