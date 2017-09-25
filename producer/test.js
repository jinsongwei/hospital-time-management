/**
 *   author: William Jin
 */



const config = require('../config/config.json');
let AWS = require('aws-sdk');

const HOSPITAL_TABLE = "HosHSC.case_log";
const HOSPITAL_GATE = "HospitalGate1";
const HOSPITAL_DDB_TALBE = "hos1_table";

AWS.config.update({
    region: 'us-west-2',
    credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
    }
});

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-west-2'});      // dynamic object last
let params = {
    TableName: HOSPITAL_DDB_TALBE
};

ddb.describeTable(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
});


let send = (numOfRecordsPerSec, numOfSec, recordLimit) => {
    updateSessionToken(err => {
        if (err) {
            console.error(err, err.stack);
            return;
        }
        let kinesis = new AWS.Kinesis({apiVersion: '2013-12-02'});
        let mysql = require('mysql');
        let con = mysql.createConnection(config.sqlConfig);

        con.connect((err) => {
            if (err) throw err;
            console.log("SQL Connected!");
            con.query("SELECT * FROM " + HOSPITAL_TABLE + " LIMIT " + recordLimit, (err, results) => {
                if (err) {
                    console.error(err, err.stack);
                    return;
                }
                sleepLoop(kinesis, results, numOfRecordsPerSec, 0, numOfSec, 0, () => {
                    console.log("done ...");
                })
            });
        });
    });
};

function sleepLoop(kinesis, records, recordsPerSec, elapse, timeLimit, idx, callback) {
    console.log("elapse: " + elapse);
    console.log("timeLimit: " + timeLimit);
    console.log("records size : " + records.length);
    console.log("idx: " + idx);


    if (idx + recordsPerSec < records.length && elapse < timeLimit) {
        setTimeout(function () {
            for (let j = idx; j < idx + recordsPerSec; j++) {
                sendToKinesis(kinesis, records[j]);
            }
            sleepLoop(kinesis, records, recordsPerSec, elapse + 1, timeLimit, idx + recordsPerSec, callback);
        }, 1000);
    } else {
        callback();
    }
}

function sendToKinesis(kinesis, caseRecord) {
    let logId = caseRecord.Log_Id;
    let putDataParams = {
        Data: JSON.stringify(caseRecord),
        PartitionKey: 'Hospital1_' + Date.now().toString() + "_" + logId,
        StreamName: HOSPITAL_GATE,
    };
    console.log("sending ... ", caseRecord);
    kinesis.putRecord(putDataParams, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
    });
}

function updateSessionToken(callback) {
    let sts = new AWS.STS({apiVersion: '2011-06-15'});
    let params = {
        DurationSeconds: 129600,
    };
    sts.getSessionToken(params, function (err, data) {
        if (err) callback(err);
        else {
            let cred = data.Credentials;
            AWS.config.update({
                credentials: {
                    accessKeyId: cred.AccessKeyId,
                    secretAccessKey: cred.SecretAccessKey,
                    sessionToken: cred.SessionToken
                }
            });
            callback();
        }
    });
};

