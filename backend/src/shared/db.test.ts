import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ddbMock } from "../test/ddb";
import { writeAll, type Item } from "./db";

const items = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({ pk: "AIR#camden", sk: `2026-10-05T${String(i).padStart(2, "0")}:00` }));

const put = (Item: Item) => ({ PutRequest: { Item } });
// Items sent by each BatchWriteCommand, in order
const sentBatches = () =>
  ddbMock.commandCalls(BatchWriteCommand).map((call) => call.args[0].input.RequestItems!["test-table"]);

beforeEach(() => {
  ddbMock.reset();
  ddbMock.on(BatchWriteCommand).resolves({});
});

describe("writeAll", () => {
  it("writes in batches of 25, DynamoDB's limit", async () => {
    await writeAll(items(60));
    expect(sentBatches().map((batch) => batch.length)).toEqual([25, 25, 10]);
  });

  it("sends nothing for an empty list", async () => {
    await writeAll([]);
    expect(sentBatches()).toEqual([]);
  });

  it("retries the unprocessed items with a backoff", async () => {
    vi.useFakeTimers();
    const [first, second, third] = items(3);
    ddbMock
      .on(BatchWriteCommand)
      .resolvesOnce({ UnprocessedItems: { "test-table": [put(second), put(third)] } })
      .resolvesOnce({ UnprocessedItems: { "test-table": [put(third)] } })
      .resolves({});

    const done = writeAll([first, second, third]);
    await vi.runAllTimersAsync();
    await done;

    expect(sentBatches()).toEqual([
      [put(first), put(second), put(third)],
      [put(second), put(third)],
      [put(third)],
    ]);
  });

  it("fails after 5 attempts", async () => {
    vi.useFakeTimers();
    const [item] = items(1);
    ddbMock.on(BatchWriteCommand).resolves({ UnprocessedItems: { "test-table": [put(item)] } });

    const done = writeAll([item]);
    const assertion = expect(done).rejects.toThrow("1 items not written after 5 attempts");
    await vi.runAllTimersAsync();
    await assertion;
    expect(sentBatches()).toHaveLength(5);
  });
});
