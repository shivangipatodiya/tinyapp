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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] || {}
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortID = generateRandomString();
  urlDatabase[shortID] = req.body["longURL"];
  res.redirect(`/u/${shortID}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortId = req.params.shortURL;
  delete urlDatabase[shortId];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (req.body.longURL) {
    const newLongURL = req.body["longURL"];
    urlDatabase[id] = newLongURL;
  }
  res.redirect(`/urls/${id}`);
});

app.get("/login", (req, res) => {
  res.render("login_", { user: {} });
});

app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  console.log(users);
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

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]] || {}
  };
  res.render("urls_reg", templateVars);
});

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
