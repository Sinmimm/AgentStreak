// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

/// @notice Minimal interface of the SPACE ID Agent ID contract (ERC721 non-transferable).
/// @dev Only balanceOf is needed: holding >= 1 Agent ID gates check-ins.
interface IAgentID {
    function balanceOf(address account) external view returns (uint256);
}

/// @title AgentStreak
/// @author AgentStreak (Binance Agent ID Hackathon)
/// @notice Daily check-in for Agent ID holders. First check-in mints a soulbound
///         ERC721 streak badge (non-transferable). No owner, no admin functions,
///         no fees, no pause, no withdraw: the contract is fully immutable and
///         never holds user funds (it is not payable and has no receive/fallback).
/// @dev Day = UTC day number: block.timestamp / 86400.
contract AgentStreak is ERC721 {
    using Strings for uint256;

    // ------------------------------------------------------------------------
    // Errors
    // ------------------------------------------------------------------------
    error NotAgentIDHolder();
    error AlreadyCheckedInToday();
    error Soulbound();
    error ZeroAgentIDAddress();

    // ------------------------------------------------------------------------
    // Constants & immutables
    // ------------------------------------------------------------------------
    /// @notice SPACE ID Agent ID contract on BNB Chain (chain 56).
    IAgentID public immutable agentId;

    /// @notice Seconds in one UTC day.
    uint256 public constant SECONDS_PER_DAY = 86400;

    // ------------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------------
    mapping(address => uint256) private _streak;
    mapping(address => uint256) private _lastCheckInDay;
    mapping(address => uint256) private _totalCheckIns;
    mapping(address => uint256) private _badgeOf;

    /// @dev Next badge tokenId to mint. Starts at 1.
    uint256 private _nextTokenId = 1;
    /// @dev Number of distinct users that ever checked in (= badges minted).
    uint256 private _totalUsers;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------
    event CheckIn(address indexed user, uint256 day, uint256 streak, uint256 totalCheckIns);

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    /// @param agentId_ Address of the Agent ID contract (0x60b9262456de011f7d15a54cdd8c48baaa8b022f on BNB Chain).
    constructor(address agentId_) ERC721("AgentStreak", "ASTRK") {
        if (agentId_ == address(0)) revert ZeroAgentIDAddress();
        agentId = IAgentID(agentId_);
    }

    // ------------------------------------------------------------------------
    // Check-in
    // ------------------------------------------------------------------------
    /// @notice Daily check-in. Caller must hold >= 1 Agent ID. At most once per
    ///         UTC day. Consecutive days grow the streak, a missed day resets it
    ///         to 1. First check-in mints the caller's soulbound badge.
    function checkIn() external {
        if (agentId.balanceOf(msg.sender) < 1) revert NotAgentIDHolder();

        uint256 day = currentDay();
        uint256 lastDay = _lastCheckInDay[msg.sender];
        // lastDay is only ever assigned the current day, so lastDay <= day
        // always holds; ">=" (not "==") also stays correct if a block
        // timestamp ever moved backwards across midnight.
        if (lastDay >= day) revert AlreadyCheckedInToday();

        // Consecutive iff lastDay + 1 >= day (given lastDay < day above,
        // this is exactly lastDay == day - 1, written without "==").
        uint256 streak = (lastDay + 1 >= day) ? _streak[msg.sender] + 1 : 1;
        _streak[msg.sender] = streak;
        _lastCheckInDay[msg.sender] = day;

        uint256 total = _totalCheckIns[msg.sender] + 1;
        _totalCheckIns[msg.sender] = total;

        if (_badgeOf[msg.sender] == 0) {
            uint256 tokenId = _nextTokenId++;
            _badgeOf[msg.sender] = tokenId;
            _totalUsers++;
            // Deliberate _mint (not _safeMint): the recipient is always
            // msg.sender, who explicitly called checkIn. _safeMint would
            // revert for smart-contract wallets without onERC721Received,
            // blocking legitimate check-ins. The badge cannot go to an
            // unintended recipient — it only ever mints to the caller.
            _mint(msg.sender, tokenId);
        }

        emit CheckIn(msg.sender, day, streak, total);
    }

    // ------------------------------------------------------------------------
    // Soulbound: block every transfer and every approval
    // ------------------------------------------------------------------------
    /// @dev _update is the single choke point for mint / transfer / burn in
    ///      OpenZeppelin ERC721 v5. Only mints (from == address(0)) pass.
    ///      Burns are never issued by this contract; a burn (to == address(0))
    ///      would also pass the gate, but no function can trigger one.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    /// @dev Approvals are meaningless for a soulbound token: block them.
    function approve(address /* to */, uint256 /* tokenId */) public virtual override {
        revert Soulbound();
    }

    /// @dev Operator approvals are meaningless for a soulbound token: block them.
    function setApprovalForAll(address /* operator */, bool /* approved */) public virtual override {
        revert Soulbound();
    }

    // ------------------------------------------------------------------------
    // Views
    // ------------------------------------------------------------------------
    /// @notice Current streak of `user` (consecutive UTC days checked in).
    function streakOf(address user) external view returns (uint256) {
        return _streak[user];
    }

    /// @notice UTC day number of `user`'s last check-in (0 = never).
    function lastCheckInDay(address user) external view returns (uint256) {
        return _lastCheckInDay[user];
    }

    /// @notice Total number of check-ins ever made by `user`.
    function totalCheckIns(address user) external view returns (uint256) {
        return _totalCheckIns[user];
    }

    /// @notice Badge tokenId owned by `user` (0 = never checked in).
    function badgeOf(address user) external view returns (uint256) {
        return _badgeOf[user];
    }

    /// @notice Number of distinct users that ever checked in.
    function totalUsers() external view returns (uint256) {
        return _totalUsers;
    }

    /// @notice Current UTC day number (block.timestamp / 86400).
    function currentDay() public view returns (uint256) {
        return block.timestamp / SECONDS_PER_DAY;
    }

    /// @notice True if `user` holds an Agent ID and has not checked in today.
    function canCheckInToday(address user) public view returns (bool) {
        if (agentId.balanceOf(user) < 1) return false;
        return _lastCheckInDay[user] < currentDay();
    }

    /// @notice Seconds until `user` can check in again. 0 if the time gate is
    ///         open (never checked in, or last check-in was a previous day).
    ///         Note: this measures only the daily time gate, not Agent ID
    ///         ownership — a non-holder also returns 0.
    function nextCheckInIn(address user) external view returns (uint256) {
        uint256 day = currentDay();
        if (_lastCheckInDay[user] < day) return 0;
        return (day + 1) * SECONDS_PER_DAY - block.timestamp;
    }

    // ------------------------------------------------------------------------
    // Metadata (fully on-chain, no external baseURI)
    // ------------------------------------------------------------------------
    /// @notice On-chain JSON metadata (base64) with an embedded SVG showing
    ///         the badge number, current streak and total check-ins.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) revert IERC721Errors.ERC721NonexistentToken(tokenId);

        string memory json = Base64.encode(
            bytes(_buildMetadataJson(tokenId, _streak[owner], _totalCheckIns[owner]))
        );
        return string.concat("data:application/json;base64,", json);
    }

    function _buildMetadataJson(uint256 tokenId, uint256 streak, uint256 total)
        internal
        pure
        returns (string memory)
    {
        // Split into small chunks: one concatenation with many arguments
        // overflows the legacy codegen stack ("stack too deep").
        string memory head = string.concat(
            '{"name":"AgentStreak Badge #',
            tokenId.toString(),
            '",',
            '"description":"Soulbound daily check-in badge for Agent ID holders on BNB Chain. Non-transferable.",',
            '"image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(_buildSvg(tokenId, streak, total))),
            '",'
        );
        string memory tail = string.concat(
            '"attributes":[{"trait_type":"Streak","value":',
            streak.toString(),
            "},",
            '{"trait_type":"Total Check-Ins","value":',
            total.toString(),
            "},",
            '{"trait_type":"Badge","value":',
            tokenId.toString(),
            "}]}"
        );
        return string.concat(head, tail);
    }

    function _buildSvg(uint256 tokenId, uint256 streak, uint256 total)
        internal
        pure
        returns (string memory)
    {
        // Split into small chunks (see _buildMetadataJson).
        string memory head = string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#0B0B1E"/>',
            '<rect x="12" y="12" width="376" height="376" rx="24" fill="none" stroke="#F0B90B" stroke-width="3"/>',
            '<text x="200" y="70" font-family="monospace" font-size="26" fill="#F0B90B" text-anchor="middle">AGENTSTREAK</text>',
            '<text x="200" y="110" font-family="monospace" font-size="15" fill="#AAAAAA" text-anchor="middle">SOULBOUND BADGE #',
            tokenId.toString(),
            "</text>"
        );
        string memory mid = string.concat(
            '<text x="200" y="210" font-family="monospace" font-size="72" fill="#FFFFFF" text-anchor="middle">',
            streak.toString(),
            "</text>",
            '<text x="200" y="245" font-family="monospace" font-size="18" fill="#AAAAAA" text-anchor="middle">DAY STREAK</text>',
            '<text x="200" y="300" font-family="monospace" font-size="18" fill="#FFFFFF" text-anchor="middle">Total check-ins: ',
            total.toString(),
            "</text>"
        );
        string memory tail =
            '<text x="200" y="350" font-family="monospace" font-size="13" fill="#666666" text-anchor="middle">BNB Chain - Agent ID gated</text></svg>';
        return string.concat(head, mid, tail);
    }
}
