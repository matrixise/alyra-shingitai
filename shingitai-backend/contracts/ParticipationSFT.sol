// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import './IPresenceCounter.sol';

/**
 * @title ParticipationSFT
 * @notice This contract manages the issuance and validation of participation tokens for events,
 * utilizing ERC1155 for token management.
 * @dev Inherits from ERC1155 for token functionality and Ownable for ownership management.
 */
contract ParticipationSFT is ERC1155, Ownable, ReentrancyGuard {
    uint256 public nextEventId;

    IPresenceCounter public presenceCounterContract;

    /// @dev Enum for event workflow states.
    enum EventWorkflow {
        Opened,
        Closed
    }

    /// @dev Struct to store information about each event.
    struct EventInfo {
        string name;
        uint256 date;
        address[] validators;
        EventWorkflow state;
    }

    /// @dev Mapping from event ID to its information.
    mapping(uint256 => EventInfo) public events;

    /// @dev Mapping to track which addresses have attended which events.
    mapping(uint256 => mapping(address => bool)) public hasAttended;

    /**
     * @notice Emitted when a new event is created.
     * @param eventId The ID of the created event.
     * @param name The name of the event.
     * @param date The date of the event.
     */
    event EventCreated(uint256 eventId, string name, uint256 date);

    /**
     * @notice Emitted when an address's presence at an event is validated.
     * @param participant The address of the participant.
     * @param eventId The ID of the event.
     * @param validator The address of the validator.
     */
    event PresenceValidated(
        address indexed participant,
        uint256 indexed eventId,
        address validator
    );

    /**
     * @notice Emitted when an event is opened.
     * @param eventId The ID of the opened event.
     */
    event EventOpened(uint256 eventId);

    /**
     * @notice Emitted when an event is closed.
     * @param eventId The ID of the closed event.
     */
    event EventClosed(uint256 eventId);

    /// @dev Sets the initial URI for all token types.
    constructor(
        address _presenceCounterContract,
        string memory initialURI
    ) ERC1155(initialURI) Ownable(msg.sender) {
        presenceCounterContract = IPresenceCounter(_presenceCounterContract);
    }

    /**
     * @notice Creates a new event with the specified details.
     * @param name The name of the event.
     * @param date The date of the event.
     * @param validators The addresses allowed to validate attendance.
     */
    function createEvent(
        string memory name,
        uint256 date,
        address[] memory validators
    ) external onlyOwner {
        uint256 eventId = nextEventId;
        events[eventId] = EventInfo({
            name: name,
            date: date,
            validators: validators,
            state: EventWorkflow.Closed
        });
        emit EventCreated(eventId, name, date);
        nextEventId++;
    }

    /**
     * @dev Checks if an address is a validator for a given event.
     * @param validator The address to check.
     * @param eventId The ID of the event.
     * @return True if the address is a validator for the event, false otherwise.
     */
    function _isValidator(
        address validator,
        uint256 eventId
    ) internal view returns (bool) {
        address[] memory list = events[eventId].validators;
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == validator) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Opens an event for attendance validation.
     * @param eventId The ID of the event to open.
     */
    function openEvent(uint256 eventId) external onlyOwner {
        require(eventId < nextEventId, 'Event does not exist');
        require(
            events[eventId].state == EventWorkflow.Closed,
            'Event is already open'
        );
        events[eventId].state = EventWorkflow.Opened;
        emit EventOpened(eventId);
    }

    /**
     * @notice Closes an event, preventing further attendance validation.
     * @param eventId The ID of the event to close.
     */
    function closeEvent(uint256 eventId) external onlyOwner {
        require(eventId < nextEventId, 'Event does not exist');
        require(
            events[eventId].state == EventWorkflow.Opened,
            'Event is already closed'
        );
        events[eventId].state = EventWorkflow.Closed;
        emit EventClosed(eventId);
    }

    /**
     * @notice Validates a participant's attendance at an event.
     * @param participant The address of the participant.
     * @param eventId The ID of the event.
     */
    function validatePresence(address participant, uint256 eventId) external nonReentrant() {
        require(
            events[eventId].state == EventWorkflow.Opened,
            'Event is not open'
        );
        require(
            _isValidator(msg.sender, eventId),
            'Not a validator for this event'
        );
        require(!hasAttended[eventId][participant], 'Already validated');

        _mint(participant, eventId, 1, '');
        hasAttended[eventId][participant] = true;
        presenceCounterContract.recordPresence(
            participant,
            events[eventId].date
        );
        emit PresenceValidated(participant, eventId, msg.sender);
    }

    /// @dev Override _update to prevent all transfers, allowing only minting and burning.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        require(from == address(0), 'ERC1155: Transfers are disabled');

        super._update(from, to, ids, values);
    }
}
