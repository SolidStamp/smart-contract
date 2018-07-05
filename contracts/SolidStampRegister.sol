pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract SolidStampRegister is Ownable
{
/// @dev address of the current SolidStamp contract which can add audits
    address public contractSolidStamp;

    /// @dev const value to indicate the contract is audited and approved
    uint8 public constant NOT_AUDITED = 0x00;

    /// @dev const value to indicate the contract is audited and approved
    uint8 public constant AUDITED_AND_APPROVED = 0x01;

    /// @dev const value to indicate the contract is audited and rejected
    uint8 public constant AUDITED_AND_REJECTED = 0x02;

    /// @dev Maps auditor and code hash to the outcome of the audit of
    /// the particular contract by the particular auditor.
    /// Map key is: keccack256(auditor address, contract codeHash)
    /// @dev codeHash is a sha3 from the contract byte code
    mapping (bytes32 => uint8) public AuditOutcomes;

    /// @dev event fired when a contract is sucessfully audited
    event AuditRegistered(address auditor, bytes32 codeHash, bool isApproved);

    function getAuditOutcome(address _auditor, bytes32 _codeHash) public view returns (uint8)
    {
        require(_auditor != 0x0);
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));
        return AuditOutcomes[hashAuditorCode];
    }

    function registerAuditOutcome(address _auditor, bytes32 _codeHash, bool _isApproved) public onlySolidStampContract
    {
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));
        if ( _isApproved )
            AuditOutcomes[hashAuditorCode] = AUDITED_AND_APPROVED;
        else
            AuditOutcomes[hashAuditorCode] = AUDITED_AND_REJECTED;
        emit AuditRegistered(_auditor, _codeHash, _isApproved);
    }


    event SolidStampContractChanged(address indexed newSolidStamp);
    /**
     * @dev Throws if called by any account other than the contractSolidStamp
     */
    modifier onlySolidStampContract() {
      require(msg.sender == contractSolidStamp);
      _;
    }

    /**
     * @dev Transfers control of the registry to a _newSolidStamp.
     * @param _newSolidStamp The address to transfer control registry to.
     */
    function changeSolidStampContract(address _newSolidStamp) public onlyOwner {
      require(_newSolidStamp != address(0));
      emit SolidStampContractChanged(_newSolidStamp);
      contractSolidStamp = _newSolidStamp;
    }

}
