import { ponder } from "ponder:registry";
import { organization, organizationAdmin } from "ponder:schema";
import { challenge } from "ponder:schema";
import { prize } from "ponder:schema";
import { prizeClaim } from "ponder:schema";
import { rewardClaim } from "ponder:schema";


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
      prizeAmount
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
    const { prizeId, orgId, name, description, price, stock } = event.args;
  
    await context.db.insert(prize).values({
      id: prizeId.toString(),
      orgId: orgId.toString(),
      name,
      description,
      price,
      stock: Number(stock),
    });
  });


ponder.on("Prizes:PrizeClaimed", async ({ event, context }) => {
    const { prizeId, orgId, amount, claimer, cost } = event.args;
  
    const uniqueId = `${orgId.toString()}-${prizeId.toString()}-${claimer.toLowerCase()}-${event.block.timestamp}`;
  
    await context.db.insert(prizeClaim).values({
      id: uniqueId,
      prizeId: prizeId.toString(),
      orgId: orgId.toString(),
      amount,
      claimer,
      cost,
    });
  });

