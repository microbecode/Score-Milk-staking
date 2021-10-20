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

    constructor(address _owner) public Owned(_owner) {}

    function setNFTAddresses(
        address nftFirst,
        address nftSecond,
        address nftThird
    ) public onlyOwner {
        require(!nftAddressesSet, "You can only set addresses once");
        _nftFirst = NFTFirst(nftFirst);
        _nftSecond = NFTSecond(nftSecond);
        _nftThird = NFTThird(nftThird);

        nftAddressesSet = true;
    }

    mapping(address => bool) private tier1Whitelist;
    mapping(address => bool) private tier2Whitelist;
    mapping(address => bool) private tier3Whitelist;
    mapping(address => bool) private tier1NFTReceived;
    mapping(address => bool) private tier2NFTReceived;
    mapping(address => bool) private tier3NFTReceived;

    function whiteList(uint8 tier, address addr) public onlyOwner {
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
        }
        if (tier2Whitelist[msg.sender] && !tier2NFTReceived[msg.sender]) {
            _nftSecond.mint(msg.sender);
            tier2NFTReceived[msg.sender] = true;
        }
        if (tier3Whitelist[msg.sender] && !tier3NFTReceived[msg.sender]) {
            _nftThird.mint(msg.sender);
            tier3NFTReceived[msg.sender] = true;
        }
    }

    public amIEligible() public view returns (bool) {
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
