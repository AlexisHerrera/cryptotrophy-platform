import { onchainTable } from "ponder";


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
  orgId: t.text().notNull(), // foreign key to organization.id
  name: t.text(),
  description: t.text(),
  price: t.bigint(),
  stock: t.integer(),
}));


export const prizeClaim = onchainTable("prizeClaim", (t) => ({
  id: t.text().primaryKey(),
  prizeId: t.text(), // storing as string for consistency
  orgId: t.text(),
  amount: t.integer(),
  claimer: t.text(),
  cost: t.bigint(),
}));


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

