1. Pause the SolidStamp v1 contract via MEW (Use contract ABI and call pause())
2. Generate list of existing audits using python dump_contracts (use the correct DB)
3. Paste dumped contracts to gen_constructor_abi.js and run node gen_constructor_abi to generate constructor data
4. Compile and Deploy SolidStampRegister. Use constructor data from 3.
5. Verify contract source code.
5. Use gen_constructor_abi.js to generate constructor data for SolidStamp
6. Deploy SolidStamp.
7. Verify contract source code.
8. Call changeSolidStampContract() to change the contractSolidStamp
9. Change contract address and abi on server. Deploy
10. Call setNewAddress on the old contract
11. Tag the new contract as Version 2.0 and update addresses
