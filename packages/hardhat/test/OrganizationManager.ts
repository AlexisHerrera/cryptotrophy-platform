import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers as ethersHardhat } from "hardhat";
import { ethers } from "ethers";
import { OrganizationManager, ChallengeManager } from "../typechain-types";

describe("OrganizationManager (with real ChallengeManager)", function () {
  // ----------------------------------------------------------------
  // 1. Fixture principal: Desplegamos OrganizationManager + ChallengeManager
  // ----------------------------------------------------------------
  async function deployCoreContractsFixture() {
    const [owner, admin1, admin2, user1, user2, notAdmin] = await ethersHardhat.getSigners();

    // Desplegar OrganizationManager
    const OrgManagerFactory = await ethersHardhat.getContractFactory("OrganizationManager");
    const orgManager = (await OrgManagerFactory.deploy()) as OrganizationManager;
    await orgManager.waitForDeployment();

    // Desplegar ChallengeManager (constructor recibe orgManager address)
    const ChallengeManagerFactory = await ethersHardhat.getContractFactory("ChallengeManager");
    const challengeManager = (await ChallengeManagerFactory.deploy(orgManager.getAddress())) as ChallengeManager;
    await challengeManager.waitForDeployment();

    return {
      orgManager,
      challengeManager,
      owner,
      admin1,
      admin2,
      user1,
      user2,
      notAdmin,
    };
  }

  // ----------------------------------------------------------------
  // 2. Tests iniciales: Despliegue
  // ----------------------------------------------------------------
  describe("Deployment checks", function () {
    it("Should deploy OrganizationManager with a valid address", async function () {
      const { orgManager } = await loadFixture(deployCoreContractsFixture);
      expect(orgManager.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should deploy ChallengeManager correctly linked to OrganizationManager", async function () {
      const { challengeManager, orgManager } = await loadFixture(deployCoreContractsFixture);
      // Simple chequeo de que se haya desplegado y orgManager sea el correcto
      const storedOrgManagerAddress = await challengeManager.orgManager();
      expect(storedOrgManagerAddress).to.equal(await orgManager.getAddress());
    });
  });

  // ----------------------------------------------------------------
  // 3. Creación de organizaciones
  // ----------------------------------------------------------------
  describe("createOrganization", function () {
    it("Should create a new organization successfully (with enough ETH backing)", async function () {
      const { orgManager, owner, admin1, admin2 } = await loadFixture(deployCoreContractsFixture);

      const name = "MyOrg";
      const symbol = "MOG";
      const initialSupply = 1000;
      const initialEthBacking = ethers.parseEther("1");
      const admins = [admin1.address, admin2.address];
      const baseURI = "http://localhost:3000/ipfs/org";

      const tx = await orgManager.createOrganization(name, symbol, initialSupply, initialEthBacking, admins, baseURI, {
        value: initialEthBacking,
      });
      const receipt = await tx.wait();

      // Obtenemos el topic del evento:
      const eventTopic = orgManager.interface.getEvent("OrganizationCreated");

      // Buscamos el log correspondiente
      const log = receipt?.logs.find(l => l.topics[0] === eventTopic.topicHash);

      // Validamos que exista
      expect(log).to.not.equal(undefined);
      if (!log) return;

      // Decodificamos el evento
      const decoded = orgManager.interface.decodeEventLog("OrganizationCreated", log.data, log.topics);

      // Extraemos orgId
      const orgId = decoded.orgId;

      // Chequeamos datos de la organización
      const details = await orgManager.getOrganizationDetails(orgId);
      const orgBalance = await orgManager.getBalanceOfOrg(orgId);
      const token = await orgManager.getTokenOfOrg(orgId);
      const tokenContract = await ethersHardhat.getContractAt("OrganizationToken", token);
      const tokenDecimals = await tokenContract.decimals();
      const tokenETHBalance = await ethersHardhat.provider.getBalance(token);

      expect(details.orgId).to.equal(orgId);
      expect(details.name).to.equal(name);
      expect(details.admins).to.include(owner.address);
      expect(details.admins).to.include(admin1.address);
      expect(details.admins).to.include(admin2.address);
      expect(orgBalance).to.equal(ethers.parseUnits(initialSupply.toString(), tokenDecimals));
      expect(await tokenContract.totalSupply()).to.equal(orgBalance);
      expect(await tokenContract.balanceOf(orgManager.getAddress())).to.equal(orgBalance);
      expect(details.token).to.equal(token);
      expect(await orgManager.isAdmin(orgId, admin1.address)).to.equal(true);

      // Validamos que el ETH que posee la org sea lo que se envió
      expect(tokenETHBalance).to.equal(initialEthBacking);
    });

    it("Should revert if not enough ETH is sent for initial backing", async function () {
      const { orgManager } = await loadFixture(deployCoreContractsFixture);
      const baseURI = "http://localhost:3000/ipfs/org";

      await expect(
        orgManager.createOrganization(
          "OrgName",
          "ORG",
          1000,
          ethers.parseEther("5"), // se pide 5 ETH
          [],
          baseURI,
          { value: ethers.parseEther("1") }, // solo 1 ETH enviado
        ),
      ).to.be.revertedWith("Insufficient ETH backing");
    });

    it("Should revert when creating a second organization with the same token symbol", async function () {
      const { admin1, orgManager } = await loadFixture(deployCoreContractsFixture);

      const initialSupply = 1000;
      const initialEthBacking = ethers.parseEther("1");
      const admins = [admin1.address];
      const baseURI = "http://localhost:3000/ipfs/org";

      // Create first organization with symbol "DUP"
      const tx = await orgManager.createOrganization(
        "FirstOrg",
        "DUP",
        initialSupply,
        initialEthBacking,
        admins,
        baseURI,
        { value: ethers.parseEther("1") },
      );
      await tx.wait();

      // Attempt to create a second organization with the same symbol
      await expect(
        orgManager.createOrganization("SecondOrg", "DUP", initialSupply, initialEthBacking, admins, baseURI, {
          value: ethers.parseEther("1"),
        }),
      ).to.be.revertedWith("Token symbol already exists");
    });

    it("Should revert when creating a second organization with the same name", async function () {
      const { admin1, orgManager } = await loadFixture(deployCoreContractsFixture);

      const initialSupply = 1000;
      const initialEthBacking = ethers.parseEther("1");
      const admins = [admin1.address];
      const baseURI = "http://localhost:3000/ipfs/org";

      // Create first organization with name "DuplicateName"
      const tx = await orgManager.createOrganization(
        "DuplicateName",
        "ORG1",
        initialSupply,
        initialEthBacking,
        admins,
        baseURI,
        { value: ethers.parseEther("1") },
      );
      await tx.wait();

      // Attempt to create a second organization with the same name
      await expect(
        orgManager.createOrganization("DuplicateName", "ORG2", initialSupply, initialEthBacking, admins, baseURI, {
          value: ethers.parseEther("1"),
        }),
      ).to.be.revertedWith("Organization name already exists");
    });
  });

  // ----------------------------------------------------------------
  // 4. Administración y permisos
  // ----------------------------------------------------------------
  describe("Admin Management", function () {
    async function createOrgFixture() {
      const f = await deployCoreContractsFixture();
      const { orgManager, admin1 } = f;
      const baseURI = "http://localhost:3000/ipfs/org";

      // Creamos una organización de prueba
      const tx = await orgManager.createOrganization(
        "TestOrg",
        "TST",
        1000,
        ethers.parseEther("1"),
        [admin1.address], // admin extra
        baseURI,
        { value: ethers.parseEther("1") },
      );
      const receipt = await tx.wait();
      const eventTopic = orgManager.interface.getEvent("OrganizationCreated");

      // Buscamos el log correspondiente
      const log = receipt?.logs.find(l => l.topics[0] === eventTopic.topicHash);
      if (!log) return { ...f, orgId: null };

      // Decodificamos el evento
      const decoded = orgManager.interface.decodeEventLog("OrganizationCreated", log.data, log.topics);

      // Extraemos orgId
      const orgId = decoded.orgId;

      return { ...f, orgId };
    }

    it("addAdmin: Should add a new admin if called by existing admin", async function () {
      const { orgManager, orgId, admin1, admin2 } = await loadFixture(createOrgFixture);

      await orgManager.connect(admin1).addAdmin(orgId, admin2.address);

      const details = await orgManager.getOrganizationDetails(orgId);
      expect(details.admins).to.include(admin2.address);
      expect(await orgManager.isAdmin(orgId, admin2.address)).to.equal(true);
    });

    it("addAdmin: Should revert if called by non-admin", async function () {
      const { orgManager, orgId, user1, admin2 } = await loadFixture(createOrgFixture);
      // user1 es user, no admin
      await expect(orgManager.connect(user1).addAdmin(orgId, admin2.address)).to.be.revertedWith("Not an admin");
    });
  });

  // ----------------------------------------------------------------
  // 5. Listas y detalles de organizaciones
  // ----------------------------------------------------------------
  describe("Organization data queries", function () {
    async function multipleOrgsFixture() {
      const f = await deployCoreContractsFixture();
      const { orgManager, admin1, admin2 } = f;
      const baseURI = "http://localhost:3000/ipfs/org";

      // OrgA
      let tx = await orgManager.createOrganization(
        "OrgA",
        "ORGA",
        1000,
        ethers.parseEther("1"),
        [admin1.address],
        baseURI,
        {
          value: ethers.parseEther("1"),
        },
      );
      await tx.wait();

      // OrgB
      tx = await orgManager.createOrganization(
        "OrgB",
        "ORGB",
        500,
        ethers.parseEther("0.5"),
        [admin2.address], // solo el creador (owner) será admin
        baseURI,
        { value: ethers.parseEther("0.5") },
      );
      await tx.wait();

      return { ...f };
    }

    it("listOrganizations should return all created org IDs", async function () {
      const { orgManager } = await loadFixture(multipleOrgsFixture);
      const orgIds = await orgManager.listOrganizations();
      expect(orgIds.length).to.be.gte(2);
    });

    it("listAdministratedOrganizations should list only orgs where msg.sender is admin", async function () {
      const { orgManager, admin1, admin2 } = await loadFixture(multipleOrgsFixture);

      // user1 es miembro de OrgA pero no de OrgB
      let result = await orgManager.connect(admin1).listAdministratedOrganizations();
      expect(result.orgIds.length).to.equal(1);
      expect(result.names[0]).to.equal("OrgA");

      // user2 es miembro de OrgB pero no de OrgA
      result = await orgManager.connect(admin2).listAdministratedOrganizations();
      expect(result.orgIds.length).to.equal(1);
      expect(result.names[0]).to.equal("OrgB");
    });

    it("getOrganizationDetails should return correct data", async function () {
      const { orgManager } = await loadFixture(multipleOrgsFixture);
      const orgIds = await orgManager.listOrganizations();

      const detailsA = await orgManager.getOrganizationDetails(orgIds[0]);
      expect(detailsA.name).to.equal("OrgA");
      expect(detailsA.admins.length).to.equal(2); // admin1 and owner

      const detailsB = await orgManager.getOrganizationDetails(orgIds[1]);
      expect(detailsB.name).to.equal("OrgB");
      expect(detailsB.admins.length).to.equal(2); // admin1 and owner
    });
  });

  // ----------------------------------------------------------------
  // 6. transferTokensTo
  // ----------------------------------------------------------------
  describe("transferTokensTo", function () {
    async function createOrgWithTokensFixture() {
      // Usamos la fixture principal
      const f = await deployCoreContractsFixture();
      const { orgManager, admin1 } = f;
      const baseURI = "http://localhost:3000/ipfs/org";

      // Crear una organización con supply 1000
      const tx = await orgManager.createOrganization(
        "OrgWithTokens",
        "OWT",
        1000,
        ethers.parseEther("1"),
        [admin1.address], // admin extra
        baseURI,
        { value: ethers.parseEther("1") },
      );
      const receipt = await tx.wait();

      // Decodificar el evento para obtener orgId
      const eventTopic = orgManager.interface.getEvent("OrganizationCreated");
      const log = receipt?.logs.find(l => l.topics[0] === eventTopic.topicHash);
      if (!log) return { ...f, orgId: null };

      const decoded = orgManager.interface.decodeEventLog("OrganizationCreated", log.data, log.topics);
      const orgId = decoded.orgId;

      return { ...f, orgId };
    }

    it("Should transfer tokens successfully", async function () {
      const { orgManager, orgId, user1 } = await loadFixture(createOrgWithTokensFixture);

      // Revisar balance inicial en OrgManager
      const initialOrgBalance = await orgManager.getBalanceOfOrg(orgId);
      // Queremos transferir 100 tokens (escala 10^18 si es un ERC20 con 18 decimales)
      const transferAmount = ethers.parseUnits("100", 18);

      // Llamamos a la función
      await orgManager.transferTokensTo(orgId, user1.address, transferAmount);

      // Nuevo balance en OrgManager
      const finalOrgBalance = await orgManager.getBalanceOfOrg(orgId);
      // Balance del user1 en el token
      const tokenAddress = await orgManager.getTokenOfOrg(orgId);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        user1,
      ); // user1 aquí sirve para conexión, pero es indiferente

      const userBalance = await tokenContract.balanceOf(user1.address);

      expect(finalOrgBalance).to.equal(initialOrgBalance - transferAmount);
      expect(userBalance).to.equal(transferAmount);
    });

    it("Should revert if not enough tokens in OrgManager", async function () {
      const { orgManager, orgId, user1 } = await loadFixture(createOrgWithTokensFixture);

      // Verificar cuánto tiene la org
      const orgBalance = await orgManager.getBalanceOfOrg(orgId);
      // Pedimos transferir más de lo que tiene
      const tooMuch = orgBalance + ethers.parseUnits("1", 18);

      await expect(orgManager.transferTokensTo(orgId, user1.address, tooMuch)).to.be.revertedWith(
        "Not enough tokens in OrgManager",
      );
    });

    it("Should revert if organization does not exist", async function () {
      const { orgManager, user1 } = await loadFixture(createOrgWithTokensFixture);

      // orgCount es el número actual de orgs, así que orgCount + 9999 es inexistente
      const invalidOrgId = 99999;
      const amount = ethers.parseUnits("10", 18);

      await expect(orgManager.transferTokensTo(invalidOrgId, user1.address, amount)).to.be.revertedWith(
        "Organization does not exist",
      );
    });
  });

  // Opcional: si descomentas require(msg.sender == challengeManagerAddr) dentro de transferTokensTo:
  // it("Should revert if caller is not challengeManager", async function () {
  //   const { orgManager, orgId, user1 } = await loadFixture(createOrgWithTokensFixture);
  //   const amount = ethers.parseUnits("10", 18);

  //   await expect(
  //     orgManager.transferTokensTo(orgId, user1.address, amount)
  //   ).to.be.revertedWith("Only ChallengeManager can call");
  // });
});
