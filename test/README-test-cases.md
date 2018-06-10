### [Case A](./test/user_crud_case_a.js) - Delete The Last User

Add 3 users - Amelia, Bob and Alice. And then delete Alice.

**The events will be:**

```
[LogDeleteUser]
0x3333333333333333333333333333333333333333, 2

[LogUpdateUser]
0x3333333333333333333333333333333333333333, 2, alice@example.com, 32
```

**Why this happened? Let's see the code, line-by-line:**

```
uint256 rowToDelete = userStructs[userAddress].index;
rowToDelete = 2;

address keyToMove = userIndex[userIndex.length-1];
keyToMove = 0x3333333333333333333333333333333333333333;

userIndex[rowToDelete] = keyToMove;
userIndex[2] = 0x3333333333333333333333333333333333333333;

userStructs[keyToMove].index = rowToDelete;
userStructs[0x3333333333333333333333333333333333333333].index = 2;

userIndex.length--;
// it's 2 now

LogDeleteUser(userAddress, rowToDelete);
LogDeleteUser(0x3333333333333333333333333333333333333333, 2); // expected

LogUpdateUser(keyToMove, rowToDelete, userStructs[keyToMove].userEmail, userStructs[keyToMove].userAge);
LogUpdateUser(0x3333333333333333333333333333333333333333, 2, alice@example.com, 32); // the weird part
```

**So, what we can conclude here?**

If both `LogDeleteUser` and `LogUpdateUser` events are showing the same `userAddress` and `index`, that means we were deleting the last user.

### [Case B](./test/user_crud_case_b.js) - A Lonely User, Delete Her

Add only 1 user - Amelia. And then delete her.

**The events will be:**

```
[LogDeleteUser]
0x1111111111111111111111111111111111111111, 0

[LogUpdateUser]
0x1111111111111111111111111111111111111111, 0, amelia@example.com, 30
```

**Why this happened?**

It's like Case A. Amelia is the first and the last user. So, when we were deleting her, we actually deleting the last user.

**So, what we can conclude here?**

If both `LogDeleteUser` and `LogUpdateUser` events are showing the same `userAddress` and `index` AND the `index` is `0`, we actually deleting the lonely user.

### [Case C](./test/user_crud_case_c.js) - Delete The Middle User

Add 3 users - Amelia, Bob and Alice. And then delete Bob (the middle).

**The events will be:**

```
[LogDeleteUser]
0x2222222222222222222222222222222222222222, 1

[LogUpdateUser]
0x3333333333333333333333333333333333333333, 1, alice@example.com, 32
```

**What happened here?**

This is the normal and expected deletion process. We first delete Bob and then swap Bob's position with Alice without moving all users after Bob (read: out of gas problem).

**So, what we can conclude here?**

If both `LogDeleteUser` and `LogUpdateUser` events are showing different `userAddress` but the `index` is same, we know that position-swap was just happened (Alice took Bob's place).
