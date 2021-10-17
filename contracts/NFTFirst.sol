pragma solidity ^0.5.0;

import "./MyNFT.sol";
import "hardhat/console.sol";

contract NFTFirst is MyNFT {
    constructor(address stakingContr)
        public
        MyNFT(stakingContr, "first", "first")
    {}

    function setHashes() internal {
        _hashes.push("a");
        _hashes.push("b");
    }
}
