// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//The mega lottery will require minimum 5 participants and the number of winners will be 3.
//There can be multiple lotteries active at a time. User can participate in any of the acive lottery. 
//The total collected ticket amount will be distributed amongst the contract and winners as follows:
        
//    1. 1st Winner - 50%
//    2. 2nd Winner - 30%
//    3. 3rd Winner - 10%
//    4. Smart contract - 10%
contract MegaLottery {

    struct Lottery {
        uint256 id;
        uint256 maxParticipants;
        uint256 ticketPrice;        
        uint256[3] winningAmount;      
        LotteryStatus status;
        string[3] winnersTicketId;
        uint256 ticketsSold;       // number of tickets sold
    }

    enum LotteryStatus {
        NOT_STARTED,    
        STARTED,            // Users can participate
        CLOSED,             // No more participants allowed
        WINNER_DECLARED           
    }

    struct Ticket {
        string id;
        uint256 lotteryId;
        address owner;
    }


    uint256 public currentLotteryId;
    mapping(uint256 => Lottery) public lotteryMap;
    mapping(string => Ticket) public ticketMap;

    constructor() {
        currentLotteryId = 0;
    }

    event LotteryStarted(uint256 id, uint256 maxParticipants, uint256 ticketPrice, uint256[3] winningAmount);
    event TicketBought(uint256 lotteryId, string ticketId, address by);
    event WinnerDeclared(uint256 lotteryId, string[3] winnerTickets, address[3] winners, uint256[3] winningAmount);
    event PrizeClaimed(address account, uint256 amount);

    /*
        About - Start a lottery
        Who can perform this action - Lottery Owner
        Event - LotteryStarted
    */
    function start(uint256 _maxParticipants, uint256 _ticketPrice) public returns (uint256) {
        return 0;
    }


    /*
        About - Buy a lottery ticket
        Who can perform this action - Anyone
        Event - TicketBought
    */
    function buy(uint256 _lotteryId) public returns (string memory ticketId) {
        return "";
    }


    /*
        About - Pick random winners
        Who can perform this action - Lottery Owner 
        Event - WinnerDeclared
    */
    function declareWinners(uint256 _lotteryId) public returns (string[3] memory winners) {
        return ["", "", ""];
    }

    /*
        About - Claim Prize
        Who can perform this action - Lottery Winners 
        Event - PrizeClaimed
    */
    function claimPrize() public returns (uint256 amountTransferred) {
        return 0; 
    }

    /*
        About - Withdraw smart contract(lottery) balance
        Who can perform this action - Lottery Owner 
    */
    function withdraw(address _ownerAddress, uint256 _amount) public {
    } 

    /*
        About - Get ticket owner address
        Who can perform this action - Anyone
    */
    function getTicketOwner(string memory _ticketId) public view returns (address) {
        return address(0);
    }

    /*
        About - Get first, second and third winner
        Who can perform this action - Anyine 
    */
    function getLotteryWinners(uint256 _lotteryId) public view returns (address[3] memory winners) {
        return [address(0), address(0), address(0)];
    }

    /*
        About - Get smart contract balance
        Who can perform this action - Anyone 
    */
    function getBalance() public view returns (uint256) {
        return 0;
    }


}