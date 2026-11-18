// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title MockAgentID — TEST ONLY
/// @notice Minimal stand-in for the SPACE ID Agent ID contract, used ONLY on
///         BSC testnet and in local tests, where the official Agent ID
///         contract (0x60b9262456de011f7d15a54cdd8c48baaa8b022f) does not
///         exist. Anyone can mint a mock ID to themselves. The mock mirrors
///         the real contract's confirmed interface (balanceOf, ownerOf,
///         tokenURI) plus tokenOfOwnerByIndex for convenience — note the REAL
///         contract is NOT ERC721Enumerable, so production frontends must
///         find a holder's tokenId by scanning Transfer events.
///         NEVER use this address as the Agent ID parameter on mainnet.
contract MockAgentID {
    uint256 private _nextId = 1;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256[]) private _owned;
    mapping(address => uint256) private _balances;

    event MockMinted(address indexed to, uint256 indexed tokenId);

    function mint(address to) external returns (uint256) {
        require(to != address(0), "MockAgentID: zero address");
        uint256 id = _nextId++;
        _owners[id] = to;
        _owned[to].push(id);
        _balances[to] += 1;
        emit MockMinted(to, id);
        return id;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address o = _owners[tokenId];
        require(o != address(0), "MockAgentID: nonexistent token");
        return o;
    }

    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256)
    {
        require(
            index < _owned[owner].length,
            "MockAgentID: index out of bounds"
        );
        return _owned[owner][index];
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(
            _owners[tokenId] != address(0),
            "MockAgentID: nonexistent token"
        );
        return
            string(
                abi.encodePacked(
                    "https://mock.agent-id.local/token/",
                    _toString(tokenId)
                )
            );
    }

    function _toString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 len;
        uint256 tmp = v;
        while (tmp > 0) {
            len++;
            tmp /= 10;
        }
        bytes memory b = new bytes(len);
        while (v > 0) {
            b[--len] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(b);
    }
}
