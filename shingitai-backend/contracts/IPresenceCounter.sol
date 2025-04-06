// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

interface IPresenceCounter {
    function recordPresence(address user, uint256 timestamp) external;
    function getPresenceDates(
        address user
    ) external view returns (uint256[] memory);
    function resetPresence(address user) external;
}
