const { SSL_OP_MICROSOFT_SESS_ID_BUG } = require("constants");
var fs = require("fs");

let sysFilePath = "/Users/tuojianlyu/VSCodeProjects/temp/socketio-for-gpio/RevPiTest.json";
let sysJson;
let insertID = "OPC";
let IOFBsArray = [];
let OPCFBs = [];
let fbInsertType = "CLIENT_1_0"
let opcuaAddr = "opc.tcp://localhost:53880";

let fbInsert = {
    '@_Name': "",
    '@_Type': fbInsertType,
    '@_Comment': '',
    '@_x': '100',
    '@_y': '100'
};

let ParameterTemplate = [
    {
        '@_Name': 'QI', '@_Value': '1'
    },
    {
        '@_Name': 'ID', '@_Value': ""
    }
];

function insertOpcFBsFromSysFile() {
    fs.readFile(sysFilePath, function (error, content) {
        sysJson = JSON.parse(content);
        findIOFBs(sysJson);
    });

    return sysJson;
}

const findIOFBs = (sysJson) => {
    let index = 0;
    sysJson.System.Application.SubAppNetwork.FB.forEach(fb => {
        if ((fb['@_Type'] == "IX") || (fb['@_Type'] == "QX")) {
            IOFBsArray[index] = fb['@_Name'];
            index++;
        }
    });

    insertIOFBs(IOFBsArray);
}

function insertIOFBs(IOFBsArray) {

    let index = 0;
    IOFBsArray.forEach(IOFBName => {

        let opcInsertFB = { ...fbInsert };
        let fbInsertName = IOFBName + "_" + insertID;
        let opcID = 'opc_ua[WRITE;' + opcuaAddr + '#;/Objects/1:' + fbInsertName + ']';
        opcInsertFB['@_Name'] = fbInsertName;

        let Parameter = JSON.parse(JSON.stringify(ParameterTemplate));
        opcInsertFB.Parameter = Parameter;
        opcInsertFB.Parameter[1]['@_Value'] = opcID;

        OPCFBs[index] = opcInsertFB;
        index++;
    });

    // console.log(OPCFBs)

    OPCFBs.forEach(element => {
        sysJson.System.Application.SubAppNetwork.FB.push(element)
    });

    // sysJson.System.Application.SubAppNetwork.FB.concat(OPCFBs);
    // console.log(sysJson.System.Application.SubAppNetwork.FB)
    var str = JSON.stringify(sysJson, null, 2);
    // console.log(str)
    fs.writeFileSync('./sysOPC.json', str);
    console.log("At the end of program")

    
}

async function main() {

    await insertOpcFBsFromSysFile();

    console.log("should be printed at the end")
}

main()






