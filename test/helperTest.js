const { assert } = require("chai");

const { findUserWithEmail } = require("../helper.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("findUserWithEmail", function () {
  it("should return a user with valid email", function () {
    const user = findUserWithEmail("user@example.com", testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });

  it("should return undefined if the email provide is not valid", function () {
    const user = findUserWithEmail("user3@example.com", testUsers);
    assert.isUndefined(user);
  });
});
