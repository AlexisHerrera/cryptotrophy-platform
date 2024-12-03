// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Ejemplo del contrato de tokens
contract CompanyToken is ERC20, Ownable {
	constructor(
		string memory name,
		string memory symbol,
		uint256 initialSupply,
		address initialRecipient
	) ERC20(name, symbol) Ownable(msg.sender) {
		// Suministro inicial enviado al recipient
		_mint(initialRecipient, initialSupply * (10 ** decimals()));
	}

	function mint(address to, uint256 amount) public onlyOwner {
		_mint(to, amount);
	}
}

// interface IValidator {
// 	function validate(address user) external view returns (bool);
// }

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
		// address validator;
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
			new CompanyToken(_name, _symbol, _initialSupply, address(this))
		);
	}

	event DebugLog(string message);


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

		// Crear nuevo token de la organización y asignar tokens al contrato
		address token = address(
			new CompanyToken(_name, _symbol, _initialSupply, address(this))
		);
		require(token != address(0), "Failed to create token");
		emit DebugLog("Token created");

		// Crear y registrar organización
		uint256 orgId = orgCount++;
		Organization storage org = organizations[orgId];
		org.id = orgId;
		org.name = _name;
		org.token = token;
		org.exists = true;

		// Por default, el creador de la organización es admin
		_addAdmin(orgId, msg.sender);
		emit DebugLog("Admin added");

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
		uint256 _prizeAmount,
		uint256 _startTime,
		uint256 _endTime,
		uint256 _maxWinners
	) public onlyAdmin(_orgId) returns (uint256) {
		require(_startTime < _endTime, "Invalid time range");

		// Verificar que hay suficientes tokens disponibles
		uint256 availableTokens = tokensAvailable(_orgId);
		require(_prizeAmount * _maxWinners <= availableTokens, "Not enough tokens available");

		uint256 challengeId = challengeCount++;
		Challenge storage challenge = challenges[challengeId];
		challenge.id = challengeId;
		challenge.description = _description;
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

		Organization storage organization = organizations[_orgId];
		uint256 prizeAmountInBaseUnits = challenge.prizeAmount;

		require(
			ERC20(organization.token).balanceOf(address(this)) >= prizeAmountInBaseUnits,
			"Not enough tokens in the organization"
		);

		challenge.winners[msg.sender] = true;
		challenge.winnerCount++;

		// Si se alcanzó el número máximo de ganadores, marcar el desafío como inactivo
		if (challenge.winnerCount >= challenge.maxWinners) {
			challenge.active = false;
		}

		// Transferir tokens al ganador
		ERC20(organization.token).transfer(msg.sender, prizeAmountInBaseUnits);

		emit RewardClaimed(_challengeId, msg.sender);
	}

	function getTokenDecimals(uint256 _orgId) public view returns (uint8) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");
		return ERC20(org.token).decimals();
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

	// @notice Devuelve las organizaciones a las que el sender pertenece como admin o usuario, incluyendo nombre y dirección del token
	function listOrganizationsWithDetails() public view returns (
		uint256[] memory orgIds,
		string[] memory names,
		string[] memory tokenSymbols,
		address[] memory tokenAddresses,
		uint256[] memory adminCounts,
		uint256[] memory userCounts,
		bool[] memory isMembers
	) {
		uint256 count = 0;
		for (uint256 i = 0; i < orgCount; i++) {
			if (organizations[i].adminExists[msg.sender] || organizations[i].userExists[msg.sender]) {
				count++;
			}
		}

		orgIds = new uint256[](count);
		names = new string[](count);
		tokenSymbols = new string[](count);
		tokenAddresses = new address[](count);
		adminCounts = new uint256[](count);
		userCounts = new uint256[](count);
		isMembers = new bool[](count);

		uint256 index = 0;

		for (uint256 i = 0; i < orgCount; i++) {
			if (organizations[i].adminExists[msg.sender] || organizations[i].userExists[msg.sender]) {
				Organization storage org = organizations[i];
				orgIds[index] = org.id;
				names[index] = org.name;

				tokenSymbols[index] = ERC20(org.token).symbol();
				tokenAddresses[index] = org.token;

				adminCounts[index] = org.admins.length;
				userCounts[index] = org.users.length;
				isMembers[index] = org.userExists[msg.sender] || org.adminExists[msg.sender];
				index++;
			}
		}
	}

	/// @notice Obtiene los detalles de una organización por ID
	function getOrganizationDetails(uint256 _orgId) public view returns (
		uint256 orgId,
		string memory name,
		address token,
		address[] memory admins,
		address[] memory users,
		uint256[] memory orgChallengeIds,
		bool isAdmin,
		bool isUser
	) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");

		orgId = org.id;
		name = org.name;
		token = org.token;
		admins = org.admins;
		users = org.users;
		orgChallengeIds = org.challengeIds;
		isAdmin = org.adminExists[msg.sender];
		isUser = org.userExists[msg.sender];
	}

	/// @notice Verifica si una dirección es miembro de una organización
	function isMember(uint256 _orgId, address _user) public view returns (bool) {
		Organization storage org = organizations[_orgId];
		return org.userExists[_user];
	}

	/// @notice Unirse a una organización
	function joinOrganization(uint256 _orgId) public {
		require(organizations[_orgId].exists, "Organization does not exist");
		require(!organizations[_orgId].userExists[msg.sender], "Already a member");

		_addUser(_orgId, msg.sender);
	}

	/// @notice Salir de una organización
	function leaveOrganization(uint256 _orgId) public onlyUser(_orgId) {
		Organization storage org = organizations[_orgId];
		org.userExists[msg.sender] = false;

		// Remover al usuario de la lista de usuarios
		address[] storage users = org.users;
		for (uint256 i = 0; i < users.length; i++) {
			if (users[i] == msg.sender) {
				users[i] = users[users.length - 1];
				users.pop();
				break;
			}
		}
	}

	/// @notice Obtiene los detalles de múltiples desafíos
	/// @param ids Lista de IDs de los desafíos
	/// @return challengeIds Lista de IDs de los desafíos
	/// @return descriptions Lista de descripciones de los desafíos
	/// @return prizeAmounts Lista de montos de premios de los desafíos
	/// @return startTimes Lista de tiempos de inicio de los desafíos
	/// @return endTimes Lista de tiempos de finalización de los desafíos
	/// @return maxWinners Lista de máximos ganadores permitidos de los desafíos
	/// @return actives Lista de estados de los desafíos (activos o inactivos)
	/// @return winnerCounts Lista de conteos de ganadores actuales de los desafíos
	function listChallengesDetails(uint256[] calldata ids)
	external
	view
	returns (
		uint256[] memory challengeIds,
		string[] memory descriptions,
		uint256[] memory prizeAmounts,
		uint256[] memory startTimes,
		uint256[] memory endTimes,
		uint256[] memory maxWinners,
		bool[] memory actives,
		uint256[] memory winnerCounts
	)
	{
		uint256 count = ids.length;

		challengeIds = new uint256[](count);
		descriptions = new string[](count);
		prizeAmounts = new uint256[](count);
		startTimes = new uint256[](count);
		endTimes = new uint256[](count);
		maxWinners = new uint256[](count);
		actives = new bool[](count);
		winnerCounts = new uint256[](count);

		for (uint256 i = 0; i < count; i++) {
			Challenge storage challenge = challenges[ids[i]];
			require(challenge.exists, "Challenge does not exist");

			challengeIds[i] = challenge.id;
			descriptions[i] = challenge.description;
			prizeAmounts[i] = challenge.prizeAmount;
			startTimes[i] = challenge.startTime;
			endTimes[i] = challenge.endTime;
			maxWinners[i] = challenge.maxWinners;
			actives[i] = challenge.active;
			winnerCounts[i] = challenge.winnerCount;
		}
	}

	/// @notice Calcula la cantidad de tokens disponibles para crear desafíos (en unidades base)
	function tokensAvailable(uint256 _orgId) public view returns (uint256) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");

		// Tokens disponibles = Balance del token en el contrato - tokens comprometidos en desafíos activos
		uint256 tokenBalance = ERC20(org.token).balanceOf(address(this));
		uint256 committedTokens = 0;

		for (uint256 i = 0; i < org.challengeIds.length; i++) {
			uint256 challengeId = org.challengeIds[i];
			Challenge storage challenge = challenges[challengeId];
			if (challenge.active) {
				committedTokens += challenge.prizeAmount * (challenge.maxWinners - challenge.winnerCount);
			}
		}

		return tokenBalance >= committedTokens ? tokenBalance - committedTokens : 0;
	}

}
