import { Contract, JsonRpcProvider, ethers } from "ethers";
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
    readOnlyProvider!: JsonRpcProvider;
    signer!: ethers.JsonRpcSigner;
    walletAddress!: string;
    walletBalance!: string;
    readOnlyContractInstance!: Contract;
    writeAccessContractInstance!: Contract;
    simpleLotteryContractAddress = import.meta.env
        .VITE_LOTTERY_CONTRACT_ADDRESS;

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
        // Create read only provider. Use infura - https://polygon-mumbai.infura.io/v3/12767fe463ba4c649c1f4e9c1bc0a90d
        // Connect to polygon mumbai
    }

    async getCurrentLotteryDetails() {
        // Get current lottery details. Use the read only contract instance
        // as fetching the current lottery details is a read operation which can be done without connecting the wallet
        return {
            id: "",
            maxParticipants: 0,
            ticketPrice: 0,
            winningAmount: 0,
            status: "",
            winnerTicketId: "",
            ticketsSold: "",
        } as any;
    }

    async getLotteryId() {
        // Get current lottery id. Use the read only contract instance
        // as fetching the current lottery id is a read operation which can be done without connecting the wallet
    }

    async getOwner() {
        // Get the contract owner
        return "";
    }

    async getTicketDetails(ticketId: string) {
        // Read operation. Get ticket details.
        return {} as any;
    }

    async getSigner() {
        // Get the signer. Signer has access to do write operations. So, you need to connect the metamask wallet to get the signer
    }

    async getWriteAccessProvider() {
        // Get the provider from the metamask connection
    }

    async connectWallet() {
        // Connect to metamask and get the provider and signer. Provider and signer are required to interact with the smart contract.
    }

    async getWalletAddress() {
        // Get connected wallet address
        return "";
    }

    async getWalletBalance() {
        // Get connected wallet balance
        return "0";
    }

    isWalletConnected() {
        // check if wallet is connected
        return false;
    }

    async startLottery(
        maxParticipants: number,
        ticketPrice: number | bigint,
        winningAmount: number | bigint
    ) {
        // Starting the lottery is a write operation. So, make sure the metamask wallet is connected.
    }

    async buyTicket(ticketPrice: number) {
        // Buying a lottery ticket is a write operation. So, make sure the metamask wallet is connected.
    }

    async delcareWinner() {
        // Declaring the lottery winner is a write operation. So, make sure the metamask wallet is connected.
    }
}
