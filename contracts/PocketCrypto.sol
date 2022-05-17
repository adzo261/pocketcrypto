// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract PocketCrypto {

	enum Role {GUARDIAN, WARD} 
	enum TransactionStatus {NONE, PENDING, APPROVED, REJECTED}

	struct Account {
		address owner;
		Role role;
		string nickname;
		bool isAccount;
	}

	struct Transaction {
		uint id;
		address from;
		address to;
		uint amount;
		uint date; //date is the recent status date in seconds
		TransactionStatus status;
	}

	//Used to generate transaction ids
	uint public numOfTransactions = 0;

	//arr of all ward accounts
	Account[] public wardAccounts;

	// mapping of address to all accounts
	mapping(address => Account) public account;

	// mapping of address of guardian to their ward accounts
	mapping(address => Account[]) public wards;

	// mapping of address of ward to their guardian account
	mapping(address => Account) public guardian;

	//mapping of id to transactions
	mapping(uint => Transaction) public transactions;
	
	function addAccount(Role _role, string memory _nickname) public {
		
		//Account must not exist
		require(
			account[msg.sender].isAccount == false, 
			"Account already exists"
		);

		account[msg.sender] = Account({
			owner: msg.sender,
			role: _role,
			nickname: _nickname,
			isAccount: true
		});

		if (account[msg.sender].role == Role.WARD) {
			wardAccounts.push(account[msg.sender]);
		}
	}

	function addWard(address _ward) public {
		
		//Guardian's account must exist
		require(
			account[msg.sender].isAccount == true && account[msg.sender].role == Role.GUARDIAN,
			"Guardian's account does not exist"
		);

		//Ward's account must exist
		require(
			account[_ward].isAccount == true && account[_ward].role == Role.WARD,
			"Ward's account does not exist"
		);

		//Ward must not have a guardian
		require(
			guardian[_ward].isAccount == false, "Ward already has a guardian"
		);


		wards[msg.sender].push(account[_ward]);
		guardian[_ward] = account[msg.sender];
	}

	function deleteWard(address _ward) public {
		//Guardian's account must exist
		require(
			account[msg.sender].isAccount == true && account[msg.sender].role == Role.GUARDIAN,
			"Guardian's account does not exist"
		);

		//Ward's account must exist
		require(
			account[_ward].isAccount == true && account[_ward].role == Role.WARD,
			"Ward's account does not exist"
		);

		//Ward must have this account as guardian
		require(
			guardian[_ward].isAccount == true && guardian[_ward].owner == msg.sender,
			"Guardian does not match"
		);

		removeWardByGuardian(msg.sender);
		guardian[_ward].isAccount = false;
	}

	//Request new transaction from guardian
	function requestTransaction(address _guardian, uint _amount) public {
		//Ward's account must exist
		require(
			account[msg.sender].isAccount == true && account[msg.sender].role == Role.WARD,
			"Ward's account does not exist"
		);

		//Guardian's account must exist
		require(
			account[_guardian].isAccount == true && account[_guardian].role == Role.GUARDIAN,
			"Guardian's account does not exist"
		);

		//Ward must have this account as guardian
		require(
			guardian[msg.sender].isAccount == true && guardian[msg.sender].owner == _guardian,
			"Guardian does not match"
		);

		//Guardian must have enough balance
		require(
			account[_guardian].owner.balance >= _amount,
			"Guardian does not have enough balance"
		);

		numOfTransactions++;
		transactions[numOfTransactions] = Transaction({
			id: numOfTransactions,
			from: _guardian,
			to: msg.sender,
			amount: _amount,
			date: block.timestamp,
			status: TransactionStatus.PENDING
		});
	}

	//Approve transaction raised by a ward
	function approveTransaction(uint _id, address _ward) public {
		
		//Transaction must exist
		require(
			transactions[_id].id == _id,
			"Transaction does not exist"
		);

		//Guardian's account must exist
		require(
			account[msg.sender].isAccount == true && account[msg.sender].role == Role.GUARDIAN,
			"Guardian's account does not exist"
		);

		//Ward's account must exist
		require(
			account[_ward].isAccount == true && account[_ward].role == Role.WARD,
			"Ward's account does not exist"
		);

		//Ward must have this account as guardian
		require(
			guardian[_ward].isAccount == true && guardian[_ward].owner == msg.sender,
			"Guardian does not match"
		);

		//TODO: This is checked while requesting transaction. Need to think if we still need it while approving transaction
		//Guardian must have enough balance
		require(
			msg.sender.balance >= transactions[_id].amount,
			"Guardian does not have enough balance"
		);

		transactions[_id].status = TransactionStatus.APPROVED;
	}

	//Reject transaction raised by a ward
	function rejectTransaction(uint _id, address _ward) public {
		
		//Transaction must exist
		require(
			transactions[_id].id == _id,
			"Transaction does not exist"
		);

		//Guardian's account must exist
		require(
			account[msg.sender].isAccount == true && account[msg.sender].role == Role.GUARDIAN,
			"Guardian's account does not exist"
		);
		
		//Ward's account must exist
		require(
			account[_ward].isAccount == true && account[_ward].role == Role.WARD,
			"Ward's account does not exist"
		);

		//Ward must have this account as guardian
		require(
			guardian[_ward].isAccount == true && guardian[_ward].owner == msg.sender,
			"Guardian does not match"
		);

		transactions[_id].status = TransactionStatus.REJECTED;
	}

	function getAllWards() public view returns (Account[] memory) {
		return wardAccounts;
	}

	function getWardsByGuardian(address _guardian) public view returns (Account[] memory) {
		return wards[_guardian];
	}

	//Removes a ward of a guardian from the guardian to wards arr mapping
	function removeWardByGuardian(address _guardian) internal {
		
		for (uint i = 0; i < wards[_guardian].length; i++) {
			if (wards[_guardian][i].owner == _guardian) {
				wards[_guardian][i].isAccount = false;
				wards[_guardian][i] = wards[_guardian][wards[_guardian].length - 1];
				wards[_guardian].pop();
				break;
			}
		}
	}

}

