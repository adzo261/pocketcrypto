
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

    //Helper function
    static asyncFilter = async (arr, predicate) => {
            const results = await Promise.all(arr.map(predicate));
            return arr.filter((_v, index) => results[index]);
    }

    

}


export default ChainAccess;