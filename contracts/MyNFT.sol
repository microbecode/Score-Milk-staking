pragma solidity ^0.5.0;

import "./token/ERC721/ERC721Metadata.sol";
import "./drafts/Counters.sol";
import "hardhat/console.sol";

//import "./token/ERC721/ERC721Burnable.sol";

contract MyNFT is ERC721Metadata {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address internal _stakingContr;

    string[] internal _hashes;

    constructor(
        address stakingContr,
        string memory name,
        string memory symbol
    ) public ERC721Metadata(name, symbol) {
        _stakingContr = stakingContr;
        _setBaseURI("http://blah/");

        setHashes();
    }

    function setHashes() internal;

    function mint(address receiver) public {
        require(msg.sender == _stakingContr, "Only staking contract can mint");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        string memory usedHash = _hashes[((newItemId - 1) % _hashes.length)];
        console.log("minting with hash %s", usedHash);
        _setTokenURI(newItemId, usedHash);
    }
}
