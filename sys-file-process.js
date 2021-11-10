const { SSL_OP_MICROSOFT_SESS_ID_BUG, SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG } = require("constants");
var fs = require("fs");

let sysFilePath = "/Users/tuojianlyu/VSCodeProjects/temp/socketio-for-gpio/RevPiTest.json";
let sysJson;
let insertID = "OPC";
let IOFBsNameArray = [];
let OPCFBs = [];
let fbInsertType = "CLIENT_1_0"
let opcuaAddr = "opc.tcp://localhost:53880";
let IOFBsObjArray = [];

console.time('doSomething')

let fbInsert = {
    '@_Name': "",
    '@_Type': fbInsertType,
    '@_Comment': '',
    '@_x': '100',
    '@_y': '100'
};

let conectionTemplate = {
    "@_Source": "",
    "@_Destination": "",
    "@_Comment": "",
    "@_dx1": ""
};

let ParameterTemplate = [
    {
        '@_Name': 'QI', '@_Value': '1'
    },
    {
        '@_Name': 'ID', '@_Value': ""
    }
];

let mappingTemplate = {
    "@_From": "",
    "@_To": ""
}

function insertOpcFBsFromSysFile() {
    fs.readFile(sysFilePath, function (error, content) {
        sysJson = JSON.parse(content);
        findIOFBs(sysJson);
        // console.log(sysJson)
    });
}

const findIOFBs = (sysJson) => {
    let index = 0;
    sysJson.System.Application.SubAppNetwork.FB.forEach(fb => {
        if ((fb['@_Type'] == "IX") || (fb['@_Type'] == "QX")) {
            IOFBsNameArray[index] = fb['@_Name'];
            IOFBsObjArray[index] = fb;
            index++;
        }
    });

    insertIOFBs(IOFBsNameArray);
}

function insertIOFBs(IOFBsNameArray) {

    let index = 0;

    //Find and prepare opc ua fbs with IDs
    IOFBsNameArray.forEach(IOFBName => {
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

    OPCFBs.forEach(element => {
        sysJson.System.Application.SubAppNetwork.FB.push(element);
        if (typeof sysJson.System.Device.Resource === 'array') {
            sysJson.System.Device.Resource[0].FBNetwork.FB.push(element);
        } else {
            sysJson.System.Device.Resource.FBNetwork.FB.push(element);
        }

        let mappingFB = { ...mappingTemplate };
        mappingFB['@_From'] = sysJson.System.Application["@_Name"] + "." + element["@_Name"];

        if (typeof sysJson.System.Device.Resource === 'array') {
            mappingFB['@_To'] = sysJson.System.Device["@_Name"] + "." + sysJson.System.Device.Resource[0]["@_Name"] + "." + element["@_Name"];
        } else {
            mappingFB['@_To'] = sysJson.System.Device["@_Name"] + "." + sysJson.System.Device.Resource["@_Name"] + "." + element["@_Name"];
        }

        sysJson.System.Mapping.push(mappingFB);
    });

    let index1 = 0;

    //Prepare events and data connections and insert them to the original json object
    IOFBsObjArray.forEach(element => {
        let sourceName;
        let destiName;
        let eventConnectionINIT;
        let eventConnectionREQ;
        let dataConnectionSD;

        if ((element['@_Type'] == "IX")) {
            //Do the same as above
            //Prepare INIT event connection
            sourceName = element['@_Name'] + ".INITO";
            destiName = OPCFBs[index1]['@_Name'] + ".INIT";
            eventConnectionINIT = { ...conectionTemplate };
            eventConnectionINIT["@_Source"] = sourceName;
            eventConnectionINIT["@_Destination"] = destiName;

            //Prepare REQ event connection
            sourceName = element['@_Name'] + ".IND";
            destiName = OPCFBs[index1]['@_Name'] + ".REQ";
            eventConnectionREQ = { ...conectionTemplate };
            eventConnectionREQ["@_Source"] = sourceName;
            eventConnectionREQ["@_Destination"] = destiName;

            //PreparsourceName = element + ".IND";
            sourceName = element['@_Name'] + ".IN";
            destiName = OPCFBs[index1]['@_Name'] + ".SD_1";
            dataConnectionSD = { ...conectionTemplate };
            dataConnectionSD["@_Source"] = sourceName;
            dataConnectionSD["@_Destination"] = destiName;

        } else {
            //Search INIT connection from destination of QX
            let eventsConnections = sysJson.System.Application.SubAppNetwork.EventConnections.Connection;
            let dataConnections = sysJson.System.Application.SubAppNetwork.DataConnections.Connection;
            eventsConnections.forEach(eveConEle => {
                if (eveConEle["@_Destination"] == element['@_Name'] + ".INIT") {
                    sourceName = eveConEle["@_Source"];
                    destiName = OPCFBs[index1]['@_Name'] + ".INIT";
                    eventConnectionINIT = { ...conectionTemplate };
                    eventConnectionINIT["@_Source"] = sourceName;
                    eventConnectionINIT["@_Destination"] = destiName;
                }
                if (eveConEle["@_Destination"] == element['@_Name'] + ".REQ") {
                    sourceName = eveConEle["@_Source"];
                    destiName = OPCFBs[index1]['@_Name'] + ".REQ";
                    eventConnectionREQ = { ...conectionTemplate };
                    eventConnectionREQ["@_Source"] = sourceName;
                    eventConnectionREQ["@_Destination"] = destiName;
                }
            });
            dataConnections.forEach(dataConEle => {
                if (dataConEle["@_Destination"] == element['@_Name'] + ".OUT") {
                    sourceName = dataConEle["@_Source"];
                    destiName = OPCFBs[index1]['@_Name'] + ".SD_1";
                    dataConnectionSD = { ...conectionTemplate };
                    dataConnectionSD["@_Source"] = sourceName;
                    dataConnectionSD["@_Destination"] = destiName;
                }
            });
        }
        sysJson.System.Application.SubAppNetwork.EventConnections.Connection.push(eventConnectionINIT);
        // sysJson.System.Device.Resource[0].FBNetwork.EventConnections.Connection.push(eventConnectionINIT)

        sysJson.System.Application.SubAppNetwork.EventConnections.Connection.push(eventConnectionREQ);
        // sysJson.System.Device.Resource[0].FBNetwork.EventConnections.Connection.push(eventConnectionREQ)

        sysJson.System.Application.SubAppNetwork.DataConnections.Connection.push(dataConnectionSD);
        // sysJson.System.Device.Resource[0].FBNetwork.DataConnections.Connection.push(dataConnectionSD)

        if (typeof sysJson.System.Device.Resource === 'array') {
            sysJson.System.Device.Resource[0].FBNetwork.EventConnections.Connection.push(eventConnectionINIT);
            sysJson.System.Device.Resource[0].FBNetwork.EventConnections.Connection.push(eventConnectionREQ);
            sysJson.System.Device.Resource[0].FBNetwork.DataConnections.Connection.push(dataConnectionSD);

        } else {
            sysJson.System.Device.Resource.FBNetwork.EventConnections.Connection.push(eventConnectionINIT);
            sysJson.System.Device.Resource.FBNetwork.EventConnections.Connection.push(eventConnectionREQ);
            sysJson.System.Device.Resource.FBNetwork.DataConnections.Connection.push(dataConnectionSD);
        }

        index1++;
    });

    var str = JSON.stringify(sysJson, null, 2);
    fs.writeFileSync('./sysOPC.json', str);
    console.log("sys json is written to the file")
}

async function main() {

    insertOpcFBsFromSysFile();

}

main()


console.timeEnd('doSomething')


