pragma solidity ^0.5.0;

import "./MyNFT.sol";

contract NFTSecond is MyNFT {
    constructor(address minterContract)
        public
        MyNFT(minterContract, "second", "second")
    {
        _setBaseURI(
            "https://gateway.pinata.cloud/ipfs/QmVEWNACYMp9DKMZWvYBXdQWVt9UjgFFtiLuyj1ibFgy5R/"
        );
    }

    function setHashes() internal {
        _hashes.push("5.json");
        _hashes.push("6.json");
        _hashes.push("7.json");
    }
}
