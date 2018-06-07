# DEXY

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
[0x0aA7A4482780F67c6B2862Bd68CD67A83faCe355](https://etherscan.io/address/0x0aA7A4482780F67c6B2862Bd68CD67A83faCe355)

#### Ropsten [0x28dEa7e266130Ed89cF12031684c8978ba366d14](https://ropsten.etherscan.io/address/0x28dEa7e266130Ed89cF12031684c8978ba366d14)

## Built With
* [Truffle](https://github.com/trufflesuite/truffle) - Ethereum development environment


## Compiling using solc

To compile using `solc` compiler run:
```
solc openzeppelin-solidity/=[YOUR_PATH_TO_openzeppelin-solidity] -o build --optimize --bin --abi --overwrite SolidStamp.sol
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details
