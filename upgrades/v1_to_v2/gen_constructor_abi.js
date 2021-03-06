var abi = require('ethereumjs-abi');

var parameterTypes = ["address[]", "bytes32[]", "bool[]"];
var parameterValues =   [["0x8BFb0A6848A402d9931ba22797f82781c6E1711F","0x8BFb0A6848A402d9931ba22797f82781c6E1711F","0x8BFb0A6848A402d9931ba22797f82781c6E1711F","0x4602adBfE84beB925c924c19d3AE353688389265","0x4602adBfE84beB925c924c19d3AE353688389265","0xE73A1998cE936AceBEb7899D790a7a69c541b695","0xE73A1998cE936AceBEb7899D790a7a69c541b695","0xE73A1998cE936AceBEb7899D790a7a69c541b695","0x59142a4bE50Ed4d390fC5E1F3Ec8F9DBd708d08a","0x59142a4bE50Ed4d390fC5E1F3Ec8F9DBd708d08a","0x59142a4bE50Ed4d390fC5E1F3Ec8F9DBd708d08a",
"0x59142a4bE50Ed4d390fC5E1F3Ec8F9DBd708d08a","0x59142a4bE50Ed4d390fC5E1F3Ec8F9DBd708d08a",],["0xda33e318deb07af0b10fe7707ee37b63f2363ef7e5effa603851ce2856af3281","0x0d08992ec0b20f49632cc3771127bfef965736be1389b54899a8564982745b43","0x2a8161cba2e29f988a34f48253cfcaa3c06e7b9026153a3f6927dbc56aeb6355","0x1790c8cab6ef73bba80f7dae16b40446c78620f825de14d0c01392b8699bb008","0x7fa51f418a39f67df894cfadd96705779a36d047824e3a759ef8f03b53b6c73d",
"0x0241be77ba68a35c638cf282ee743850c27c5d44036648fb223ef93551734edc","0x8d6e37db5d99f11e37d9c88caba4d5d18b82e2df3b95cf2f796374a13f1d1ba2","0x2ab20342bb55c62e76cfeeffd1419d6ff6d3fc82f2c4cfdd805d09ee1a6cf725","0x023edcce76a4a535f25ec09910d0f28d807c4f486d002c84faca289a033341a1","0x4bd1efc7ebb66551f7a6752265387155a85f27fd26cc867b55cab22a6e94a39d","0x0241be77ba68a35c638cf282ee743850c27c5d44036648fb223ef93551734edc","0x3ef23062542ed96f1c83b8febc152ca39343b03a81f68a8ddc4e9d46e266dd11",
"0xd0a06b12ac47863b5c7be4185c2deaad1c61557033f56c7d4ea74429cbb25e23",],[true,true,true,true,true,true,true,true,true,true,true,true,true,]];

var encoded = abi.rawEncode(parameterTypes, parameterValues);
console.log(encoded.toString('hex'));

console.log();

var parameterTypes = ["address"];
var parameterValues =   ["0xFfE73766Ed803769cDaEA47470E66fdfa5308c22"]
var encoded = abi.rawEncode(parameterTypes, parameterValues);
console.log(encoded.toString('hex'));
