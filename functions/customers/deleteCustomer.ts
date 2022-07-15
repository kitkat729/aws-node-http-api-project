import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { defaultDocumentTranslateConfig } from '../../constants/dynamodb';

/**
 * Remove the specific resource if it exists
 *
 * @param {APIGatewayProxyEventV2} event - API event
 * @param {Context} context - Request context
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (event): Promise<APIGatewayProxyResultV2> => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const primary_key = event?.pathParameters?.customerId;

  if (!primary_key) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 'MissingPathParameter',
        errorMessage: '`customerId` is required',
      }),
    };
  }

  const dbClient = new DynamoDBClient({});
  const dbDocClient = DynamoDBDocumentClient.from(dbClient, defaultDocumentTranslateConfig);

  const command = new DeleteCommand({
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      primary_key,
    },
  });

  let response: APIGatewayProxyResultV2;

  try {
    response = await dbDocClient.send(command).then(() => {
      // Promise will be resolved to the same output regardless whether the specific resource
      // was removed or it did not exist
      return {
        statusCode: 204,
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
