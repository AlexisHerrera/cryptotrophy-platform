// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../Organization/ICustomerBase.sol";


contract OnChainCustomerBase is ICustomerBase {
	// Estructuras
	struct Membership {
		mapping(address => bool) customerExists;
		address[] customers;
		address admin;
		bool exists;
	}
	mapping(uint256 => Membership) public memberships;


	modifier onlyAdmin(uint256 _membershipId) {
		Membership storage membership = memberships[_membershipId];
		require(membership.exists, "Membership does not exist");
        require(membership.admin == msg.sender, "Not membership administrator");
		_;
	}

	modifier onlyCustomer(uint256 _membershipId) {
		Membership storage membership = memberships[_membershipId];
		require(membership.exists, "Membership does not exist");
		require(membership.customerExists[msg.sender], "Not membership customer");
		_;
	}

	/// @notice Initialize a new membership.
    function initialize(uint256 _membershipId, address _admin) external {
		Membership storage membership = memberships[_membershipId];
		membership.exists = true;
		membership.admin = _admin;
	}

	function isCustomer(uint256 _membershipId, address _customer) external view override returns (bool) {
		Membership storage membership = memberships[_membershipId];
		require(membership.exists, "Membership does not exist");
		return membership.customerExists[_customer];
	}

	/// @notice Adds a customer to a membership. onlyAdmin checks membership exists
	function addCustomer(uint256 _membershipId, address _customer) public onlyAdmin(_membershipId) {
		_addCustomer(_membershipId, _customer);
	}

	/// @notice Set the membership administrator. onlyAdmin checks membership exists
	function setAdmin(uint256 _membershipId, address _admin) public onlyAdmin(_membershipId) {
		memberships[_membershipId].admin = _admin;
	}

	/// @notice Calling address leaves a membership. onlyCustomer checks membership exists
	function leaveMembership(uint256 _membershipId) public onlyCustomer(_membershipId) {
		Membership storage membership = memberships[_membershipId];

		membership.customerExists[msg.sender] = false;

		// Remover al usuario de la lista de usuarios
		address[] storage customers = membership.customers;
		for (uint256 i = 0; i < customers.length; i++) {
			if (customers[i] == msg.sender) {
				customers[i] = customers[customers.length - 1];
				customers.pop();
				break;
			}
		}
	}

	/// @notice Caller joins a membership
	function joinMembership(uint256 _membershipId) public {
		require(memberships[_membershipId].exists, "Membership does not exist");
		_addCustomer(_membershipId, msg.sender);
	}

	/// The membership should exists.
	function _addCustomer(uint256 _membershipId, address _customer) internal {
		Membership storage membership = memberships[_membershipId];
		if (!membership.customerExists[_customer]) {
			membership.customerExists[_customer] = true;
			membership.customers.push(_customer);
		}
	}
}