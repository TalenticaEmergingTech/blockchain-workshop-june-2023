import { Contract, JsonRpcProvider, ethers } from "ethers";
import simpleLotteryAbi from "../assets/simple-lottery-abi.json";
import { BrowserProvider } from "ethers";

export class ContractServiceFactory {
  static instance: ContractService;
  static getInstance() {
    if (!ContractServiceFactory.instance) {
      ContractServiceFactory.instance = new ContractService();
    }
    return ContractServiceFactory.instance;
  }
}

class ContractService {
  writeAccessProvider!: BrowserProvider;
  // Can be used for read only operations as we are not connecting to the wallet
  readOnlyProvider: JsonRpcProvider;
  signer!: ethers.JsonRpcSigner;
  walletAddress!: string;
  walletBalance!: string;
  readOnlyContractInstance: Contract;
  writeAccessContractInstance!: Contract;
  simpleLotteryContractAddress = "0x2Db91Ea6fC4CE315581b0054668Da20E13f649E7";

  /*  Lottery =
    "(uint256 id, uint256 maxParticipants, uint256 ticketPrice, uint256 winningAmount, string memory status, string winnerTicketId, uint256 ticketsSold)";
  simpleLotteryAbi = [
    "function start(uint256 _maxParticipants, uint256 _ticketPrice, uint256 _winningAmount) public returns (uint256)",
    "function buy() public payable returns (string memory ticketId)",
    "function getTicketId(uint256 _ticketNo) private view returns (string memory)",
    "function declareWinner() public returns (string memory winner)",
    "function getBalance() public view returns (uint256)",
    "function currentLotteryId() public view returns (uint256)",
    `function getLotteryDetails(uint256 _lotteryId) public view returns(${this.Lottery} lottery)`,
  ]; */
  constructor() {
    this.readOnlyProvider = new ethers.JsonRpcProvider(
      "https://polygon-mumbai.infura.io/v3/12767fe463ba4c649c1f4e9c1bc0a90d",
      { chainId: 80001, name: "mumbai" },
      { staticNetwork: true }
    );

    this.readOnlyContractInstance = new Contract(
      this.simpleLotteryContractAddress,
      simpleLotteryAbi,
      this.readOnlyProvider
    );
  }

  async getSigner() {
    if (!this.signer) {
      await this.connectWallet();
    }
    return this.signer;
  }

  async getWriteAccessProvider() {
    if (!this.signer) {
      await this.connectWallet();
    }
    return this.signer?.provider;
  }

  async connectWallet() {
    if (window.ethereum == null) {
      console.log("MetaMask not installed;");
    } else {
      try {
        this.writeAccessProvider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.writeAccessProvider.getSigner();

        this.walletAddress = await this.signer.getAddress();
        const bal = await this.signer.provider.getBalance(
          await this.signer.getAddress()
        );
        this.writeAccessContractInstance = new Contract(
          this.simpleLotteryContractAddress,
          simpleLotteryAbi,
          this.signer
        );
        const balEth = ethers.formatUnits(bal, "ether");
        this.walletBalance = balEth.toString() + " MATIC";
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getWalletAddress() {
    if (!this.signer) {
      await this.connectWallet();
    }
    return this.walletAddress;
  }

  async getWalletBalance() {
    if (!this.signer) {
      await this.connectWallet();
    }
    return this.walletBalance;
  }

  isWalletConnected() {
    return this.walletAddress !== undefined && this.walletAddress.length > 0;
  }

  async getLotteryId() {
    const currentLotteryId =
      await this.readOnlyContractInstance.currentLotteryId();
    return currentLotteryId.toString();
  }

  async getCurrentLotteryDetails() {
    const lotteryDetails =
      await this.readOnlyContractInstance.getLotteryDetails(
        await this.getLotteryId()
      );
    return lotteryDetails;
  }

  async startLottery(
    maxParticipants: number,
    ticketPrice: number | bigint,
    winningAmount: number | bigint
  ) {
    if (!this.writeAccessProvider) {
      await this.connectWallet();
    }
    await this.writeAccessContractInstance.start(
      maxParticipants,
      ticketPrice,
      winningAmount
    );
  }

  async buyTicket(ticketPrice: number) {
    if (!this.writeAccessProvider) {
      await this.connectWallet();
    }
    await this.writeAccessContractInstance.buy({ value: ticketPrice });
  }

  async getOwner() {
    return await this.readOnlyContractInstance.owner();
  }

  async delcareWinner() {
    if (!this.writeAccessProvider) {
      await this.connectWallet();
    }
    await this.writeAccessContractInstance.declareWinner({});
  }

  async getTicketDetails(ticketId: string) {
    return await this.readOnlyContractInstance.getTicketDetails(ticketId);
  }
}
