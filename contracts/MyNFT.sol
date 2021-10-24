pragma solidity ^0.5.0;

import "./token/ERC721/ERC721Metadata.sol";
import "./drafts/Counters.sol";

contract MyNFT is ERC721Metadata {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address internal _minterContract;

    string[] internal _hashes;

    constructor(
        address minterContract,
        string memory name,
        string memory symbol
    ) public ERC721Metadata(name, symbol) {
        _minterContract = minterContract;

        setHashes();
    }

    function setHashes() internal;

    function mint(address receiver) public {
        require(
            msg.sender == _minterContract,
            "Only minting contract can mint"
        );

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        string memory usedHash = _hashes[((newItemId - 1) % _hashes.length)];
        _setTokenURI(newItemId, usedHash);
    }
}
