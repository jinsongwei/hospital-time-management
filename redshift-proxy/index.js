/**
 *   author: William Jin
 */



function RedshiftConnector() {
    const self = this;
    const redshiftClient = require('./client.js');

    this.query = (command, callback) => {
        redshiftClient.query(command, {raw: true}, (err, data) => {
            if (err) {
                callback(err);
                throw err;
            }
            else {
                console.log(data.length);
                // console.log(data[0]);
                console.log(data[0]['log_id']);
                callback(data);
                redshiftClient.close();
            }
        });
    }
}

exports.handler = function (event, context, callback) {
    if (!event) {
        console.error(ERR, 'not a valid stream event'); // 'Invalid request'
        return;
    }
    const action = event.action;
    const command = event.command;
    const redshiftConnector = new RedshiftConnector();
    if (action === 'query') {
        redshiftConnector.query(command, callback);
    }
};