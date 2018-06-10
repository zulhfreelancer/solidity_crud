pragma solidity ^0.4.0;
contract UserCrud {

  struct UserStruct {
    string userEmail;
    uint256 userAge;
    uint256 index;
  }

  address public owner;
  mapping(address => UserStruct) private userStructs;
  address[] private userIndex;

  event LogNewUser(address indexed userAddress, uint256 index, string userEmail, uint256 userAge);
  event LogUpdateUser(address indexed userAddress, uint256 index, string userEmail, uint256 userAge);
  event LogDeleteUser(address indexed userAddress, uint256 index);

  // Rails `before_action` like helper function to prevent we do CRUD non-existence user
  function isUser(address userAddress) public constant returns(bool isIndeed) {
    uint256 userIndexLength = userIndex.length;
    if (userIndexLength == 0) return false;

    uint256 biggestIndex = userIndexLength - 1;
    if ( userStructs[userAddress].index > biggestIndex ) return false;

    return (userIndex[userStructs[userAddress].index] == userAddress);
  }

  function insertUser(address userAddress, string userEmail, uint256 userAge) public returns(uint256 index) {
    require(!isUser(userAddress), "User already exists");
    userStructs[userAddress].userEmail = userEmail;
    userStructs[userAddress].userAge = userAge;
    userStructs[userAddress].index = userIndex.push(userAddress)-1;
    emit LogNewUser(userAddress, userStructs[userAddress].index, userEmail, userAge);
    return userIndex.length-1;
  }

  function updateUserEmail(address userAddress, string userEmail) public returns(bool success) {
    require(isUser(userAddress), "User does not exist");
    userStructs[userAddress].userEmail = userEmail;
    emit LogUpdateUser(userAddress, userStructs[userAddress].index, userEmail, userStructs[userAddress].userAge);
    return true;
  }

  function updateUserAge(address userAddress, uint256 userAge) public returns(bool success) {
    require(isUser(userAddress), "User does not exist");
    userStructs[userAddress].userAge = userAge;
    emit LogUpdateUser(userAddress, userStructs[userAddress].index, userStructs[userAddress].userEmail, userAge);
    return true;
  }

  function deleteUser(address userAddress) public returns(uint256 index) {
    require(isUser(userAddress), "User does not exist");
    uint256 rowToDelete = userStructs[userAddress].index;
    address keyToMove = userIndex[userIndex.length-1]; // always take the last key to replace it empty slot
    userIndex[rowToDelete] = keyToMove;
    userStructs[keyToMove].index = rowToDelete;
    userIndex.length--;
    emit LogDeleteUser(userAddress, rowToDelete);
    emit LogUpdateUser(keyToMove, rowToDelete, userStructs[keyToMove].userEmail, userStructs[keyToMove].userAge);
    return rowToDelete;
  }

  function getUser(address userAddress) public constant returns(string userEmail, uint256 userAge, uint256 index) {
    require(isUser(userAddress), "User does not exist");
    return(
        userStructs[userAddress].userEmail,
        userStructs[userAddress].userAge,
        userStructs[userAddress].index
    );
  }

  function getUserCount() public constant returns(uint256 count) {
    return userIndex.length;
  }

  function getAddressAtIndex(uint256 index) public constant returns(address userAddress) {
    return userIndex[index];
  }

  constructor() public {
    owner = msg.sender;
  }

  // JUST FOR DEV ------------------------------------------------------
  // to prove that the struct is not deleted after the deletion process
  // only the userIndex[] will get deleted
  // but, since we have isUser() to guard all function calls, we are okay
  // JUST FOR DEV ------------------------------------------------------
  function getUserEmail(address userAddress) public constant returns(string email) {
    return userStructs[userAddress].userEmail;
  }
}
