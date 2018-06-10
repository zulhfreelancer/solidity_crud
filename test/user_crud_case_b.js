const UserCrud = artifacts.require("UserCrud");
const truffleAssert = require('truffle-assertions');
const expectThrow = require('./helpers/expectThrow'); // OpenZeppelin's helper

contract('UserCrud - Case B', async (accounts) => {

  let instance;
  users = [
    {
      "address": "0x1111111111111111111111111111111111111111",
      "email": "amelia@example.com",
      "age": 30
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

  it("should be able to delete the last user", async () => {
    let lastUserIndex = users.length - 1;
    let user = users[lastUserIndex];
    let address = user.address;
    let tx = await instance.deleteUser(address);
    // log what was deleted in userIndex[]
    // {0x1111111111111111111111111111111111111111, 0}
    truffleAssert.eventEmitted(tx, 'LogDeleteUser', (ev) => {
      return ev.userAddress == address &&
        ev.index            == lastUserIndex;
    });
    // log the new UserStruct that replaced the old position
    // {0x1111111111111111111111111111111111111111, 0, amelia@example.com, 30}
    truffleAssert.eventEmitted(tx, 'LogUpdateUser', (ev) => {
      return ev.userAddress == address &&
        ev.index            == lastUserIndex &&
        ev.userEmail        == user.email &&
        ev.userAge          == user.age;
    });
    let getUserCount = await instance.getUserCount.call();
    assert.equal(getUserCount, users.length - 1);
  })

  it("should throw when calling getUser", async () => {
    let user = users[0];
    await expectThrow( instance.getUser(user.address) );
  })

  it("should throw when calling getAddressAtIndex", async () => {
    await expectThrow( instance.getAddressAtIndex(0) );
  })
})
