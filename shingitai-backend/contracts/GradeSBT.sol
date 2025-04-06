// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GradeSBT
 * @notice A contract for managing martial arts grading as NFTs.
 * @dev Extends ERC721URIStorage for NFT functionality and AccessControl for role-based permissions.
 */
contract GradeSBT is ERC721URIStorage, AccessControl, ReentrancyGuard {
    error NotAuthorized();
    error ZeroAddress();
    error GradeAlreadyExists();
    error GradeNotFound();

    bytes32 public constant GRADE_MANAGER_ROLE =
        keccak256('GRADE_MANAGER_ROLE');
    uint256 public nextTokenId;
    uint256 public nextGradeId;

    mapping(string => bool) public gradeExists;
    mapping(uint256 => string) public grades;
    mapping(string => uint256) public gradesByName;
    mapping(address => mapping(uint256 => bool)) private _hasGrade;
    string[] private gradeNames;

    /**
     * @notice Checks if a grade ID exists within the system.
     * @dev Utilizes the grades mapping to check if the grade name for the given ID has been set.
     * @param gradeId The ID of the grade to check for existence.
     * @return bool True if the grade ID exists (has a non-empty name), false otherwise.
     */
    function gradeIdExists(uint256 gradeId) external view returns (bool) {
        return bytes(grades[gradeId]).length > 0;
    }

    /**
     * @notice Emitted when a new grade is assigned to an address.
     * @param receiver The address receiving the grade.
     * @param date The date of the grade assignment.
     * @param gradeId The ID of the assigned grade.
     * @param tokenId The token ID associated with the grade assignment.
     */
    event GradeAssigned(
        address receiver,
        uint256 date,
        uint256 gradeId,
        uint256 indexed tokenId
    );

    /**
     * @notice Emitted when a new grade is created.
     * @param gradeId The ID of the newly created grade.
     * @param gradeName The name of the newly created grade.
     */
    event GradeCreated(uint256 gradeId, string gradeName);

    /// @notice Contract constructor that sets up initial roles and grades.
    constructor() ERC721('GradeSBT', 'GSBT') {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(GRADE_MANAGER_ROLE, _msgSender());
    }

    /**
     * @notice Creates a new grade with the given name.
     * @dev Emits a GradeCreated event upon creation.
     * @param gradeName The name of the grade to create.
     */
    function createGrade(string memory gradeName) public {
        if (gradeExists[gradeName]) revert GradeAlreadyExists();

        uint256 gradeId = nextGradeId;
        grades[gradeId] = gradeName;
        gradesByName[gradeName] = gradeId;
        gradeExists[gradeName] = true;
        gradeNames.push(gradeName);

        emit GradeCreated(gradeId, gradeName);
        nextGradeId++;
    }

    /**
     * @notice Retrieves the grade ID by its name.
     * @dev Reverts if the grade name does not exist.
     * @param gradeName The name of the grade to retrieve the ID for.
     * @return The ID of the grade.
     */
    function getGradeIdByName(
        string memory gradeName
    ) public view returns (uint256) {
        if (!gradeExists[gradeName]) revert GradeNotFound();
        return gradesByName[gradeName];
    }

    /// @notice Retrieves the names of all grades managed by the federation.
    /// @return gradeNames An array of strings, where each string is the name of a grade.
    function getAllGradeNames() public view returns (string[] memory) {
        return gradeNames;
    }

    /**
     * @notice Assigns a grade to an address, marking them as having achieved that grade.
     * @dev Requires the caller to have the GRADE_MANAGER_ROLE.
     * Emits a GradeAssigned event upon successful assignment.
     * @param to The address to assign the grade to.
     * @param gradeId The ID of the grade to assign.
     * @param date The date of grade assignment.
     * @param tokenURI The URI for the grade's metadata.
     */
    function assignGrade(
        address to,
        uint256 gradeId,
        uint256 date,
        string memory tokenURI
    ) external onlyRole(GRADE_MANAGER_ROLE) nonReentrant() {
        require(gradeId < nextGradeId, 'Grade does not exist');
        require(_hasGrade[to][gradeId] == false, 'Grade already assigned');

        if (gradeId > 0) {
            require(_hasGrade[to][gradeId - 1], 'Previous grade not assigned');
        }

        _hasGrade[to][gradeId] = true;
        // Stocker la date du grade, ainsi on pourra le redonner + tard si on doit faire une copie
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit GradeAssigned(to, date, gradeId, tokenId);
        nextTokenId++;
    }

    /**
     * @notice Checks if an address has been assigned a specific grade.
     * @dev Validates against the existence of the grade.
     * @param receiver The address to check for the grade.
     * @param gradeId The ID of the grade to check.
     * @return True if the address has the grade, false otherwise.
     */
    function hasGrade(
        address receiver,
        uint256 gradeId
    ) public view returns (bool) {
        require(gradeId < nextGradeId, 'Grade does not exist');
        return _hasGrade[receiver][gradeId];
    }

    /**
     * @dev Overrides the _update function to enforce soulbound token logic, preventing transfers.
     * @param to The address to transfer the token to.
     * @param tokenId The ID of the token to transfer.
     * @param auth The address performing the update.
     * @return The address the token is transferred from.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId); // SBT
        require(from == address(0), 'Soulbound: non-transferable');
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Indicates whether the contract implements a specific interface.
     * @dev Overrides supportsInterface in ERC721URIStorage and AccessControl.
     * @param interfaceId The ID of the interface to check.
     * @return bool True if the contract supports the interface, false otherwise.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Add an admin to the contract
     * @param account Address to grant admin role
     */
    function addAdmin(address account) external {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAuthorized();
        if (account == address(0)) revert ZeroAddress();
        _grantRole(GRADE_MANAGER_ROLE, account);
    }

    /**
     * @notice Remove an admin from the contract
     * @param account Address to revoke admin role
     */
    function removeAdmin(address account) external {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAuthorized();
        if (account == address(0)) revert ZeroAddress();
        _revokeRole(GRADE_MANAGER_ROLE, account);
    }
}
