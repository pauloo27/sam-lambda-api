import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { newDataSource } from "./db/datasource";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("hello :)");
    const ds = newDataSource();
    console.log("data source created");
    await ds.initialize();
    console.log("data source initialized");
    await ds.synchronize();
    console.log("data source migrations run");

    const name = event.queryStringParameters?.name;
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "missing the name query parameter",
        }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `hello ${name}`,
      }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "some error happened",
      }),
    };
  }
};
