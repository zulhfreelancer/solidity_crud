const UserCrud = artifacts.require("UserCrud");
const truffleAssert = require('truffle-assertions');

contract('UserCrud - Case C', async (accounts) => {
  let instance;

  users = [
    {
      "address": "0x1111111111111111111111111111111111111111",
      "email": "amelia@example.com",
      "age": 30
    },
    {
      "address": "0x2222222222222222222222222222222222222222",
      "email": "bob@example.com",
      "age": 31
    },
    {
      "address": "0x3333333333333333333333333333333333333333",
      "email": "alice@example.com",
      "age": 32
    }
  ];

  /** ------------------------------------------------
  * The basic parts
  ------------------------------------------------- */

  it("should create all users", async () => {
    instance = await UserCrud.deployed();
    for (var i = 0; i < users.length; i++) {
      await instance.insertUser(
        users[i].address,
        users[i].email,
        users[i].age
      )
    }
    let getUserCount = await instance.getUserCount.call();
    assert.equal(getUserCount, users.length);
  })

  /** ------------------------------------------------
  * The fun parts - deleting the last user
  ------------------------------------------------- */

  it("should be able to delete the second-last user", async () => {
    let lastUserIndex = users.length - 2; // 3 - 2 = 1 <-- take user at index 1
    let user = users[lastUserIndex];
    let address = user.address;
    let tx = await instance.deleteUser(address);
    // log what was deleted in userIndex[]
    // {0x2222222222222222222222222222222222222222, 1}
    truffleAssert.eventEmitted(tx, 'LogDeleteUser', (ev) => {
      return ev.userAddress == address &&
        ev.index            == lastUserIndex;
    });

    let shiftedUserIndex = users.length - 1;
    let shiftedUser = users[shiftedUserIndex];
    // log the new UserStruct that replaced the old position at index 1
    // {0x3333333333333333333333333333333333333333, 1, alice@example.com, 32}
    truffleAssert.eventEmitted(tx, 'LogUpdateUser', (ev) => {
      return ev.userAddress == shiftedUser.address &&
        ev.index            == (shiftedUserIndex - 1) &&
        ev.userEmail        == shiftedUser.email &&
        ev.userAge          == shiftedUser.age;
    });
    let getUserCount = await instance.getUserCount.call();
    assert.equal(getUserCount, users.length - 1);
  })

  it("should return the correct last user after deleteUser", async () => {
    // 2 - 1 = 1 <-- users[1] here is Bob and he was deleted
    let lastUserIndex = await instance.getUserCount.call() - 1;
    // the last user after Bob was deleted is Alice here and her index is Bob's index + 1
    let user = users[lastUserIndex + 1];
    let email = user.email;
    let _user = await instance.getUser.call(user.address);
    let _email = _user[0]; // result from EVM, in form of array, not objects
    assert.equal(_email, email);
  })

  it("should return address when calling getAddressAtIndex", async () => {
    let lastUserIndex = await instance.getUserCount.call() - 1;
    let address = users[lastUserIndex + 1].address;
    let _address = await instance.getAddressAtIndex.call(lastUserIndex);
    assert.equal(address, _address);
  })

})
