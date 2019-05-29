## Consistency Verification of Smart Contracts 

Verify the consistency between the source code of a smart contract and its online `runtimeCode`. 

### Install 
```
npm install --save vscc
```

### Usage  
#### Interface  
```
interface IVerifyContract {
    sourceCode: string,              // base64 of contract source code
    isOptimizer?: boolean,           // whether optimizer                       (default: false)
    contractAddress: string,         // contract address
    solcVersion?: string,            // compiler version                        (default: solc version)
    params?: string,                 // contract constructor params encode abi  (default: '')
    contractName: string,            // contract name for compile
    txId: string,                    // txid of deployed contract
    runs?: string,                   // compiler runs                           (default 200)
}
``` 
### Example  
#### Verify  
```js 
import { BlockChain, Utils, Vscc} from 'vscc'

const fs = require('fs')
const path = require('path')
const binPath = path.join(__dirname, './bins')

async function testVscc() {

    if(!fs.existsSync(bins)) {
        fs.mkdirSync(bins)
    }

    const soljson424 = '0.4.24'
    const base64Code = Utils.encodeBase64('/*source code*/')
    const c_addr = '/*contract address*/'
    const txId = '/*txid*/'
    const runs = '200'
    const p = {
        sourceCode: base64Code,
        isOptimizer: false,
        contractAddress: c_addr,
        solcVersion: soljson424,
        contractName: '/*contract name*/',
        txId: txId,
        runs: runs
    }

    try {
        const ins = new Vscc('/*rpc endpoint*/', binPath)
        // return true or false 
        const re = await ins.verify(p)
        console.log('re: ', re)
    } catch (error) {
        console.log(error)
    }
}
```
#### Download Compiler  
If the target compiler does not exist, download it first.  
```js
import { download } from 'vscc'

try {
    await download(version, bins)
} catch (error) {
    console.log(error)
}
```

### Methods
```
|--Vscc
|   |--verify 
|--BlockChain
|   |--getCode
|   |--deployContractOfCall
|   |--accounts
|   |--getTransaction
|--DownloadCompiler
|   |--download
|   |--getVersionList
|--Util
|   |--decodeBase64
|   |--encodeBase64
```

### References  
- [ethereum solc-bin](https://github.com/ethereum/solc-bin)
- [solcjs](https://github.com/ethereum/solc-js)

### License  
- GNU v3
