// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// There can be only 1 lottery at a time. 
// Owner of this lottery should be able to start a lottery if there is no actively running lottery. 
// To start a lottery, owner has to provide the price of the ticket, max allowed participants, winner prize
// Owner has to declare the winner once the requied number of participants have participated in the lottery.
// Anyone should be able to check the details of the lottery and the tickets.
// This contract is importing Ownable contract. Ownable contract provides onlyOwner modifier --> https://docs.openzeppelin.com/contracts/4.x/access-control
contract SimpleLottery is Ownable {

    struct Lottery {
        uint256 id;
        uint256 maxParticipants;
        uint256 ticketPrice;        // Price is in wei( 1 eth = 1e18 wei ).
        uint256 winningAmount;      // winner will winning amount in wei
        LotteryStatus status;
        string winnerTicketId; 
        uint256 ticketsSold;       // number of tickets sold
    }

    enum LotteryStatus {
        NOT_STARTED,        // Initial state i.e. no lottery has been started  
        STARTED,            // Users can participate
        CLOSED,             // No more participants allowed
        WINNER_DECLARED     // Winner declared, lottery can be started again       
    }

    // Tickets starts with 0 for each lottery 
    struct Ticket {
        string id;          // id = lotteryId + "_" + ticketId                    
        uint256 lotteryId;
        address owner;      
    }


    uint256 public currentLotteryId;
    // Lottery id to Lottery struct map
    mapping(uint256 => Lottery) public lotteryMap;
    // Ticket id to ticket struct map
    mapping(string => Ticket) public ticketMap;
    // Used for pseudo random function
    uint256 private seed;

    constructor() {
        currentLotteryId = 0;
        seed = (block.timestamp + block.prevrandao) % 100;
    }

    // Events
    event LotteryStarted(uint256 id, uint256 maxParticipants, uint256 ticketPrice, uint256 winningAmount);
    event TicketBought(uint256 lotteryId, string ticketId, address by);
    event LotteryFull(uint256 lotteryId);
    event WinnerDeclared(uint256 lotteryId, string ticketId, address owner, uint256 winningAmount);

    // Owner should be able to start a lottery if there is no actively running lottery. 
    // Also, should be able to start a new lottery is the previous lottery winner has been declared.  
    function start(uint256 _maxParticipants, uint256 _ticketPrice, uint256 _winningAmount) public returns (uint256 lotteryId) {
        return 0;
    }

    // Anyone can buy the ticket if the current lottery is open
    // The msg.value should equal the price of the ticket.
    // Buyer will get a ticket id.
    function buy() public returns (string memory ticketId) {
        // TODO: Implement this function
        return "";
    }

    // Owner can declare the winner if the lottery has reached the required number of participants
    // Transfer the winning amount to the ticket owner
    function declareWinner() public returns (string memory winnerTicketId) {
        // TODO: Implement this function
        return "";
    }

    //E.g. for lottery no 2 and ticket no 5, ticketId = 2_5
    function getTicketId(uint256 _ticketNo) private view returns (string memory) {
        return string.concat(Strings.toString(currentLotteryId) , "_", Strings.toString(_ticketNo));
    }

    // Gets the contract balance
    function getBalance() public view returns (uint256) {
        // TODO: Implement this function
        return 0;
    }

    // This is a pseudo random number generation code. Do not use it in production
    // Refer https://docs.chain.link/getting-started/intermediates-tutorial for a production grade random function
    function getRandomNumber(uint256 _range) private returns(uint256) {
        seed = (seed + block.timestamp + block.prevrandao) % _range;
        return seed;
    }

    modifier canStart {
        Lottery memory lottery = lotteryMap[currentLotteryId];
        require(lottery.status == LotteryStatus.NOT_STARTED || lottery.status == LotteryStatus.WINNER_DECLARED, "The last lottery has not ended yet!");
        _;
    }

    modifier buyAllowed {
        Lottery memory lottery = lotteryMap[currentLotteryId];
        require(lottery.status == LotteryStatus.STARTED, "Cannot buy ticket now as the lottery is not open");
        _;
    }

    modifier isLotteryFull {
        Lottery memory lottery = lotteryMap[currentLotteryId];
        require(lottery.status == LotteryStatus.CLOSED, "Lottery is not full!");
        _;
    }

}