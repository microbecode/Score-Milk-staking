pragma solidity ^0.5.0;

import "./MyNFT.sol";

contract NFTFirst is MyNFT {
    constructor(address minterContract)
        public
        MyNFT(minterContract, "first", "first")
    {
        _setBaseURI(
            "https://gateway.pinata.cloud/ipfs/QmVEWNACYMp9DKMZWvYBXdQWVt9UjgFFtiLuyj1ibFgy5R/"
        );
    }

    function setHashes() internal {
        _hashes.push("1.json");
        _hashes.push("2.json");
        _hashes.push("3.json");
        _hashes.push("4.json");
    }
}
