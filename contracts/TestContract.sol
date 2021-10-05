//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8;
pragma experimental ABIEncoderV2;

contract Test {
    event TestEvent(address sender, string message);

    function test() public {
        emit TestEvent(msg.sender, "test Message!");
    }
}
