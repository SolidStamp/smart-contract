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
SolidStampRegister [0x39b46de96cFe29fFCf225e899B8ffe1f7fBbA59e](https://etherscan.io/address/0x39b46de96cFe29fFCf225e899B8ffe1f7fBbA59e)

SolidStamp [0x165cFb9cCf8b185E03205Ab4118eA6afBdbA9203](https://etherscan.io/address/0x165cFb9cCf8b185E03205Ab4118eA6afBdbA9203)


#### Ropsten
SolidStampRegister [0x77dbc13b80f2bbc31b92a40abb8c22e0e9b879d4](https://ropsten.etherscan.io/address/0x77dbc13b80f2bbc31b92a40abb8c22e0e9b879d4)

SolidStamp [0x8E12DFa382aE33563c77A1a62536D4F6Bf6D0d2F](https://ropsten.etherscan.io/address/0x8E12DFa382aE33563c77A1a62536D4F6Bf6D0d2F)

## Built With
* [Truffle](https://github.com/trufflesuite/truffle) - Ethereum development environment


## Compiling using solc

To compile using `solc` compiler run:
```
solc openzeppelin-solidity/=[YOUR_PATH_TO_openzeppelin-solidity] -o build --optimize --bin --abi --overwrite SolidStamp.sol
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details
