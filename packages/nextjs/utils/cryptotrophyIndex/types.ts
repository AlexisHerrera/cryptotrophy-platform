export type Challenge = {
  id: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  maxWinners: number;
  orgId: string;
  prizeAmount: bigint;
  isActive: boolean;
  validatorUID: string;
  validatorAddr: string;
  validationId: number;
};

export type Organization = {
  id: string;
  name: string;
  token: string;
  baseURI: string;
};

export type Prize = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  price: bigint;
  stock: bigint;
  nftContract: string;
  baseURI: string;
};

export interface PageInfo {
  endCursor: string;
  startCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  totalCount: number;
  items: T[];
  pageInfo: PageInfo;
}

export interface ChallengeData {
  challenges: PaginatedResult<Challenge>;
}

export interface OrganizationData {
  organizations: PaginatedResult<Organization>;
}

export interface PrizeData {
  prizes: PaginatedResult<Prize>;
}
