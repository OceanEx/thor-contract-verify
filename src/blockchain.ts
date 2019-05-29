const axios = require('axios')

export class BlockChain {
    endpoint: string

    constructor(_endpoint: string) {
        this.endpoint = _endpoint
    }

    /**
     * get code from address
     * @param contract_address contract address
     */
    async getCode(contract_address: string): Promise<any> {
        const result = await axios.get(this.endpoint + `/accounts/${contract_address}/code`).catch(err => {
            throw err
        })
        return result.data
    }

    /**
     * call deploy contract
     * @param byteCode byteCode for deploy contract
     */
    async deployContractOfCall(byteCode: string): Promise<any> {
        const result = await axios.post(this.endpoint + `/accounts`, {
            value: '0',
            data: '0x' + byteCode
        }).catch(err => {
            throw 'Deploy contract call error. ' + err.toString()
        })
        return result.data
    }

    /**
     * get accounts 
     * @param address 
     */
    async accounts(address: string): Promise<any> {
        const result = await axios.get(this.endpoint + `/accounts/${address}`).catch(err => {
            throw err.toString()
        })
        return result.data
    }

    /**
     * get transaction
     * @param _txId transaction hash
     */
    async getTransaction(txId: string): Promise<any> {
        const result = await axios.get(this.endpoint + `/transactions/${txId}`).catch(err => {
            throw err.response.data
        })
        return result.data
    }
}
