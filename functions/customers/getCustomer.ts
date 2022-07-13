import { AWSError } from 'aws-sdk'
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { DEFAULT_DOCUMENT_TRANSLATE_CONFIG } from '../../constants/dynamodb'

/**
 * Get customers
 *
 * @param {APIGatewayProxyEventV2} event - API event
 * @param {Context} context - Request context
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (event, context) : Promise<APIGatewayProxyResultV2> => {
  const primary_key = event?.pathParameters?.customerId

  if (!primary_key) {
    return {
      "statusCode": 400,
      "body": JSON.stringify({
        "code": "MissingPathParameter",
        "errorMessage": "`customerId` is required"
      })
    }
  }

  const dbClient = new DynamoDBClient({})
  const dbDocClient = DynamoDBDocumentClient.from(dbClient, DEFAULT_DOCUMENT_TRANSLATE_CONFIG)

  const command = new GetCommand({
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      "primary_key": primary_key
    }
  })

  let response

  await dbDocClient.send(command)
    .then(result => {
      if (result?.Item) {
        const {primary_key: name, ...rest} = result.Item

        response = {
          "statusCode": 200,
          "body": JSON.stringify({
            "name": name,
            ...rest
          })
        }
      } else {
        response = {
          "statusCode": 404,
          "body": JSON.stringify({
            "errorMessage": "Item not found"
          })
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
    .finally(() => {
      dbClient.destroy()
    })

  return await response
}

export default handler