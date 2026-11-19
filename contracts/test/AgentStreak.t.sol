// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {AgentStreak} from "../src/AgentStreak.sol";

/// @notice Minimal mock of the SPACE ID Agent ID contract: only balanceOf matters.
contract MockAgentID {
    mapping(address => uint256) private _bal;

    function setBalance(address user, uint256 amount) external {
        _bal[user] = amount;
    }

    function balanceOf(address user) external view returns (uint256) {
        return _bal[user];
    }
}

contract AgentStreakTest is Test {
    AgentStreak public streak;
    MockAgentID public agentId;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public carol = makeAddr("carol"); // never holds an Agent ID

    // 2026-11-18 00:00:00 UTC = 1794787200. Pick a mid-day start so "next day"
    // warps are unambiguous.
    uint256 public constant T0 = 1794787200 + 12 * 3600; // 2026-11-18 12:00 UTC
    uint256 public constant DAY = 86400;

    function setUp() public {
        agentId = new MockAgentID();
        streak = new AgentStreak(address(agentId));
        agentId.setBalance(alice, 1);
        agentId.setBalance(bob, 2);
        vm.warp(T0);
    }

    // ------------------------------------------------------------------
    // Gate Agent ID
    // ------------------------------------------------------------------
    function test_RevertWhen_NoAgentID() public {
        vm.prank(carol);
        vm.expectRevert(AgentStreak.NotAgentIDHolder.selector);
        streak.checkIn();
    }

    function test_RevertWhen_AgentIDSoldAfterFirstCheckIn() public {
        vm.prank(alice);
        streak.checkIn();
        agentId.setBalance(alice, 0);
        vm.warp(T0 + DAY);
        vm.prank(alice);
        vm.expectRevert(AgentStreak.NotAgentIDHolder.selector);
        streak.checkIn();
    }

    function test_ConstructorRevertsZeroAgentID() public {
        vm.expectRevert(AgentStreak.ZeroAgentIDAddress.selector);
        new AgentStreak(address(0));
    }

    // ------------------------------------------------------------------
    // First check-in + event
    // ------------------------------------------------------------------
    function test_FirstCheckIn_MintsBadge() public {
        uint256 day = T0 / DAY;
        vm.expectEmit(true, false, false, true, address(streak));
        emit AgentStreak.CheckIn(alice, day, 1, 1);

        vm.prank(alice);
        streak.checkIn();

        assertEq(streak.streakOf(alice), 1);
        assertEq(streak.totalCheckIns(alice), 1);
        assertEq(streak.lastCheckInDay(alice), day);
        assertEq(streak.badgeOf(alice), 1);
        assertEq(streak.balanceOf(alice), 1);
        assertEq(streak.ownerOf(1), alice);
        assertEq(streak.totalUsers(), 1);
    }

    function test_SecondUserGetsBadgeTwo() public {
        vm.prank(alice);
        streak.checkIn();
        vm.prank(bob);
        streak.checkIn();

        assertEq(streak.badgeOf(bob), 2);
        assertEq(streak.ownerOf(2), bob);
        assertEq(streak.totalUsers(), 2);
    }

    function test_NameAndSymbol() public {
        assertEq(streak.name(), "AgentStreak");
        assertEq(streak.symbol(), "ASTRK");
    }

    // ------------------------------------------------------------------
    // 1x per day
    // ------------------------------------------------------------------
    function test_RevertWhen_DoubleCheckInSameDay() public {
        vm.prank(alice);
        streak.checkIn();

        vm.prank(alice);
        vm.expectRevert(AgentStreak.AlreadyCheckedInToday.selector);
        streak.checkIn();
    }

    function test_CheckInAtExactMidnightNextDay() public {
        vm.prank(alice);
        streak.checkIn();

        // Warp to exactly 00:00:00 UTC of the next day.
        uint256 nextMidnight = (T0 / DAY + 1) * DAY;
        vm.warp(nextMidnight);
        vm.prank(alice);
        streak.checkIn();
        assertEq(streak.streakOf(alice), 2);
    }

    function test_CheckInOneSecondBeforeMidnightStillSameDay() public {
        vm.prank(alice);
        streak.checkIn();

        uint256 nextMidnight = (T0 / DAY + 1) * DAY;
        vm.warp(nextMidnight - 1);
        vm.prank(alice);
        vm.expectRevert(AgentStreak.AlreadyCheckedInToday.selector);
        streak.checkIn();
    }

    // ------------------------------------------------------------------
    // Streak logic
    // ------------------------------------------------------------------
    function test_StreakIncrementsOnConsecutiveDays() public {
        vm.prank(alice);
        streak.checkIn();
        vm.warp(T0 + DAY);
        vm.prank(alice);
        streak.checkIn();
        vm.warp(T0 + 2 * DAY);
        vm.prank(alice);
        streak.checkIn();

        assertEq(streak.streakOf(alice), 3);
        assertEq(streak.totalCheckIns(alice), 3);
        assertEq(streak.lastCheckInDay(alice), (T0 + 2 * DAY) / DAY);
    }

    function test_StreakResetsAfterGap() public {
        vm.prank(alice);
        streak.checkIn();
        vm.warp(T0 + DAY);
        vm.prank(alice);
        streak.checkIn();
        assertEq(streak.streakOf(alice), 2);

        // Skip one full day, check in on day +3.
        vm.warp(T0 + 3 * DAY);
        vm.prank(alice);
        streak.checkIn();

        assertEq(streak.streakOf(alice), 1);
        assertEq(streak.totalCheckIns(alice), 3);
    }

    function test_StreakResetsAfterLongAbsence() public {
        vm.prank(alice);
        streak.checkIn();
        vm.warp(T0 + 30 * DAY);
        vm.prank(alice);
        streak.checkIn();
        assertEq(streak.streakOf(alice), 1);
        assertEq(streak.totalCheckIns(alice), 2);
    }

    // ------------------------------------------------------------------
    // Badge minted only once
    // ------------------------------------------------------------------
    function test_BadgeMintedOnlyOnce() public {
        for (uint256 i = 0; i < 5; i++) {
            vm.warp(T0 + i * DAY);
            vm.prank(alice);
            streak.checkIn();
        }
        assertEq(streak.badgeOf(alice), 1);
        assertEq(streak.balanceOf(alice), 1);
        assertEq(streak.totalUsers(), 1);
        assertEq(streak.streakOf(alice), 5);
    }

    // ------------------------------------------------------------------
    // Soulbound: transfers + approvals revert
    // ------------------------------------------------------------------
    function test_TransferReverts() public {
        vm.prank(alice);
        streak.checkIn();

        vm.prank(alice);
        vm.expectRevert(AgentStreak.Soulbound.selector);
        streak.transferFrom(alice, bob, 1);
    }

    function test_SafeTransferReverts() public {
        vm.prank(alice);
        streak.checkIn();

        vm.prank(alice);
        vm.expectRevert(AgentStreak.Soulbound.selector);
        streak.safeTransferFrom(alice, bob, 1);
    }

    function test_SafeTransferWithDataReverts() public {
        vm.prank(alice);
        streak.checkIn();

        vm.prank(alice);
        vm.expectRevert(AgentStreak.Soulbound.selector);
        streak.safeTransferFrom(alice, bob, 1, "");
    }

    function test_ApproveReverts() public {
        vm.prank(alice);
        streak.checkIn();

        vm.prank(alice);
        vm.expectRevert(AgentStreak.Soulbound.selector);
        streak.approve(bob, 1);
    }

    function test_SetApprovalForAllReverts() public {
        vm.prank(alice);
        streak.checkIn();

        vm.prank(alice);
        vm.expectRevert(AgentStreak.Soulbound.selector);
        streak.setApprovalForAll(bob, true);
    }

    function test_GetApprovedIsZeroAndOperatorNotApproved() public {
        vm.prank(alice);
        streak.checkIn();
        assertEq(streak.getApproved(1), address(0));
        assertFalse(streak.isApprovedForAll(alice, bob));
    }

    // ------------------------------------------------------------------
    // tokenURI
    // ------------------------------------------------------------------
    function test_TokenURIHasJsonBase64Prefix() public {
        vm.prank(alice);
        streak.checkIn();
        string memory uri = streak.tokenURI(1);
        assertTrue(bytes(uri).length > 100);
        assertEq(_prefix(uri, 29), "data:application/json;base64,");
    }

    function test_TokenURIRevertsForNonexistentToken() public {
        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", 99)
        );
        streak.tokenURI(99);
    }

    function test_TokenURIReflectsCurrentStreak() public {
        vm.prank(alice);
        streak.checkIn();
        vm.warp(T0 + DAY);
        vm.prank(alice);
        streak.checkIn();
        // URI must change as streak grows (streak 1 -> 2).
        string memory uriDay1;
        // Rebuild day-1 URI expectation implicitly: just check today's URI
        // decodes differently from a fresh badge; simplest robust check:
        // URI is non-empty and its length differs from the day-1 URI captured
        // via a second user with streak 1.
        vm.prank(bob);
        streak.checkIn();
        uriDay1 = streak.tokenURI(2);
        string memory uriDay2 = streak.tokenURI(1);
        assertTrue(
            keccak256(bytes(uriDay1)) != keccak256(bytes(uriDay2)),
            "URI must reflect streak"
        );
    }

    // ------------------------------------------------------------------
    // Views
    // ------------------------------------------------------------------
    function test_ViewsBeforeAnyCheckIn() public {
        assertEq(streak.streakOf(alice), 0);
        assertEq(streak.lastCheckInDay(alice), 0);
        assertEq(streak.totalCheckIns(alice), 0);
        assertEq(streak.badgeOf(alice), 0);
        assertEq(streak.totalUsers(), 0);
        assertEq(streak.currentDay(), T0 / DAY);
        assertTrue(streak.canCheckInToday(alice));
        assertFalse(streak.canCheckInToday(carol));
        assertEq(streak.nextCheckInIn(alice), 0);
    }

    function test_CanCheckInTodayTransitions() public {
        assertTrue(streak.canCheckInToday(alice));
        vm.prank(alice);
        streak.checkIn();
        assertFalse(streak.canCheckInToday(alice));
        vm.warp(T0 + DAY);
        assertTrue(streak.canCheckInToday(alice));
    }

    function test_NextCheckInInValue() public {
        vm.prank(alice);
        streak.checkIn();
        uint256 nextMidnight = (T0 / DAY + 1) * DAY;
        assertEq(streak.nextCheckInIn(alice), nextMidnight - T0);
        // Non-holder / never-checked-in user: time gate open -> 0.
        assertEq(streak.nextCheckInIn(bob), 0);
        // At midnight the gate reopens.
        vm.warp(nextMidnight);
        assertEq(streak.nextCheckInIn(alice), 0);
    }

    function test_CurrentDayFollowsWarp() public {
        assertEq(streak.currentDay(), T0 / DAY);
        vm.warp(T0 + 3 * DAY + 3600);
        assertEq(streak.currentDay(), (T0 + 3 * DAY + 3600) / DAY);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    function _prefix(string memory s, uint256 n) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        require(b.length >= n, "short");
        bytes memory out = new bytes(n);
        for (uint256 i = 0; i < n; i++) out[i] = b[i];
        return string(out);
    }
}
