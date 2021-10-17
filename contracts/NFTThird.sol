pragma solidity ^0.5.0;

import "./MyNFT.sol";
import "hardhat/console.sol";

contract NFTThird is MyNFT {
    constructor(address stakingContr)
        public
        MyNFT(stakingContr, "third", "third")
    {}

    function setHashes() internal {
        _hashes.push("e");
        _hashes.push("f");
    }
}
