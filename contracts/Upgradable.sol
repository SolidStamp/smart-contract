pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract Upgradable is Ownable, Pausable {
    // Set in case the core contract is broken and an upgrade is required
    address public newContractAddress;

    /// @dev Emited when contract is upgraded - See README.md for updgrade plan
    event ContractUpgrade(address newContract);

    /// @dev Used to mark the smart contract as upgraded, in case there is a serious
    ///  breaking bug. This method does nothing but keep track of the new contract and
    ///  emit a message indicating that the new address is set. It's up to clients of this
    ///  contract to update to the new contract address in that case. (This contract will
    ///  be paused indefinitely if such an upgrade takes place.)
    /// @param _v2Address new address
    function setNewAddress(address _v2Address) external onlyOwner whenPaused {
        require(_v2Address != 0x0);
        newContractAddress = _v2Address;
        emit ContractUpgrade(_v2Address);
    }

}
