# Virtual commissioning platform for 4diac IEC 61499 control systems

For debugging control applications developed in 4diac with IEC 61499 standard, it would be easier that a cloud-based interactive website could be used. Also, soft-plc containers can be customized and delopyed in the VC case. Generally, this website could be used to create soft-plc containers and deploy to cloud VMs, monitoring statistics of soft-plc containers and VMs, disply VC results on the web page. The way to use is: 1) launch the web server in the cloud VM, 2) visit the home page, 3) following the instruction to deploy soft-plc containers (what I used in the test is the Forte container).

# Auto-generated OPC UA FBs in 4diac IDE

The file sys-file-process.js is used to automatically generate OPC UA FBs in 4diac. The work flow is that, first the 4diac project system file should be converted to json format from xml. Then, this converted json file can be processed by this js script to generate a new json file with OPC UA configurations by processing the info of the existing control application. The generated json file should also be converted back to the xml format as a new 4diac system file. Once updating the existing system file with this generated one, OPC UA FBs, e.g., SUBSCRIBE and CLIENT, can be seen that they are connected to IO FBs, e.g., IX and QX, with correct ports.
