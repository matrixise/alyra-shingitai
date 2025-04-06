// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

interface IGradeSBT {
    function gradeIdExists(uint256 gradeId) external view returns (bool);
    function assignGrade(
        address to,
        uint256 gradeId,
        uint256 date,
        string memory tokenURI
    ) external;
}
