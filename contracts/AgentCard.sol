// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title AgentCard — one-shot on-chain agent card bound to an Agent ID
/// @notice Each Agent ID holder registers exactly ONCE. The card is bound to
///         the holder's SPECIFIC Agent ID token: the caller supplies the
///         tokenId and the contract verifies ownerOf(tokenId) == msg.sender.
///         That is proof of ownership of that Agent ID — strictly stronger
///         than a balanceOf gate ("holds any ID"). The tokenId, the holder's
///         public endpoint and a short message are stored on-chain, forming a
///         public directory of agents keyed by Agent ID.
///         One Agent ID = one card. Agent IDs are non-transferable and one
///         per user, so there is no farming surface by design.
///         No payments, no token, no owner, no admin powers, no pause, no
///         mint, no fund custody. The Agent ID contract address is set once
///         at deploy time and is immutable. On BNB Chain mainnet it MUST be
///         the official Agent ID contract
///         0x60b9262456de011f7d15a54cdd8c48baaa8b022f (SPACE ID Agent ID).
///         On testnet, where the official contract does not exist, deploy
///         with a MockAgentID address instead (see contracts/mocks/).
interface IAgentID {
    function balanceOf(address owner) external view returns (uint256);

    function ownerOf(uint256 tokenId) external view returns (address);
}

contract AgentCard {
    IAgentID public immutable agentId;

    uint256 public constant MAX_ENDPOINT_BYTES = 200;
    uint256 public constant MAX_MESSAGE_BYTES = 280;

    uint256 public totalCards;

    struct Card {
        uint256 tokenId;
        string endpoint;
        string message;
        uint256 registeredAt;
    }

    mapping(address => Card) public cards;
    mapping(address => bool) public hasCard;
    mapping(uint256 => address) public cardOwnerByToken;

    event CardRegistered(
        address indexed owner,
        uint256 indexed tokenId,
        string endpoint,
        string message,
        uint256 registeredAt
    );

    constructor(address _agentId) {
        require(_agentId != address(0), "AgentCard: zero Agent ID address");
        agentId = IAgentID(_agentId);
    }

    /// @notice Register your agent card, bound to your Agent ID token.
    /// @param tokenId Your Agent ID token id (verify ownership on-chain).
    /// @param endpoint Public endpoint where your agent can be reached (URL, max 200 bytes).
    /// @param message Short public message about your agent (max 280 bytes).
    function register(
        uint256 tokenId,
        string calldata endpoint,
        string calldata message
    ) external {
        require(
            agentId.balanceOf(msg.sender) > 0,
            "AgentCard: caller holds no Agent ID"
        );
        require(
            agentId.ownerOf(tokenId) == msg.sender,
            "AgentCard: not the owner of this Agent ID token"
        );
        require(!hasCard[msg.sender], "AgentCard: already registered");
        require(
            cardOwnerByToken[tokenId] == address(0),
            "AgentCard: this Agent ID already has a card"
        );
        require(
            bytes(endpoint).length <= MAX_ENDPOINT_BYTES,
            "AgentCard: endpoint too long"
        );
        require(
            bytes(message).length <= MAX_MESSAGE_BYTES,
            "AgentCard: message too long"
        );

        cards[msg.sender] = Card({
            tokenId: tokenId,
            endpoint: endpoint,
            message: message,
            registeredAt: block.timestamp
        });
        hasCard[msg.sender] = true;
        cardOwnerByToken[tokenId] = msg.sender;
        totalCards += 1;

        emit CardRegistered(
            msg.sender,
            tokenId,
            endpoint,
            message,
            block.timestamp
        );
    }

    /// @notice Full card for `owner` in one call.
    function getCard(address owner)
        external
        view
        returns (
            uint256 tokenId,
            string memory endpoint,
            string memory message,
            uint256 registeredAt
        )
    {
        Card storage c = cards[owner];
        return (c.tokenId, c.endpoint, c.message, c.registeredAt);
    }
}
