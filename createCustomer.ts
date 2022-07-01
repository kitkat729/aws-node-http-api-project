import { DynamoDB } from 'aws-sdk'

type CreateCustomerResult = {
  statusCode: number;
}

const dynamoDb = new DynamoDB.DocumentClient()

export default async (event): Promise<CreateCustomerResult> => {
  const body = JSON.parse(Buffer.from(event.body, 'base64').toString())
  const putParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: body.name,
      email: body.email
    }
  } as DynamoDB.DocumentClient.PutItemInput

  await dynamoDb.put(putParams).promise()

  return {
    statusCode: 201
  }
}