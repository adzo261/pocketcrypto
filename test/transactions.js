const PocketCrypto = artifacts.require("PocketCrypto");

contract('PocketCrypto', async (accounts) => {
  const ERROR_MSG = "VM Exception while processing transaction: revert ";

  it('should add request transaction only when caller is ward', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    try {
      await pocketCryptoInstance.requestTransaction(accounts[0], 1, {from : accounts[1]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Ward's account does not exist");
    }
  });

  it('should add request transaction only if guardian exists', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "Ward");
    const account = await pocketCryptoInstance.account(accounts[0]);
    try {
      await pocketCryptoInstance.requestTransaction(account.owner, 1);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian's account does not exist");
    }
  });

  it('should add request transaction only when given guardian is the correct guardian of the ward(caller)', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "Martin");
    await pocketCryptoInstance.addAccount(0, "Carl", {from: accounts[1]});
    await pocketCryptoInstance.addAccount(0, "John", {from: accounts[2]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    try {
      await pocketCryptoInstance.requestTransaction(accounts[2], 1);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian does not match");
    }
  });

  it('should add request transaction only when given guardian has balance more than requested amount', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "Martin");
    await pocketCryptoInstance.addAccount(0, "Carl", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    try {
      await pocketCryptoInstance.requestTransaction(accounts[1], new web3.utils.BN("100000000000000000000"));
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian does not have enough balance");
    }
  });
  
  it('should add request transaction', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "Martin");
    await pocketCryptoInstance.addAccount(0, "Carl", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    const idBefore = (await pocketCryptoInstance.numOfTransactions.call()).toNumber();
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    const idAfter = (await pocketCryptoInstance.numOfTransactions.call()).toNumber();
    const transaction = await pocketCryptoInstance.transactions(idAfter);
    assert.equal(idBefore + 1, idAfter, "New ID should be one more than last ID");
    assert.equal(transaction.id, idAfter, "Transaction ID not matching");
    assert.equal(transaction.from, accounts[1], "From address not matching");
    assert.equal(transaction.to, accounts[0], "To address not matching");
    assert.equal(transaction.status, 1, "Transaction status is not PENDING(1)");
    //TODO: assert exact recent updated date
    //assert.equal((transaction.date).toNumber(), (new Date().getTime())/1000, "Transaction date is incorrect");
    assert.equal((transaction.amount).toNumber(), 100, "Transaction amount is not 100");
  });

  it('should approve transaction only when it exists', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    try {
      await pocketCryptoInstance.approveTransaction(1, accounts[0], {from : accounts[1]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Transaction does not exist");
    }
  });

  it('should approve transaction only when caller is guardian', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    try {
      await pocketCryptoInstance.approveTransaction(1, accounts[0]);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian's account does not exist");
    }
  });

  it('should approve transaction only when ward exists', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    try {
      await pocketCryptoInstance.approveTransaction(1, accounts[2], {from : accounts[1]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Ward's account does not exist");
    }
  });

  it('should approve transaction only when ward has caller as its guardian', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addAccount(1, "TempWard", {from: accounts[2]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    try {
      await pocketCryptoInstance.approveTransaction(1, accounts[2], {from : accounts[1]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian does not match");
    }
  });

  it('should approve transaction', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    await pocketCryptoInstance.approveTransaction(1, accounts[0], {from : accounts[1]});
    const transaction = await pocketCryptoInstance.transactions(1);
    assert.equal(transaction.id, 1, "Transaction ID not matching");
    assert.equal(transaction.from, accounts[1], "From address not matching");
     assert.equal(transaction.to, accounts[0], "To address not matching");
    assert.equal((transaction.status).toNumber(), 2, "Transaction status is not APPROVED(2)");
    //TODO: assert exact recent updated date
    //assert.equal((transaction.date).toNumber(), (new Date().getTime())/1000, "Transaction date is incorrect");
    assert.equal((transaction.amount).toNumber(), 100, "Transaction amount is not 100");
  });
  
  it('should reject transaction only when it exists', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    try {
      await pocketCryptoInstance.rejectTransaction(1, accounts[0], {from : accounts[1]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Transaction does not exist");
    }
  });

  it('should reject transaction only when caller is guardian', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    try {
      await pocketCryptoInstance.rejectTransaction(1, accounts[0]);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian's account does not exist");
    }
  });

  it('should reject transaction only when ward exists', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    try {
      await pocketCryptoInstance.rejectTransaction(1, accounts[2], {from : accounts[1]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Ward's account does not exist");
    }
  });

  it('should reject transaction only when ward has caller as its guardian', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addAccount(1, "TempWard", {from: accounts[2]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    try {
      await pocketCryptoInstance.rejectTransaction(1, accounts[2], {from : accounts[1]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian does not match");
    }
  });

  it('should reject transaction', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    await pocketCryptoInstance.addAccount(0, "TempGuardian", {from: accounts[1]});
    await pocketCryptoInstance.addWard(accounts[0], {from: accounts[1]});
    await pocketCryptoInstance.requestTransaction(accounts[1], 100);
    await pocketCryptoInstance.rejectTransaction(1, accounts[0], {from : accounts[1]});
    const transaction = await pocketCryptoInstance.transactions(1);
    assert.equal(transaction.id, 1, "Transaction ID not matching");
    assert.equal(transaction.from, accounts[1], "From address not matching");
     assert.equal(transaction.to, accounts[0], "To address not matching");
    assert.equal((transaction.status).toNumber(), 3, "Transaction status is not REJECTED(3)");
    //TODO: assert exact recent updated date
    //assert.equal((transaction.date).toNumber(), (new Date().getTime())/1000, "Transaction date is incorrect");
    assert.equal((transaction.amount).toNumber(), 100, "Transaction amount is not 100");
  });
  
});
