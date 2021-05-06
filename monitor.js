const io = require("socket.io-client");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require("fs");

const socket = io("http://localhost:3000");
socket.on("connection");

let count = 1;

setInterval(function () {

    fs.readFile("/Users/tuojianlyu/VSCodeProjects/temp/socketio-test/hello.txt", function (err, data) {
        if (err) {
            throw err;
        }
        console.log(data.toString());
        socket.emit("log", "fake log message: " + data.toString() + " " + count);
        count++;
    });

}, 1000);


// socket.emit("log", "fake log message " + count);

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}