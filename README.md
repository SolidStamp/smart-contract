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
SolidStampRegister [0x165cFb9cCf8b185E03205Ab4118eA6afBdbA9203](https://etherscan.io/address/0x165cFb9cCf8b185E03205Ab4118eA6afBdbA9203)
SolidStamp [0x034464DB73874a8650535f931D831439CAAEe29d](https://etherscan.io/address/0x034464DB73874a8650535f931D831439CAAEe29d)

## Built With
* [Truffle](https://github.com/trufflesuite/truffle) - Ethereum development environment


## Compiling using solc

To compile using `solc` compiler run:
```
solc openzeppelin-solidity/=[YOUR_PATH_TO_openzeppelin-solidity] -o build --optimize --bin --abi --overwrite SolidStamp.sol
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details
