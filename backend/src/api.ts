import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const q = event.queryStringParameters ?? {};
  const location = q.location ?? "camden";
  const hours = Math.min(Number(q.hours ?? 48) || 48, 24 * 30);
  const since = new Date(Date.now() - hours * 3600e3).toISOString().slice(0, 16);

  const { Items } = await ddb.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: "#l = :l AND #t >= :s",
      ExpressionAttributeNames: { "#l": "location", "#t": "ts" },
      ExpressionAttributeValues: { ":l": location, ":s": since },
    })
  );

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Items ?? []),
  };
};