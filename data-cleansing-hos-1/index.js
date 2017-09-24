/**
 *   author: William Jin
 */

//todo remove below when uploading to AWS
// let config = require('./test/config-helper').config;
// let AWS = new config().AWS; // remove this when upload to AWS


const AWS = require('aws-sdk');

const ERR = require('error-msg');
const schema = require('./schema');
const attributes = schema.attributes;

let ddb = new AWS.DynamoDB({apiVersion: "2012-8-10", region: 'us-west-2'});
const HOS_META_DATA_TABLE = "hos1_table";

function processError(err, func, callback) {
    ERR.Log("Hospital1", func, err);
    callback(err);
}

function DataTransform(event) {
    const self = this;
    this.transform = (callback) => {
        self.callback = callback;

        displayInfo(err => {
            if (err) {
                processError(new Error(err), "displayInfo", callback);
                return;
            }
            schemaValidation((err, intermediateData) => {
                if (err) {
                    processError(new Error(err), "schemaValidation", callback);
                    return;
                }
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
                    });
                });
            });
        });
    };

    // add log info here for different data interest
    function displayInfo(callback) {
        // console.log(event);
        console.log(Date.now());
        callback();
    }

    //
    function schemaValidation(callback) {
        const output = event.records.map((record) => {
            const entry = (new Buffer(record.data, 'base64')).toString('utf8');
            try {
                content = JSON.parse(entry);
                return {
                    recordId: record.recordId,
                    result: 'Ok',
                    data: content,
                }

            } catch (e) {
                console.error(e);
                return {
                    recordId: record.recordId,
                    result: 'ProcessingFailed',
                    data: record.data,
                };
            }
        });
        callback(null, output);
    }


    //case validation logic: clean unreasonable date and case status and add or drop missing values.
    function caseValidation(intermediateData, callback) {
        const output = intermediateData.map((record) => {
            return {
                recordId: record.recordId,
                result: 'Ok',
                data: record.data
            }
        });

        callback(null, output);
    }

    function saveToDDB(cleanData, callback) {
        loopSaveToDDB(cleanData, 0, (err) => {
            if (err) {
                callback(err);
                return;
            }
            const output = cleanData.map((record) => {
                const payload = (new Buffer(JSON.stringify(record.data), 'utf8')).toString('base64');
                return {
                    recordId: record.recordId,
                    result: record.result,
                    data: payload
                }
            });
            callback(null, {records: output});
        });

    }

    function loopSaveToDDB(records, index, callback) {
        if (index < records.length) {
            const content = records[index].data;
            let params = {
                TableName: HOS_META_DATA_TABLE,
                Item: {
                    log_id: {S: content.log_id},
                    record_create_date: {S: content.record_create_date},
                    record_create_date_mill: {N: content.record_create_date_mill.toString()},
                    record_create_date_hash: {N: content.record_create_date_hash.toString()},
                    record_create_date_day: {N: content.record_create_date_day.toString()},
                    last_update_date: {S: content.last_update_date},
                    last_update_date_mill: {N: content.last_update_date_mill.toString()},
                    last_update_date_hash: {N: content.last_update_date_hash.toString()},
                    last_update_date_day: {N: content.last_update_date_day.toString()},
                    sched_surgery_date: {S: content.sched_surgery_date},
                    sched_surgery_date_mill: {N: content.sched_surgery_date_mill.toString()},
                    sched_surgery_date_hash: {N: content.sched_surgery_date_hash.toString()},
                    sched_surgery_date_day: {N: content.sched_surgery_date_day.toString()},
                    case_class_name: {S: content.case_class_name},
                    surgeon_req_len: {S: content.surgeon_req_len},
                    setup_minutes: {S: content.setup_minutes},
                    cleanup_minutes: {S: content.cleanup_minutes},
                    total_time_needed: {S: content.total_time_needed},
                    add_on_case_yn: {S: content.add_on_case_yn},
                    sched_status_c: {S: content.sched_status_c},
                    sched_status_name: {S: content.sched_status_name},
                    cancel_date: {S: content.cancel_date},
                    cancel_reason_c: {S: content.cancel_reason_c},
                    cancel_reason_name: {S: content.cancel_reason_name},
                    service_c: {S: content.service_c},
                    service_name: {S: content.service_name},
                    procedure_id: {S: content.procedure_id},
                    procedure_name: {S: content.procedure_name},
                    parent_location_id: {S: content.parent_location_id},
                    location_id: {S: content.location_id},
                    location_name: {S: content.location_name},
                    room_id: {S: content.room_id},
                    room_name: {S: content.room_name},
                    sched_setup_start_dttm: {S: content.sched_setup_start_dttm},
                    sched_in_room_dttm: {S: content.sched_in_room_dttm},
                    sched_out_room_dttm: {S: content.sched_out_room_dttm},
                    sched_cleanup_comp_dttm: {S: content.sched_cleanup_comp_dttm},
                    room_setup_start_dttm: {S: content.room_setup_start_dttm},
                    room_ready_dttm: {S: content.room_ready_dttm},
                    patient_in_room_dttm: {S: content.patient_in_room_dttm},
                    patient_out_room_dttm: {S: content.patient_out_room_dttm},
                    room_cleanup_start_dttm: {S: content.room_cleanup_start_dttm},
                    room_cleanup_comp_dttm: {S: content.room_cleanup_comp_dttm},
                    delay_type_c: {S: content.delay_type_c},
                    delay_type_nm: {S: content.delay_type_nm}
                }
            };
            ddb.putItem(params, (err) => {
                    if (err) {
                        console.error(err, err.stack);
                        records[index].result = 'ProcessingFailed';
                    }
                    // console.log(records[index]);
                    console.log(index);
                    loopSaveToDDB(records, index + 1, callback);
                }
            );
        } else {
            callback();
        }
    }
}


exports.handler = function (event, context, callback) {
    if (!event || !event.invocationId || !event.deliveryStreamArn || !event.records) {
        console.error(ERR, 'not a valid stream event'); // 'Invalid request'
        return;
    }

    const dataClean = new DataTransform(event);
    dataClean.transform(callback);
};
