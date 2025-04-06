// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import '@openzeppelin/contracts/access/Ownable.sol';

/// @title PresenceCounter
/// @notice Tracks attendance timestamps for federation members based on ParticipationSFT mints
/// @dev Only the configured ParticipationSFT contract can update presence data
contract PresenceCounter is Ownable {
    /// @notice Address of the authorized ParticipationSFT contract
    address private participationSFT;
    address private gradeManager;

    /// @notice Mapping from user address to their attendance timestamps
    mapping(address => uint256[]) public presenceDates;

    /// @notice Emitted when a presence is recorded
    /// @param user Address of the participant
    /// @param timestamp Block timestamp of the presence
    event PresenceRecorded(address indexed user, uint256 timestamp);

    /// @notice Emitted when a user's attendance list is reset
    /// @param user Address of the participant
    event PresenceReset(address indexed user);

    /// @notice Emitted when the ParticipationSFT contract address is set
    /// @param newAddress New ParticipationSFT contract address
    event ParticipationSFTSet(address indexed newAddress);

    /// @notice Emitted when the GradeManager contract address is set
    /// @param newAddress New GradeManager contract address
    event GradeManagerSet(address indexed newAddress);

    /// @notice Ensures that only the authorized ParticipationSFT contract can call the modified function.
    modifier onlyParticipationSFT() {
        require(msg.sender == participationSFT, 'Not authorized');
        _;
    }

    /// @notice Ensures that only the authorized GradeManager contract can call the modified function.
    modifier onlyGradeManagerContract() {
        require(msg.sender == gradeManager, 'Not authorized');
        _;
    }

    /// @notice Initializes the contract setting the deployer as the owner.
    constructor() Ownable(msg.sender) {}

    /// @notice Sets or updates the ParticipationSFT contract address
    /// @dev Can only be called by the contract owner.
    /// @param _participationSFT Address of the ParticipationSFT contract
    function setParticipationSFT(address _participationSFT) external onlyOwner {
        participationSFT = _participationSFT;
        emit ParticipationSFTSet(_participationSFT);
    }

    /// @notice Retrieves the current ParticipationSFT contract address.
    /// @return The address of the configured ParticipationSFT contract.
    function getParticipationSFT() public view returns (address) {
        return participationSFT;
    }

    /// @notice Sets or updates the ParticipationSFT contract address
    /// @dev Can only be called by the contract owner.
    /// @param _gradeManager Address of the ParticipationSFT contract
    function setGradeManager(address _gradeManager) external onlyOwner {
        gradeManager = _gradeManager;
        emit GradeManagerSet(gradeManager);
    }

    /// @notice Retrieves the current GradeManager contract address.
    /// @return The address of the configured GradeManager contract.
    function getGradeManager() public view returns (address) {
        return gradeManager;
    }

    /// @notice Called by ParticipationSFT to record a new presence
    /// @dev Can only be called by the authorized ParticipationSFT contract.
    /// @param user Address of the participant
    /// @param timestamp Timestamp of the attendance (typically block.timestamp)
    function recordPresence(
        address user,
        uint256 timestamp
    ) external onlyParticipationSFT {
        presenceDates[user].push(timestamp);

        emit PresenceRecorded(user, timestamp);
    }

    /// @notice Retrieves the total number of presences recorded for a specific user.
    /// @param user Address of the user whose presence count is being queried.
    /// @return The total number of presences recorded for the user.
    function getPresenceCount(address user) external view returns (uint256) {
        return presenceDates[user].length;
    }

    /// @notice Retrieves all presence timestamps recorded for a specific user.
    /// @param user Address of the user whose presence timestamps are being queried.
    /// @return An array of timestamps representing the user's recorded presences.
    function getPresenceDates(
        address user
    ) external view returns (uint256[] memory) {
        return presenceDates[user];
    }

    /// @notice Clears all recorded presence data for a specific user.
    /// @dev Can only be called by the authorized GradeManager contract.
    /// @param user Address of the user whose presence data will be reset.
    function resetPresence(address user) external onlyGradeManagerContract {
        delete presenceDates[user];
        emit PresenceReset(user);
    }
}
