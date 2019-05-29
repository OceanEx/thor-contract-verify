const axios = require('axios')
const fs = require('fs')
const path = require('path')

export async function getVersionList() {
    console.log('Retrieving available version list...')
    const url = 'https://ethereum.github.io/solc-bin/bin/list.json'
    const res = await axios.get(url).catch(err => {
        throw Error(`Error downloading file: ${err.toString()}`)
    })
    return res.data
}

/**
 * download solc compiler
 * @param version solc compiler version
 * @param binsPath download path
 */
export async function download(version: string, binsPath: string) {
    const vList = await getVersionList()
    const versionName = vList.releases[version]
    if (!versionName) {
        throw Error(`version ${version} invalid`)
    }

    if (!fs.existsSync(binsPath)) {
        throw Error(`binsPath not exists. ${binsPath}`)
    }

    const binPath = path.join(binsPath, `/${versionName}`)
    if (fs.existsSync(binPath)) {
        throw Error(`version ${version} existed`)
    }

    console.log('Downloading version ', versionName)
    const url = 'https://ethereum.github.io/solc-bin/bin/' + versionName

    process.on('SIGINT', function () {
        console.log('Interrupted, removing file.');
        fs.unlinkSync(binPath);
        process.exit(1);
    });

    const writer = fs.createWriteStream(binPath)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
    response.data.pipe(writer)

    writer.on('finish', () => {
        console.log('Downloading Success.')
        process.exit(1)
    })

    writer.on('error', () => {
        console.log('Error downloading version')
        process.exit(1)
    })
}
