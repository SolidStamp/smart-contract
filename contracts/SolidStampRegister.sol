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

    /// @notice SolidStampRegister constructor
    /// @dev import audits from the SolidStamp v1 contract deployed to: 0x0aA7A4482780F67c6B2862Bd68CD67A83faCe355
    /// @param _existingAuditors list of existing auditors
    /// @param _existingCodeHashes list of existing code hashes
    /// @param _outcomes list of existing audit outcomes
    /// @dev each n-th element represents an existing audit conducted by _existingAuditors[n]
    /// on code hash _existingCodeHashes[n] with an outcome _outcomes[n]
    constructor(address[] _existingAuditors, bytes32[] _existingCodeHashes, bool[] _outcomes) public {
        uint noOfExistingAudits = _existingAuditors.length;
        require(noOfExistingAudits == _existingCodeHashes.length);
        require(noOfExistingAudits == _outcomes.length);

        // set contract address temporarily to owner so that registerAuditOutcome does not revert
        contractSolidStamp = msg.sender;
        for (uint i=0; i<noOfExistingAudits; i++){
            registerAuditOutcome(_existingAuditors[i], _existingCodeHashes[i], _outcomes[i]);
        }
        contractSolidStamp = 0x0;
    }

    function getAuditOutcome(address _auditor, bytes32 _codeHash) public view returns (uint8)
    {
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));
        return AuditOutcomes[hashAuditorCode];
    }

    function registerAuditOutcome(address _auditor, bytes32 _codeHash, bool _isApproved) public onlySolidStampContract
    {
        require(_auditor != 0x0);
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));
        if ( _isApproved )
            AuditOutcomes[hashAuditorCode] = AUDITED_AND_APPROVED;
        else
            AuditOutcomes[hashAuditorCode] = AUDITED_AND_REJECTED;
        emit AuditRegistered(_auditor, _codeHash, _isApproved);
    }


    event SolidStampContractChanged(address newSolidStamp);
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