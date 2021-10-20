pragma solidity ^0.5.0;

import "./MyNFT.sol";
import "hardhat/console.sol";

contract NFTSecond is MyNFT {
    constructor(address minterContract)
        public
        MyNFT(minterContract, "second", "second")
    {}

    function setHashes() internal {
        _hashes.push("c");
        _hashes.push("d");
    }
}
