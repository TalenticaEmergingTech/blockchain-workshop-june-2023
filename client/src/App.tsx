import { useEffect, useState } from "react";
import "./App.css";
import { ContractServiceFactory } from "./service/ContractService";
import { ethers } from "ethers";

interface Lottery {
  id: number;
  maxParticipants: number;
  ticketPrice: number;
  winningAmount: number;
  status: string;
  winnerTicketId: string;
  ticketsSold: number;
}

interface Ticket {
  id: string;
  lotteryId: number;
  owner: string;
}
function App() {
  const contractService = ContractServiceFactory.getInstance();

  const [lotteryDetails, setLotteryDetails] = useState<Lottery>();
  const [owner, setOwner] = useState("");
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticketDetails, setTicketDetails] = useState<Ticket>();
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [ticketPrice, setTicketPrice] = useState(0.1);
  const [winningAmount, setWinningAmount] = useState(0.1);

  useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    try {
      await contractService.connectWallet();
      const walletConnected = contractService.isWalletConnected();
      setConnected(walletConnected);
      if (walletConnected) {
        setWalletAddress(await contractService.getWalletAddress());
        setBalance(await contractService.getWalletBalance());
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function setCurrentLotteryDetails() {
      const _owner = await contractService.getOwner();
      setOwner(_owner);
      console.log(_owner);
      const lotteryDetails = await contractService.getCurrentLotteryDetails();
      setLotteryDetails({
        id: lotteryDetails?.id,
        maxParticipants: lotteryDetails?.maxParticipants,
        ticketPrice: lotteryDetails?.ticketPrice,
        winningAmount: lotteryDetails?.winningAmount,
        status: lotteryDetails?.status,
        winnerTicketId: lotteryDetails?.winnerTicketId,
        ticketsSold: lotteryDetails?.ticketsSold,
      });
      console.log(lotteryDetails.id);
    }
    setCurrentLotteryDetails();
  }, []);

  async function handleBuyTicket() {
    if (!lotteryDetails?.ticketPrice) {
      return;
    }
    await contractService.buyTicket(lotteryDetails?.ticketPrice);
  }

  async function handleStartLottery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("maxParticipants:", maxParticipants);
    console.log("ticketPrice:", ticketPrice);
    console.log("winningAmount:", winningAmount);
    await contractService.startLottery(
      maxParticipants,
      ethers.parseUnits(ticketPrice.toString(), "ether"),
      ethers.parseUnits(winningAmount.toString(), "ether")
    );
  }

  async function handleDeclareWinner() {
    await contractService.delcareWinner();
  }

  async function handleGetTicketDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log("TicketId is:", ticketId);
    const ticketDetails = await contractService.getTicketDetails(ticketId);
    console.log(ticketDetails);
    setTicketDetails({
      id: ticketDetails?.id,
      lotteryId: ticketDetails?.lotteryId,
      owner: ticketDetails?.owner,
    });
  }

  return (
    <>
      <header>
        <div className="flex h-16 bg-green-300 justify-center">
          <div className="w-128 text-center justify-center flex content-center">
            {!connected && (
              <button
                className="bg-sky-500 hover:bg-sky-700 h-12 w-32 rounded "
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}

            {connected && (
              <div className="flex gap-4 ">
                <div className="flex-auto grid grid-rows-2">
                  <div>{walletAddress}</div>
                  <div>{balance}</div>
                </div>
                <div className="h-12 w-32">Connected</div>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="divide-y-4 divide-slate-400/25 m-8">
        {lotteryDetails && lotteryDetails?.id !== undefined && (
          <div className="space-y-4  mx-8">
            <div className="space-y-2">
              {/* Current Lottery Details Section */}
              <div>
                <h1 className="font-extrabold text-2xl">
                  Current Lottery Details
                </h1>
                <div className="mx-8 space-y-2">
                  <p>ID: {lotteryDetails.id.toString()}</p>
                  <p>
                    Max Participants:{" "}
                    {lotteryDetails.maxParticipants.toString()}
                  </p>
                  <p>
                    Ticket Price:{" "}
                    {ethers.formatEther(lotteryDetails.ticketPrice)} MATIC
                  </p>
                  <p>
                    Winning Amount:{" "}
                    {ethers.formatEther(lotteryDetails.winningAmount)} MATIC
                  </p>
                  <p>Tickets Sold: {lotteryDetails.ticketsSold.toString()}</p>
                  <p>Status: {lotteryDetails.status.toString()}</p>
                  <p>
                    Winner Ticket Id: {lotteryDetails.winnerTicketId.toString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Buy Ticket Section */}
            {lotteryDetails.status === "STARTED" && (
              <div className="text-center">
                <button
                  className="w-32 h-16 bg-sky-500 hover:bg-sky-700 rounded"
                  onClick={handleBuyTicket}
                >
                  Buy Ticket
                </button>
              </div>
            )}

            {/* Declare Winner Section */}
            {lotteryDetails.status === "CLOSED" &&
              owner.toLowerCase() === walletAddress.toLowerCase() && (
                <div className="text-center">
                  <button
                    className="w-32 h-16 bg-sky-500 hover:bg-sky-700 rounded"
                    onClick={handleDeclareWinner}
                  >
                    Declare Winner
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Start Lottery Section */}
        {lotteryDetails &&
          (lotteryDetails.status === "NOT_STARTED" ||
            lotteryDetails.status === "WINNER_DECLARED") &&
          owner.toLowerCase() === walletAddress.toLowerCase() && (
            <form
              method="post"
              onSubmit={handleStartLottery}
              className="space-y-4  m-8"
            >
              <h1 className="font-extrabold text-2xl">Start Lottery</h1>
              <div className="flex space-x-4">
                <label htmlFor="maxParticipants" className="flex-initial w-64">
                  Max Participants
                </label>

                <input
                  inputMode="numeric"
                  type="text"
                  name="maxParticipants"
                  id="maxParticipants"
                  className="block rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                />
              </div>

              <div className="flex space-x-4">
                <label htmlFor="ticketPrice" className="flex-initial w-64">
                  Ticket Price(MATIC)
                </label>

                <input
                  type="number"
                  name="ticketPrice"
                  id="ticketPrice"
                  className="block rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                />
              </div>
              <div className="flex space-x-4">
                <label htmlFor="winningAmount" className="flex-initial w-64">
                  Winning Amount(MATIC)
                </label>

                <input
                  type="number"
                  name="winningAmount"
                  id="winningAmount"
                  className="block rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={winningAmount}
                  onChange={(e) => setWinningAmount(Number(e.target.value))}
                />
              </div>

              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Start Lottery
              </button>
            </form>
          )}

        {/* Get Ticket Details Section */}
        <div className="space-y-4  m-8">
          <div className="font-extrabold text-2xl">Get Ticket Details</div>
          <form
            method="post"
            onSubmit={handleGetTicketDetails}
            className="space-y-4"
          >
            <input
              type="text"
              name="ticketId"
              id="ticketId"
              className="w-64 block rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="1_1"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />
            <button
              type="submit"
              className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </form>

          {ticketDetails && (
            <div>
              <p>Ticket Id: {ticketDetails?.id}</p>
              <p>Lottery Id: {ticketDetails?.lotteryId?.toString()}</p>
              <p>Owner: {ticketDetails?.owner}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
