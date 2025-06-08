import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers as ethersHardhat } from "hardhat";
import { ethers } from "ethers";

// Importa los tipos de TypeChain (ajusta según tu configuración)
import {
  OrganizationManager,
  Prizes,
  OrganizationManager__factory,
  Prizes__factory,
  PrizeNFT__factory,
  OrganizationToken__factory,
} from "../typechain-types";

describe("Prizes contract", function () {
  // ----------------------------------------------------------------
  // 1. Fixture principal: despliega OrganizationManager y Prizes
  // ----------------------------------------------------------------
  async function deployPrizesFixture() {
    const [owner, admin1, user1, user2, outsider] = await ethersHardhat.getSigners();

    // 1A. Desplegamos OrganizationManager
    const OrgManagerFactory = (await ethersHardhat.getContractFactory(
      "OrganizationManager",
    )) as OrganizationManager__factory;

    const orgManager = (await OrgManagerFactory.deploy()) as OrganizationManager;
    await orgManager.waitForDeployment();

    // 1B. Desplegamos Prizes apuntando al orgManager
    const PrizesFactory = (await ethersHardhat.getContractFactory("Prizes")) as Prizes__factory;

    const prizes = (await PrizesFactory.deploy(orgManager.getAddress())) as Prizes;
    await prizes.waitForDeployment();

    // 2. Creamos una organización para probar
    //    - El 'owner' es el creador, que se vuelve admin de la org
    //    - Añadimos admin1 como admin adicional
    //    - Añadimos user1 como user de la org
    //    - Creamos supply 1000 (de su token interno)
    //    - Añadimos algo de ETH backing
    const txCreateOrg = await orgManager.createOrganization(
      "TestOrg",
      "TST",
      1000, // supply inicial del token de la org
      ethers.parseEther("1"), // backing
      [admin1.address], // admins extra
      "http://localhost:3000/ipfs/org",
      { value: ethers.parseEther("1") },
    );
    const receipt = await txCreateOrg.wait();

    // Decodificar el evento "OrganizationCreated" para obtener orgId
    const eventTopic = orgManager.interface.getEvent("OrganizationCreated");
    const log = receipt?.logs.find(l => l.topics[0] === eventTopic.topicHash);
    let orgId: number;
    if (log) {
      const decoded = orgManager.interface.decodeEventLog("OrganizationCreated", log.data, log.topics);
      orgId = decoded.orgId;
    } else {
      throw new Error("No se encontró el evento OrganizationCreated");
    }

    // 3. Transferimos algunos tokens de la organización a user1 para que pueda probar claimPrize
    //    Por defecto, los tokens de la org residen en el OrganizationManager,
    //    así que usaremos `transferTokensTo` para mandar a user1.
    //const orgTokenBalance = await orgManager.getBalanceOfOrg(orgId);
    // Ejemplo: transferimos 200 tokens a user1
    const transferAmount = ethers.parseUnits("200", 18);
    await orgManager.transferTokensTo(orgId, user1.address, transferAmount);

    // Devolvemos todo lo necesario para los tests
    return {
      owner,
      admin1,
      user1,
      user2,
      outsider,
      orgManager,
      prizes,
      orgId,
    };
  }

  // ----------------------------------------------------------------
  // 2. createPrize
  // ----------------------------------------------------------------
  describe("createPrize", function () {
    it("Should allow an org admin to create a prize", async function () {
      const { prizes, orgId, admin1 } = await loadFixture(deployPrizesFixture);

      await prizes
        .connect(admin1)
        .createPrize(orgId, "T-Shirt", "T-Shirt con logo", 10, 100, "http://localhost:3000/ipfs/prize");

      // Verificamos que realmente se haya creado
      const [ids, names, descriptions, prices, stocks] = await prizes.listPrizes(orgId);
      expect(ids.length).to.equal(1);
      expect(ids[0]).to.equal(0n);
      expect(names[0]).to.equal("T-Shirt");
      expect(descriptions[0]).to.equal("T-Shirt con logo");
      expect(prices[0]).to.equal(10n);
      expect(stocks[0]).to.equal(100n);
    });

    it("Should deploy a new NFT contract when creating a prize", async function () {
      const { prizes, orgId, admin1 } = await loadFixture(deployPrizesFixture);

      // Create a prize
      await prizes
        .connect(admin1)
        .createPrize(orgId, "T-Shirt", "T-Shirt con logo", 10, 100, "http://localhost:3000/ipfs/prize");

      // Get prize info including NFT contract
      const [, , , , , nftContracts] = await prizes.listPrizes(orgId);

      // Verify NFT contract was deployed
      expect(nftContracts[0]).to.not.equal(ethers.ZeroAddress);

      // Check the NFT contract properties
      const prizeNFT = PrizeNFT__factory.connect(nftContracts[0], admin1);

      // Verify NFT contract has correct name and symbol
      expect(await prizeNFT.name()).to.equal("T-Shirt");
      expect(await prizeNFT.symbol()).to.equal("PRIZE0"); // PRIZE + prizeId (0)
      expect(await prizeNFT.owner()).to.equal(await prizes.getAddress()); // Prizes contract should be the owner
    });

    it("Should revert if caller is not an admin of the org", async function () {
      const { prizes, orgId, user1 } = await loadFixture(deployPrizesFixture);
      const price = ethers.parseUnits("5", 18);
      await expect(
        prizes.connect(user1).createPrize(orgId, "Mug", "Taza oficial", price, 50, "http://localhost:3000/ipfs/prize"),
      ).to.be.revertedWith("Prizes: caller is not an admin of this org");
    });
  });

  // ----------------------------------------------------------------
  // 3. listPrizes
  // ----------------------------------------------------------------
  describe("listPrizes", function () {
    it("Should return the list of prizes created", async function () {
      const { prizes, orgId, admin1 } = await loadFixture(deployPrizesFixture);

      // Creamos 2 premios
      const price1 = ethers.parseUnits("10", 18);
      const price2 = ethers.parseUnits("2", 18);
      await prizes
        .connect(admin1)
        .createPrize(orgId, "T-Shirt", "T-Shirt con logo", price1, 100, "http://localhost:3000/ipfs/prize");
      await prizes
        .connect(admin1)
        .createPrize(orgId, "Sticker Pack", "Stickers varios", price2, 500, "http://localhost:3000/ipfs/prize");

      const [ids, names, descriptions, prices, stocks] = await prizes.listPrizes(orgId);

      expect(ids.length).to.equal(2);
      expect(names[0]).to.equal("T-Shirt");
      expect(names[1]).to.equal("Sticker Pack");
      expect(descriptions[0]).to.equal("T-Shirt con logo");
      expect(descriptions[1]).to.equal("Stickers varios");
      expect(prices[0]).to.equal(price1);
      expect(prices[1]).to.equal(price2);
      expect(stocks[0]).to.equal(100n);
      expect(stocks[1]).to.equal(500n);
    });

    it("Should return empty arrays if no prizes created", async function () {
      const { prizes, orgId } = await loadFixture(deployPrizesFixture);
      const [ids, names, descriptions, prices, stocks] = await prizes.listPrizes(orgId);

      expect(ids.length).to.equal(0);
      expect(names.length).to.equal(0);
      expect(descriptions.length).to.equal(0);
      expect(prices.length).to.equal(0);
      expect(stocks.length).to.equal(0);
    });
  });

  // ----------------------------------------------------------------
  // 4. claimPrize
  // ----------------------------------------------------------------
  describe("claimPrize", function () {
    async function createPrizeAndApproveFixture() {
      // Partimos de la fixture principal
      const f = await loadFixture(deployPrizesFixture);
      const { prizes, orgManager, orgId, admin1, user1 } = f;

      // 1. Creamos un premio con price=10 tokens y stock=100
      const price = ethers.parseUnits("10", 18);
      await prizes
        .connect(admin1)
        .createPrize(orgId, "T-Shirt", "T-Shirt con logo", price, 100, "http://localhost:3000/ipfs/prize");

      // 2. user1 ya tiene 200 tokens (ver fixture).
      //    Debe dar "approve" al contrato `Prizes` para que pueda hacer transferFrom
      const orgTokenAddress = await orgManager.getTokenOfOrg(orgId);
      const orgToken = new ethers.Contract(
        orgTokenAddress,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        user1,
      );

      // Approve de, por ejemplo, 100 tokens
      await orgToken.approve(await prizes.getAddress(), ethers.parseUnits("100", 18));

      return { ...f };
    }

    it("Should allow a user to claim a prize", async function () {
      const { prizes, orgManager, orgId, user1 } = await loadFixture(createPrizeAndApproveFixture);

      // Revisamos stock inicial
      const result = await prizes.listPrizes(orgId);
      const ids = result[0];
      let stocks = result[4];

      const prizeId = ids[0]; // 0
      expect(stocks[0]).to.equal(100n);

      // user1 reclama 5 unidades
      await prizes.connect(user1).claimPrize(orgId, prizeId, 5);

      // Stock debería reducirse
      [, , , , stocks] = await prizes.listPrizes(orgId);
      expect(stocks[0]).to.equal(95n);

      // Y los tokens del user1 se transfirieron al contrato Prizes
      // Revisamos balance de user1 y balance de Prizes
      const orgTokenAddress = await orgManager.getTokenOfOrg(orgId);
      const orgToken = new ethers.Contract(
        orgTokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        user1,
      );

      const userBalanceAfter = await orgToken.balanceOf(user1.address);
      // Inicialmente user1 tenía 200 tokens
      // Pagó 5 * 10 = 50 tokens
      expect(userBalanceAfter).to.equal(ethers.parseUnits("150", 18));

      // Contrato Prizes no debe tener nada, los debe tener la organizacion
      const prizesBalance = await orgToken.balanceOf(await prizes.getAddress());
      expect(prizesBalance).to.equal(0n);
    });

    it("Should give the user NFTs when claiming a prize", async function () {
      const { prizes, orgId, user1 } = await loadFixture(createPrizeAndApproveFixture);

      // Get initial data
      const [prizeIds, , , , , nftContracts] = await prizes.listPrizes(orgId);
      const prizeId = prizeIds[0];
      const nftContractAddress = nftContracts[0];

      // Connect to the NFT contract
      const prizeNFT = PrizeNFT__factory.connect(nftContractAddress, user1);

      // Claim 3 prize units
      await prizes.connect(user1).claimPrize(orgId, prizeId, 3);

      // Check NFT ownership using balanceOf
      const nftBalance = await prizeNFT.balanceOf(user1.address);
      expect(nftBalance).to.equal(3n);

      // Verify ownership of the first 3 NFTs (IDs 0, 1, 2)
      for (let i = 0; i < 3; i++) {
        expect(await prizeNFT.ownerOf(i)).to.equal(user1.address);
      }
    });

    it("Should revert if there is no stock available", async function () {
      const { prizes, orgId, user1 } = await loadFixture(createPrizeAndApproveFixture);

      // Solo hay stock=100
      // Intentar reclamar 101
      await expect(prizes.connect(user1).claimPrize(orgId, 0, 101)).to.be.revertedWith("Prizes: not enough stock");
    });

    it("Should revert if the caller has not approved enough tokens", async function () {
      const { prizes, orgManager, orgId, admin1, user1 } = await loadFixture(deployPrizesFixture);

      // Creamos un premio con price=10 y stock=100
      const price = ethers.parseUnits("10", 18);
      await prizes
        .connect(admin1)
        .createPrize(orgId, "Camiseta", "Camiseta especial", price, 100, "http://localhost:3000/ipfs/prize");

      // user1 tiene 200 tokens, pero 0 allowance
      // Reclamamos 5 sin "approve"
      await expect(prizes.connect(user1).claimPrize(orgId, 0, 5)).to.be.reverted;
      // Normalmente revertirá con un error de transferFrom del token (no allowance).
      // Dependiendo del token, el mensaje puede ser "ERC20: insufficient allowance".

      // Hacemos approve pero no suficientes tokens en balance
      // (Por ejemplo, le transferimos tokens de vuelta al orgManager para vaciar su balance.)
      const orgTokenAddress = await orgManager.getTokenOfOrg(orgId);
      const orgToken = new ethers.Contract(
        orgTokenAddress,
        [
          "function transfer(address to, uint256 amount) public returns (bool)",
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function balanceOf(address account) view returns (uint256)",
        ],
        user1,
      );

      // Transferimos a orgManager (dejamos 0 en user1).
      const userBalance = await orgToken.balanceOf(user1.address);
      await orgToken.transfer(await orgManager.getAddress(), userBalance);

      // Hacemos approve(100) pero no hay balance
      await orgToken.approve(await prizes.getAddress(), ethers.parseUnits("100", 18));

      // Reclamamos
      await expect(prizes.connect(user1).claimPrize(orgId, 0, 5)).to.be.reverted; // "ERC20: transfer amount exceeds balance" o similar
    });

    it("Should return the prize tokens to the OrganizationManager contract", async function () {
      const { prizes, orgManager, orgId, user1 } = await loadFixture(createPrizeAndApproveFixture);
      const orgTokenAddress = await orgManager.getTokenOfOrg(orgId);
      const orgToken = OrganizationToken__factory.connect(orgTokenAddress, user1);
      const [prizeIds, , , prices] = await prizes.listPrizes(orgId);
      const prizeId = prizeIds[0];
      const prizePrice = prices[0];
      const amountToClaim = 5n;
      const totalCost = prizePrice * amountToClaim;

      // Balance del OrganizationManager ANTES del reclamo
      const orgManagerBalanceBefore = await orgToken.connect(user1).balanceOf(await orgManager.getAddress());

      // user1 reclama 5 unidades del premio
      await prizes.connect(user1).claimPrize(orgId, prizeId, amountToClaim);

      // Balance del OrganizationManager DESPUÉS del reclamo
      const orgManagerBalanceAfter = await orgToken.connect(user1).balanceOf(await orgManager.getAddress());

      //El balance del OrganizationManager debe haber aumentado por el costo total.
      expect(orgManagerBalanceAfter).to.equal(orgManagerBalanceBefore + totalCost);

      // El contrato Prizes no debe retener ningún token. Su balance debe ser 0.
      const prizesContractBalance = await orgToken.connect(user1).balanceOf(await prizes.getAddress());
      expect(prizesContractBalance).to.equal(0n);
    });
  });
});
