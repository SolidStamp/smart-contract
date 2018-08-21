# SOLIDSTAMP

 [![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

Smart Contract for [the SolidStamp project](https://www.solidstamp.com).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing

SolidStamp uses npm to manage dependencies, therefore the installation process is kept simple:

```
npm install
```

### Running tests

SolidStamp uses truffle for its Ethereum development environment. All tests can be run using truffle:

```
truffle test
```


### Deployed Addresses

#### Mainnet
SolidStampRegister [0xFfE73766Ed803769cDaEA47470E66fdfa5308c22](https://etherscan.io/address/0xFfE73766Ed803769cDaEA47470E66fdfa5308c22)

SolidStamp [0x16964D770439B1d2Ae84EC96a18eDb1657CFfEcF](https://etherscan.io/address/0x16964D770439B1d2Ae84EC96a18eDb1657CFfEcF)


#### Ropsten
SolidStampRegister [0x4ad5766168f631aea2b6e5bbcfa1553e05f25c47](https://etherscan.io/address/0x4ad5766168f631aea2b6e5bbcfa1553e05f25c47)

SolidStamp [0x81d5c4488f3a5ffd8b3a7445f7d6ee943c38eba7](https://etherscan.io/address/0x81d5c4488f3a5ffd8b3a7445f7d6ee943c38eba7)

## Built With
* [Truffle](https://github.com/trufflesuite/truffle) - Ethereum development environment


## Compiling using solc

To compile using `solc` compiler run:
```
solc openzeppelin-solidity/=[YOUR_PATH_TO_openzeppelin-solidity] -o build --optimize --bin --abi --overwrite SolidStamp.sol
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details
