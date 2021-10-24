pragma solidity ^0.5.0;

import "./MyNFT.sol";

contract NFTThird is MyNFT {
    constructor(address minterContract)
        public
        MyNFT(minterContract, "third", "third")
    {
        _setBaseURI("http://third/");
    }

    function setHashes() internal {
        _hashes.push("e");
        _hashes.push("f");
    }
}
