const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ITEM = "Vintage signed first edition";
const DEPOSIT = ethers.parseEther("10");

function makeCommitment(amount, secret, address) {
  const packed = ethers.solidityPacked(
    ["uint256", "bytes32", "address"],
    [amount, secret, address],
  );
  return ethers.sha256(packed);
}

function randomSecret() {
  return ethers.hexlify(ethers.randomBytes(32));
}

async function deployFixture() {
  const [auctioneer, alice, bob, carol] = await ethers.getSigners();
  const Auction = await ethers.getContractFactory("BlockBidAuction");
  const auction = await Auction.connect(auctioneer).deploy(ITEM, DEPOSIT);
  return { auction, auctioneer, alice, bob, carol };
}

describe("BlockBidAuction", () => {
  describe("deployment", () => {
    it("stores item, deposit, auctioneer and starts in Commit phase", async () => {
      const { auction, auctioneer } = await loadFixture(deployFixture);
      expect(await auction.itemDescription()).to.equal(ITEM);
      expect(await auction.depositAmount()).to.equal(DEPOSIT);
      expect(await auction.auctioneer()).to.equal(auctioneer.address);
      expect(await auction.phase()).to.equal(0);
    });
  });

  describe("commit phase", () => {
    it("accepts a valid commit with the right deposit", async () => {
      const { auction, alice } = await loadFixture(deployFixture);
      const secret = randomSecret();
      const bid = ethers.parseEther("3");
      const commitment = makeCommitment(bid, secret, alice.address);

      await expect(auction.connect(alice).commit(commitment, { value: DEPOSIT }))
        .to.emit(auction, "Committed")
        .withArgs(alice.address, commitment);

      expect(await auction.bidderCount()).to.equal(1);
    });

    it("rejects a commit with the wrong deposit", async () => {
      const { auction, alice } = await loadFixture(deployFixture);
      const commitment = makeCommitment(1n, randomSecret(), alice.address);
      await expect(
        auction.connect(alice).commit(commitment, { value: ethers.parseEther("9") }),
      ).to.be.revertedWithCustomError(auction, "WrongDeposit");
    });

    it("rejects a second commit from the same bidder", async () => {
      const { auction, alice } = await loadFixture(deployFixture);
      const commitment = makeCommitment(1n, randomSecret(), alice.address);
      await auction.connect(alice).commit(commitment, { value: DEPOSIT });
      await expect(
        auction.connect(alice).commit(commitment, { value: DEPOSIT }),
      ).to.be.revertedWithCustomError(auction, "AlreadyCommitted");
    });

    it("rejects reveal during commit phase", async () => {
      const { auction, alice } = await loadFixture(deployFixture);
      await expect(
        auction.connect(alice).reveal(1, randomSecret()),
      ).to.be.revertedWithCustomError(auction, "WrongPhase");
    });
  });

  describe("phase transitions", () => {
    it("only the auctioneer can end the commit phase", async () => {
      const { auction, alice } = await loadFixture(deployFixture);
      await expect(
        auction.connect(alice).endCommitPhase(),
      ).to.be.revertedWithCustomError(auction, "NotAuctioneer");
    });

    it("rejects commits after commit phase ends", async () => {
      const { auction, auctioneer, alice } = await loadFixture(deployFixture);
      await auction.connect(auctioneer).endCommitPhase();
      const commitment = makeCommitment(1n, randomSecret(), alice.address);
      await expect(
        auction.connect(alice).commit(commitment, { value: DEPOSIT }),
      ).to.be.revertedWithCustomError(auction, "WrongPhase");
    });
  });

  describe("reveal phase", () => {
    async function commitFixture() {
      const f = await deployFixture();
      const aliceSecret = randomSecret();
      const aliceBid = ethers.parseEther("3");
      await f.auction
        .connect(f.alice)
        .commit(makeCommitment(aliceBid, aliceSecret, f.alice.address), { value: DEPOSIT });

      const bobSecret = randomSecret();
      const bobBid = ethers.parseEther("7");
      await f.auction
        .connect(f.bob)
        .commit(makeCommitment(bobBid, bobSecret, f.bob.address), { value: DEPOSIT });

      await f.auction.connect(f.auctioneer).endCommitPhase();

      return { ...f, aliceSecret, aliceBid, bobSecret, bobBid };
    }

    it("accepts a matching reveal and tracks the highest bid", async () => {
      const { auction, alice, aliceSecret, aliceBid } = await commitFixture();
      await expect(auction.connect(alice).reveal(aliceBid, aliceSecret))
        .to.emit(auction, "Revealed")
        .withArgs(alice.address, aliceBid);

      expect(await auction.highestBidder()).to.equal(alice.address);
      expect(await auction.highestBid()).to.equal(aliceBid);
    });

    it("rejects a reveal whose hash does not match", async () => {
      const { auction, alice, aliceBid } = await commitFixture();
      await expect(
        auction.connect(alice).reveal(aliceBid, randomSecret()),
      ).to.be.revertedWithCustomError(auction, "HashMismatch");
    });

    it("rejects a reveal that exceeds the deposit", async () => {
      const { auction, alice } = await commitFixture();
      const tooBig = DEPOSIT + 1n;
      await expect(
        auction.connect(alice).reveal(tooBig, randomSecret()),
      ).to.be.revertedWithCustomError(auction, "BidExceedsDeposit");
    });

    it("rejects a double reveal", async () => {
      const { auction, alice, aliceSecret, aliceBid } = await commitFixture();
      await auction.connect(alice).reveal(aliceBid, aliceSecret);
      await expect(
        auction.connect(alice).reveal(aliceBid, aliceSecret),
      ).to.be.revertedWithCustomError(auction, "AlreadyRevealed");
    });

    it("rejects a reveal from someone who never committed", async () => {
      const { auction, carol } = await commitFixture();
      await expect(
        auction.connect(carol).reveal(1, randomSecret()),
      ).to.be.revertedWithCustomError(auction, "NoCommitment");
    });
  });

  describe("settlement", () => {
    it("pays winner deposit minus bid; pays losers full deposit; auctioneer collects winning bid", async () => {
      const { auction, auctioneer, alice, bob, carol } = await loadFixture(deployFixture);

      const aliceBid = ethers.parseEther("3");
      const bobBid = ethers.parseEther("7");
      const carolBid = ethers.parseEther("5");
      const aliceSecret = randomSecret();
      const bobSecret = randomSecret();
      const carolSecret = randomSecret();

      await auction.connect(alice).commit(makeCommitment(aliceBid, aliceSecret, alice.address), { value: DEPOSIT });
      await auction.connect(bob).commit(makeCommitment(bobBid, bobSecret, bob.address), { value: DEPOSIT });
      await auction.connect(carol).commit(makeCommitment(carolBid, carolSecret, carol.address), { value: DEPOSIT });

      await auction.connect(auctioneer).endCommitPhase();

      await auction.connect(alice).reveal(aliceBid, aliceSecret);
      await auction.connect(bob).reveal(bobBid, bobSecret);
      await auction.connect(carol).reveal(carolBid, carolSecret);

      await expect(auction.connect(auctioneer).endRevealPhase())
        .to.emit(auction, "Won")
        .withArgs(bob.address, bobBid);

      expect(await auction.pendingReturns(alice.address)).to.equal(DEPOSIT);
      expect(await auction.pendingReturns(carol.address)).to.equal(DEPOSIT);
      expect(await auction.pendingReturns(bob.address)).to.equal(DEPOSIT - bobBid);
      expect(await auction.pendingReturns(auctioneer.address)).to.equal(bobBid);
    });

    it("forfeits non-revealer deposits to the auctioneer", async () => {
      const { auction, auctioneer, alice, bob } = await loadFixture(deployFixture);

      const aliceBid = ethers.parseEther("4");
      const bobBid = ethers.parseEther("6");
      const aliceSecret = randomSecret();
      const bobSecret = randomSecret();

      await auction.connect(alice).commit(makeCommitment(aliceBid, aliceSecret, alice.address), { value: DEPOSIT });
      await auction.connect(bob).commit(makeCommitment(bobBid, bobSecret, bob.address), { value: DEPOSIT });

      await auction.connect(auctioneer).endCommitPhase();
      // Bob never reveals.
      await auction.connect(alice).reveal(aliceBid, aliceSecret);
      await auction.connect(auctioneer).endRevealPhase();

      expect(await auction.highestBidder()).to.equal(alice.address);
      expect(await auction.pendingReturns(alice.address)).to.equal(DEPOSIT - aliceBid);
      expect(await auction.pendingReturns(bob.address)).to.equal(0);
      expect(await auction.pendingReturns(auctioneer.address)).to.equal(aliceBid + DEPOSIT);
    });

    it("transfers withdrawn balances correctly", async () => {
      const { auction, auctioneer, alice, bob } = await loadFixture(deployFixture);

      const aliceBid = ethers.parseEther("2");
      const bobBid = ethers.parseEther("8");
      const aliceSecret = randomSecret();
      const bobSecret = randomSecret();

      await auction.connect(alice).commit(makeCommitment(aliceBid, aliceSecret, alice.address), { value: DEPOSIT });
      await auction.connect(bob).commit(makeCommitment(bobBid, bobSecret, bob.address), { value: DEPOSIT });
      await auction.connect(auctioneer).endCommitPhase();
      await auction.connect(alice).reveal(aliceBid, aliceSecret);
      await auction.connect(bob).reveal(bobBid, bobSecret);
      await auction.connect(auctioneer).endRevealPhase();

      await expect(auction.connect(alice).withdraw()).to.changeEtherBalance(alice, DEPOSIT);
      await expect(auction.connect(bob).withdraw()).to.changeEtherBalance(bob, DEPOSIT - bobBid);
      await expect(auction.connect(auctioneer).withdraw()).to.changeEtherBalance(auctioneer, bobBid);
    });

    it("rejects a second withdraw", async () => {
      const { auction, auctioneer, alice } = await loadFixture(deployFixture);

      const aliceBid = ethers.parseEther("3");
      const aliceSecret = randomSecret();
      await auction.connect(alice).commit(makeCommitment(aliceBid, aliceSecret, alice.address), { value: DEPOSIT });
      await auction.connect(auctioneer).endCommitPhase();
      await auction.connect(alice).reveal(aliceBid, aliceSecret);
      await auction.connect(auctioneer).endRevealPhase();

      await auction.connect(auctioneer).withdraw();
      await expect(
        auction.connect(auctioneer).withdraw(),
      ).to.be.revertedWithCustomError(auction, "NothingToWithdraw");
    });
  });
});
