// const socket = io("http://35.228.43.127/");
const socket = io("http://localhost:3000");
socket.on("connection");

let result = document.getElementById("result");
let user = "";

let message = 0;
const sendMessage = () => {
    message = (message + 1) % 2;
    socket.emit("button", user, message);
};

//=======================================
userForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (userInput.value) {
        user = userInput.value;
        document.getElementById("username").innerHTML = user;
        socket.on("led" + user, function (msg) {
            result.innerHTML = msg;
            if (msg == 1) {
                document.getElementById("led-image").src = "images/led-on.jpg"
            }
            else {
                document.getElementById("led-image").src = "images/led-off.jpg"
            }
        });
        userInput.value = "";
    }
});

//=================test===================
cmdForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let image = imageInput.value;
    let port = portInput.value;
    let name = nameInput.value;
    let node = nodeInput.value;

    let cmd = "docker run -d --privileged -p " + port + ":" + port + " " +
        "--name " + name + " " + image;

    socket.emit("container", node, cmd);
});