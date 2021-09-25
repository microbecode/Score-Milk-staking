pragma solidity ^0.5.0;

import "./MyNFT.sol";
import "hardhat/console.sol";

contract HODLerNFT is MyNFT {
    constructor(address stakingContr) public MyNFT(stakingContr, "a", "b") {}

    function setHashes() internal {
        _hashes.push("a");
        _hashes.push("b");
    }
}
