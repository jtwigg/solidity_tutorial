//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8;

import "hardhat/console.sol";

contract Crowdfunding {
    event RequestCreated(uint256 numRequests);
    mapping(address => uint256) public contributors;
    address public admin;
    uint256 public noOfContributors;
    uint256 public minimumContributions;
    uint256 public deadline; //timestamp
    uint256 public goal;
    uint256 public raisedAmount;

    struct Request {
        string description;
        address payable recipiant;
        uint256 value;
        bool completed;
        uint256 noOfVoters;
        mapping(address => bool) voters;
    }

    mapping(uint256 => Request) public requests;
    uint256 public numRequests;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin can call this function");
        _;
    }

    constructor(uint256 _goal, uint256 _deadline) {
        goal = _goal;
        deadline = block.timestamp + _deadline;
        minimumContributions = 100;
        admin = msg.sender;
    }

    receive() external payable {
        contribute();
    }

    modifier notAdmin() {
        require(admin != msg.sender);
        _;
    }

    function contribute() public payable {
        require(block.timestamp < deadline, "Deadline has passed");
        require(msg.value > minimumContributions);

        if (contributors[msg.sender] == 0x0) {
            noOfContributors++;
        }

        contributors[msg.sender] += msg.value;
        raisedAmount += msg.value;
    }

    function refund() public payable {
        require(block.timestamp >= deadline && raisedAmount < goal);
        require(contributors[msg.sender] > 0);

        payable(msg.sender).transfer(contributors[msg.sender]);
        contributors[msg.sender] = 0;
    }

    function createRequest(
        string memory _description,
        address payable _recipient,
        uint256 _value
    ) public onlyAdmin returns (uint256) {
        uint256 requestID = numRequests;
        Request storage newRequest = requests[numRequests++];
        newRequest.description = _description;
        newRequest.recipiant = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.noOfVoters = 0;

        emit RequestCreated(requestID);
        return requestID;
    }

    function vote(uint256 requestNumber) public {
        require(
            contributors[msg.sender] > 0,
            "You must be a contributor to vote!"
        );

        Request storage thisRequest = requests[requestNumber];

        require(
            thisRequest.voters[msg.sender] == false,
            "You have already voted"
        );
        thisRequest.voters[msg.sender] = true;
        thisRequest.noOfVoters++;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
