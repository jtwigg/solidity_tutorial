//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Cryptos is ERC20 {
    address public founder;

    constructor() ERC20("Cryptos", "CRPT") {
        founder = msg.sender;
        _mint(msg.sender, 100000);
    }
}

contract CryptosICO is Cryptos {
    address public admin;
    address payable public deposit;

    uint256 tokenPrices = 0.001 ether;

    uint256 public hardCap = 300 ether;
    uint256 public raisedAmount;

    uint256 public saleStart = block.timestamp + 3600;
    uint256 public saleEnd = block.timestamp + 604800;

    uint256 public tokenTradeStart = saleEnd + 604800;

    uint256 public maxInvestment = 5 ether;
    uint256 public minInvestment = 0.1 ether;

    enum State {
        beforeStart,
        running,
        afterEnd,
        halted
    }

    State public icoState = State.beforeStart;

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    constructor(address payable _deposit) {
        deposit = _deposit;
        admin = msg.sender;
    }

    function halt() public onlyAdmin {
        icoState = State.halted;
    }

    function resume() public onlyAdmin {
        icoState = State.running;
    }

    function changeDepositAddress(address payable newDepost) public onlyAdmin {
        deposit = newDepost;
    }

    function getCurrentState() public view returns (State) {
        if (icoState == State.halted) {
            return State.halted;
        } else if (block.timestamp < saleStart) {
            return State.beforeStart;
        } else if (block.timestamp >= saleStart && block.timestamp <= saleEnd) {
            return State.running;
        } else {
            return State.afterEnd;
        }
    }

    event Invest(address investor, uint256 value, uint256 tokens);

    function invest() public payable returns (bool) {
        require(getCurrentState() == State.running);
        require(msg.value >= minInvestment && msg.value <= maxInvestment);
        require((raisedAmount + msg.value) < hardCap);
        uint256 tokens = msg.value / tokenPrices;

        transferFrom(founder, msg.sender, tokens);
        emit Invest(msg.sender, msg.value, tokens);

        deposit.transfer(msg.value);
        return true;
    }

    receive() external payable {
        invest();
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        require(block.timestamp > tokenTradeStart);
        return ERC20.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(block.timestamp > tokenTradeStart);
        return ERC20.transferFrom(sender, recipient, amount);
    }

    function burn() public returns (bool) {
        require(getCurrentState() == State.afterEnd);
        ERC20._burn(founder, balanceOf(founder));
        return true;
    }
}
