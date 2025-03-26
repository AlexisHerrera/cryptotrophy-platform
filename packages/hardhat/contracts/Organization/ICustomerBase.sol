// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


interface ICustomerBase {
    function initialize(uint256 _membershipId, address _admin) external;
    function isCustomer(uint256 _membershipId, address _customer) external view returns (bool);
}
