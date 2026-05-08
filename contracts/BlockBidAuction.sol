// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BlockBid sealed-bid auction with commit-reveal
/// @notice One auction per deployment. Phases are advanced manually by the
///         auctioneer for demo control; a production deployment would gate
///         transitions on block.timestamp instead.
contract BlockBidAuction {
    enum Phase {
        Commit,
        Reveal,
        Ended
    }

    struct Bid {
        bytes32 commitment;
        uint256 deposit;
        bool revealed;
        uint256 amount;
    }

    address public immutable auctioneer;
    string public itemDescription;
    uint256 public immutable depositAmount;

    Phase public phase;
    address[] public bidders;
    mapping(address => Bid) public bids;
    mapping(address => uint256) public pendingReturns;

    address public highestBidder;
    uint256 public highestBid;

    event Committed(address indexed bidder, bytes32 commitment);
    event Revealed(address indexed bidder, uint256 amount);
    event PhaseAdvanced(Phase newPhase);
    event Won(address indexed winner, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    error NotAuctioneer();
    error WrongPhase();
    error AlreadyCommitted();
    error WrongDeposit();
    error NoCommitment();
    error AlreadyRevealed();
    error HashMismatch();
    error BidExceedsDeposit();
    error NothingToWithdraw();
    error TransferFailed();

    modifier onlyAuctioneer() {
        if (msg.sender != auctioneer) revert NotAuctioneer();
        _;
    }

    modifier inPhase(Phase expected) {
        if (phase != expected) revert WrongPhase();
        _;
    }

    constructor(string memory _itemDescription, uint256 _depositAmount) {
        auctioneer = msg.sender;
        itemDescription = _itemDescription;
        depositAmount = _depositAmount;
        phase = Phase.Commit;
    }

    /// @notice Submit a sealed bid. The commitment must equal
    ///         sha256(bid, secret, msg.sender). Including msg.sender prevents
    ///         a bidder copying another's commitment.
    function commit(bytes32 commitment) external payable inPhase(Phase.Commit) {
        if (bids[msg.sender].commitment != bytes32(0)) revert AlreadyCommitted();
        if (msg.value != depositAmount) revert WrongDeposit();

        bids[msg.sender] = Bid({
            commitment: commitment,
            deposit: msg.value,
            revealed: false,
            amount: 0
        });
        bidders.push(msg.sender);

        emit Committed(msg.sender, commitment);
    }

    /// @notice Reveal a previously committed bid. Bid must be <= deposit so
    ///         the deposit always covers the bid amount.
    function reveal(uint256 amount, bytes32 secret) external inPhase(Phase.Reveal) {
        Bid storage b = bids[msg.sender];
        if (b.commitment == bytes32(0)) revert NoCommitment();
        if (b.revealed) revert AlreadyRevealed();
        if (amount > b.deposit) revert BidExceedsDeposit();

        bytes32 expected = sha256(abi.encodePacked(amount, secret, msg.sender));
        if (expected != b.commitment) revert HashMismatch();

        b.revealed = true;
        b.amount = amount;

        if (amount > highestBid) {
            highestBid = amount;
            highestBidder = msg.sender;
        }

        emit Revealed(msg.sender, amount);
    }

    function endCommitPhase() external onlyAuctioneer inPhase(Phase.Commit) {
        phase = Phase.Reveal;
        emit PhaseAdvanced(phase);
    }

    /// @dev Loops over bidders to settle balances. Acceptable for the demo
    ///      (small N); a production system would settle in O(1) via pull-only.
    function endRevealPhase() external onlyAuctioneer inPhase(Phase.Reveal) {
        phase = Phase.Ended;

        uint256 forfeited;
        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            Bid storage b = bids[bidder];

            if (!b.revealed) {
                forfeited += b.deposit;
            } else if (bidder == highestBidder) {
                pendingReturns[bidder] = b.deposit - b.amount;
            } else {
                pendingReturns[bidder] = b.deposit;
            }
        }

        pendingReturns[auctioneer] += highestBid + forfeited;

        emit PhaseAdvanced(phase);
        emit Won(highestBidder, highestBid);
    }

    function withdraw() external inPhase(Phase.Ended) {
        uint256 amount = pendingReturns[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        pendingReturns[msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    function bidderCount() external view returns (uint256) {
        return bidders.length;
    }
}
