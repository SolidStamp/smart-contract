const abi = require("ethereumjs-abi");

const assertRevert = require("./helpers/assertRevert.js");

const SolidStampRegister = artifacts.require("SolidStampRegister");

contract('SolidStampRegister', function(accounts) {
    const eq = assert.equal.bind(assert);
    const [owner, contract, codeHash, codeHash2, auditor, auditor2, sender, sender2, /* rest */] = accounts;

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
            await ssr.registerAuditOutcome(auditor, codeHash2, false, {from: contract});
            eq((await ssr.getAuditOutcome(auditor, codeHash2, {from: sender})).valueOf(), AUDITED_AND_REJECTED.valueOf(), 'Audit not registered');
        })
        it("should return NOT_AUDITED for unregistered audits", async function() {
            eq((await ssr.getAuditOutcome(auditor2, codeHash, {from: sender})).valueOf(), NOT_AUDITED.valueOf(), 'Incorrect return for not audited contract');
        })
    });
    describe("#registerAuditOutcome", function() {
        it("should revert if called not by the SolidStamp contract", async function() {
            await assertRevert(ssr.registerAuditOutcome(auditor, codeHash2, false, {from: sender}))
        })
        it("should revert if called by the owner", async function() {
            await assertRevert(ssr.registerAuditOutcome(auditor, codeHash2, false, {from: owner}))
        })
        it("should revert if auditor is empty", async function() {
            await assertRevert(ssr.registerAuditOutcome(0x0, codeHash2, false, {from: owner}))
        })
        it("should register the audit and emit event", async function() {
            result = (await ssr.registerAuditOutcome(auditor, codeHash2, false, {from: contract}));
            hash2 = '0x' + abi.soliditySHA3(
                [ "address", "bytes32" ],
                [ auditor, codeHash2 ]
            ).toString('hex');
            eq((await ssr.AuditOutcomes(hash2)).valueOf(), AUDITED_AND_REJECTED.valueOf(), 'Audit not registered');
            eq(result.logs.length, 1, "Incorrect number of events");
            eq(result.logs[0].event, "AuditRegistered", "No AuditRegistered event triggered");
            eq(result.logs[0].args['auditor'], auditor, 'Wrong event data (auditor)');
            eq(result.logs[0].args['isApproved'], false, 'Wrong event data (isApproved)');
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
            eq((await ssr.contractSolidStamp()), sender2, "SolidStamp contract not changed");
            eq(result.logs.length, 1, "Incorrect number of events");
            eq(result.logs[0].event, "SolidStampContractChanged", "No SolidStampContractChanged event triggered");
            eq(result.logs[0].args['newSolidStamp'], sender2, 'Wrong event data (newSolidStamp)');
        });
    });
});
