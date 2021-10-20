pragma solidity ^0.5.0;

import "./math/SafeMath.sol";
import "hardhat/console.sol";
import "./NFTFirst.sol";
import "./NFTSecond.sol";
import "./NFTThird.sol";
import "./Owned.sol";

contract Minter is Owned {
    using SafeMath for uint256;

    NFTFirst public _nftFirst;
    NFTSecond public _nftSecond;
    NFTThird public _nftThird;

    bool private nftAddressesSet = false;

    mapping(address => bool) public tier1Whitelist;
    mapping(address => bool) public tier2Whitelist;
    mapping(address => bool) public tier3Whitelist;
    mapping(address => bool) public tier1NFTReceived;
    mapping(address => bool) public tier2NFTReceived;
    mapping(address => bool) public tier3NFTReceived;

    event NFTMinted(uint8 tier, address receiver);

    constructor(address _owner) public Owned(_owner) {}

    function setNFTAddresses(
        address nftFirst,
        address nftSecond,
        address nftThird
    ) public onlyOwner {
        require(!nftAddressesSet, "You can only set NFT addresses once");
        _nftFirst = NFTFirst(nftFirst);
        _nftSecond = NFTSecond(nftSecond);
        _nftThird = NFTThird(nftThird);

        nftAddressesSet = true;
    }

    function whitelist(uint8 tier, address addr) public onlyOwner {
        if (tier == 1) {
            tier1Whitelist[addr] = true;
        }
        if (tier == 2) {
            tier2Whitelist[addr] = true;
        }
        if (tier == 3) {
            tier3Whitelist[addr] = true;
        }
    }

    function claimNFTs() public {
        if (tier1Whitelist[msg.sender] && !tier1NFTReceived[msg.sender]) {
            _nftFirst.mint(msg.sender);
            tier1NFTReceived[msg.sender] = true;
            emit NFTMinted(1, msg.sender);
        }
        if (tier2Whitelist[msg.sender] && !tier2NFTReceived[msg.sender]) {
            _nftSecond.mint(msg.sender);
            tier2NFTReceived[msg.sender] = true;
            emit NFTMinted(2, msg.sender);
        }
        if (tier3Whitelist[msg.sender] && !tier3NFTReceived[msg.sender]) {
            _nftThird.mint(msg.sender);
            tier3NFTReceived[msg.sender] = true;
            emit NFTMinted(3, msg.sender);
        }
    }

    function amIEligible() public view returns (bool) {
        if (tier1Whitelist[msg.sender] && !tier1NFTReceived[msg.sender]) {
            return true;
        }
        if (tier2Whitelist[msg.sender] && !tier2NFTReceived[msg.sender]) {
            return true;
        }
        if (tier3Whitelist[msg.sender] && !tier3NFTReceived[msg.sender]) {
            return true;
        }
        return false;
    }
}
