// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./OrganizationToken.sol";
import "../Challenges/IChallengeManager.sol";
import "../Challenges/OnChainValidator.sol";
import {IOrganizationManager} from "./IOrganizationManager.sol";

contract OrganizationManager is IOrganizationManager {
	// Estructuras
	struct Organization {
		uint256 id;
		string name;
		address token;
		mapping(address => bool) adminExists;
		mapping(address => bool) userExists;
		address[] admins;
		address[] users;
		bool exists;
	}

	// Atributos
	uint256 public orgCount;
	mapping(uint256 => Organization) public organizations;

	uint256[] public organizationIds;
	// address public cryptoTrophyToken;

	// Eventos
	event OrganizationCreated(
		uint256 indexed orgId,
		string name,
		address token
	);

	// Modificadores
	modifier onlyAdmin(uint256 orgId) {
		require(organizations[orgId].adminExists[msg.sender], "Not an admin");
		_;
	}

	modifier onlyUser(uint256 orgId) {
		require(organizations[orgId].userExists[msg.sender], "Not a user");
		_;
	}

	function getTokenOfOrg(uint256 _orgId) external view override returns (address) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");
		return org.token;
	}

	/// @notice Obtiene el balance de una organización en su token con los 18 decimales
	function getBalanceOfOrg(uint256 _orgId) external view override returns (uint256) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");
		return ERC20(org.token).balanceOf(address(this));
	}

	// @return Balance de un usuario en una organización y el nombre del token
	function getBalanceOfUser(uint256 _orgId, address _user) external view override returns (uint256, string memory) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");
		return (ERC20(org.token).balanceOf(_user), ERC20(org.token).symbol());
	}

	function transferTokensTo(uint256 _orgId, address _destAddress, uint256 _amount) external {
		// require(msg.sender == address(challengeManagerAddr), "Only ChallengeManager can call");
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");

		// Validar balance
		uint256 orgBalance = ERC20(org.token).balanceOf(address(this));
		require(orgBalance >= _amount, "Not enough tokens in OrgManager");

		// Hacer transferencia
		ERC20(org.token).transfer(_destAddress, _amount);
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

		// Crear nuevo token de la organización y asignar tokens al contrato
		address token = address(
			new OrganizationToken(_name, _symbol, _initialSupply, address(this))
		);
		require(token != address(0), "Failed to create token");

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

	// Implementación de las funciones de la interfaz

	/// @notice Verifica si una dirección es administrador de una organización
	function isAdmin(uint256 _orgId, address _user) external view override returns (bool) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");
		return org.adminExists[_user];
	}

	/// @notice Verifica si una dirección es miembro de una organización
	function isUser(uint256 _orgId, address _user) external view override returns (bool) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");
		return org.userExists[_user];
	}

	/// @notice Lista todas las organizaciones
	function listOrganizations() public view returns (uint256[] memory) {
		return organizationIds;
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
		bool userIsAdmin,
		bool userIsMember
	) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");

		orgId = org.id;
		name = org.name;
		token = org.token;
		admins = org.admins;
		users = org.users;
		userIsAdmin = org.adminExists[msg.sender];
		userIsMember = org.userExists[msg.sender];
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
}
