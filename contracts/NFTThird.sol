pragma solidity ^0.5.0;

import "./MyNFT.sol";

contract NFTThird is MyNFT {
    constructor(address minterContract)
        public
        MyNFT(minterContract, "third", "third")
    {
        _setBaseURI(
            "https://gateway.pinata.cloud/ipfs/QmVEWNACYMp9DKMZWvYBXdQWVt9UjgFFtiLuyj1ibFgy5R/"
        );
    }

    function setHashes() internal {
        _hashes.push("8.json");
        _hashes.push("9.json");
        _hashes.push("10.json");
        _hashes.push("11.json");
    }
}
