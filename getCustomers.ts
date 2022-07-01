import { DynamoDB } from 'aws-sdk'

type GetCustomersResult = {
  statusCode: number;
  body?: string;
}

export default async (): Promise<GetCustomersResult> => {
  const dynamoDb = new DynamoDB.DocumentClient()
  const scanParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE
  } as DynamoDB.DocumentClient.ScanInput

  const result: DynamoDB.DocumentClient.ScanOutput = await dynamoDb.scan(scanParams).promise()

  if (result.Count === 0) {
    return {
      statusCode: 404
    }
  }

  return {
    statusCode: 200,  
    body: JSON.stringify({
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