const abi = require("ethereumjs-abi");

const assertRevert = require("./helpers/assertRevert.js");
const increaseTime = require("./helpers/increaseTime");

const SolidStamp = artifacts.require("SolidStamp");

contract('SolidStamp', function(accounts) {
    const eq = assert.equal.bind(assert);
    const [owner, codeHash, auditor, sender2, sender, /* rest */] = accounts;
    const AUDIT_TIME = 60*60*24*2; // 2 days

    let ss;

    beforeEach(async function () {
        ss = await SolidStamp.new({from: owner});
        hash2 = '0x' + abi.soliditySHA3(
            [ "address", "bytes32" ],
            [ auditor, codeHash ]
        ).toString('hex');
        hash3 = '0x' + abi.soliditySHA3(
            [ "address", "address", "bytes32" ],
            [ auditor, sender, codeHash ]
        ).toString('hex');
    });

    describe("#requestAudit", function () {
        it("should revert if auditTime below minimal allowed time", async function() {
            const MIN_AUDIT_TIME = await ss.MIN_AUDIT_TIME();
            await assertRevert(ss.requestAudit(auditor, codeHash, MIN_AUDIT_TIME.minus(1),
                {from: sender, value: 100}));
        });

        it("should revert if auditTime over maximum allowed time", async function() {
            const MAX_AUDIT_TIME = await ss.MAX_AUDIT_TIME();
            await assertRevert(ss.requestAudit(auditor, codeHash, MAX_AUDIT_TIME.plus(1),
                {from: sender, value: 100}));
        });

        it("should revert if no ethers sent", async function() {
            await assertRevert(ss.requestAudit(auditor, codeHash, AUDIT_TIME,
                {from: sender, value: 0}));
        });

        describe("with existing audit request", function () {
            let firstAuditReceipt;
            beforeEach(async function () {
                firstAuditReceipt = await ss.requestAudit(auditor, codeHash, AUDIT_TIME,
                    {from: sender, value: 100});
            });

            it("should do all the needed stuff", async function() {
                eq( (await ss.Rewards(hash2)).valueOf(), 100, "100 Wei is not in rewards");
                eq( (await ss.AuditRequests(hash3))[0].valueOf(), 100, "100 Wei is not in auditRequests");
                eq( (await ss.AuditRequests(hash3))[1].valueOf(),
                        await web3.eth.getBlock(firstAuditReceipt.receipt.blockNumber).timestamp + AUDIT_TIME, "Incorrect expire date in AuditRequests");
                eq(await web3.eth.getBalance(ss.address).valueOf(), 100, "Contract balance is not 100")
                eq(await ss.TotalRequestsAmount().valueOf(), 100, "totalRequestsAmount is not 100")
                eq(firstAuditReceipt.logs.length, 1, "Incorrect number of alerts");
                eq(firstAuditReceipt.logs[0].event, "AuditRequested", "No AuditRequested event triggered");
            });

            it("should sum contract balance and rewards on another audit", async function(){
                await ss.requestAudit(auditor, codeHash, AUDIT_TIME,
                    {from: sender, value: 200});

                eq( (await ss.Rewards(hash2)).valueOf(), 300, "200 Wei is not in rewards");
                eq( (await ss.AuditRequests(hash3))[0].valueOf(), 300, "300 Wei is not in request");
                eq( (await web3.eth.getBalance(ss.address)).valueOf(), 300, "Contract balance is not 100")
            });

            it("should NOT increse expireDate if earlier then existing", async function(){
                let result = await ss.requestAudit(auditor, codeHash, AUDIT_TIME/2,
                    {from: sender, value: 200});

                assert.notEqual( (await ss.AuditRequests(hash3))[1].valueOf(),
                await web3.eth.getBlock(result.receipt.blockNumber).timestamp + AUDIT_TIME/2, "expireDate changed");
            });

            it("should increase expireDate if later then existing", async function(){
                let result = await ss.requestAudit(auditor, codeHash, AUDIT_TIME*2,
                        {from: sender, value: 200});
                eq( (await ss.AuditRequests(hash3))[1].valueOf(),
                        await web3.eth.getBlock(result.receipt.blockNumber).timestamp + AUDIT_TIME*2, "expireDate changed");
            });

            it("different requestAudit should increase total reward", async function() {
                let result = await ss.requestAudit(auditor, codeHash, AUDIT_TIME,
                        {from: sender2, value: 125});

                eq((await ss.Rewards(hash2)).valueOf(), 225, "225 Wei not in rewards");
            });

            it("should revert if contract already audited", async function(){
                await ss.auditContract(codeHash, true, { from: auditor });

                await assertRevert(ss.requestAudit(auditor, codeHash, AUDIT_TIME,
                            {from: sender, value: 100}));
            });
        });
        it("should revert when the service is paused", async function(){
            await ss.pause({from: owner});
            await assertRevert(ss.requestAudit(auditor, codeHash, AUDIT_TIME,
                {from: sender, value: 210}));
        });
    });

    describe("#withdrawRequest", function () {
        it("should fail without audit");

        describe("with two existing requests", function () {
            const FIRST_REWARD = 300;
            const SECOND_REWARD = 500;
            beforeEach(async function () {
                await ss.requestAudit(auditor, codeHash, AUDIT_TIME, {from: sender, value: FIRST_REWARD});
                await ss.requestAudit(auditor, codeHash, AUDIT_TIME, {from: sender2, value: SECOND_REWARD});
            });

            it("should revert if done before the expireDate", async function() {
                await assertRevert(ss.withdrawRequest(auditor, codeHash,
                    {from: sender}));
                eq((await ss.Rewards(hash2)).valueOf(), FIRST_REWARD + SECOND_REWARD, "800 Wei not in rewards");
                eq((await ss.AuditRequests(hash3))[0].valueOf(), FIRST_REWARD, "300 Wei not in AuditRequests");
            });

            it("should decrease total reward and do all other stuff", async function() {
                await increaseTime(web3, AUDIT_TIME*2);
                let result = await ss.withdrawRequest(auditor, codeHash,
                        {from: sender});

                eq((await ss.Rewards(hash2)).valueOf(), SECOND_REWARD, "reward not equal to 500");
                eq((await ss.AuditRequests(hash3))[0].valueOf(), 0, "0 Wei not in AuditRequests");
                eq((await ss.TotalRequestsAmount()).valueOf(), SECOND_REWARD, "TotalRewards is not 100");
                eq(await web3.eth.getBalance(ss.address).valueOf(), SECOND_REWARD, "Contract balance is not 100");
                eq(result.logs.length, 1, "Incorrect number of events");
                eq(result.logs[0].event, "RequestWithdrawn", "No RequestWithdrawn event triggered");
            });
        });
    });

    describe("#auditContract", function () {
        it("should fail without request");

        describe("with a audit request", function () {
            const REQEUST_REWARD = 200;
            beforeEach(async function () {
                await ss.requestAudit(auditor, codeHash, AUDIT_TIME, {from:sender, value: REQEUST_REWARD});
            });

            it("should pay reward and do all other stuff", async function() {
                const AUDITED_AND_APPROVED = await ss.AUDITED_AND_APPROVED();
                const COMMISSION = REQEUST_REWARD * (await ss.Commission()).toNumber() / 100;

                let result = await ss.auditContract(codeHash, true,
                        {from: auditor});

                eq((await ss.AuditOutcomes(hash2)).valueOf(), AUDITED_AND_APPROVED, "Contract is not AUDITED");
                eq((await ss.TotalRequestsAmount()).valueOf(), 0, "TotalRewards is not 0");
                eq(await web3.eth.getBalance(ss.address).valueOf(), COMMISSION, "Contract balance doesn't hold Commision")
                eq(result.logs.length, 1, "Incorrect number of events");
                eq(result.logs[0].event, "ContractAudited", "No ContractAudited event triggered");
            });
            it("should not change Commission", async function() {
                const oldCommission = (await ss.Commission()).toNumber();
                let result = await ss.auditContract(codeHash, true,
                        {from: auditor});
                const newCommission = (await ss.Commission()).toNumber();
                eq(oldCommission, newCommission, "Commission changed in auditContract");
            })
            it("should revert when the service is paused", async function(){
                await ss.pause({from: owner});
                await assertRevert(ss.auditContract(codeHash, true,
                        {from: auditor}));
            });
        });
    });

    it("contract should not accept ordinary money transfers (tips & donations)", async function(){
        await assertRevert(ss.sendTransaction({from:sender2, value:10}));
    });

    describe("#withdrawCommission", function () {
        describe("with existing commission", function () {
            beforeEach(async function () {
                await ss.requestAudit(auditor, codeHash, AUDIT_TIME, {from: sender, value: 100});
                await ss.auditContract(codeHash, true, {from: auditor});
            });

            it("should revert if called not by owner", async function(){
                await assertRevert(ss.withdrawCommission(1, {from: sender}));
            });

            it("should withdraw funds", async function(){
                let beforeBalance = Number(web3.eth.getBalance(owner));
                let toWithdraw = 1;
                let result = (await ss.withdrawCommission(toWithdraw, {from: owner}));
                let gasUsed = result.receipt.cumulativeGasUsed * (await web3.eth.getTransaction(result.tx).gasPrice);
                let afterBalance = Number(web3.eth.getBalance(owner));
                eq(beforeBalance-gasUsed+toWithdraw, afterBalance, 'Couldn\'t withdraw commission');
            });
        });
    });

    describe("#changeCommission", function () {
        it("should revert if called not by owner", async function(){
            await assertRevert(ss.changeCommission(1, {from: sender}));
        });
        it("should revert if commission bigger than max commision", async function(){
            const MAX_COMMISION = await ss.MAX_COMMISION();
            await assertRevert(ss.changeCommission(MAX_COMMISION.plus(1), {from: owner}));
        });
        it("should set new commission", async function(){
            let newCommission = await ss.MAX_COMMISION();
            let result = await ss.changeCommission(newCommission, {from: owner});
            let afterCommission = (await ss.Commission()).valueOf();
            eq(newCommission, afterCommission, 'Couldn\'t change commission')
        });
        it("should revert when service is paused", async function(){
            await ss.pause({from: owner});
            let newCommission = await ss.MAX_COMMISION();
            await assertRevert(ss.changeCommission(newCommission, {from: owner}));
        });
    });

    it("check makeOffer for audited contract");
});
