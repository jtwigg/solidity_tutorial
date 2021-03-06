//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8;

import "hardhat/console.sol";

contract Auction {
    address payable public owner;
    uint256 public startBlock;
    uint256 public endBlock;

    string public ipfsHash;
    enum State {
        Started,
        Running,
        Ended,
        Canceled
    }
    State public auctionState;
    uint256 public highestBindingBid;
    address public highestBidder;

    mapping(address => uint256) public bids;
    uint256 bidIncrement;

    constructor(address payable _owner) {
        owner = _owner;
        auctionState = State.Running;
        startBlock = block.number;
        endBlock = block.number + 4; //Blocks per week.

        ipfsHash = "";
        bidIncrement = 0.1 ether;
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    modifier notOwner() {
        require(owner != msg.sender);
        _;
    }

    modifier afterStart() {
        require(block.number >= startBlock);
        _;
    }

    modifier beforeEnd() {
        require(block.number <= endBlock);
        _;
    }

    function min(uint256 l, uint256 r) internal pure returns (uint256) {
        if (l <= r) {
            return l;
        }
        return r;
    }

    function canel() public onlyOwner {
        auctionState = State.Canceled;
    }

    function finalizeAuction() public {
        require(auctionState == State.Canceled || block.number > endBlock);
        require(msg.sender == owner || bids[msg.sender] > 0);
   
        address payable recipiant = payable(msg.sender);
        uint256 value;

        if (auctionState == State.Canceled) {
            value = bids[msg.sender];
        } else {
            if (msg.sender == owner) {
                value = highestBindingBid;
            } else {
                if (msg.sender == highestBidder) {
                    value = bids[highestBidder] - highestBindingBid;
                } else {
                    value = bids[msg.sender];
                }
            }
        }
       
        bids[recipiant] = 0;
        recipiant.transfer(value);
    }

    function placeBid() public payable notOwner afterStart beforeEnd {
        require(auctionState == State.Running);
        require(msg.value >= 0.1 ether);

        uint256 currentBid = bids[msg.sender] + msg.value;
        require(currentBid > highestBindingBid || highestBindingBid == 0);
        bids[msg.sender] = currentBid;  

        if (currentBid <= bids[highestBidder]) {
            highestBindingBid = min(
                currentBid + bidIncrement,
                bids[highestBidder]
            );
        } else {
            highestBindingBid = min(
                currentBid,
                bids[highestBidder] + bidIncrement
            );
            highestBidder = msg.sender;
        }
    }
}

contract CreateAuction {
    address public immutable ownerA;
    event ContractCreated(address factory, address newAddress);
    Auction[] public deployedAuctions;

    constructor() {
        ownerA = msg.sender;
    }

    function createAuction() public returns (address newContract) {
        Auction a = new Auction(payable(msg.sender));
        deployedAuctions.push(a);
        emit ContractCreated(address(this), address(a));
        return address(a);
    }
}
