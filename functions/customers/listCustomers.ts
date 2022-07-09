import { DynamoDB, AWSError } from 'aws-sdk'
import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda'

/**
 * List customers
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (): Promise<APIGatewayProxyResultV2> => {
  const dynamoDb = new DynamoDB.DocumentClient()
  const scanParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE
  } as DynamoDB.DocumentClient.ScanInput

  let response

  await dynamoDb.scan(scanParams).promise()
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
          })
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

  return await response
}

export default handler