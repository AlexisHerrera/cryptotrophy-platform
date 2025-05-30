import { decodeBytes32String } from "ethers";
import { ponder } from "ponder:registry";
import { organization, organizationAdmin } from "ponder:schema";
import { challenge } from "ponder:schema";
import { prize } from "ponder:schema";
import { prizeClaim } from "ponder:schema";
import { prizeToken } from "ponder:schema";
import { rewardClaim } from "ponder:schema";
import { offchainApiCall } from "ponder:schema";
import { randomValidatorCall } from "ponder:schema";


ponder.on("OrganizationManager:OrganizationCreated", async ({ event, context }) => {
    const { orgId, name, token, baseURI} = event.args;
  
    await context.db.insert(organization).values({
      id: orgId.toString(),
      name: name,
      token: token,
      baseURI: baseURI
    });
  });


ponder.on("OrganizationManager:OrganizationAdminAdded", async ({ event, context }) => {
    const { orgId, adminAddress } = event.args;
  
    await context.db.insert(organizationAdmin).values({
      id: `${orgId.toString()}-${adminAddress.toLowerCase()}`, // lowercase for consistency
      orgId: orgId.toString(),
      adminAddress: adminAddress.toLowerCase(),
    });
  });


ponder.on("ChallengeManager:ChallengeCreated", async ({ event, context }) => {
    const {
      challengeId,
      description,
      startTime,
      endTime,
      maxWinners,
      orgId,
      prizeAmount
    } = event.args;
  
    await context.db.insert(challenge).values({
      id: challengeId.toString(),
      description,
      startTime,
      endTime,
      maxWinners,
      orgId: orgId.toString(),
      prizeAmount,
      isActive: true
    });
  });

  
ponder.on("ChallengeManager:RewardClaimed", async ({ event, context }) => {
    const {
      challengeId,
      user,
      claimTime,
      prizeAmountInBaseUnits
    } = event.args;
  
    // Create a unique ID to avoid primary key collision
    const id = `${challengeId.toString()}-${user.toLowerCase()}-${claimTime.toString()}`;
  
    await context.db.insert(rewardClaim).values({
      id,
      challengeId: challengeId.toString(),
      user,
      claimTime,
      prizeAmountInBaseUnits
    });
  });


ponder.on("Prizes:PrizeCreated", async ({ event, context }) => {
  const {
    prizeId,
    orgId,
    name,
    description,
    price,
    stock,
    nftContract,
    baseURI,
  } = event.args;

  console.log(event.args)

  await context.db.insert(prize).values({
    id: prizeId.toString(),
    orgId: orgId.toString(),
    name,
    description,
    price,
    stock,
    nftContract,
    baseURI: baseURI,
  });
});


ponder.on("Prizes:PrizeClaimed", async ({ event, context }) => {
  const { prizeId, orgId, amount, claimer, cost, nftIds } = event.args;
  const uniqueId = `${orgId.toString()}-${prizeId.toString()}-${claimer.toLowerCase()}-${event.block.timestamp}`;

  await context.db.insert(prizeClaim).values({
    id: uniqueId,
    prizeId: prizeId.toString(),
    orgId: orgId.toString(),
    amount,
    claimer,
    cost,
  });

  await context.db
    .update(prize, { id: prizeId.toString() })
    .set((row) => ({
      stock: row.stock ? row.stock - amount : null,
    }));

  for (const nftId of nftIds) {
    await context.db
      .insert(prizeToken)
      .values({
        claimId: uniqueId,
        prizeId: prizeId.toString(),
        nftId,
        claimer,
      });
  }
});


ponder.on("OffChainApiValidator:OffChainApiValidatorCalled", async ({ event, context }) => {
    const { validationId, claimer, requestId } = event.args;
  
    await context.db.insert(offchainApiCall).values({
      validationId: validationId.toString(),
      claimer,
      requestId: requestId.toString(),
    });
  });



ponder.on("RandomValidator:RandomValidatorCalled", async ({ event, context }) => {
    const { validationId, claimer, requestId } = event.args;
  
    await context.db.insert(randomValidatorCall).values({
      validationId: validationId.toString(),
      claimer,
      requestId: requestId.toString(),
    });
  });


  
ponder.on("ChallengeManager:IsActiveChanged", async ({ event, context }) => {
  const { challengeId, isActive } = event.args;

  await context.db
    .update(challenge, { id: challengeId.toString() })
    .set((row) => ({
      isActive: isActive,
    }));
});


ponder.on("ChallengeManager:ValidatorChanged", async ({ event, context }) => {
  const { challengeId, validatorUID, validatorAddr, validationId } = event.args;

  await context.db
    .update(challenge, {id: challengeId.toString()})
    .set((row) => ({
      validatorUID: decodeBytes32String(validatorUID), // bytes32 will be a hex string like "0xabc123..."
      validatorAddr: validatorAddr,
      validationId: validationId,
    }));
});
