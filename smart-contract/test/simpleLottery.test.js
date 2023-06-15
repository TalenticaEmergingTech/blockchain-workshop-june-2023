const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const provider = ethers.provider;

describe("Simple Lottery Tests", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, ...otherAddresses] = await ethers.getSigners();

        const SimpleLottery = await ethers.getContractFactory("SimpleLottery");
        const simpleLottery = await SimpleLottery.deploy();

        return { simpleLottery, owner, otherAddresses };
    }

    describe("Initialization Tests", function () {

        it("Should initialize the lottery id to 0", async function () {
            const { simpleLottery } = await loadFixture(deployOneYearLockFixture);

            expect(await simpleLottery.currentLotteryId()).to.equal(0);
        });

        it("Should set the right owner", async function () {
            const { simpleLottery, owner } = await loadFixture(deployOneYearLockFixture);

            expect(await simpleLottery.owner()).to.equal(owner.address);
        });

    });

    describe("Start lottery Tests", function () {

        it("Should allow only owner to start the lottery", async function () {
            const { simpleLottery, owner, otherAddresses } = await loadFixture(deployOneYearLockFixture);

            await expect(simpleLottery.connect(otherAddresses[0]).start(5, 10, 40)).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it("Should not allow to start a lottery if existing lottery status is started", async function () {
            const { simpleLottery } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(3, 10, 20);

            await expect(simpleLottery.start(5, 10, 40)).to.be.revertedWith('The last lottery has not ended yet!');
        });

        it("Should not allow to start a lottery if existing lottery status is closed and winner is not declared yet", async function () {
            const { simpleLottery, otherAddresses: otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(2, 10, 15);
            await simpleLottery.connect(otherAddresses[0]).buy({ value: 10 });
            await simpleLottery.connect(otherAddresses[1]).buy({ value: 10 });

            await expect(simpleLottery.start(5, 10, 40)).to.be.revertedWith('The last lottery has not ended yet!');
        });

        it("Should emit an event when lottery is started", async function () {
            const { simpleLottery } = await loadFixture(deployOneYearLockFixture);

            await expect(simpleLottery.start(3, 10, 20))
              .to.emit(simpleLottery, "LotteryStarted")
              .withArgs(1, 3, 10, 20);
        });
    
    });

    describe('Buy lottery Tests', function () {

        it('Should not allow to buy a ticket if the lottery has not started', async function () {
            const { simpleLottery } = await loadFixture(deployOneYearLockFixture);

            await expect(simpleLottery.buy({ value: 10 })).to.be.revertedWith('Cannot buy ticket now as the lottery is not open');
        });

        it('Should not allow to buy a ticket if the lottery has ended', async function () {
            const { simpleLottery, otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(2, 10, 15);
            await simpleLottery.connect(otherAddresses[0]).buy({ value: 10 });
            await simpleLottery.connect(otherAddresses[1]).buy({ value: 10 });

            await expect(simpleLottery.connect(otherAddresses[2]).buy({ value: 10 })).to.be.revertedWith('Cannot buy ticket now as the lottery is not open');
        });

        it('Should not allow to buy a ticket if the provided value does not match the ticket price', async function () {
            const { simpleLottery, otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(2, 10, 15);

            await expect(simpleLottery.connect(otherAddresses[0]).buy({ value: 500 })).to.be.revertedWith('Value does not equals the ticket price');
        });

        it('Should update the ether balance after buying the ticket', async function () {
            const { simpleLottery, otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(2, 10, 15);

            await expect(simpleLottery.connect(otherAddresses[0]).buy({ value: 10 })).to.changeEtherBalances(
                [otherAddresses[0], simpleLottery],
                [-10, 10]
            );
        });

        it('Should emit an event after buying the ticket', async function () {
            const { simpleLottery, otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(2, 10, 15);

            await expect(simpleLottery.connect(otherAddresses[0]).buy({ value: 10 }))
                .to.emit(simpleLottery, "TicketBought")
                .withArgs(1, "1_1", otherAddresses[0].address);
        });


    })

    describe('Declare Winner Tests', function () {

        it('Should not be allowed to pick the winner if there is no active lottery', async function () {
            const { simpleLottery } = await loadFixture(deployOneYearLockFixture);

            await expect(simpleLottery.declareWinner()).to.be.revertedWith('Lottery has not started OR is not full OR winner is already declared!');
        });

        it('Should not be allowed to pick the winner if the lottery does not have required number of participants', async function () {
            const { simpleLottery, otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(3, 10, 20);

            await simpleLottery.connect(otherAddresses[0]).buy({ value: 10 });
            await simpleLottery.connect(otherAddresses[1]).buy({ value: 10 });

            await expect(simpleLottery.declareWinner()).to.be.revertedWith('Lottery has not started OR is not full OR winner is already declared!');
        });

        it('Should not be allowed to pick the winner twice', async function () {
            const { simpleLottery, otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(2, 10, 20);

            await simpleLottery.connect(otherAddresses[0]).buy({ value: 10 });
            await simpleLottery.connect(otherAddresses[1]).buy({ value: 10 });
            await simpleLottery.declareWinner();

            await expect(simpleLottery.declareWinner()).to.be.revertedWith('Lottery has not started OR is not full OR winner is already declared!');
        });

        it('Should transfer the winning amount to the winner', async function () {
            const { simpleLottery, otherAddresses } = await loadFixture(deployOneYearLockFixture);
            await simpleLottery.start(2, 10, 20);
            await simpleLottery.connect(otherAddresses[0]).buy({ value: 10 });
            await simpleLottery.connect(otherAddresses[1]).buy({ value: 10 });

            const firstBuyerInitialBalance = await provider.getBalance(otherAddresses[0]);
            const secondBuyerInitialBalance = await provider.getBalance(otherAddresses[1]);

            await expect(simpleLottery.declareWinner()).to.changeEtherBalances([simpleLottery],[-20])
                .to
                .emit(simpleLottery, "WinnerDeclared").withArgs(1, anyValue, anyValue, 20);

            const firstBuyerUpdatedBalance = await provider.getBalance(otherAddresses[0]);
            const secondBuyerUpdatedBalance = await provider.getBalance(otherAddresses[1]);

            expect(firstBuyerUpdatedBalance == firstBuyerInitialBalance + 20n || secondBuyerUpdatedBalance == secondBuyerInitialBalance + 20n).to.be.true;
        });

    });

});
