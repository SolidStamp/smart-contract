pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract SolidStampRegister is Ownable
{
/// @dev address of the current SolidStamp contract which can add audits
    address public ContractSolidStamp;

    /// @dev const value to indicate the contract is not audited
    uint8 public constant NOT_AUDITED = 0x00;

    /// @dev const value to indicate the contract is audited and approved
    uint8 public constant AUDITED_AND_APPROVED = 0x01;

    /// @dev const value to indicate the contract is audited and rejected
    uint8 public constant AUDITED_AND_REJECTED = 0x02;

    /// @dev struct representing the audit report and the audit outcome
    struct Audit {
        /// @dev AUDITED_AND_APPROVED or AUDITED_AND_REJECTED
        uint8 outcome;
        /// @dev IPFS hash of the audit report
        bytes reportIPFS;
    }

    /// @dev Maps auditor and code hash to the Audit struct.
    /// Map key is: keccack256(auditor address, contract codeHash)
    /// @dev codeHash is a sha3 from the contract byte code
    mapping (bytes32 => Audit) public Audits;

    /// @dev event fired when a contract is sucessfully audited
    event AuditRegistered(address auditor, bytes32 codeHash, bytes reportIPFS, bool isApproved);

    /// @notice SolidStampRegister constructor
    constructor() public {
    }

    /// @notice returns the outcome of the audit or NOT_AUDITED (0) if none
    function getAuditOutcome(address _auditor, bytes32 _codeHash) public view returns (uint8)
    {
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));
        return Audits[hashAuditorCode].outcome;
    }

    /// @notice returns the audit report IPFS of the audit or 0x0 if none
    function getAuditReportIPFS(address _auditor, bytes32 _codeHash) public view returns (bytes)
    {
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));
        return Audits[hashAuditorCode].reportIPFS;
    }

    function registerAudit(address _auditor, bytes32 _codeHash, bytes _reportIPFS, bool _isApproved) public onlySolidStampContract
    {
        require(_auditor != 0x0, "auditor cannot be 0x0");
        require(_codeHash != 0x0, "codeHash cannot be 0x0");
        require(_reportIPFS.length != 0x0, "report IPFS cannot be 0x0");
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));

        Audit storage audit = Audits[hashAuditorCode];
        require(audit.outcome == NOT_AUDITED, "already audited");

        if ( _isApproved )
            audit.outcome = AUDITED_AND_APPROVED;
        else
            audit.outcome = AUDITED_AND_REJECTED;
        audit.reportIPFS = _reportIPFS;
        emit AuditRegistered(_auditor, _codeHash, _reportIPFS, _isApproved);
    }

    event SolidStampContractChanged(address newSolidStamp);

    /**
     * @dev Throws if called by any account other than the contractSolidStamp
     */
    modifier onlySolidStampContract() {
      require(msg.sender == ContractSolidStamp, "cannot be run by not SolidStamp contract");
      _;
    }

    /**
     * @dev Transfers control of the registry to a _newSolidStamp.
     * @param _newSolidStamp The address to transfer control registry to.
     */
    function changeSolidStampContract(address _newSolidStamp) public onlyOwner {
      require(_newSolidStamp != address(0), "SolidStamp contract cannot be 0x0");
      emit SolidStampContractChanged(_newSolidStamp);
      ContractSolidStamp = _newSolidStamp;
    }

}
