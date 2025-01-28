// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IOrganizationManager {
    function isAdmin(uint256 _orgId, address _user) external view returns (bool);
    function isUser(uint256 _orgId, address _user) external view returns (bool);
    function getTokenOfOrg(uint256 _orgId) external view returns (address);
}
