import { onchainTable, primaryKey } from "ponder";


export const organization = onchainTable("organization", (t) => ({
  id: t.text().primaryKey(), // orgId as string
  name: t.text(),
  token: t.text(), // addresses are stored as text
  baseURI: t.text(), // addresses are stored as text
}));


export const organizationAdmin = onchainTable("organizationAdmin", (t) => ({
  id: t.text().primaryKey(), // unique ID like `${orgId}-${adminAddress}`
  orgId: t.text(),
  adminAddress: t.text(),
}));


export const challenge = onchainTable("challenge", (t) => ({
  id: t.text().primaryKey(), // Store challengeId as a string
  description: t.text(),
  startTime: t.bigint(),
  endTime: t.bigint(),
  maxWinners: t.integer(),
  orgId: t.text(),
  prizeAmount: t.bigint(),
  isActive: t.boolean(),
  validatorUID: t.text(),
  validatorAddr: t.text(),
  validationId: t.bigint(),
}));


export const rewardClaim = onchainTable("rewardClaim", (t) => ({
  id: t.text().primaryKey(), // We'll create a custom unique ID
  challengeId: t.text(),
  user: t.text(),
  claimTime: t.bigint(),
  prizeAmountInBaseUnits: t.bigint(),
}));



export const prize = onchainTable("prize", (t) => ({
  id: t.text().primaryKey(), // prizeId as string
  orgId: t.text(), // foreign key to organization, stored as string
  name: t.text(),
  description: t.text(),
  price: t.bigint(),
  stock: t.bigint(),
  nftContract: t.text(),
  baseURI: t.text(),
}));


export const prizeClaim = onchainTable(
  "prizeClaim",
  (t) => ({
    id: t.text().primaryKey(),
    prizeId: t.text(),
    claimer: t.text(),
    orgId: t.text(),
    amount: t.bigint(),
    cost: t.bigint(),
  })
);


export const prizeToken = onchainTable(
  "prizeToken",
  (t) => ({
    claimId: t.text(),
    nftId: t.bigint(),
    prizeId: t.text(),
    claimer: t.text(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.claimId, table.nftId] }),
  })
);


export const offchainApiCall = onchainTable("offchainApiCall", (t) => ({
  requestId: t.text().primaryKey(),
  validationId: t.text(),
  claimer: t.text(),
}));



export const randomValidatorCall = onchainTable("randomValidatorCall", (t) => ({
  requestId: t.text().primaryKey(),
  validationId: t.text(),
  claimer: t.text(),
}));
