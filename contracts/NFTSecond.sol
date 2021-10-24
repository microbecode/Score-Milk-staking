pragma solidity ^0.5.0;

import "./MyNFT.sol";

contract NFTSecond is MyNFT {
    constructor(address minterContract)
        public
        MyNFT(minterContract, "second", "second")
    {
        _setBaseURI("http://second/");
    }

    function setHashes() internal {
        _hashes.push("c");
        _hashes.push("d");
    }
}
