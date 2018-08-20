pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Upgradable.sol";
import "./SolidStampRegister.sol";

/// @title The main SolidStamp.com contract
contract SolidStamp is Ownable, Pausable, Upgradable {
    using SafeMath for uint;

    /// @dev const value to indicate the contract is audited and approved
    uint8 public constant NOT_AUDITED = 0x00;

    /// @dev minimum amount of time for an audit request
    uint public constant MIN_AUDIT_TIME = 24 hours;

    /// @dev maximum amount of time for an audit request
    uint public constant MAX_AUDIT_TIME = 28 days;

    /// @dev aggregated amount of audit requests
    uint public TotalRequestsAmount = 0;

    // @dev amount of collected commision available to withdraw
    uint public AvailableCommission = 0;

    // @dev commission percentage, initially 9%
    uint public Commission = 9;

    /// @dev event fired when the service commission is changed
    event NewCommission(uint commmission);

    address public SolidStampRegisterAddress;

    /// @notice SolidStamp constructor
    constructor(address _addressRegistrySolidStamp) public {
        SolidStampRegisterAddress = _addressRegistrySolidStamp;
    }

    /// @notice Audit request
    struct AuditRequest {
        // amount of Ethers offered by a particular requestor for an audit
        uint amount;
        // request expiration date
        uint expireDate;
    }

    /// @dev Maps auditor and code hash to the total reward offered for auditing
    /// the particular contract by the particular auditor.
    /// Map key is: keccack256(auditor address, contract codeHash)
    /// @dev codeHash is a sha3 from the contract byte code
    mapping (bytes32 => uint) public Rewards;

    /// @dev Maps requestor, auditor and codeHash to an AuditRequest
    /// Map key is: keccack256(auditor address, requestor address, contract codeHash)
    mapping (bytes32 => AuditRequest) public AuditRequests;

    /// @dev event fired upon successul audit request
    event AuditRequested(address auditor, address bidder, bytes32 codeHash, uint amount, uint expireDate);
    /// @dev event fired when an request is sucessfully withdrawn
    event RequestWithdrawn(address auditor, address bidder, bytes32 codeHash, uint amount);
    /// @dev event fired when a contract is sucessfully audited
    event ContractAudited(address auditor, bytes32 codeHash, bytes reportIPFS, bool isApproved, uint reward);

    /// @notice registers an audit request
    /// @param _auditor the address of the auditor the request is directed to
    /// @param _codeHash the code hash of the contract to audit. _codeHash equals to sha3 of the contract byte-code
    /// @param _auditTime the amount of time after which the requestor can withdraw the request
    function requestAudit(address _auditor, bytes32 _codeHash, uint _auditTime)
    public whenNotPaused payable
    {
        require(_auditor != 0x0, "_auditor cannot be 0x0");
        // audit request cannot expire too quickly or last too long
        require(_auditTime >= MIN_AUDIT_TIME, "_auditTime should be >= MIN_AUDIT_TIME");
        require(_auditTime <= MAX_AUDIT_TIME, "_auditTime should be <= MIN_AUDIT_TIME");
        require(msg.value > 0, "msg.value should be >0");

        // revert if the contract is already audited by the auditor
        uint8 outcome = SolidStampRegister(SolidStampRegisterAddress).getAuditOutcome(_auditor, _codeHash);
        require(outcome == NOT_AUDITED, "contract already audited");

        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));
        uint currentReward = Rewards[hashAuditorCode];
        uint expireDate = now.add(_auditTime);
        Rewards[hashAuditorCode] = currentReward.add(msg.value);
        TotalRequestsAmount = TotalRequestsAmount.add(msg.value);

        bytes32 hashAuditorRequestorCode = keccak256(abi.encodePacked(_auditor, msg.sender, _codeHash));
        AuditRequest storage request = AuditRequests[hashAuditorRequestorCode];
        if ( request.amount == 0 ) {
            // first request from msg.sender to audit contract _codeHash by _auditor
            AuditRequests[hashAuditorRequestorCode] = AuditRequest({
                amount : msg.value,
                expireDate : expireDate
            });
            emit AuditRequested(_auditor, msg.sender, _codeHash, msg.value, expireDate);
        } else {
            // Request already exists. Increasing value
            request.amount = request.amount.add(msg.value);
            // if new expireDate is later than existing one - increase the existing one
            if ( expireDate > request.expireDate )
                request.expireDate = expireDate;
            // event returns the total request value and its expireDate
            emit AuditRequested(_auditor, msg.sender, _codeHash, request.amount, request.expireDate);
        }
    }

    /// @notice withdraws an audit request
    /// @param _auditor the address of the auditor the request is directed to
    /// @param _codeHash the code hash of the contract to audit. _codeHash equals to sha3 of the contract byte-code
    function withdrawRequest(address _auditor, bytes32 _codeHash)
    public
    {
        bytes32 hashAuditorCode = keccak256(abi.encodePacked(_auditor, _codeHash));

        // revert if the contract is already audited by the auditor
        uint8 outcome = SolidStampRegister(SolidStampRegisterAddress).getAuditOutcome(_auditor, _codeHash);
        require(outcome == NOT_AUDITED, "contract already audited");

        bytes32 hashAuditorRequestorCode = keccak256(abi.encodePacked(_auditor, msg.sender, _codeHash));
        AuditRequest storage request = AuditRequests[hashAuditorRequestorCode];
        require(request.amount > 0, "nothing to withdraw");
        require(now > request.expireDate, "cannot withdraw before request.expireDate");

        uint amount = request.amount;
        delete request.amount;
        delete request.expireDate;
        Rewards[hashAuditorCode] = Rewards[hashAuditorCode].sub(amount);
        TotalRequestsAmount = TotalRequestsAmount.sub(amount);
        emit RequestWithdrawn(_auditor, msg.sender, _codeHash, amount);
        msg.sender.transfer(amount);
    }

    /// @notice marks contract as audited
    /// @param _codeHash the code hash of the stamped contract. _codeHash equals to sha3 of the contract byte-code
    /// @param _reportIPFS IPFS hash of the audit report
    /// @param _isApproved whether the contract is approved or rejected
    function auditContract(bytes32 _codeHash, bytes _reportIPFS, bool _isApproved)
    public whenNotPaused
    {
        // revert if the contract is already audited by the auditor
        uint8 outcome = SolidStampRegister(SolidStampRegisterAddress).getAuditOutcome(msg.sender, _codeHash);
        require(outcome == NOT_AUDITED, "contract already audited");

        SolidStampRegister(SolidStampRegisterAddress).registerAudit(msg.sender, _codeHash, _reportIPFS, _isApproved);

        bytes32 hashAuditorCode = keccak256(abi.encodePacked(msg.sender, _codeHash));
        uint reward = Rewards[hashAuditorCode];
        TotalRequestsAmount = TotalRequestsAmount.sub(reward);
        uint commissionKept = calcCommission(reward);
        AvailableCommission = AvailableCommission.add(commissionKept);
        emit ContractAudited(msg.sender, _codeHash, _reportIPFS, _isApproved, reward);
        msg.sender.transfer(reward.sub(commissionKept));
    }

    /// @notice marks multiple contracts as audited
    /// @param _codeHashes the code hashes of the stamped contracts. each _codeHash equals to sha3 of the contract byte-code
    /// @param _reportIPFS IPFS hash of the audit report
    /// @param _isApproved whether the contracts are approved or rejected
    function auditContracts(bytes32[] _codeHashes, bytes _reportIPFS, bool _isApproved)
    public whenNotPaused
    {
        for(uint i=0; i<_codeHashes.length; i++ )
        {
            auditContract(_codeHashes[i], _reportIPFS, _isApproved);
        }
    }

    /// @dev const value to indicate the maximum commision service owner can set
    uint public constant MAX_COMMISSION = 33;

    /// @notice ability for owner to change the service commmission
    /// @param _newCommission new commision percentage
    function changeCommission(uint _newCommission) public onlyOwner whenNotPaused {
        require(_newCommission <= MAX_COMMISSION, "commission should be <= MAX_COMMISSION");
        require(_newCommission != Commission, "_newCommission==Commmission");
        Commission = _newCommission;
        emit NewCommission(Commission);
    }

    /// @notice calculates the SolidStamp commmission
    /// @param _amount amount to calcuate the commission from
    function calcCommission(uint _amount) private view returns(uint) {
        return _amount.mul(Commission)/100; // service commision
    }

    /// @notice ability for owner to withdraw the commission
    /// @param _amount amount to withdraw
    function withdrawCommission(uint _amount) public onlyOwner {
        // cannot withdraw money reserved for requests
        require(_amount <= AvailableCommission, "Cannot withdraw more than available");
        AvailableCommission = AvailableCommission.sub(_amount);
        msg.sender.transfer(_amount);
    }

    /// @dev Override unpause so we can't have newContractAddress set,
    ///  because then the contract was upgraded.
    /// @notice This is public rather than external so we can call super.unpause
    ///  without using an expensive CALL.
    function unpause() public onlyOwner whenPaused {
        require(newContractAddress == address(0), "new contract cannot be 0x0");

        // Actually unpause the contract.
        super.unpause();
    }

    /// @notice We don't welcome tips & donations
    function() payable public {
        revert();
    }
}
