import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context, Callback } from 'aws-lambda';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  GetCommandInput,
  ScanCommandInput,
  PutCommandInput,
  DeleteCommandInput,
} from '@aws-sdk/lib-dynamodb/dist-types/commands';

import getCustomer from '../functions/customers/getCustomer';
import listCustomers from '../functions/customers/listCustomers';
import createCustomer from '../functions/customers/createCustomer';
import deleteCustomer from '../functions/customers/deleteCustomer';

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: jest.fn().mockImplementation(),
    GetCommand: jest.fn().mockImplementation((input: GetCommandInput) => ({ input })),
    ScanCommand: jest.fn().mockImplementation((input: ScanCommandInput) => ({ input })),
    PutCommand: jest.fn().mockImplementation((input: PutCommandInput) => ({ input })),
    DeleteCommand: jest.fn().mockImplementation((input: DeleteCommandInput) => ({ input })),
  };
});

describe('customers', () => {
  const OLD_ENV = process.env;
  const mockSend = jest.fn();
  const MockDynamoDBDocumentClient = jest.fn();

  beforeAll(() => {
    MockDynamoDBDocumentClient.mockImplementation(() => {
      return {
        send: mockSend,
      };
    });
    DynamoDBDocumentClient.from = jest.fn().mockReturnValue(new MockDynamoDBDocumentClient());
  });
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.DYNAMODB_CUSTOMER_TABLE = 'aws-node-http-api-project-customerTable-dev';

    jest.clearAllMocks();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });
  describe(`getCustomer`, () => {
    it(`should get correct data if customer exists`, async () => {
      mockSend.mockResolvedValue({
        Item: {
          primary_key: 'Existing Customer',
        },
      });

      const event = {
        pathParameters: { customerId: 'Existing Customer' },
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await getCustomer(event, context, callback);

      const expected = {
        statusCode: 200,
        body: JSON.stringify({
          name: 'Existing Customer',
        }),
      };

      expect(result).toEqual(expected);
      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
          Key: {
            primary_key: 'Existing Customer',
          },
        }),
      );
    });

    it(`should get error if customer does not exist`, async () => {
      mockSend.mockResolvedValue({});

      const event = {
        pathParameters: { customerId: 'NonExisting Customer' },
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await getCustomer(event, context, callback);

      const expected = {
        statusCode: 404,
        body: JSON.stringify({
          errorMessage: 'Item not found',
        }),
      };

      expect(result).toEqual(expected);
      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
          Key: {
            primary_key: 'NonExisting Customer',
          },
        }),
      );
    });

    it(`should get error if required input is missing`, async () => {
      const event = {
        pathParameters: null,
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await deleteCustomer(event, context, callback);

      const expected = {
        statusCode: 400,
        body: JSON.stringify({
          code: 'MissingPathParameter',
          errorMessage: '`customerId` is required',
        }),
      };
      expect(result).toEqual(expected);
    });
  });

  describe(`listCustomers`, () => {
    it(`should get empty list`, async () => {
      mockSend.mockResolvedValue({
        Count: 0,
        Items: undefined,
      });

      const event = {} as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await listCustomers(event, context, callback);

      const expected = {
        statusCode: 200,
        body: JSON.stringify({
          total: 0,
          items: [],
        }),
      };

      expect(result).toEqual(expected);
      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
        }),
      );
    });

    it(`should get correct list`, async () => {
      mockSend.mockResolvedValue({
        Count: 3,
        Items: [
          { primary_key: 'Customer 1' },
          { primary_key: 'Customer 2' },
          { primary_key: 'Customer 3' },
        ],
      });

      const event = {} as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await listCustomers(event, context, callback);

      const expected = {
        statusCode: 200,
        body: JSON.stringify({
          total: 3,
          items: [{ name: 'Customer 1' }, { name: 'Customer 2' }, { name: 'Customer 3' }],
        }),
      };

      expect(result).toEqual(expected);
      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
        }),
      );
    });
  });

  describe(`createCustomer`, () => {
    it(`should get error if input body is empty (null)`, async () => {
      mockSend.mockResolvedValue(true);

      const event = {
        body: null,
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await createCustomer(event, context, callback);

      const expected = {
        statusCode: 400,
        body: JSON.stringify({
          code: 'MalformedInput',
          errorMessage: 'Malformed input',
        }),
      };

      expect(result).toEqual(expected);
      expect(mockSend).not.toBeCalled();
    });

    it(`should get error if required input is missing`, async () => {
      mockSend.mockResolvedValue(true);

      const event = {
        body: JSON.stringify({}),
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await createCustomer(event, context, callback);

      const expected = {
        statusCode: 400,
        body: JSON.stringify({
          code: 'MissingInput',
          errorMessage: '`name` is required',
        }),
      };

      expect(result).toEqual(expected);
      expect(mockSend).not.toBeCalled();
    });

    it(`should get correct data after a new customer is created`, async () => {
      mockSend.mockResolvedValue(true);

      const event = {
        body: JSON.stringify({
          name: 'New Customer',
        }),
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await createCustomer(event, context, callback);

      const expected = {
        statusCode: 201,
        headers: {
          Location: `/customers/New%20Customer`,
        },
      };
      expect(result).toEqual(expected);
      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
          Item: {
            primary_key: 'New Customer',
          },
        }),
      );
    });
  });

  describe(`deleteCustomer`, () => {
    it(`should delete record if record exists`, async () => {
      mockSend.mockResolvedValue(true);
      const event = {
        pathParameters: {
          customerId: 'Customer to delete',
        },
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await deleteCustomer(event, context, callback);

      const expected = {
        statusCode: 204,
      };

      expect(result).toEqual(expected);
      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: {
            primary_key: 'Customer to delete',
          },
        }),
      );
    });

    /* Notes: A delete request can never hit the lambda if a resource id is missing from
     * the url. The request is simply not routable and the gateway will throw an error.
     * The lambda will only get an event if and only if a target id is present
     */
    it(`should get error if required input is missing`, async () => {
      const event = {
        pathParameters: null,
      } as unknown as APIGatewayProxyEventV2;
      const context = {} as Context;
      const callback = {} as Callback<APIGatewayProxyResultV2>;
      const result = await deleteCustomer(event, context, callback);

      const expected = {
        statusCode: 400,
        body: JSON.stringify({
          code: 'MissingPathParameter',
          errorMessage: '`customerId` is required',
        }),
      };
      expect(result).toEqual(expected);
    });
  });
});
