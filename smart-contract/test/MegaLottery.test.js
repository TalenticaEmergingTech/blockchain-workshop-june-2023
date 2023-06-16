const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const provider = ethers.provider;

// DO NOT MODIFY ANYTHING IN THIS FILE.
describe("Mega Lottery Tests", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const [owner, ...otherAddresses] = await ethers.getSigners();

        const MegaLottery = await ethers.getContractFactory("MegaLottery");
        const megaLottery = await MegaLottery.deploy();

        const signerMap = {};
        for (i = 0; i < 5; i++) {
            signerMap[otherAddresses[i].address] = otherAddresses[i];
        }
        return { megaLottery, owner, otherAddresses, signerMap };
    }

    describe("Initialization Tests", function () {

        it("Should initialize the lottery id to 0", async function () {
            const { megaLottery } = await loadFixture(deploy);

            expect(await megaLottery.currentLotteryId()).to.equal(0);
        });

        it("Should set the right owner", async function () {
            const { megaLottery, owner } = await loadFixture(deploy);

            expect(await megaLottery.owner()).to.equal(owner.address);
        });

    });

    describe("Start lottery Tests", function () {

        it("Should allow only owner to start the lottery", async function () {
            const { megaLottery, owner, otherAddresses } = await loadFixture(deploy);

            await expect(megaLottery.connect(otherAddresses[0]).start(5, 10)).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should not allow lottery to start with less than 5 participants', async function () {
            const { megaLottery } = await loadFixture(deploy);

            await expect(megaLottery.start(4, 10)).to.be.revertedWith('Minimum allowed participants is 5');
        });

        it("Should allow to start a lottery even if existing lottery status has started", async function () {
            const { megaLottery } = await loadFixture(deploy);
            await megaLottery.start(5, 10);

            await expect(megaLottery.start(10, 10)).not.to.be.reverted;
        });

        it("Should emit an event when lottery has started", async function () {
            const { megaLottery } = await loadFixture(deploy);

            await expect(megaLottery.start(5, 10))
                .to.emit(megaLottery, "LotteryStarted")
                .withArgs(1, 5, 10, [25, 15, 5]);
        });

    });

    describe('Buy lottery Tests', function () {

        it('Should not allow to buy a ticket if the lottery has not started', async function () {
            const { megaLottery } = await loadFixture(deploy);

            await expect(megaLottery.buy(1, { value: 10 })).to.be.revertedWith('Cannot buy ticket now as the lottery is not open');
        });

        it('Should not allow to buy a ticket if the lottery has ended', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[2]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[3]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[4]).buy(1, { value: 10 });

            await expect(megaLottery.connect(otherAddresses[5]).buy(1, { value: 10 })).to.be.revertedWith('Cannot buy ticket now as the lottery is not open');
        });

        it('Should not allow to buy a ticket if the provided value does not match the ticket price', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);

            await expect(megaLottery.connect(otherAddresses[0]).buy(1, { value: 500 })).to.be.revertedWith('Value does not equals the ticket price');
        });

        it('Should update the ether balance after buying the ticket', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);

            await expect(megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 })).to.changeEtherBalances(
                [otherAddresses[0], megaLottery],
                [-10, 10]
            );
        });

        it('Should emit an event after buying the ticket', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);

            await expect(megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 }))
                .to.emit(megaLottery, "TicketBought")
                .withArgs(1, "1_1", otherAddresses[0].address);
        });

        it('Should be able to buy a ticket of any active lottery', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.start(5, 20);

            await expect(megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 }))
                .to.emit(megaLottery, "TicketBought")
                .withArgs(1, "1_1", otherAddresses[0].address);

            await expect(megaLottery.connect(otherAddresses[0]).buy(2, { value: 20 }))
                .to.emit(megaLottery, "TicketBought")
                .withArgs(2, "2_1", otherAddresses[0].address);
        });


    })

    describe('Withdraw Lottery Balance', function () {

        it('Should not allow to withdraw amount greater than the contract balance', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });

            await expect(megaLottery.withdraw(otherAddresses[3], 50)).to.be.revertedWith('Contract does not have sufficient balance');
        });

        it('Should allow to withdraw amount less than the contract balance', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });

            await expect(megaLottery.withdraw(otherAddresses[3], 10)).to.changeEtherBalances([megaLottery], [-10]);
        });

    });

    describe('Declare Winner Tests', function () {

        it('Should not be allowed to pick the winner if there is no lottery', async function () {
            const { megaLottery } = await loadFixture(deploy);

            await expect(megaLottery.declareWinners(1)).to.be.revertedWith('Lottery has not started OR is not full OR winner is already declared!');
        });

        it('Should not be allowed to pick the winner if the lottery does not have required number of participants', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);

            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });

            await expect(megaLottery.declareWinners(1)).to.be.revertedWith('Lottery has not started OR is not full OR winner is already declared!');
        });

        it('Should not be allowed to pick the winner twice', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);

            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[2]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[3]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[4]).buy(1, { value: 10 });
            await megaLottery.declareWinners(1);

            await expect(megaLottery.declareWinners(1)).to.be.revertedWith('Lottery has not started OR is not full OR winner is already declared!');
        });

        it('Should emit an event after declaring the winners', async function () {
            const { megaLottery, otherAddresses } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[2]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[3]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[4]).buy(1, { value: 10 });

            await expect(megaLottery.declareWinners(1))
                .to
                .emit(megaLottery, "WinnerDeclared").withArgs(1, anyValue, anyValue, [25, 15, 5]);

        });

    });

    describe('Claim Prize Tests', function () {

        it('Should validate that the account is a winner of a lottery', async function () {
            const { megaLottery, otherAddresses, signerMap } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[2]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[3]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[4]).buy(1, { value: 10 });

            await megaLottery.declareWinners(1);

            await expect(megaLottery.connect(otherAddresses[6]).claimPrize()).to.be.revertedWith('You do not have any unclaimed prize!');
        });

        it('Should transfer the winning amount to the claimants', async function () {
            const { megaLottery, otherAddresses, signerMap } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[2]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[3]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[4]).buy(1, { value: 10 });

            await megaLottery.declareWinners(1);
            const winners = await megaLottery.getLotteryWinners(1);

            await expect(megaLottery.connect(signerMap[winners[0]]).claimPrize()).to.changeEtherBalances(
                [signerMap[winners[0]], megaLottery],
                [25, -25]
            ).to.emit(megaLottery, "PrizeClaimed").withArgs(winners[0], 25);

            await expect(megaLottery.connect(signerMap[winners[1]]).claimPrize()).to.changeEtherBalances(
                [signerMap[winners[1]], megaLottery],
                [15, -15]
            ).to.emit(megaLottery, "PrizeClaimed").withArgs(winners[1], 15);

            await expect(megaLottery.connect(signerMap[winners[2]]).claimPrize()).to.changeEtherBalances(
                [signerMap[winners[2]], megaLottery],
                [5, -5]
            ).to.emit(megaLottery, "PrizeClaimed").withArgs(winners[2], 5);
        });

        it('Should not allow to claim prize twice', async function () {
            const { megaLottery, otherAddresses, signerMap } = await loadFixture(deploy);
            await megaLottery.start(5, 10);
            await megaLottery.connect(otherAddresses[0]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[1]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[2]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[3]).buy(1, { value: 10 });
            await megaLottery.connect(otherAddresses[4]).buy(1, { value: 10 });

            await megaLottery.declareWinners(1);
            const winners = await megaLottery.getLotteryWinners(1);

            await expect(megaLottery.connect(signerMap[winners[0]]).claimPrize()).to.changeEtherBalances(
                [signerMap[winners[0]], megaLottery],
                [25, -25]
            );

            await expect(megaLottery.connect(signerMap[winners[0]]).claimPrize()).to.be.revertedWith('You do not have any unclaimed prize!');
        });


    });
});
