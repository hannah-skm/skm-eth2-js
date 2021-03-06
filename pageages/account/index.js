const path = require("path");
const fs = require("fs");
const ethwallet = require("ethereumjs-wallet");

function configStore(options) {
    if (options.type == "instance") {
        return options.instance;
    }
    var requireFile = path.join(__dirname, "store", options.type + ".js")
    if (!fs.existsSync(requireFile)) {
        requireFile = path.join(__dirname, "store", "file.js")
        options.path = path.join(process.cwd(), "testdata", "accounts");
    }
    return require(requireFile).init(options);
}

class Account {
    constructor(options) {
        this.store = configStore(options.store);
    }

    setStore(options) {
        this.store = configStore(options);
    }

    listAccounts() {
        return this.store.all().then(data => {
            var accounts = [];
            data.forEach(element => {
                accounts.push("0x" + element.address);
            });
            return accounts;
        })
    }

    newAccount(passphrase) {
        var wallet = ethwallet.generate();
        var json = wallet.toV3(passphrase);
        return this.store.save(json);
    }

    deleteAccount(address, passphrase) {
        return this.getKey(address, passphrase).then(() => {
            return this.store.del(address);
        });
    }

    getKey(address, passphrase) {
        return this.store.get(address).then(data => {
            var wallet = ethwallet.fromV3(data, passphrase);
            return {
                privKey: wallet.getPrivateKey(),
                privKeyStr: wallet.getPrivateKeyString(),
                pubKey: wallet.getPublicKey(),
                pubKeyStr: wallet.getPublicKeyString()
            }
        })
    }
}

module.exports = Account;