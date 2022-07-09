<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS'
description: 'This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node HTTP API on AWS

This project is built off of Serverless Framework Node HTTP API template intended to run on AWS Lambda and API Gateway v2.

This template does not initially include any kind of persistence (database). For more advanced examples, check out the [serverless/examples repository](https://github.com/serverless/examples/) which includes Typescript, Mongo, DynamoDB and other examples.

The template setup AWS with Node 14.x runtime in serverless.yml

The HttpApi integration implements APIGateway V2

## Usage

### Deployment

```
$ serverless deploy
```

After deploying, you should see output similar to:

```bash
Deploying aws-node-http-api-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-http-api-project-dev (152s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: aws-node-http-api-project-dev-hello (1.9 kB)
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/).

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in response similar to the following (removed `input` content for brevity):

```json
{
  "message": "Go Serverless v2.0! Your function executed successfully!",
  "input": {
    ...
  }
}
```

### Local development

You can invoke Lambdas locally by the following commands:

Create example
```
serverless invoke local -f createCustomer -d '{"body":"{\"name\":\"Customer 20\",\"gender\":\"M\"}"}'
```

List example
```
serverless invoke local -f listCustomers
```

Get example
```
serverless invoke local -f getCustomer -d '{"pathParameters":{"customerId":"Customer 20"}}'
```

Delete example
```
serverless invoke local -f deleteCustomer -d '{"pathParameters":{"customerId":"Customer 23"}}'
```

The getCustomer response should look similar to the following:

```
{
    "statusCode": 200,
    "body": "{\"name\":\"Customer 20\",\"gender\":\"M\"}"
}
```


Alternatively, it is also possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
yarn add --dev serverless-offline
```

You need to add `serverless-offline` under `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline start
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).

You can call APIs locally by the following commands:
Note: where a customer name is required in the url path, the customer name must be encoded with encodeURIComponent. For ex: `Customer%2022`

Create example
```
curl --url http://localhost:3000/customers -d '{"name":"Customer 24","email":"customer24@gmail.com"}' -X POST -i -H 'Content-Type: application/json' -H 'Accept: application/json'
```

List example
```
curl --url http://localhost:3000/customers -i -H 'Content-Type: application/json' -H 'Accept: application/json'
```

Get example 
```
<<<<<<< HEAD
curl --url http://localhost:3000/customers/Customer%2022 -i -H 'Content-Type: application/json' -H 'Accept: application/json'
=======
curl --url "http://localhost:3000/customers/Customer%2022" -i -H 'Content-Type: application/json' -H 'Accept: application/json'
>>>>>>> RD-3 update documentation
```

Delete example
```
<<<<<<< HEAD
curl --url http://localhost:3000/customers/Customer25 -X DELETE -i -H 'Content-Type: application/json' -H 'Accept: application/json'
=======
curl --url "http://localhost:3000/customers/Customer25" -X DELETE -i -H 'Content-Type: application/json' -H 'Accept: application/json'
>>>>>>> RD-3 update documentation
```

The GET /customers/Customer%2022 response should look similar to the following:

```
{"name":"Customer 22","email":"customer22@gmail.com"}
```

### Custom headers
Lambda function can return custom headers by adding a `headers` property to the return object

```
{
  statusCode: 200,
  headers: {
    "x-custom-1": "value-1",
    "x-custom-2": "value-2"
  }
  body: JSON.stringify({...})
}
```

### Api path
To assign a named resource path to an api, update the httpApi's path attribute in `serverless.yml`

```
functions:
  createCustomer:
    handler: createCustomer.default
    events:
      - httpApi:
          path: /<resource-name>
```

### Common issues
- Get an error like below when calling API locally. It is because the local built output is missing. Make sure to run `serverless offline start` on a separate command console.
{"errorMessage":"ENOENT: no such file or directory, scandir '/Users/hyuen/repos/aws-node-http-api-project/.build/functions/customers'",
