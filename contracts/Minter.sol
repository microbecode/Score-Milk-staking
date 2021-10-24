pragma solidity ^0.5.0;

import "./NFTFirst.sol";
import "./NFTSecond.sol";
import "./NFTThird.sol";
import "./Owned.sol";

contract Minter is Owned {
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

    /** @dev Sets the addresses of the three NFT contracts. Can be called only once
     */
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

    /** @dev Whitelists an address for certain tier of NFT
     * @param tier For which tier the user should be whitelisted. 1, 2 or 3.
     * @param addr Which address should be whitelisted
     */
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

    /** @dev Claims an NFT. Works only if you are whitelisted for some NFT tier
     */
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

    /** @dev Checks whether the caller is whitelisted for some NFT tier
     */
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
