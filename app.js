const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:5173", 
		credentials: true,
	})
);
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
const authenticateJWT = (req, res, next) => {
	// const bearerHeader = req.headers.authorization;
	// const bearer = bearerHeader.split(' ');
	// const token = bearer[1];
	const token = req.cookies.jwt;

	if (token) {
		jwt.verify(token, SECRET_KEY, (err, uzer) => {
			if (err) {
				console.log(err);
				return res.status(403).json({ message: "Forbidden" });
			} else {
				req.uzer = uzer;
				next();
			}
		});
	} else {
		res.status(401).json({ message: "Unauthourized" });
	}
};
app.use(cors());
app.use(bodyParser.json());
const userDB = [
	{
		emailAddress: "net.maaz@yahoo.com",
		password: "123abc",
	},
];
const now = new Date();
let users = [
	{
		title: "one 2 one",
		id: 1,
		timeStamp: now.getTime(),
		author: "Maaz",
		Date: "13 /02 / 24",
		content: "Hi how are you ",
	},
	{
		title: "one 4 one",
		id: 2,
		timeStamp: now.getTime(),
		author: "Maaz",
		Date: "13 /02 / 24",
		content: "Hi how are you ",
	},
	{
		title: "one  one",
		id: 3,
		timeStamp: now.getTime(),
		author: "Maaz",
		Date: "3 /03 / 24",
		content: "Hey you ",
	},
];
app.get("/", (req, res) => {
	console.log("dfgdhgvjh");
	res.send("Hello World!");
});
app.post("/create", (req, res) => {
	try {
		const title = req.body.title;
		const id = req.body.id;
		const timeStamp = req.body.timeStamp;
		const author = req.body.author;
		const Date = req.body.Date;
		const content = req.body.content;
		users.push({
			title: title,
			id: id,
			timeStamp: timeStamp,
			author: author,
			content: content,
			Date: Date,
		});
		res.json({ msg: "done" });
	} catch (error) {
		console.error("error occured :", error.message);
	}
});
app.get("/view", authenticateJWT, (req, res) => {
	res.json(users);
});
app.delete("/delete-note", (req, res) => {
	const id = req.body.id;
	let newUser = [];
	function filt(user) {
		return user.id != id;
	}
	newUser = users.filter(filt);
	users = newUser;
	res.json({ msg: `deleted ${id}` });
});
app.post("/sign-up", (req, res) => {
	const { emailAddress, password } = req.body;
	const uzer = userDB.find(
		(u) => u.emailAddress == emailAddress && u.password == password
	);
	console.log("uzer", uzer);
	if (uzer) {
		const token = jwt.sign({ emailAddress: uzer.emailAddress }, SECRET_KEY, {
			expiresIn: "1h",
		});

		res.cookie("jwt", token, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",

			path: "/",
			
		});
		console.log("cookie sent");
	} else {
		res.status(401).json({ message: "Invalid Credentials" });
	}
});

app.get("/protected", authenticateJWT, (req, res) => {
	console.log("yes");
	res.json({ message: "You have accessed a protected route", user: req.user });
});
app.post("/edit", (req, res) => {
	const id = req.body.id;
	const newContent = req.body.content;
	const index = req.body.index;
	console.log(`${newContent} hey`);
	const newUser = { ...users[index], content: newContent };
	console.log(newUser);
	users.splice(index, 1, newUser);
	res.json(newUser);
});
const port = 3000;

app.listen(port, () => {
	console.log(`app listening on port ${port}`);
});
