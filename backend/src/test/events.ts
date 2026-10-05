import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import type { Query } from "../shared/response";

// The only fields of an API Gateway event the handler reads
export const apiEvent = (rawPath: string, queryStringParameters?: Query) =>
  ({ rawPath, queryStringParameters }) as APIGatewayProxyEventV2;

// The handler always returns a structured result with a JSON body
export const parse = (result: unknown) => {
  const { statusCode, body } = result as APIGatewayProxyStructuredResultV2;
  return { statusCode, body: JSON.parse(body as string) };
};
