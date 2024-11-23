// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// Ejemplo del contrato de tokens
contract CompanyToken is ERC20, Ownable {
	constructor(
		string memory name,
		string memory symbol,
		uint256 initialSupply
	) ERC20(name, symbol) Ownable(msg.sender) {
		// Suministro inicial enviado al creador del contrato
		_mint(msg.sender, initialSupply * (10 ** decimals()));
	}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

interface IValidator {
	function validate(address user) external view returns (bool);
}

contract CryptoTrophyPlatform {
	// Estructuras
	struct Organization {
		uint256 id;
		string name;
		address token;
		mapping(address => bool) adminExists;
		mapping(address => bool) userExists;
        address[] admins;
        address[] users;
		uint256[] challengeIds;
        bool exists;
	}

	struct Challenge {
		uint256 id;
		string description;
		address validator;
		uint256 prizeAmount;
		uint256 startTime;
		uint256 endTime;
		uint256 maxWinners;
		bool active;
		uint256 winnerCount;
		uint256 orgId;
		mapping(address => bool) winners;
        bool exists;
	}

	// Atributos
	uint256 public orgCount;
	uint256 public challengeCount;
	mapping(uint256 => Organization) public organizations;
	uint256[] public organizationIds;

	mapping(uint256 => Challenge) public challenges;
	uint256[] public challengeIds;

	address public cryptoTrophyToken;

	// Eventos
	event OrganizationCreated(
		uint256 indexed orgId,
		string name,
		address token
	);
	event ChallengeCreated(uint256 indexed challengeId, string description);
	event RewardClaimed(uint256 indexed challengeId, address indexed user);

	// Modificadores
	modifier onlyAdmin(uint256 orgId) {
		require(organizations[orgId].adminExists[msg.sender], "Not an admin");
		_;
	}

	modifier onlyUser(uint256 orgId) {
		require(organizations[orgId].userExists[msg.sender], "Not a user");
		_;
	}

	constructor(
		string memory _name,
		string memory _symbol,
		uint256 _initialSupply
	) {
        // Crear token de la plataforma
		cryptoTrophyToken = address(
			new CompanyToken(_name, _symbol, _initialSupply)
		);
	}

	// Funciones

	/// @notice Crea una nueva organización
	function createOrganization(
		string memory _name,
		string memory _symbol,
		uint256 _initialSupply,
		uint256 _initialEthBacking,
		address[] memory _admins,
		address[] memory _users
	) public payable returns (uint256) {
		require(msg.value >= _initialEthBacking, "Insufficient ETH backing");

		// Crear nuevo token de la organización
		address token = address(
			new CompanyToken(_name, _symbol, _initialSupply)
		);

		// Crear y registrar organización
		uint256 orgId = orgCount++;
		Organization storage org = organizations[orgId];
		org.id = orgId;
		org.name = _name;
		org.token = token;
        org.exists = true;

        // Por default, el creador de la organización es admin
        _addAdmin(orgId, msg.sender);

		for (uint256 i = 0; i < _admins.length; i++) {
			_addAdmin(orgId, _admins[i]);
		}
		for (uint256 i = 0; i < _users.length; i++) {
			_addUser(orgId, _users[i]);
        }

		organizationIds.push(orgId);
		emit OrganizationCreated(orgId, _name, token);
		return orgId;
	}

	/// @notice Obtiene información básica de una organización
	function getOrganization(
		uint256 _orgId
	) public view returns (uint256, string memory, address) {
		Organization storage org = organizations[_orgId];
		return (org.id, org.name, org.token);
	}

    function _addAdmin(uint256 _orgId, address _admin) internal {
        if (!organizations[_orgId].adminExists[_admin]) {
            organizations[_orgId].adminExists[_admin] = true;
            organizations[_orgId].admins.push(_admin);
        }
    }

	/// @notice Agrega un administrador a una organización
	function addAdmin(uint256 _orgId, address _admin) public onlyAdmin(_orgId) {
        _addAdmin(_orgId, _admin);
	}

    function _addUser(uint256 _orgId, address _user) internal {
        if (!organizations[_orgId].userExists[_user]) {
            organizations[_orgId].userExists[_user] = true;
            organizations[_orgId].users.push(_user);
        }
    }

	/// @notice Agrega un usuario a una organización
	function addUser(uint256 _orgId, address _user) public onlyAdmin(_orgId) {
        _addUser(_orgId, _user);
	}

	/// @notice Crea un nuevo desafío
	function createChallenge(
		uint256 _orgId,
		string memory _description,
		address _validator,
		uint256 _prizeAmount,
		uint256 _startTime,
		uint256 _endTime,
		uint256 _maxWinners
	) public onlyAdmin(_orgId) returns (uint256) {
		require(_startTime < _endTime, "Invalid time range");

		uint256 challengeId = challengeCount++;
		Challenge storage challenge = challenges[challengeId];
		challenge.id = challengeId;
		challenge.description = _description;
		challenge.validator = _validator;
		challenge.prizeAmount = _prizeAmount;
		challenge.startTime = _startTime;
		challenge.endTime = _endTime;
		challenge.maxWinners = _maxWinners;
		challenge.orgId = _orgId;
		challenge.active = true;
        challenge.exists = true;

        Organization storage organization = organizations[_orgId];
        require(organization.exists, "Organization does not exist");

		organization.challengeIds.push(challengeId);
		challengeIds.push(challengeId);
		emit ChallengeCreated(challengeId, _description);
		return challengeId;
	}

	/// @notice Reclama un premio de un desafío
	function claimReward(
		uint256 _orgId,
		uint256 _challengeId
	) public onlyUser(_orgId) {
		Challenge storage challenge = challenges[_challengeId];
		require(challenge.active, "Challenge not active");
		require(
			block.timestamp >= challenge.startTime,
			"Challenge not started"
		);
		require(block.timestamp <= challenge.endTime, "Challenge ended");
		require(
			challenge.winnerCount < challenge.maxWinners,
			"Max winners reached"
		);
		require(!challenge.winners[msg.sender], "Already claimed");

		IValidator validator = IValidator(challenge.validator);
		require(validator.validate(msg.sender), "Validation failed");

		Organization storage organization = organizations[_orgId];

		challenge.winners[msg.sender] = true;
		challenge.winnerCount++;

		CompanyToken(organization.token).mint(
			msg.sender,
			challenge.prizeAmount
		);
		emit RewardClaimed(_challengeId, msg.sender);
	}

	/// @notice Lista todas las organizaciones
	function listOrganizations() public view returns (uint256[] memory) {
		return organizationIds;
	}

	/// @notice Lista todos los desafíos de una organización
	function listChallenges(
		uint256 _orgId
	) public view returns (uint256[] memory) {
		return organizations[_orgId].challengeIds;
	}
}
