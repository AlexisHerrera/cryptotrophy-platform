import { executeQuery } from "./indexClient";
import type { GraphQLClient } from "graphql-request";

export type ValidatorCall = {
  validationId: string;
  claimer: string;
  requestId: string;
};

export interface OffchainApiCallsData {
  offchainApiCalls: {
    items: ValidatorCall[];
  };
}

// GraphQL query to fetch organizations with pagination.
const GET_LATEST_VALIDATOR_CALL_QUERY = `
  query GetLatestValidatorCall {
    offchainApiCalls(limit: 1, orderBy: "requestId", orderDirection: "DESC") {
      items {
        validationId
        claimer
        requestId
      }
    }
  }
`;

export async function fetchLatestOffChainApiRequestId(client: GraphQLClient): Promise<string | null> {
  const response = await executeQuery<OffchainApiCallsData>(client, GET_LATEST_VALIDATOR_CALL_QUERY);
  const items = response.offchainApiCalls?.items;
  return items?.length ? items[0].requestId : null;
}
