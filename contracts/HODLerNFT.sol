pragma solidity ^0.5.0;

import "./token/ERC721/ERC721Metadata.sol";
import "./drafts/Counters.sol";
import "hardhat/console.sol";

//import "./token/ERC721/ERC721Burnable.sol";

contract HODLerNFT is ERC721Metadata {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private _stakingContr;

    string[] private _hashes;

    constructor(address stakingContr) public ERC721Metadata("a", "b") {
        _stakingContr = stakingContr;
        _setBaseURI("http://blah/");

        _hashes.push("a");
        _hashes.push("b");
    }

    function mint(address receiver) public {
        require(msg.sender == _stakingContr, "Only staking contract can mint");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        string memory usedHash = _hashes[newItemId % _hashes.length];
        console.log("minting with hash %s", usedHash);
        _setTokenURI(newItemId, usedHash);
    }

    /*     function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory uri) public {
        _setTokenURI(tokenId, uri);
    }

    function setBaseURI(string memory baseURI) public {
        _setBaseURI(baseURI);
    } */
}
