/**
 *   author: William Jin
 *
 *   ------ hospital lambda function -----
 *
 *   1. mapping schema from hospital to TassFly formatted data.
 *   2. clean invalid cases.
 *   3. save meta data into DynamoDb.
 *   4. callback clean data and redirect to S3 as backup
 */

//todo remove below when uploading to AWS
// let config = require('../../config/config-helper').config;
// let AWS = new config().AWS; // remove this when upload to AWS

const AWS = require('aws-sdk');

const ERR = require('error-msg');
const schemaGate = require('../../lib/schema-gate/index');

let ddb = new AWS.DynamoDB({apiVersion: "2012-8-10", region: 'us-west-2'});
const HOS_META_DATA_TABLE = "hos1_table";
const META_DATA_TABLE = "meta-data-table";

function processError(err, func, callback) {
    ERR.Log("Hospital1", func, err);
    callback(err);
}

function DataTransform(event) {
    let totalRecordsNum = event.records.length;
    let schemaValidNum = 0;
    let caseValidNum = 0;
    let validIds = [];
    let curTime = Date.now();

    this.transform = (callback) => {
        displayInfo(err => {
            if (err) {
                processError(new Error(err), "displayInfo", callback);
                return;
            }
            schemaTransformation((err, intermediateData) => {
                if (err) {
                    processError(new Error(err), "schemaValidation", callback);
                    return;
                }
                callback(null, intermediateData);
                return;
                caseValidation(intermediateData, (err, cleanData) => {
                    if (err) {
                        processError(new Error(err), "caseValidation", callback);
                        return;
                    }
                    saveToDDB(cleanData, (err, records) => {
                        if (err) {
                            processError(new Error(err), "saveToDDB", callback);
                            return;
                        }
                        console.log(records);
                        callback(null, records);
                        saveMetaData(intermediateData, cleanData);
                    });
                });
            });
        });
    };

    // add log info here for different data interest
    function displayInfo(callback) {
        console.log(Date.now());
        callback();
    }

    function schemaTransformation(callback) {
        schemaGate.getSchema('hospital1', '1.0.0', (err, tassFlySchema) => {
            if (err) {
                callback(new Error(err));
                return;
            }
            const output = event.records.map((record) => {
                const entry = (new Buffer(record.data, 'base64')).toString('utf8');
                let entryJson = JSON.parse(entry);
                schemaValidNum++;
                let tassFlyRecord = getTassFlyFormatRecord(tassFlySchema, entryJson);
                return {
                    recordId: record.recordId,
                    result: 'Ok',
                    data: tassFlyRecord,
                }
            });
            callback(null, output);
        });
    }

    function caseValidation(intermediateData, callback) {
        const output = intermediateData.map((record) => {
            caseValidNum++;

            //todo invalid check
            let resultStatus = invalidCheck(record.data);
            if (resultStatus === 'Dropped') {

            } else {
                validIds.push(record.data['log_id']);
            }
            return {
                recordId: record.recordId,
                result: resultStatus,
                data: record.data
            }
        });
        callback(null, output);
    }

    /**
     *  case validation :
     *  1. drop unreasonable date.
     *  2. add missing value.
     */
    function invalidCheck(data) {
        if (data.sched_status_name === 'cancelled'
            || data.record_create_date_mill > data.last_update_date_mill) {
            return 'Dropped';
        } else {
            return 'Ok';
        }
    }

    function saveToDDB(cleanData, callback) {
        const output = cleanData.map((record) => {
            const payload = (new Buffer(JSON.stringify(record.data), 'utf8')).toString('base64');
            return {
                recordId: record.recordId,
                result: record.result,
                data: payload
            }
        });
        callback(null, {records: output});
    }

    function saveMetaData() {
        let hashHour = (parseInt(curTime / (1000 * 60 * 60))).toString();
        let hashMin = (parseInt(curTime / (1000 * 60))).toString();
        console.log(hashHour, hashMin);

        let params = {
            TableName: META_DATA_TABLE,
            Item: {
                hashKey: {S: hashHour},
                rangeKey: {S: hashMin},
                totalRecordsNum: {N: totalRecordsNum.toString()},
                schemaValidNum: {N: schemaValidNum.toString()},
                caseValidNum: {N: caseValidNum.toString()},
                validIds: {SS: validIds}
            },
            ReturnConsumedCapacity: "TOTAL"
        };
        console.log(validIds);
        console.log(params);
        ddb.putItem(params, (err, data) => {
            if (err) console.error(err);
            console.log((Date.now() - curTime) / 1000);
            console.log(data);
        });
    }

    function getTassFlyFormatRecord(schemaFormat, record) {
        let tassFlyRecord = {};
        let schemaFormatJson = schemaGate.documentToJson(schemaFormat);
        for (let key in schemaFormatJson) {
            if (schemaFormatJson.hasOwnProperty(key) && record.hasOwnProperty(key)) {
                tassFlyRecord[schemaFormatJson[key]] = record[key];
            }
        }
        return tassFlyRecord;
    }
}


exports.handler = function (event, context, callback) {
    if (!event || !event.records) {
        console.error(ERR, 'not a valid stream event'); // 'Invalid request'
        return;
    }

    const dataClean = new DataTransform(event);
    dataClean.transform(callback);
};
