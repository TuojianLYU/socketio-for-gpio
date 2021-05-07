const io = require("socket.io-client");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require("fs");

const socket = io("http://35.228.251.153/");
socket.on("connection");

setInterval(function () {

    fs.readFile("/sys/class/gpio/gpio8/value", function (err, data) {
        if (err) {
            throw err;
        }
        console.log(data.toString());
	socket.emit("led", data.toString());
    });

}, 1000);

const buttonPath = "/sys/class/gpio/gpio2/value"
socket.on("button", (data) => {
    fs.writeFile(buttonPath, data, function(error) {
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
