// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./OrganizationToken.sol";
import "../Challenges/IChallengeManager.sol";
import {IOrganizationManager} from "./IOrganizationManager.sol";
import {ICustomerBase} from "./ICustomerBase.sol";

contract OrganizationManager is IOrganizationManager {
	// Estructuras
	struct Organization {
		uint256 id;
		string name;
		address token;

        bytes32 customerBaseUID;
		address customerBaseAddr;

		mapping(address => bool) adminExists;
		address[] admins;
		bool exists;
	}

	// Supported customer bases
    mapping(bytes32 => address) public customerBaseRegistry;

	// Atributos
	uint256 public orgCount;
	mapping(uint256 => Organization) public organizations;
	mapping(string => bool) public orgNameExists;
	mapping(string => bool) public tokenSymbolExists;

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
        bytes32 _customerBaseUID
	) public payable returns (uint256) {
		require(msg.value >= _initialEthBacking, "Insufficient ETH backing");
		require(!orgNameExists[_name], "Organization name already exists");
		require(!tokenSymbolExists[_symbol], "Token symbol already exists");
		orgNameExists[_name] = true;
		tokenSymbolExists[_symbol] = true;

		// Crear nuevo token de la organización y asignar tokens al contrato
		OrganizationToken token = new OrganizationToken(
			_name,
			_symbol,
			_initialSupply,
			address(this)
		);
		require(address(token) != address(0), "Failed to create token");

		// Send ETH backing to the token contract if provided
		if (_initialEthBacking > 0) {
			(bool success, ) = address(token).call{value: _initialEthBacking}("");
			require(success, "Failed to send ETH to token contract");
		}

		// Crear y registrar organización
		uint256 orgId = orgCount++;
		Organization storage org = organizations[orgId];
		org.id = orgId;
		org.name = _name;
		org.token = address(token);
		org.exists = true;
		org.customerBaseUID = _customerBaseUID;
		org.customerBaseAddr = customerBaseRegistry[_customerBaseUID];

		// Por default, el creador de la organización es admin
		_addAdmin(orgId, msg.sender);

		for (uint256 i = 0; i < _admins.length; i++) {
			_addAdmin(orgId, _admins[i]);
		}

		if (org.customerBaseAddr != address(0x0)) {
			ICustomerBase customerBase = ICustomerBase(org.customerBaseAddr);
			customerBase.initialize(org.id, msg.sender);
		}

		organizationIds.push(orgId);
		emit OrganizationCreated(orgId, _name, address(token));
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


	// Implementación de las funciones de la interfaz

	/// @notice Verifica si una dirección es administrador de una organización
	function isAdmin(uint256 _orgId, address _user) external view override returns (bool) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");
		return org.adminExists[_user];
	}

	/// @notice Lista todas las organizaciones
	function listOrganizations() public view returns (uint256[] memory) {
		return organizationIds;
	}

    function hasUsers(uint256 _orgId) external view returns (bool) {
		Organization storage org = organizations[_orgId];
		return org.customerBaseAddr != address(0x0);
	}

    function isUser(uint256 _orgId, address _user) external view returns (bool) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does handle user membership");
		ICustomerBase customerBase = ICustomerBase(org.customerBaseAddr);
		return customerBase.isCustomer(org.id, _user);
	}

	// @notice Devuelve las organizaciones a las que el sender pertenece como admin o usuario, incluyendo nombre y dirección del token
	function listAdministratedOrganizations() public view returns (
		uint256[] memory orgIds,
		string[] memory names,
		string[] memory tokenSymbols,
		address[] memory tokenAddresses,
		uint256[] memory adminCounts,
		uint256[] memory customerCounts,
		bool[] memory isMembers
	) {
		uint256 count = 0;
		for (uint256 i = 0; i < orgCount; i++) {
			if (organizations[i].adminExists[msg.sender]) {
				count++;
			}
		}

		orgIds = new uint256[](count);
		names = new string[](count);
		tokenSymbols = new string[](count);
		tokenAddresses = new address[](count);
		adminCounts = new uint256[](count);
		customerCounts = new uint256[](count);
		isMembers = new bool[](count);

		uint256 index = 0;

		for (uint256 i = 0; i < orgCount; i++) {
			if (organizations[i].adminExists[msg.sender]) {
				Organization storage org = organizations[i];
				orgIds[index] = org.id;
				names[index] = org.name;

				tokenSymbols[index] = ERC20(org.token).symbol();
				tokenAddresses[index] = org.token;

				adminCounts[index] = org.admins.length;
				customerCounts[index] = 0;
				isMembers[index] = true;
				index++;
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
		uint256[] memory customerCounts,
		bool[] memory isMembers
	) {
		uint256 count = 0;
		for (uint256 i = 0; i < orgCount; i++) {
			Organization storage org = organizations[i];
			if (org.customerBaseAddr != address(0x0)) {
				ICustomerBase customerBase = ICustomerBase(org.customerBaseAddr);
				if (customerBase.isCustomer(org.id, msg.sender)) {
					count++;
				}
			}
		}

		orgIds = new uint256[](count);
		names = new string[](count);
		tokenSymbols = new string[](count);
		tokenAddresses = new address[](count);
		adminCounts = new uint256[](count);
		customerCounts = new uint256[](count);
		isMembers = new bool[](count);

		uint256 index = 0;

		for (uint256 i = 0; i < orgCount; i++) {
			Organization storage org = organizations[i];
			if (org.customerBaseAddr != address(0x0)) {
				ICustomerBase customerBase = ICustomerBase(org.customerBaseAddr);
				if (customerBase.isCustomer(org.id, msg.sender)) {
					orgIds[index] = org.id;
					names[index] = org.name;

					tokenSymbols[index] = ERC20(org.token).symbol();
					tokenAddresses[index] = org.token;

					adminCounts[index] = org.admins.length;
					customerCounts[index] = 0;
					isMembers[index] = true;
					index++;
				}
			}
		}
	}

	/// @notice Obtiene los detalles de una organización por ID
	function getOrganizationDetails(uint256 _orgId) public view returns (
		uint256 orgId,
		string memory name,
		address token,
		address[] memory admins,
		bytes32 customerBaseUID,
		bool userIsAdmin,
		bool userIsMember
	) {
		Organization storage org = organizations[_orgId];
		require(org.exists, "Organization does not exist");

		orgId = org.id;
		name = org.name;
		token = org.token;
		admins = org.admins;
		customerBaseUID = org.customerBaseUID;
		userIsAdmin = org.adminExists[msg.sender];
		userIsMember = false;
		if (org.customerBaseAddr != address(0x0)) {
			ICustomerBase customerBase = ICustomerBase(org.customerBaseAddr);
			userIsMember = customerBase.isCustomer(org.id, msg.sender);
		}
	}

    function registerCustomerBase(bytes32 _customerBaseUID, address _customerBaseAddress) public {
        customerBaseRegistry[_customerBaseUID] = _customerBaseAddress;
    }
}
