//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8;

contract IOU {
    address public owner;
    mapping(address => uint256) public debts;

    constructor() {
        owner = msg.sender;
    }

    function queue(address payable other) public payable {
        require(msg.sender == owner);
        require(msg.value != 0);
        
        debts[other] += debts[other] + msg.value;
    }

    function withdraw() public payable {
        require(debts[msg.sender] != 0);
        uint256 debt = debts[msg.sender];
        payable(msg.sender).transfer(debt);
    }
}
