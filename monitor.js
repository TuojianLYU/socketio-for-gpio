const io = require("socket.io-client");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require("fs");

const socket = io("http://35.228.251.153/");
socket.on("connection");

setInterval(function () {

    fs.readFile("/sys/class/gpio/gpio3/value", function (err, data) {
        if (err) {
            throw err;
        }
        console.log(data.toString());
	socket.emit("log", data.toString());
    });

}, 1000);

socket.emit("log", "test messge");

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
