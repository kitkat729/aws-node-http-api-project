import { DynamoDB } from 'aws-sdk'
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'

const dynamoDb = new DynamoDB.DocumentClient()

/**
 * Create Customer handler. Create data if data not yet existed or append data to existing data.
 * Handler can handle request content-type 'application/json' and 'application/x-www-form-urlencoded'
 * @param {APIGatewayProxyEventV2} event - API event
 * @param {Context} context - Request context
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (event, context): Promise<APIGatewayProxyResultV2> => {
  if (!event?.body) {
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