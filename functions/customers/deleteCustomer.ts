import { DynamoDB, AWSError } from 'aws-sdk'
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'

const dynamoDb = new DynamoDB.DocumentClient()

const handler: APIGatewayProxyHandlerV2 = async (event, context) : Promise<APIGatewayProxyResultV2> => {
  const primary_key = event?.pathParameters?.customerId

  if (!primary_key) {
    // Not meant for HTTP
    throw new Error("customerId must not be empty")
  }

  const deleteParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      "primary_key": primary_key
    } as DynamoDB.DocumentClient.Key
  } as DynamoDB.DocumentClient.DeleteItemInput

  let response

  await dynamoDb.delete(deleteParams).promise()
    .then(result => {
      response = {
        "statusCode": 204,
      }
    })
    .catch((err: AWSError) => {
      response = {
        "statusCode": 500,
        "body": JSON.stringify({
          "code": "InternalServerError"
        })
      }
    })

  return await response
}

export default handler