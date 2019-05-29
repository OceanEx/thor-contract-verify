import { solcBinPath } from "./utils/util"

let solc = require('solc')
const linker = require('solc/linker')

/**
 * compile contract code with normal
 * @param sourceCode contract source code
 * @param isOptimizer optimizer
 */
export async function solcCompile(
    sourceCode: string,
    contract_name: string,
    _version: string | undefined,
    runs = 200,
    _path: string,
    _isOptimizer = false): Promise<string> {
    try {
        if (_version) {
            const vPath = solcBinPath(_version, _path)
            solc = solc.setupMethods(require(vPath))
        } else {
            solc = require('solc')
        }
        // console.log('compile version: ', solc.semver())
        const bytecode = solcCompileStandardWrapper(solc, sourceCode, contract_name, runs, _isOptimizer)
        if (Object.keys(linker.findLinkReferences(bytecode)).length > 0) throw Error('link library not support')
        return bytecode
    } catch (error) {
        throw error
    }
}

/**
 * 
 * @param sourceCode contract source code
 * @param _isOptimizer default false
 */
export function solcCompileStandardWrapper(
    _solc: any,
    sourceCode: string,
    contract_name: string,
    runs = 200,
    _isOptimizer = false): string {
    const input = { content: { content: sourceCode } }
    const json = {
        language: 'Solidity',
        settings: {
            optimizer: {
                enabled: _isOptimizer,
                runs: runs
            },
            outputSelection: {
                '*': {
                    '*': ['evm.bytecode']
                }
            }
        },
        sources: input
    }
    try {
        const ret = _solc.compileStandardWrapper(JSON.stringify(json))
        const jsonRet = JSON.parse(ret)
        if (!jsonRet.contracts) throw Error(jsonRet["errors"][0]["formattedMessage"])
        if ((Object.keys(jsonRet.contracts)).length === 0) throw Error(jsonRet["errors"][0]["formattedMessage"])
        const contractNames = Object.keys(jsonRet.contracts.content)
        if (contractNames.length === 0) throw Error('compile contract source code failed')
        if (!jsonRet.contracts.content[contract_name]) throw Error('mismatch target contract name')
        const bytecode = jsonRet.contracts.content[contract_name].evm.bytecode.object
        if (!bytecode) throw Error('mismatch target contract name')
        return bytecode
    } catch (error) {
        if (typeof error === 'string') {
            if (error.includes('abort(5)')) {
                throw Error('abort(5) at Error')
            } else {
                throw Error('compile failed. unknown error')
            }
        }
        throw error
    }
}
