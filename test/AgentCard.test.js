const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AgentCard", function () {
  async function deployFixture() {
    const [deployer, user1, user2] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockAgentID");
    const mock = await Mock.deploy();
    const Card = await ethers.getContractFactory("AgentCard");
    const card = await Card.deploy(await mock.getAddress());
    // user1 gets token 1, user2 gets token 2
    await mock.mint(user1.address);
    await mock.mint(user2.address);
    return { mock, card, deployer, user1, user2 };
  }

  it("rejects a zero Agent ID address at deploy", async function () {
    const Card = await ethers.getContractFactory("AgentCard");
    await expect(Card.deploy(ethers.ZeroAddress)).to.be.revertedWith(
      "AgentCard: zero Agent ID address"
    );
  });

  it("registers a card bound to the caller's own token", async function () {
    const { card, user1 } = await loadFixture(deployFixture);
    await expect(
      card
        .connect(user1)
        .register(1, "https://agent.example/alice", "Alice's helper agent")
    ).to.emit(card, "CardRegistered");
  });

  it("stores the card and counts it", async function () {
    const { card, user1 } = await loadFixture(deployFixture);
    await card
      .connect(user1)
      .register(1, "https://agent.example/alice", "Alice's helper agent");
    const c = await card.getCard(user1.address);
    expect(c.tokenId).to.equal(1);
    expect(c.endpoint).to.equal("https://agent.example/alice");
    expect(c.message).to.equal("Alice's helper agent");
    expect(c.registeredAt).to.be.gt(0);
    expect(await card.hasCard(user1.address)).to.equal(true);
    expect(await card.cardOwnerByToken(1)).to.equal(user1.address);
    expect(await card.totalCards()).to.equal(1);
  });

  it("reverts when the caller holds no Agent ID", async function () {
    const { card, deployer } = await loadFixture(deployFixture);
    await expect(
      card.connect(deployer).register(1, "https://x.example", "hi")
    ).to.be.revertedWith("AgentCard: caller holds no Agent ID");
  });

  it("reverts when the token belongs to someone else", async function () {
    const { card, user1 } = await loadFixture(deployFixture);
    // token 2 belongs to user2
    await expect(
      card.connect(user1).register(2, "https://x.example", "hi")
    ).to.be.revertedWith("AgentCard: not the owner of this Agent ID token");
  });

  it("reverts on a second registration by the same address", async function () {
    const { mock, card, user1 } = await loadFixture(deployFixture);
    await mock.mint(user1.address); // user1 now also owns token 3
    await card
      .connect(user1)
      .register(1, "https://agent.example/alice", "first");
    await expect(
      card.connect(user1).register(3, "https://agent.example/alice2", "second")
    ).to.be.revertedWith("AgentCard: already registered");
  });

  it("reverts when a second address tries the same token", async function () {
    const { mock, card, user1, user2 } = await loadFixture(deployFixture);
    await card
      .connect(user1)
      .register(1, "https://agent.example/alice", "first");
    // transfer token 1 to user2 is impossible in the mock; instead user2
    // cannot pass the ownerOf check for token 1 anyway.
    await expect(
      card.connect(user2).register(1, "https://x.example", "steal")
    ).to.be.revertedWith("AgentCard: not the owner of this Agent ID token");
    expect(await mock.ownerOf(1)).to.equal(user1.address);
  });

  it("reverts on over-long endpoint or message", async function () {
    const { card, user1 } = await loadFixture(deployFixture);
    const longEndpoint = "https://x.example/" + "a".repeat(200);
    await expect(
      card.connect(user1).register(1, longEndpoint, "hi")
    ).to.be.revertedWith("AgentCard: endpoint too long");
    const longMessage = "m".repeat(281);
    await expect(
      card.connect(user1).register(1, "https://x.example", longMessage)
    ).to.be.revertedWith("AgentCard: message too long");
  });

  it("accepts exactly the max lengths", async function () {
    const { card, user1 } = await loadFixture(deployFixture);
    const endpoint = "https://x.example/" + "a".repeat(182); // 200 bytes
    const message = "m".repeat(280);
    await card.connect(user1).register(1, endpoint, message);
    expect(await card.totalCards()).to.equal(1);
  });

  it("different users register independent cards", async function () {
    const { card, user1, user2 } = await loadFixture(deployFixture);
    await card.connect(user1).register(1, "https://a.example", "alice");
    await card.connect(user2).register(2, "https://b.example", "bob");
    expect(await card.totalCards()).to.equal(2);
    expect((await card.getCard(user1.address)).tokenId).to.equal(1);
    expect((await card.getCard(user2.address)).tokenId).to.equal(2);
  });

  it("mock tokenURI resolves a metadata pointer per token", async function () {
    const { mock, user1 } = await loadFixture(deployFixture);
    expect(await mock.tokenURI(1)).to.equal(
      "https://mock.agent-id.local/token/1"
    );
    expect(await mock.tokenOfOwnerByIndex(user1.address, 0)).to.equal(1);
  });
});
