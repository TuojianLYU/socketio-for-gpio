const io = require("socket.io-client");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require("fs");

const socket = io("http://35.228.43.127/");
// const socket = io("http://localhost:3000/");
socket.on("connection");

let ledPath = "/sys/class/gpio/gpio8/value";
// let ledPath = "/Users/tuojianlyu/VSCodeProjects/temp/socketio-for-gpio/led.txt";
let buttonPath = "/sys/class/gpio/gpio2/value";
// let buttonPath = "/Users/tuojianlyu/VSCodeProjects/temp/socketio-for-gpio/btn.txt";

const args = process.argv.slice(2);
console.log(args[0]);
let username = args[0];
let value;

setInterval(function () {
    fs.readFile(ledPath, function (err, data) {
        if (err) {
            throw err;
        }
        if (value != data) {
            value = data;
            socket.emit("led", username, data.toString());
        }
    });

}, 10);

socket.on("button" + username, (data) => {
    fs.writeFile(buttonPath, data, function (error) {
        if (error) {
            console.error("write error:  " + error.message);
        } else {
            console.log("Successful Write to " + buttonPath);
        }
    });
});

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
