import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, type NativeAttributeValue } from "@aws-sdk/lib-dynamodb";

export const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const TABLE = process.env.TABLE_NAME!;

// A row as stored in DynamoDB
export type Item = Record<string, NativeAttributeValue>;

type PutRequest = { PutRequest: { Item: Item } };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Writes any number of items: chunks of 25, retries with exponential backoff
export async function writeAll(items: Item[]): Promise<void> {
  for (let i = 0; i < items.length; i += 25) {
    let requests: PutRequest[] = items.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } }));

    for (let attempt = 0; requests.length > 0; attempt++) {
      if (attempt === 5) throw new Error(`${requests.length} items not written after 5 attempts`);
      if (attempt > 0) await sleep(200 * 2 ** attempt);

      const res = await ddb.send(new BatchWriteCommand({ RequestItems: { [TABLE]: requests } }));
      requests = (res.UnprocessedItems?.[TABLE] ?? []) as PutRequest[];
    }
  }
}