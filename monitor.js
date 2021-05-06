const io = require("socket.io-client");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const socket = io("http://localhost:3000");
socket.on("connection");

let count = 1;
while (true) {

    let temp = loadFile("/sys/class/gpio/gpio8/value");

    if (temp != null) {
        if (temp.valueOf == "1".valueOf) {
            console.log("1");
        }
    } else {
        console.log("0");
    }
}

socket.emit("log", "fake log message " + count);

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