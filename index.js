const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const exec = require('child_process').exec;
const { stdout } = require('process');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");
app.set("view engine", "ejs");
app.set("views", "views");

let terminalLog = "";

app.get("/", (req, res) => {
    res.render("home", { terminalLog: terminalLog });
})

app.post("/", (req, res) => {
    const cmd = req.body.cmd;

    exec(cmd, function (err, stdout, stderr) {
        console.log(stdout);
        terminalLog = stdout;
    });
    res.redirect("/");
})

server.listen(80, () => {
    console.log("Server is running");
})

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    socket.on("button", (data) => {
        socket.broadcast.emit("button", data);
    });

    socket.on("led", (data) => {
        socket.broadcast.emit("led", data);
    });
});
