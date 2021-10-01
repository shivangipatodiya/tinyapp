const findUserWithEmail = (email, database) => {
  for (let key in database) {
    if (database[key]["email"] === email) {
      return database[key];
    }
  }
};

function generateRandomString() {
  let char = "JaLbVIcdKeOWUfYMNXghiTGjkHlmnQoSpqrRFstZuPvCwxBDyzA";
  let output = "";
  for (let i = 0; i < 6; i++) {
    if (i !== 1 && i !== 5) {
      const random = Math.floor(Math.random() * 51);
      output += char[random];
    } else {
      output += Math.floor(Math.random() * 9);
    }
  }
  return output;
}

const urlsForUser = (id, database) => {
  let myUrls = [];
  for (const shortUrl in database) {
    if (database[shortUrl]["userID"] === id) {
      myUrls.push(shortUrl);
    }
  }
  return myUrls;
};
module.exports = {
  findUserWithEmail,
  generateRandomString,
  urlsForUser
};
