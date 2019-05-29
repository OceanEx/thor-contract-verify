
export interface IVerifyContract {
    sourceCode: string,              // base64 of contract source code
    isOptimizer?: boolean,           // whether optimizer                       (default: false)
    contractAddress: string,         // contract address
    solcVersion?: string,            // compiler version                        (default: solc version)
    params?: string,                 // contract constructor params encode abi  (default: '')
    contractName: string,            // contract name for compile
    txId: string,                    // txId of deployed contract
    runs?: string,                   // compiler runs                           (default 200)
}
