// http://hypernephelist.com/2017/01/19/deploy-ethereum-smart-contract-using-client-signature.html
// npm install solc

const fs = require('fs');
const solc = require('solc');

// Compile the source code
var input = {
	'SolidStamp.sol': fs.readFileSync('contracts/SolidStamp.sol').toString(),
	'zeppelin-solidity/contracts/ownership/Ownable.sol': fs.readFileSync('node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol').toString(),
	'zeppelin-solidity/contracts/lifecycle/Pausable.sol': fs.readFileSync('node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol').toString(),
    'Upgradable.sol': fs.readFileSync('contracts/Upgradable.sol').toString(),
}

const output = solc.compile({ sources: input}, 1);
console.log(output);
console.log(output.contracts['SolidStamp.sol:SolidStamp'])
const bytecode = output.contracts['SolidStamp.sol:SolidStamp'].bytecode;
const abi = JSON.parse(output.contracts['SolidStamp.sol:SolidStamp'].interface);

console.log('bytecode:')
console.log(bytecode)
console.log('abi')
console.log(abi)
console.log('abi_json')
console.log(output.contracts['SolidStamp.sol:SolidStamp'].interface)

// goto: https://www.myetherwallet.com/#contracts
