const abi = require("ethereumjs-abi");
const crypto = require("crypto")

const randomArrayOfBytes = require("./helpers/randomArrayOfBytes.js");
const assertRevert = require("./helpers/assertRevert.js");

const SolidStampRegister = artifacts.require("SolidStampRegister");

contract('SolidStampRegister', function(accounts) {
    const eq = assert.equal.bind(assert);
    const codeHash = '0x'+crypto.randomBytes(32).toString('hex'), codeHash2arr = crypto.randomBytes(32), codeHash2 = '0x'+codeHash2arr.toString('hex');
    const reportIPFS = randomArrayOfBytes(80), reportIPFS2 = randomArrayOfBytes(80);
    const [owner, contract, auditor, auditor2, sender, sender2,  /* rest */] = accounts;

    let ssr, NOT_AUDITED, AUDITED_AND_APPROVED, AUDITED_AND_REJECTED;

    beforeEach(async function () {
        ssr = await SolidStampRegister.new({from: owner});
        NOT_AUDITED = await ssr.NOT_AUDITED();
        AUDITED_AND_APPROVED = await ssr.AUDITED_AND_APPROVED();
        AUDITED_AND_REJECTED = await ssr.AUDITED_AND_REJECTED();
        await ssr.changeSolidStampContract(contract);
    });

    describe("#getAuditOutcome", function() {
        it("should return registered audit", async function() {
            await ssr.registerAudit(auditor, codeHash, reportIPFS, false, {from: contract});
            eq((await ssr.getAuditOutcome(auditor, codeHash, {from: sender})).valueOf(), AUDITED_AND_REJECTED.valueOf(), 'Audit not registered');
        })
        it("should return NOT_AUDITED for unregistered audits", async function() {
            eq((await ssr.getAuditOutcome(auditor2, codeHash, {from: sender2})).valueOf(), NOT_AUDITED.valueOf(), 'Incorrect return for not audited contract');
        })
    });
    describe("#getAuditReportIPFS", function() {
        it("should return registered audit", async function() {
            await ssr.registerAudit(auditor, codeHash, reportIPFS, false, {from: contract});
            eq((await ssr.getAuditReportIPFS(auditor, codeHash, {from: sender})).valueOf(), web3.toHex(reportIPFS), 'Audit not registered');
        })
        it("should return 0x for unregistered audits", async function() {
            eq((await ssr.getAuditReportIPFS(auditor2, codeHash, {from: sender2})).valueOf(), "0x", 'Incorrect return for not audited contract');
        })
    });
    describe("#registerAudit", function() {
        it("should revert if called not by the SolidStamp contract", async function() {
            await assertRevert(ssr.registerAudit(auditor, codeHash2, reportIPFS, false, {from: sender}))
        })
        it("should revert if called by the owner", async function() {
            await assertRevert(ssr.registerAudit(auditor, codeHash2, reportIPFS, false, {from: owner}))
        })
        it("should revert if auditor is empty", async function() {
            await assertRevert(ssr.registerAudit(0x0, codeHash2, reportIPFS, false, {from: owner}))
        })
        it("should revert if codeHash is empty", async function() {
            await assertRevert(ssr.registerAudit(auditor, 0x0, reportIPFS, false, {from: owner}))
        })
        it("should revert if report IPFS is empty", async function() {
            await assertRevert(ssr.registerAudit(auditor, codeHash2, 0x0, false, {from: owner}))
        })
        it("should register the audit and emit event", async function() {
            result = (await ssr.registerAudit(auditor, codeHash2, reportIPFS, false, {from: contract}));
            hash2 = '0x' + abi.soliditySHA3(
                [ "address", "bytes" ],
                [ auditor, codeHash2arr ]
            ).toString('hex');
            audit = (await ssr.Audits(hash2));
            eq(audit[0].valueOf(), AUDITED_AND_REJECTED.valueOf(), 'Audit not registered (outcome)');
            eq(audit[1].valueOf(), web3.toHex(reportIPFS), 'Audit not registered (report IPFS)');
            eq(result.logs.length, 1, "Incorrect number of events");
            eq(result.logs[0].event, "AuditRegistered", "No AuditRegistered event triggered");
            eq(result.logs[0].args['auditor'], auditor, 'Wrong event data (auditor)');
            eq(result.logs[0].args['isApproved'], false, 'Wrong event data (isApproved)');
        })
        it("should revert if trying to register same audit again", async function(){
            result = (await ssr.registerAudit(auditor, codeHash2, reportIPFS, false, {from: contract}));
            await assertRevert(ssr.registerAudit(auditor, codeHash2, reportIPFS, false, {from: contract}));
        })
    });
    describe("#changeSolidStampContract", function() {
        it("should fail if not called by owner", async function() {
            await assertRevert(ssr.changeSolidStampContract(sender2, {from: sender}))
        });
        it("should fail on attempt to change address to 0x", async function() {
            await assertRevert(ssr.changeSolidStampContract(0x0, {from: owner}))
        });
        it("should change SolidStamp contract", async function() {
            result = (await ssr.changeSolidStampContract(sender2, {from: owner}));
            eq((await ssr.ContractSolidStamp()), sender2, "SolidStamp contract not changed");
            eq(result.logs.length, 1, "Incorrect number of events");
            eq(result.logs[0].event, "SolidStampContractChanged", "No SolidStampContractChanged event triggered");
            eq(result.logs[0].args['newSolidStamp'], sender2, 'Wrong event data (newSolidStamp)');
        });
    });
});
