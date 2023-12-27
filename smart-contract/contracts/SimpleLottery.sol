// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// There can be only 1 lottery at a time.
// Owner of this lottery should be able to start a lottery if there is no running lottery.
// To start a lottery, owner has to provide the price of the ticket, max allowed participants, winner prize
// Owner has to declare the winner once the requied number of participants has participated in the lottery.
contract SimpleLottery is Ownable {
    struct Lottery {
        uint256 id;
        uint256 maxParticipants;
        uint256 ticketPrice;
        uint256 winningAmount;
        LotteryStatus status;
        string winnerTicketId;
        uint256 ticketsSold; // number of tickets sold
    }

    enum LotteryStatus {
        NOT_STARTED,
        STARTED, // Users can participate
        CLOSED, // No more participants allowed
        WINNER_DECLARED // Winner declared, lottery can be started again
    }

    struct Ticket {
        string id;
        uint256 lotteryId;
        address owner;
    }

    uint256 public currentLotteryId;
    mapping(uint256 => Lottery) private lotteryMap;
    mapping(string => Ticket) private ticketMap;
    uint256 private seed;

    constructor() {
        seed = (block.timestamp + block.prevrandao) % 100;
    }

    event LotteryStarted(
        uint256 id,
        uint256 maxParticipants,
        uint256 ticketPrice,
        uint256 winningAmount
    );
    event TicketBought(uint256 lotteryId, string ticketId, address by);
    event LotteryFull(uint256 lotteryId);
    event WinnerDeclared(
        uint256 lotteryId,
        string ticketId,
        address owner,
        uint256 winningAmount
    );

    function start(
        uint256 _maxParticipants,
        uint256 _ticketPrice,
        uint256 _winningAmount
    ) public canStart onlyOwner returns (uint256) {
        // validate that a lottery is not active
        currentLotteryId++;
        Lottery memory lottery = Lottery({
            id: currentLotteryId,
            maxParticipants: _maxParticipants,
            ticketPrice: _ticketPrice,
            winningAmount: _winningAmount,
            status: LotteryStatus.STARTED,
            winnerTicketId: "",
            ticketsSold: 0
        });
        lotteryMap[currentLotteryId] = lottery;

        emit LotteryStarted(
            lottery.id,
            lottery.maxParticipants,
            lottery.ticketPrice,
            lottery.winningAmount
        );
        return currentLotteryId;
    }

    function buy()
        external
        payable
        buyAllowed
        returns (string memory ticketId)
    {
        // validate lottery is active
        Lottery storage lottery = lotteryMap[currentLotteryId];
        require(
            msg.value == lottery.ticketPrice,
            "Value does not equals the ticket price"
        );
        lottery.ticketsSold++;

        if (lottery.ticketsSold == lottery.maxParticipants) {
            lottery.status = LotteryStatus.CLOSED;
        }
        Ticket memory ticket = Ticket(
            getTicketId(lottery.ticketsSold),
            currentLotteryId,
            msg.sender
        );
        ticketMap[ticket.id] = ticket;

        emit TicketBought(lottery.id, ticket.id, ticket.owner);

        return ticket.id;
    }

    function getTicketId(
        uint256 _ticketNo
    ) private view returns (string memory) {
        return
            string.concat(
                Strings.toString(currentLotteryId),
                "_",
                Strings.toString(_ticketNo)
            );
    }

    function declareWinner()
        external
        onlyOwner
        isLotteryFull
        returns (string memory winner)
    {
        Lottery storage lottery = lotteryMap[currentLotteryId];
        uint256 winnerTicketNo = getRandomNumber(lottery.maxParticipants) + 1;
        lottery.winnerTicketId = getTicketId(winnerTicketNo);
        lottery.status = LotteryStatus.WINNER_DECLARED;
        address winnerAddress = ticketMap[lottery.winnerTicketId].owner;

        emit WinnerDeclared(
            lottery.id,
            lottery.winnerTicketId,
            winnerAddress,
            lottery.winningAmount
        );
        payable(winnerAddress).transfer(lottery.winningAmount);
        return lottery.winnerTicketId;
    }

    function getRandomNumber(uint256 _range) private returns (uint256) {
        seed = (seed + block.timestamp + block.prevrandao) % _range;
        return seed;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getLotteryDetails(
        uint256 _lotteryId
    )
        external
        view
        returns (
            uint256 id,
            uint256 maxParticipants,
            uint256 ticketPrice,
            uint256 winningAmount,
            string memory status,
            string memory winnerTicketId,
            uint256 ticketsSold
        )
    {
        Lottery memory lottery = lotteryMap[_lotteryId];
        return (
            lottery.id,
            lottery.maxParticipants,
            lottery.ticketPrice,
            lottery.winningAmount,
            getStatusString(lottery.status),
            lottery.winnerTicketId,
            lottery.ticketsSold
        );
    }

    function getTicketDetails(
        string calldata _ticketId
    )
        external
        view
        returns (string memory id, uint256 lotteryId, address owner)
    {
        Ticket memory ticket = ticketMap[_ticketId];
        return (ticket.id, ticket.lotteryId, ticket.owner);
    }

    function getStatusString(
        LotteryStatus _status
    ) private pure returns (string memory) {
        if (_status == LotteryStatus.NOT_STARTED) return "NOT_STARTED";
        if (_status == LotteryStatus.STARTED) return "STARTED";
        if (_status == LotteryStatus.WINNER_DECLARED) return "WINNER_DECLARED";
        if (_status == LotteryStatus.CLOSED) return "CLOSED";
        return "";
    }

    receive() external payable {}

    modifier canStart() {
        Lottery memory lottery = lotteryMap[currentLotteryId];
        require(
            lottery.status == LotteryStatus.NOT_STARTED ||
                lottery.status == LotteryStatus.WINNER_DECLARED,
            "The last lottery has not ended yet!"
        );
        _;
    }

    modifier buyAllowed() {
        Lottery memory lottery = lotteryMap[currentLotteryId];
        require(
            lottery.status == LotteryStatus.STARTED,
            "Cannot buy ticket now as the lottery is not open"
        );
        _;
    }

    modifier isLotteryFull() {
        Lottery memory lottery = lotteryMap[currentLotteryId];
        require(
            lottery.status == LotteryStatus.CLOSED,
            "Lottery has not started OR is not full OR winner is already declared!"
        );
        _;
    }
}
