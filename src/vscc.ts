import { IVerifyContract } from "./utils/Interfaces"
import { solcCompile } from "./compile"
import { verifyAddress, verifyTxId, decodeBase64, solcBinPath } from "./utils/util"
import { BlockChain } from './blockchain'
import { getVersionList } from "./downloadCompiler";
const fs = require('fs')


export class Vscc {
    thor_node_rpc_endpoint: string
    blockchain: BlockChain
    binPath: string

    constructor(rpcEndpoint: string, _path: string) {
        if (!fs.statSync(_path).isDirectory()) {
            throw Error('Init Error. BinsPath invalid')
        }
        this.binPath = _path
        this.thor_node_rpc_endpoint = rpcEndpoint
        this.blockchain = new BlockChain(this.thor_node_rpc_endpoint)
    }

    /**
     * verify contract
     * @param params params verify contract params  
     */
    async verify(params: IVerifyContract) {
        if (!verifyAddress(params.contractAddress)) {
            throw Error('contract address invalid.')
        }
        if (!params.sourceCode) {
            throw Error('sourceCode invalid')
        }
        if (!params.contractName) {
            throw Error('contract_name invalid')
        }

        if (!verifyTxId(params.txId)) {
            throw Error('txId invalid')
        }

        if (params.solcVersion) {
            const vPath = solcBinPath(params.solcVersion, this.binPath)
            if (!fs.existsSync(vPath)) {
                const versionList = await getVersionList()
                const versionName = versionList.releases[params.solcVersion]
                if (versionName) {
                    throw Error(`please download compiler version first. [${params.solcVersion}]`)
                } else {
                    throw Error(`version [${params.solcVersion}] invalid`)
                }
            }
        }

        // verify contract address
        const hasCode = await this.verifyContractAddress(params.contractAddress)
        if (!hasCode) {
            throw Error('contract address invalid')
        }

        // deploy code
        const deployedCode = await this.getCode(params.contractAddress)
        // solc compile code
        const compileCode = await solcCompile(decodeBase64(params.sourceCode),
            params.contractName,
            params.solcVersion,
            parseInt(params.runs || '200'),
            this.binPath,
            params.isOptimizer)

        if (compileCode.length === 0) {
            throw Error('compile failed')
        }

        const _params = params.params ? params.params : ''
        if (_params.length % 64 !== 0) {
            throw Error('constructor params invalid')
        }

        // deploy contract call
        const deployCode = await this.deployContractOfCall(compileCode).catch(err => {
            throw Error(`deploy contract call error. ${err}`)
        })

        // compare runtimeBytecode
        const compare = this.compareByteCode(deployedCode, deployCode)
        if (!compare) {
            throw Error('verify contract source code failed')
        }

        // verify contract encodeAbi
        await this.matchContractParamsAbiCode(params.txId, compileCode, params.params).catch(err => {
            throw err
        })

        return true
    }

    /**
     * compare runtime bytecode
     * @param deployedCode deployed contract runtime bytecode
     * @param deployCode deploy contract runtime bytecode of call
     */
    compareByteCode(deployedCode: string, deployCode: string): boolean {
        const deployedCodeSubStr = deployedCode.substring(0, deployedCode.length - 68)
        const deployCodeSubStr = deployCode.substring(0, deployCode.length - 68)
        return deployedCodeSubStr === deployCodeSubStr
    }

    /**
     * get code from address
     * @param contract_address contract address
     */
    async getCode(contract_address: string): Promise<string> {
        const result = await this.blockchain.getCode(contract_address).catch(err => {
            throw 'Get code error: ' + err.toString()
        })
        return result.code
    }

    /**
     * call deploy contract
     * @param byteCode byteCode for deploy contract
     */
    async deployContractOfCall(byteCode: string): Promise<string> {
        const result = await this.blockchain.deployContractOfCall(byteCode).catch(err => {
            throw 'Deploy contract call error. ' + err.toString()
        })
        return result.data
    }

    /**
     * verify address whether contract 
     * @param address contract address
     */
    async verifyContractAddress(address: string): Promise<boolean> {
        const result = await this.blockchain.accounts(address).catch(err => {
            throw err.toString()
        })
        return result.hasCode
    }

    /**
     * verify contract constructor encode abi
     * @param txId contract deploy transaction id
     * @param params contract deploy encode abi
     */
    async matchContractParamsAbiCode(txId: string, compileCode: string, params = '') {
        const result = await this.blockchain.getTransaction(txId).catch(err => {
            throw err.toString()
        })

        if (!result) {
            throw 'txId invalid'
        }
        // TODO: only one clause
        result.clauses.forEach(clause => {
            const data: string = clause.data
            if ((data.length - 2) === (compileCode.length + params.length)) {
                const chainCodeParams = data.substr(compileCode.length + 2)
                if (chainCodeParams !== params) {
                    throw Error('verify contract source code failed')
                }
            } else {
                throw Error('verify contract source code failed')
            }
        })
    }
}
