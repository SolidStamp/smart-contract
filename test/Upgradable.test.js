const assertRevert = require("./helpers/assertRevert");

const Upgradable = artifacts.require('../contracts/Upgradable.sol');

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

contract('Upgradable', function (accounts) {
    const [owner, nonOwner, ...rest] = accounts;
    let upgradable;

    beforeEach(async function () {
        upgradable = await Upgradable.new({from: owner});
    });

    it('should start with empty newContractAddress', async function () {
        const newContractAddress = await upgradable.newContractAddress();
        // Audit(ritave): Don't use == casting equality operator
        assert.equal(newContractAddress, NULL_ADDRESS);
    });

    it('should prevent upgrade if not-paused', async function () {
        assert.equal(await upgradable.paused(), false);

        await assertRevert(upgradable.setNewAddress(accounts[1]));
    });

    describe("when paused", function () {
        beforeEach(async function () {
            await upgradable.pause({from: owner});
        });

        it('should upgrade', async function () {
            const NEW_ADDRESS = accounts[1];

            await upgradable.setNewAddress(NEW_ADDRESS);

            const actualAddress = await upgradable.newContractAddress();
            assert.equal(actualAddress, NEW_ADDRESS);
        });

        it('should not allow non-owner to change address', async function () {
            const NEW_ADDRESS = accounts[1];
            await assertRevert(upgradable.setNewAddress(NEW_ADDRESS, {from: nonOwner}));
        });

        it('should not allow 0x0 address', async function () {
            await assertRevert(upgradable.setNewAddress(NULL_ADDRESS, {from: owner}));
        });
    });
});
