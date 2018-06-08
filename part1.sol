pragma solidity ^0.4.0;

contract UserCrud {

    struct UserStruct {
        string userEmail;
        uint256 userAge;
        uint256 index;
    }

    mapping(address => UserStruct) private userStructs;
    address[] private userIndex;

    event LogNewUser(address indexed userAddress, uint256 index, string userEmail, uint256 userAge);
    event LogUpdateUser(address indexed userAddress, uint256 index, string userEmail, uint256 userAge);

    // Rails `before_action` like helper function to prevent we do CRUD non-existence user
    function isUser(address userAddress) public constant returns(bool isIndeed) {
        if (userIndex.length == 0) return false;
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

    function getUser(address userAddress) public constant returns(string userEmail, uint256 userAge, uint256 index) {
        require(isUser(userAddress), "User does not exist");
        return(
            userStructs[userAddress].userEmail,
            userStructs[userAddress].userAge,
            userStructs[userAddress].index
        );
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

    function getUserCount() public constant returns(uint256 count) {
        return userIndex.length;
    }

    function getAddressAtIndex(uint256 index) public constant returns(address userAddress) {
        return userIndex[index];
    }
}
