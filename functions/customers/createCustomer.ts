import { DynamoDB, AWSError } from 'aws-sdk'
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
      "statusCode": 400,
      "body": JSON.stringify({
        "code": "MalformedInput",
        "errorMessage": "Malformed input"
      })
    }
  }

  const customer = JSON.parse(Buffer.from(event.body, event?.isBase64Encoded ? 'base64' : 'utf8').toString())

  if (!customer?.name) {
    return {
      "statusCode": 400,
      "body": JSON.stringify({
        "code": "MissingParameter",
        "errorMessage": "`name` is required"
      })
    }
  }

  const {name: primary_key, ...rest} = customer;
  const putParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: primary_key,
      ...rest
    },
  } as DynamoDB.DocumentClient.PutItemInput

  let response

  // dynamoDb immediately throws an error for invalid input
  // putItem will replace existing item with new item 
  await dynamoDb.put(putParams).promise()
    .then(result => {
      response = {
        "statusCode": 201,
        "headers": {
          "Location": "new-resource-location" 
        }
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