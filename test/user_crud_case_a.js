const UserCrud = artifacts.require("UserCrud");
const truffleAssert = require('truffle-assertions');

// Migration: 0xda2Cf4e868599c564dE3b9Da86A9193770a08F91
// UserCrud: 0x3150112B0Cd52F443500e4737a9fa87219f5A202

contract('UserCrud - Case A', async (accounts) => {

  // make deployed contract as test state so that...
  // ...we don't need to always redeployed it in every test
  let instance;

  // because using faker is too mainstream
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

  it("owner should be the first account in Ganache", async () => {
    instance = await UserCrud.deployed();
    let owner = await instance.owner.call();
    assert.equal(owner, accounts[0]);
  })

  it("should create all users", async () => {
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

  it("should be able to updateUserEmail", async () => {
    let user = users[0];
    let newEmail = "amelia2@example.com";
    await instance.updateUserEmail(user.address, newEmail);
    let _user = await instance.getUser.call(user.address);
    let _newEmail = _user[0]; // because EVM can only returns array and not hash
    assert.equal(_newEmail, newEmail);
  })

  it("should be able to updateUserAge", async () => {
    let user = users[0];
    let newAge = 20;
    await instance.updateUserAge(user.address, newAge);
    let _user = await instance.getUser.call(user.address);
    let _newAge = _user[1]; // `age` is at index 1 in returned array
    assert.equal(_newAge, newAge);
  })

  it("should return index when calling getUser", async () => {
    let index = 0;
    let user = users[index];
    let _user = await instance.getUser.call(user.address);
    let _index = _user[2]; // `index` is at index 2 in returned array
    assert.equal(index, _index);
  })

  it("should return address when calling getAddressAtIndex", async () => {
    let index = 0;
    let address = users[index].address;
    let _address = await instance.getAddressAtIndex.call(index);
    assert.equal(address, _address);
  })

  /** ------------------------------------------------
  * The fun parts - deleting the last user
  ------------------------------------------------- */

  it("should be able to delete the last user", async () => {
    let lastUserIndex = users.length - 1; // 3 - 1 = 2 <-- take user at index 2
    let user = users[lastUserIndex];
    let address = user.address;
    let tx = await instance.deleteUser(address);
    // log what was deleted in userIndex[] (lastUserIndex / whatever the arg is)
    // {0x3333333333333333333333333333333333333333, 2}
    truffleAssert.eventEmitted(tx, 'LogDeleteUser', (ev) => {
      return ev.userAddress == address &&
        ev.index            == lastUserIndex;
    });
    // log the new UserStruct that replaced the old position
    // in this case, the Alice's pointer in userIndex[] was already deleted
    // {0x3333333333333333333333333333333333333333, 2, alice@example.com, 32}
    truffleAssert.eventEmitted(tx, 'LogUpdateUser', (ev) => {
      return ev.userAddress == address &&
        ev.index            == lastUserIndex &&
        ev.userEmail        == user.email &&
        ev.userAge          == user.age;
    });
    let getUserCount = await instance.getUserCount.call();
    assert.equal(getUserCount, users.length - 1); // 3 users minus 1 (get deleted)
  })

  it("should return the correct last user after deleteUser", async () => {
    let lastUserIndex = await instance.getUserCount.call() - 1;
    let user = users[lastUserIndex];
    let email = user.email;
    let _user = await instance.getUser.call(user.address);
    let _email = _user[0]; // result from EVM, in form of array, not objects
    assert.equal(_email, email);
  })

  it("should return address when calling getAddressAtIndex", async () => {
    let lastUserIndex = await instance.getUserCount.call() - 1;
    let address = users[lastUserIndex].address;
    let _address = await instance.getAddressAtIndex.call(lastUserIndex);
    assert.equal(address, _address);
  })

})
