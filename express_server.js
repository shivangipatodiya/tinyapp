const express = require("express");
const app = express();
const PORT = 8080;

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

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

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
  console.log(req.cookies);
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
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

app.post("/login", (req, res) => {
  const val = req.body["username"];
  res.cookie("username", val);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
