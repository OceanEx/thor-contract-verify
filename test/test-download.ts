
// normal
const fs = require('fs')
const path = require('path')
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { download } from '../src/downloadCompiler'
const binsPath = path.join(__dirname, './bins')

describe('Download compiler', () => {
    if(!fs.existsSync(binsPath)) {
        fs.mkdirSync(binsPath)
    }

    it('download 0.4.25', (done) => {
        const path0425 = path.join(binsPath, '/soljson-v0.4.25+commit.59dbf8f1.js')

        if (fs.existsSync(path0425)) {
            fs.unlinkSync(path0425)
        }

        download('0.4.25', binsPath).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('download version 0.4.25')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('invalid version', (done) => {
        download('0.5.24', binsPath).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('version 0.5.24 invalid')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('exists version', (done) => {
        download('0.4.24', binsPath).catch(e => {
            try {
                expect(() => { throw e || 'no error' }).to.throw('version 0.4.24 existed')
            } catch (error) {
                done(error)
            }
        })
        done()
    })

    it('bins path not exists', (done) => {
        const bPath = path.join(__dirname, './invalid')
        download('0.4.24', bPath).catch(e => {
            try {
                expect(e.toString()).to.contain('binsPath not exists')
            } catch (error) {
                done(error)
            }
        })
        done()
    })
})
