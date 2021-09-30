const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
const users = {
  123456: { id: "123456", email: "user@example.com", password: "1234" }
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

const findUserWithEmail = (email) => {
  for (let key in users) {
    if (users[key]["email"] === email) {
      return users[key];
    }
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
const urlsForUser = (id) => {
  let myUrls = [];
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl]["userID"] === id) {
      myUrls.push(shortUrl);
    }
  }
  return myUrls;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.cookies["user_id"]] || {}
  };
  res.render("urls_reg", templateVars);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }

  res.render("login_", { user: {} });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  const user = findUserWithEmail(email);
  if (!user) {
    return res.status(403).send("No user found");
  }
  if (user) {
    if (password !== user["password"]) {
      return res.status(403).send("Password not correct");
    }
    res.cookie("user_id", user.id);
  }
  res.redirect("/urls");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/register", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  // to make sure input is not blank
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  // to check if user with same email already exists
  if (findUserWithEmail(email)) {
    return res.status(400).send("User with that email already exists");
  }

  const id = Math.floor(Math.random() * 3000) + 1;
  users[id] = { id: id, email: email, password: password };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(401)
      .send("<html><body><b>LOGIN</b> to access</body></html>\n");
  }

  const templateVars = {
    allUrls: urlDatabase,
    myUrls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]] || {}
  };
  res.render("urls_index", templateVars);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]] || {}
  };
  res.render("urls_new", templateVars);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Login to add new URL");
  }

  const longUrl = req.body["longURL"];
  if (!longUrl) {
    return res.status(400).send("URLS cannot be blank");
  }
  const userId = req.cookies["user_id"];
  const shortID = generateRandomString();

  urlDatabase[shortID] = {
    longURL: longUrl,
    userID: userId
  };
  res.redirect(`/u/${shortID}`);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Requested ID does not exist.");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(403).send("Cannot access this page without logging in");
  }

  const myUrls = urlsForUser(req.cookies["user_id"]);
  for (let url of myUrls) {
    if (req.params.shortURL === url) {
      const templateVars = {
        user: users[req.cookies["user_id"]] || {},
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]["longURL"]
      };
      return res.render("urls_show", templateVars);
    }
  }

  return res.status(403).send("Bad request. Cannot access other user's URL");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Cannot make changes without logging in");
  }

  const id = req.params.id;
  const myUrls = urlsForUser(req.cookies["user_id"]);
  for (let url of myUrls) {
    if (id === url) {
      const newLongURL = req.body["longURL"];
      urlDatabase[id]["longURL"] = newLongURL;
      return res.redirect(`/urls/${id}`);
    }
  }
  return res.status(400).send("Cannot make changes with other user's URLs");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res
      .status(400)
      .send(
        "<html><body><b>Bad Request</b> Cannot make changes without logging in</body></html>\n"
      );
  }
  const myUrls = urlsForUser(req.cookies["user_id"]);
  const shortId = req.params.shortURL;
  for (let url of myUrls) {
    if (shortId === url) {
      delete urlDatabase[shortId];
      res.redirect("/urls");
    }
  }
  return res
    .status(400)
    .send(
      "<html><body><b>Bad Request</b> Cannot make changes with other user's URLs</body></html>\n"
    );
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
