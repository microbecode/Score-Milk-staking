pragma solidity ^0.5.0;

import "./token/ERC721/ERC721Metadata.sol";
import "./token/ERC721/ERC721Burnable.sol";

contract HODLerNFT is ERC721Metadata, ERC721Burnable {
    constructor (string memory name, string memory symbol) public ERC721Metadata(name, symbol) {
        // solhint-disable-previous-line no-empty-blocks
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