import { AWSError } from 'aws-sdk'
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { DEFAULT_DOCUMENT_TRANSLATE_CONFIG } from '../../constants/dynamodb'

/**
 * List customers
 *
 * @param {APIGatewayProxyEventV2} event - API event
 * @param {Context} context - Request context
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (): Promise<APIGatewayProxyResultV2> => {
  const dbClient = new DynamoDBClient({})
  const dbDocClient = DynamoDBDocumentClient.from(dbClient, DEFAULT_DOCUMENT_TRANSLATE_CONFIG)

  const command = new ScanCommand({
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE
  })

  let response

  await dbDocClient.send(command)
    .then(result => {
      response = {
        "statusCode": 200,
        "body": JSON.stringify({
          total: result.Count,
          items: result.Items?.map(customer => {
            const {primary_key: name, ...rest} = customer
            return {
              name: name,
              ...rest
            }
          }) || []
        })
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