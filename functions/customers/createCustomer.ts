import { DynamoDB } from 'aws-sdk'
import { Context, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { ProxyHandler } from './types'

const dynamoDb = new DynamoDB.DocumentClient()

/**
 * Create Customer handler. Handler accepts request content-type 'application/json' and 'application/x-www-form-urlencoded'
 * @param {APIGatewayProxyEventV2} event - API event
 * @param {Context} context - Request context
 * @returns {APIGatewayProxyResultV2}
 */
const handler: ProxyHandler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
console.log('event=%o', event)
  if (!event.body) {
    return {
      "statusCode": 400
    }
  }

  // AWS and local behave differently. AWS encodes body data in base64 format, but local does not encode.
  // Here we check the isBase64Encode flag to decide whether body data needs unencoding
  const body = JSON.parse(event.isBase64Encoded? Buffer.from(event.body, 'base64').toString() : event.body)
  const putParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: body.name,
      email: body.email
    }
  } as DynamoDB.DocumentClient.PutItemInput

  await dynamoDb.put(putParams).promise()

  return {
    "statusCode": 201
  }
}

export default handler