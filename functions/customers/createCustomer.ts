import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import DEFAULT_DOCUMENT_TRANSLATE_CONFIG from '../../constants/dynamodb';
import { Customer } from '../types';

/**
 * Create Customer handler. Create data or replace existing data.
 *
 * @param {APIGatewayProxyEventV2} event - API event
 * @param {Context} context - Request context
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (event): Promise<APIGatewayProxyResultV2> => {
  if (!event?.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 'MalformedInput',
        errorMessage: 'Malformed input',
      }),
    };
  }

  const customer = JSON.parse(
    Buffer.from(event.body, event?.isBase64Encoded ? 'base64' : 'utf8').toString(),
  ) as unknown as Customer;

  if (!customer?.name) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 'MissingInput',
        errorMessage: '`name` is required',
      }),
    };
  }

  const dbClient = new DynamoDBClient({});
  const dbDocClient = DynamoDBDocumentClient.from(dbClient, DEFAULT_DOCUMENT_TRANSLATE_CONFIG);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { name: primary_key, ...rest } = customer;
  const command = new PutCommand({
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key,
      ...rest,
    },
  });

  let response: APIGatewayProxyResultV2;

  // dynamoDb immediately throws an error for invalid input
  // putItem will replace existing item with new item
  try {
    response = await dbDocClient.send(command).then(() => {
      const newResourceLocation = `/customers/${encodeURIComponent(primary_key)}`;
      return {
        statusCode: 201,
        headers: {
          Location: newResourceLocation,
        },
      };
    });
  } catch (err) {
    response = {
      statusCode: 500,
      body: JSON.stringify({
        code: 'InternalServerError',
      }),
    };
  } finally {
    dbClient.destroy();
  }

  return response;
};

export default handler;
