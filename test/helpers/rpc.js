const promisify = require("util").promisify;

module.exports = async function rpc(provider, method, ...params) {
    // Audit(ritave): Some providers don't support `send` method
    const sendAsync = promisify(provider.sendAsync.bind(provider));

    const parameters = params || [];
    const response = await sendAsync({
        jsonrpc: "2.0",
        method,
        params: parameters,
    });

    if (response.error) {
          throw new Error(response.error.message || response.error);
    }
    return response.result;
}
