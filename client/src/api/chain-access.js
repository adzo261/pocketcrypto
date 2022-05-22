
class ChainAccess {

    static setChainState(web3, address, contract) {
        this.web3 = web3;
        this.address = address;
        this.contract = contract;
    }
    
    static setChainAddressState(address) {
        this.address = address;
    }
    
    static setChainAccountState(role, nickname) {
        this.role = role;
        this.nickname = nickname;
    }

    static getRole() {
        return this.role;
    }

    static getNickname() {
        return this.nickname;
    }
    
    static async getAccount() {
        let account = await this.contract.methods.account(this.address).call();
        account.role = Number(account.role);
        this.setChainAccountState(account.role, account.nickname);
        return account;
    }

    static async addAccount(role, nickname) {
        await this.contract.methods.addAccount(role, nickname).send({from : this.address});
        this.setChainAccountState(role, nickname);
    }

    static async getMyWards() {
        return await this.contract.methods.getWardsByGuardian(this.address).call();
    }

    //TODO: Rethink logic to getAllAvailableWards
    static async getAvailableWards() {
        let allWards =  await this.contract.methods.getAllWards().call();
        let res = await this.asyncFilter(allWards, async (ward) => {
            let guardianMap = await this.contract.methods.guardian(ward.owner).call();
            return !guardianMap.isAccount;
        });
        return res;
    }

    static async addWard(wardAddr) {
        await this.contract.methods.addWard(wardAddr).send({from : this.address});
    }

    static async removeWard(wardAddr) {
        await this.contract.methods.deleteWard(wardAddr).send({from : this.address});
    }

    static async getUserBalance() {
        return this.web3.utils.fromWei(await this.web3.eth.getBalance(this.address), "ether");
    }

    static async requestEth(amount) {
        amount = await this.web3.utils.toWei(amount, "ether");
        const myGuardian =  await this.contract.methods.guardian(this.address).call();
        console.log(myGuardian);
        let res = await this.contract.methods.requestTransaction(myGuardian.owner, amount).send({from : this.address});
        console.log(res);
    }

    //Get transactions for a ward
    static async getTransactions(wardAddress) {
        console.log(wardAddress);
        let numOfTransactions =  await this.contract.methods.numOfTransactions().call();
        let transactions = {pending: [], approved: [], rejected: []};

        const transformTransaction = async (transaction) => {
            return  {...transaction,
                id: Number(transaction.id),
                status : Number(transaction.status),
                amount : await this.web3.utils.fromWei(transaction.amount, "ether"),
            }
        }

        for(let i = 1; i <= numOfTransactions; i++) {
            let transaction = await this.contract.methods.transactions(i).call();
            if (transaction.to === wardAddress) {
                if (transaction.status === "1") {
                    transactions.pending.push(await transformTransaction(transaction));
                } else if (transaction.status === "2") {
                    transactions.approved.push(await transformTransaction(transaction));
                } else if (transaction.status === "3") {
                    transactions.rejected.push(await transformTransaction(transaction));
                }
                console.log(transaction);
            }
        }
        
        return transactions;
    }

    static async approveTransaction(transactionId, wardAddress, amount) {
        amount = await this.web3.utils.toWei(amount, "ether");
        let res = await this.contract.methods.approveTransaction(transactionId, wardAddress).send({from : this.address});
        console.log(res);
        await this.web3.eth.sendTransaction({
            from : this.address, 
            to : wardAddress, 
            value : amount
        });
    }

    static async rejectTransaction(transactionId, wardAddress) {
        let res = await this.contract.methods.rejectTransaction(transactionId, wardAddress).send({from : this.address});
        console.log(res);
    }

    //Helper function
    static asyncFilter = async (arr, predicate) => {
            const results = await Promise.all(arr.map(predicate));
            return arr.filter((_v, index) => results[index]);
    }

    

}


export default ChainAccess;