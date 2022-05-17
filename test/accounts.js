const PocketCrypto = artifacts.require("PocketCrypto");

contract('PocketCrypto', async (accounts) => {
  const ERROR_MSG = "VM Exception while processing transaction: revert ";

  it('should create account only if it doesnt exsist', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    try {
       await pocketCryptoInstance.addAccount(1, "John");
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Account already exists");
    }
  });

  it('should create a new account', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(0, "Martin");

    const account = await pocketCryptoInstance.account(accounts[0]);
    assert.equal((account.role).toNumber(), 0, "Role isn't set to 0 (Guardian)");
    assert.equal(account.nickname, "Martin", "Nickname isn't set to 'Martin'");
  });

  it('should add ward only when caller is guardian', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    const account = await pocketCryptoInstance.account(accounts[0]);
    try {
      await pocketCryptoInstance.addWard(account.owner);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian's account does not exist");
    }
  });

  it('should add ward only when the ward account exists', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(0, "Linda");
    const account = await pocketCryptoInstance.account(accounts[1]);
    try {
      await pocketCryptoInstance.addWard(account.owner);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Ward's account does not exist");
    }
  });

  it('should add ward only when the ward doesnt already have a guardian', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(0, "Martin");
    await pocketCryptoInstance.addAccount(1, "John", {from: accounts[1]});
    const account = await pocketCryptoInstance.account(accounts[1]);
    await pocketCryptoInstance.addWard(account.owner);
    try {
      await pocketCryptoInstance.addAccount(0, "Linda", {from: accounts[2]});
      await pocketCryptoInstance.addWard(account.owner,  {from : accounts[2]});
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Ward already has a guardian");
    }
  });

  it('should add ward', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(0, "Martin");
    await pocketCryptoInstance.addAccount(1, "John", {from: accounts[1]});
    const account = await pocketCryptoInstance.account(accounts[1]);
    await pocketCryptoInstance.addWard(account.owner);
    const guardian = await pocketCryptoInstance.guardian(account.owner);
    assert.equal(guardian.owner, accounts[0], "Address of guardian is incorrect");
    assert.equal(guardian.role, 0, "Role of guardian is incorrect");
    assert.equal(guardian.nickname, "Martin", "Nickname should be 'Martin'");
  });

  it('should delete ward only when caller is guardian', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(1, "John");
    const account = await pocketCryptoInstance.account(accounts[1]);
    try {
      await pocketCryptoInstance.deleteWard(account.owner);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian's account does not exist");
    }
  });

  it('should delete ward only when the ward account exists', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(0, "Linda");
    const account = await pocketCryptoInstance.account(accounts[1]);
    try {
      await pocketCryptoInstance.deleteWard(account.owner);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Ward's account does not exist");
    }
  });

  it('should delete ward only when the caller is the correct guardian of the ward', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(0, "Martin");
    await pocketCryptoInstance.addAccount(0, "Carl", {from: accounts[2]});
    await pocketCryptoInstance.addAccount(1, "John", {from: accounts[1]});
    const account = await pocketCryptoInstance.account(accounts[1]);
    await pocketCryptoInstance.addWard(account.owner, {from: accounts[2]});
    try {
      await pocketCryptoInstance.deleteWard(account.owner);
    } catch (err) {
      assert(err, "Expected an error but did not get one");
      expect(err.message).to.include("Guardian does not match");
    }
  });

  it('should delete ward', async () => {
    const pocketCryptoInstance = await PocketCrypto.new();
    await pocketCryptoInstance.addAccount(0, "Martin");
    await pocketCryptoInstance.addAccount(1, "John", {from: accounts[1]});
    const account = await pocketCryptoInstance.account(accounts[1]);
    await pocketCryptoInstance.addWard(account.owner);
     await pocketCryptoInstance.deleteWard(account.owner)
    const guardian = await pocketCryptoInstance.guardian(account.owner);
    assert.equal(guardian.isAccount, false, "Guardian should be deleted");
  });
});
