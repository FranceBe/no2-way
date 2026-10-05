import { mockClient } from "aws-sdk-client-mock";
import { ddb } from "../shared/db";

// Mocks the shared DynamoDB document client; reset it in a beforeEach
export const ddbMock = mockClient(ddb);
