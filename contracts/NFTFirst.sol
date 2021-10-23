pragma solidity ^0.5.0;

import "./MyNFT.sol";

contract NFTFirst is MyNFT {
    constructor(address minterContract)
        public
        MyNFT(minterContract, "first", "first")
    {}

    function setHashes() internal {
        _hashes.push("a");
        _hashes.push("b");
    }
}
