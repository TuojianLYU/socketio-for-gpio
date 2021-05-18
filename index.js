const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const exec = require('child_process').exec;
const { stdout } = require('process');
const { SSL_OP_NO_SSLv2 } = require('constants');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");
app.set("view engine", "ejs");
app.set("views", "views");

let terminalLog = "";
let containerList = [];
let testList = [];

app.get("/", (req, res) => {
    res.render("home", { containerList: containerList });
})

app.post("/", (req, res) => {
    const image = req.body.image;
    const port = req.body.port;
    const name = req.body.name;
    const node = req.body.node;


    let cmd = "docker run -d --name " + name + " " + image + " " + "0.0.0.0:" + port;
    let testCmd = "docker service create -d --name " + name + " -p " + port + ":" + port + " --constraint node.hostname=="
        + node + " " + image + " " + "0.0.0.0:" + port;

    let containerCmd = `docker service ls --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Name":"{{ .Name }}"}'`;
    let serviceCmd = `docker service ps`;
    let formatEnd = ` --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Name":"{{ .Name }}", "Node":"{{ .Node }}"}'`

    exec(testCmd, function (err, stdout, stderr) {

        // console.log(stdout);
        terminalLog = stdout;
        exec(containerCmd, function (err, stdout, stderr) {

            let objArray = [];
            // containerList = stdout;
            var found = [],          // an array to collect the strings that are found
                rxp = /{([^}]+)}/g,
                str = stdout,
                curMatch;
            while (curMatch = rxp.exec(str)) {
                found.push('{' + curMatch[1] + '}');
            }
            // console.log(found);
            for (let i = 0; i < found.length; i++) {
                let obj = JSON.parse(found[i]);
                objArray.push(obj);
            }
            for (let i = 0; i < objArray.length; i++) {
                // console.log(objArray[i].ID);
                serviceCmd = serviceCmd + " " + objArray[i].ID;
            }
            serviceCmd += formatEnd;
            console.log("service cmd: " + serviceCmd)

            exec(serviceCmd, function (err, stdout, stderr) {
                console.log("stdout: " + stdout)
                let objArray = [];
                var found = [],          // an array to collect the strings that are found
                    rxp = /{([^}]+)}/g,
                    str = stdout,
                    curMatch;
                while (curMatch = rxp.exec(str)) {
                    found.push('{' + curMatch[1] + '}');
                }
                console.log("found: " + found);
                for (let i = 0; i < found.length; i++) {
                    let obj = JSON.parse(found[i]);
                    objArray.push(obj);
                }
                for (let i = 0; i < objArray.length; i++) {
                    // console.log(objArray[i].ID);
                    console.log("Node test: " + objArray[i].Node)
                }
                containerList = objArray;
                res.redirect("/");
            })

            // res.redirect("/");
        });
    });
})

server.listen(80, () => {
// server.listen(3000, () => {
    console.log("Server is running");
})

io.on("connection", (socket) => {
    // console.log("User connected: " + socket.id);

    socket.on("button", (user, data) => {
        // console.log(user)
        io.emit("button" + user, data);
    });

    socket.on("led", (user, data) => {
        io.emit("led" + user, data);
    });
});
