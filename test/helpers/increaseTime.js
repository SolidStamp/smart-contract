const rpc = require("./rpc");

module.exports = async function increaseTime(web3, timestamp) {
    const provider = web3.currentProvider;
    // Order is important here
    // Otherwise the transactions mined would get old timestamp
    await rpc(provider, "evm_increaseTime", timestamp);
    await rpc(provider, "evm_mine");
}
