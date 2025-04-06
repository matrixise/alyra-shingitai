// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import '@openzeppelin/contracts/access/AccessControl.sol';
import './IPresenceCounter.sol';
import './IGradeSBT.sol';

/// @title GradeManager
/// @notice Manages martial arts grading within a federation, including member management,
/// grade awarding, and attendance tracking.
/// @dev Utilizes AccessControl for role-based permissions, integrating with IGradeSBT
/// for grade assignments and IPresenceCounter for attendance tracking.
contract GradeManager is AccessControl {
    // Custom errors
    error NotAuthorized();
    error GradeDoesNotExist();
    error NotAFederationMember();
    error NotEnoughPoints(uint256 required, uint256 actual);

    /// @notice Interface instance for interacting with the GradeSBT contract.
    IGradeSBT public gradeContract;

    /// @notice Interface instance for interacting with the PresenceCounter contract.
    IPresenceCounter public presenceCounterContract;

    /// @notice Role identifier for users who can manage grades.
    bytes32 public constant GRADE_MANAGER_ROLE =
        keccak256('GRADE_MANAGER_ROLE');

    struct GradeRule {
        uint256 requiredPoints;
        uint256 requiredPeriod;
    }

    /// @notice Stores the rules for awarding each grade.
    mapping(uint256 => GradeRule) public gradeRules;

    /// @notice Tracks federation membership status of users.
    mapping(address => bool) public isMember;

    /// @notice Emitted when a new member is added to the federation.
    event MemberAdded(address user);

    /// @notice Emitted when a member is enabled.
    event MemberEnabled(address user);

    /// @notice Emitted when a member is disabled.
    event MemberDisabled(address user);

    /// @notice Emitted when a grade is successfully awarded to a user.
    event GradeAwarded(address user, uint256 gradeId);

    /// @notice Emitted when a user's points are increased due to event participation.
    event PointsIncreased(
        address indexed user,
        uint256 eventId,
        uint256 timestamp
    );

    /// @param _grade Address of the GradeSBT contract.
    /// @param presenceCounter Address of the PresenceCounter contract.
    constructor(address _grade, address presenceCounter) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(GRADE_MANAGER_ROLE, _msgSender());

        gradeContract = IGradeSBT(_grade);
        presenceCounterContract = IPresenceCounter(presenceCounter);
    }

    /// @notice Awards a grade to a user if they meet the required criteria.
    /// @param user The address of the user to award the grade to.
    /// @param gradeId The ID of the grade to be awarded.
    /// @param date The date of the grade awarding.
    /// @param tokenURI The URI for the grade's metadata.
    function awardGrade(
        address user,
        uint256 gradeId,
        uint256 date,
        string calldata tokenURI
    ) external {
        if (!isMember[user]) revert NotAFederationMember();
        GradeRule memory rule = gradeRules[gradeId];

        uint256 cutoff = date - rule.requiredPeriod;
        uint256 validCount = 0;

        // On va recuperer les dates
        uint256[] memory records = presenceCounterContract.getPresenceDates(
            user
        );

        // Filtrer uniquement les présences entre cutoff et examDate (inclus)
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i] >= cutoff && records[i] <= date) {
                validCount++;
            }
        }

        if (validCount < rule.requiredPoints)
            revert NotEnoughPoints(rule.requiredPoints, validCount);

        gradeContract.assignGrade(user, gradeId, date, tokenURI);
        emit GradeAwarded(user, gradeId);
        presenceCounterContract.resetPresence(user);
    }

    /// @notice Sets the rule for a specific grade.
    /// @param gradeId The ID of the grade to set the rule for.
    /// @param points The number of points required to be eligible for the grade.
    /// @param period The period within which the points must be accumulated.
    function setGradeRule(
        uint256 gradeId,
        uint256 points,
        uint256 period
    ) public {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAuthorized();
        if (!gradeContract.gradeIdExists(gradeId)) revert GradeDoesNotExist();
        gradeRules[gradeId] = GradeRule({
            requiredPoints: points,
            requiredPeriod: period
        });
    }

    /// @notice Adds a user as a member of the federation.
    /// @param user The address of the user to add as a member.
    function addMember(address user) public {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAuthorized();
        isMember[user] = true;
        emit MemberAdded(user);
    }

    /// @notice Disables a user's membership in the federation.
    /// @param user The address of the user whose membership to disable.
    function disableMember(address user) public {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAuthorized();
        isMember[user] = false;
        emit MemberDisabled(user);
    }

    /// @notice Enables a user's membership in the federation.
    /// @param user The address of the user whose membership to enable.
    function enableMember(address user) public {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAuthorized();
        isMember[user] = true;
        emit MemberEnabled(user);
    }
}
