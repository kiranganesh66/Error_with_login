let express = require("express");
let bcrypt = require("bcrypt");
let app = express();
app.use(express.json());
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let dbPath = path.join(__dirname, "userData.db");
let db = null;

let intilisationOfDbandSever = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running on 3000");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
  }
};
intilisationOfDbandSever();

app.post("/register", async (request, response) => {
  let { username, name, password, gender, location } = request.body;
  let hashPasswrd = await bcrypt.hash(password, 10);
  let userconfirm = `select * from user where username = '${username}'`;
  let user = await db.get(userconfirm);
  let passwrd_len = password.length;

  if (passwrd_len < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    if (user === undefined) {
      let addNewuser = `INSERT INTO user (username, name, password, gender, location )
        VALUES (
            '${username}',
            '${name}',
            '${hashPasswrd}',
            '${gender}',
            '${location}'
        );`;
      await db.run(addNewuser);
      response.send("Successful registration of the registrant");
    } else {
      response.status(400);
      response.send("User already exists");
    }
  }
});

// login ApI

app.post("/login", async (request, response) => {
  let { username, password } = request.body;
  
  let userconfirm = `select * from user where username = '${username}'`;
  let verifyuser = await db.get(userconfirm);

  if (verifyuser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    let verfyHashpasswrd = await bcrypt.compare(password, verifyuser.password);

    if (verfyHashpasswrd === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");

      console.log(verifyuser.password);
    }
  }
});
