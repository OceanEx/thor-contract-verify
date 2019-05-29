// normal
const fs = require('fs')
const path = require('path')
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { encodeBase64 } from '../src/utils/util'
import { Vscc } from '../src/vscc'
import { IVerifyContract } from '../src/utils/Interfaces'

const binsPath = path.join(__dirname, './bins')

describe('Verify Contract', () => {

    if(!fs.existsSync(binsPath)) {
        fs.mkdirSync(binsPath)
    }

    const vscc = new Vscc('https://vethor-node-dev.vechaindev.com', binsPath)

    const sCode = fs.readFileSync(path.join(__dirname, '../test/contracts/normal04.sol'), 'utf8')
    const solcVersion = '0.4.24'
    const base64Code = encodeBase64(sCode)
    const c_addr = '0xfac85e7beca34cb5cb3008fd0e81e4d5aeafd800'
    const txId = '0xb5cf89000a5181d3ded55da0ebf3bb34d38e24bed28eab816a9b8d78e0b06e5b'
    const runs = '200'
    const p: IVerifyContract = {
        sourceCode: base64Code,
        isOptimizer: false,
        contractAddress: c_addr,
        solcVersion: solcVersion,
        contractName: 'Normal',
        txId: txId,
        runs: runs
    }
    it('normal', async () => {
        const re = await vscc.verify(p)
        expect(re)
    })

    it('invalid params', (done) => {
        const p1 = { ...p }
        const l = [
            'invalid address',
            '0x0',
            'abc',
            '123',
            '123kl',
            '0xfac85e7beca34cb5cb3008fd0e81e4d5aeafd802'
        ]
        for (const addr of l) {
            p1.contractAddress = addr
            vscc.verify(p1).catch(e => {
                try {
                    expect(() => { throw e || 'no error' }).to.throw('contract address invalid')
                } catch (error) {
                    done(error)
                }
            })
        }
        done()
    })

    it('invalid txId', (done) => {
        const p1 = { ...p }
        const l = [
            'txId',
            '0x123',
            '0x',
            '123',
            '/.',
            '',
            '0xb5cf89000a5181d3ded55da0ebf3bb34d38e24bed28eab816a9b8d78e0b06e52'
        ]
        for (const txId of l) {
            p1.txId = txId
            vscc.verify(p1).catch(e => {
                try {
                    expect(() => { throw e || 'no error' }).to.throw('txId invalid')
                } catch (error) {
                    done(error)
                }
            })   
        }
        done()
    })

    it('sourceCode invalid', (done) => {
        const p1 = { ...p }
        p1.sourceCode = ''
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('sourceCode invalid')
                done()
            } catch (error) {
                done(error)
            }
        })
    })

    it('optimizer', (done) => {
        const p1 = { ...p }
        p1.isOptimizer = true
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('verify contract source code failed')
                done()
            } catch (error) {
                done(error)
            }
        })
    })

    it('contract name', (done) => {
        const p1 = { ...p }
        p1.contractName = 'not found'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('mismatch target contract name')
            } catch (error) {
                done(error)
            }
        })

        p1.contractName = ''
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('contract_name invalid')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('runs', async () => {
        const p1 = { ...p }
        p1.runs = '1'
        const re = await vscc.verify(p1)
        expect(re)
    })

    it('invalid solc compiler version', (done) => {
        const p1 = { ...p }
        p1.solcVersion = '0.5.0'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' })
                done()
            } catch (error) {
                done(error)
            }
        })
    })

    it('latest version', (done) => {
        const p1 = { ...p }
        p1.solcVersion = undefined
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' })
                done()
            } catch (error) {
                done(error)
            }
        })
    })

    it('download compiler', (done) => {
        const p1 = { ...p }
        p1.solcVersion = '0.4.21'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw(`please download compiler version first. [${p1.solcVersion}]`)
                done()
            } catch (error) {
                done(error)
            }
        })
    })

    it('version invalid', (done) => {
        const p1 = { ...p }
        p1.solcVersion = 'not supported'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw(`version [${p1.solcVersion}] invalid`)
                done()
            } catch (error) {
                done(error)
            }
        })
    })

    it('invalid params', (done) => {
        const p1 = { ...p }
        p1.params = '12345678'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('constructor params invalid')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('verify failed', (done) => {
        const p1 = { ...p }
        p1.params = '0000000000000000000000000000000000000000000000000000000000000000'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('verify contract source code failed')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('verify failed for params', (done) => {
        const p1 = { ...p }
        p1.params = '00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001'
        p1.contractAddress = '0x25ff8e86d7abd7552279a96ff48b6f69d01b8741'
        p1.contractName = 'Params'
        p1.txId = '0x2221f021562f2403fea2bf8664828cb84b69112b2008f3ecf65123fd9c310a81'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('verify contract source code failed')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('verify failed for rpc node', (done) => {
        const p1 = { ...p }
        const vscc_f = new Vscc('https://vethor-node-dev.vechaindev.cn', binsPath)
        p1.params = '00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001'
        p1.contractAddress = '0x25ff8e86d7abd7552279a96ff48b6f69d01b8741'
        p1.contractName = 'Params'
        p1.txId = '0x2221f021562f2403fea2bf8664828cb84b69112b2008f3ecf65123fd9c310a81'
        vscc_f.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' })
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('external library', (done) => {
        const p1 = { ...p }
        p1.contractName = 'ExternalLib'
        vscc.verify(p1).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('link library not support')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

})
