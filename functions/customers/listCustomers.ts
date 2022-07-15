import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { defaultDocumentTranslateConfig } from '../../constants/dynamodb';

/**
 * List customers
 *
 * @param {APIGatewayProxyEventV2} event - API event
 * @param {Context} context - Request context
 * @returns {APIGatewayProxyResultV2}
 */
const handler: APIGatewayProxyHandlerV2 = async (): Promise<APIGatewayProxyResultV2> => {
  const dbClient = new DynamoDBClient({});
  const dbDocClient = DynamoDBDocumentClient.from(dbClient, defaultDocumentTranslateConfig);

  const command = new ScanCommand({
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
  });

  let response: APIGatewayProxyResultV2;

  try {
    response = await dbDocClient.send(command).then((result) => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          total: result.Count,
          items:
            result.Items?.map((customer) => {
              const { primary_key: name, ...rest } = customer;
              return {
                name: name as string,
                ...rest,
              };
            }) || [],
        }),
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
