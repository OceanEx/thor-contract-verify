const fs = require('fs')
const path = require('path')

/**
 * verify 
 * @param address address
 */
export function verifyAddress(address: string): boolean {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(address)
}

export function verifyTxId(txId: string): boolean {
    return /^(0x)?[0-9a-fA-F]{64}$/.test(txId)
}

/**
 * return solc compiler path
 * @param version version of compiler
 * @param binsPath bins directory
 */
export function solcBinPath(version: string, binsPath: string): string {
    const versions = getSolcbinsFileNames(binsPath)
    for (const v of versions) {
        if (v.startsWith('soljson-v' + version)) {
            return path.join(binsPath, v + '.js')
        }
    }
    return ''
}

/**
 * get filenames
 */
export function findFileNamesSync(startPath): string[] {
    let result: string[] = []
    function finder(startPath) {
      let files = fs.readdirSync(startPath);
      files.forEach((val: string, _index) => {
        let fPath = path.join(startPath, val);
        let stats = fs.statSync(fPath);
        if (stats.isDirectory()) finder(fPath);
        if (stats.isFile()) result.push(val);
      });
    }
    finder(startPath);
    return result;
}

/**
 * get file name of solc compiler
 * @param path solc bins directory
 */
export function getSolcbinsFileNames(path: string): string[] {
    const compilers = findFileNamesSync(path)
    const cleanSuffix = compilers.map(solcV => solcV.split('.js')[0])
    return cleanSuffix.sort()
}


/**
 * decode URI base64
 **/
export function decodeBase64(str: string): string {
    return decodeURIComponent(Buffer.from(str, 'base64').toString('utf-8'))
}

/**
 * encode URI base64
 */
export function encodeBase64(str: string): string {
    return Buffer.from(encodeURIComponent(str)).toString('base64')
}
