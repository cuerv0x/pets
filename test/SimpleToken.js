const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SimpleToken contract", function () {
  async function deploySimpleTokenFixture() {
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const [owner, first_address, second_address] = await ethers.getSigners();

    const simpleToken = await SimpleToken.deploy();
    await simpleToken.deployed();

    return { SimpleToken, simpleToken, owner, second_address, first_address };
  }

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      const { simpleToken, owner } = await loadFixture(
        deploySimpleTokenFixture
      );
      expect(await simpleToken.owner()).to.equal(owner.address);
    });

    it("should assign the total supply of tokens to the owner", async function () {
      const { simpleToken, owner } = await loadFixture(
        deploySimpleTokenFixture
      );
      const ownerBalance = await simpleToken.balanceOf(owner.address);
      expect(await simpleToken.owner()).to.equal(owner.address);
    });

    it("should initialize the contract correctly", async function () {
      const { simpleToken } = await loadFixture(deploySimpleTokenFixture);
      expect(await simpleToken.name()).to.equal("Mi Simple Token");
      expect(await simpleToken.symbol()).to.equal("MST");
      expect(await simpleToken.totalSupply()).to.equal(1000000);
    });
  });

  describe("Transactions", function () {
    it("should transfer tokens between accounts", async function () {
      const { simpleToken, owner, first_address, second_address } =
        await loadFixture(deploySimpleTokenFixture);

      expect(await simpleToken.balanceOf(first_address.address)).to.equal(0);
      expect(await simpleToken.balanceOf(second_address.address)).to.equal(0);

      await expect(
        simpleToken.transfer(first_address.address, 25)
      ).to.changeTokenBalances(simpleToken, [owner, first_address], [-25, 25]);

      await expect(
        simpleToken.transfer(first_address.address, 25)
      ).to.changeTokenBalances(
        simpleToken,
        [first_address, second_address],
        [-25, +25]
      );
    });

    it("should emit Transfer events", async function () {
      const { simpleToken, owner, first_address, second_address } =
        await loadFixture(deploySimpleTokenFixture);

      await expect(simpleToken.transfer(first_address.address, 25))
        .to.emit(simpleToken, "Transfer")
        .withArgs(owner.address, first_address, 25);

      await expect(
        simpleToken.connect(first_address).transfer(second_address, 25)
      )
        .to.emit(simpleToken, "Transfer")
        .withArgs(first_address.address, second_address.address, 25);
    });

    it("should fail if sender doesn't have enough tokens", async function () {
      const { simpleToken, owner, first_address } = await loadFixture(
        deploySimpleTokenFixture
      );
      const initialOwnerBalance = await simpleToken.balanceOf(owner.address);

      await expect(
        simpleToken.connect(first_address).transfer(owner.address, 1)
      ).to.be.revertedWith("No tienes suficientes tokens");

      expect(await simpleToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("should do nothing if transfer to self", async function () {
      const { simpleToken, owner } = await loadFixture(
        deploySimpleTokenFixture
      );
      await expect(
        simpleToken.transfer(owner.address, 1)
      ).to.changeTokenBalances(simpleToken, [owner], [0]);
      await expect(simpleToken.transfer(owner.address, 1)).to.not.emit(
        simpleToken,
        "Transfer"
      );
    });
  });
});
