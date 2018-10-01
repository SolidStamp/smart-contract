1. Pause the SolidStamp v2 contract via MEW (Use contract ABI and call pause())
2. Compile and Deploy SolidStampRegister.
3. Verify contract source code.
4. Generate constructor data for SolidStamp contract (https://abi.sonnguyen.ws/)
5. Deploy SolidStamp.
6. Verify contract source code (flatten the source code: `./scripts/solidityFlattener.pl --mainsol SolidStamp.sol --verbose --remapdir openzeppelin-solidity/=../node_modules/openzeppelin-solidity/`)
7. Call SolidStampRegister.changeSolidStampContract() to change the contractSolidStamp
8. Change contract address and abi on server. Deploy
9. Call setNewAddress on the old contract
10. Tag the new contract as Version 3.0 and update addresses on GitHub
