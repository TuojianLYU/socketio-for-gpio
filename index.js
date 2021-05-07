const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
    res.render("bstest");
})

app.get("/test", (req, res) => {
    res.render("bstest")
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
