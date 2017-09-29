/**
 *   author: William Jin
 */

//todo remove it
const config = require('../../config/config-helper').config;
const AWS = new config().AWS; // remove this when upload to AWS

// const AWS = require('aws-sdk');
const Protocol = require('./protocol');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-west-2'});

const META_DATA_TABLE = 'meta-data-table';
const INVALID_PARAMS = 'invalid params';


Protocol.registerSchema = (hospitalName, version, schemaJson, callback) => {
    if (!hospitalName || !version || typeof schemaJson !== 'object' || typeof callback !== 'function') {
        callback(new Error(INVALID_PARAMS));
        return;
    }
    let schemaDocument = jsonToDocumentWithReverse(schemaJson);
    let params = {
        TableName: META_DATA_TABLE,
        Item: {
            hashKey: {
                S: hospitalName,
            },
            rangeKey: {
                S: version
            },
            schema: {M: schemaDocument.keyValue},
            schemaReverse: {M: schemaDocument.valueKey}
        }
    };
    ddb.putItem(params, callback);
};

Protocol.updateSchema = (hospitalName, version, schemaJson, callback) => {
    if (!hospitalName || !version || typeof schemaJson !== 'object' || typeof callback !== 'function') {
        callback(new Error(INVALID_PARAMS));
        return;
    }
    let schemaDocument = jsonToDocumentWithReverse(schemaJson);
    let params = {
        TableName: META_DATA_TABLE,
        Key: {
            hashKey: {
                S: hospitalName,
            },
            rangeKey: {
                S: version
            }
        },
        ExpressionAttributeNames: {
            '#schema': 'schema'
        },
        ExpressionAttributeValues: {
            ':v1': {M: schemaDocument.keyValue},
            ':v2': {M: schemaDocument.valueKey}
        },
        UpdateExpression: 'SET #schema = :v1, #schemaReverse = :v2'
    };
    ddb.updateItem(params, callback);
};

Protocol.getSchema = (hospitalName, version, callback) => {
    if (!hospitalName || !version || typeof callback !== 'function') {
        callback(new Error(INVALID_PARAMS));
        return;
    }
    let params = {
        TableName: META_DATA_TABLE,
        Key: {
            hashKey: {
                S: hospitalName
            },
            rangeKey: {
                S: version
            }
        }
    };
    ddb.getItem(params, (err, data) => {
        if (err) {
            callback(new Error(err));
            return;
        }
        if (!data || !data.Item || !data.Item.schema) {
            calblack(new Error('empty data'));
            return;
        }
        callback(null, data.Item.schemaReverse.M);
    });
};

function jsonToDocumentWithReverse(schemaJson) {
    let schemaKeyValue = {};
    let schemaValueKey = {};
    for (let key in schemaJson) {
        if (schemaJson.hasOwnProperty(key)) {
            switch (typeof schemaJson[key]) {
                case 'string':
                    schemaKeyValue[key] = {S: schemaJson[key]};
                    schemaValueKey[schemaJson[key]] = {S: key};
                    break;
                case 'number':
                    schemaKeyValue[key] = {N: schemaJson[key]};
                    schemaKeyValue[schemaJson[key]] = {N: key};
                    break;
                default:
                    schemaKeyValue[key] = {NULL: true};
                    schemaValueKey[schemaJson[key]] = {NULL: true};
            }
        }
    }
    return {keyValue: schemaKeyValue, valueKey: schemaValueKey};
}

Protocol.jsonToDocument = (json) => {
    let documentFormat = {};
    for (let key in json) {
        if (json.hasOwnProperty(key)) {
            switch (typeof json[key]) {
                case 'string':
                    documentFormat[key] = {S: json[key]};
                    break;
                case 'number':
                    documentFormat[key] = {N: json[key]};
                    break;
                default:
                    documentFormat[key] = {NULL: true};
            }
        }
    }
    return documentFormat;
};

Protocol.documentToJson = (document) => {
    let jsonFormat = {};
    for (let key in document) {
        if (document.hasOwnProperty(key)) {
            let type = Object.keys(document[key])[0];
            jsonFormat[key] = document[key][type];
        }
    }
    return jsonFormat;
};

module.exports = Protocol;
