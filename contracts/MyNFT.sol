pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721Metadata.sol";
import "@openzeppelin/contracts/drafts/Counters.sol";

contract MyNFT is ERC721Metadata {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address internal _minterContract;

    string[] internal _hashes;
    uint256 internal _randomizerNonce;

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

        uint256 index = uint256(
            keccak256(
                abi.encodePacked(
                    _randomizerNonce,
                    msg.sender,
                    block.difficulty,
                    block.timestamp
                )
            )
        ) % _hashes.length;
        _randomizerNonce++;

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        string memory usedHash = _hashes[index];
        _setTokenURI(newItemId, usedHash);
    }
}
