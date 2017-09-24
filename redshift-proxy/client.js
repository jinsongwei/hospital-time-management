/**
 *   author: William Jin
 */
//redshift.js
let Redshift = require('node-redshift');

let client = {
    user: 'william',
    database: 'hospital1',
    password: 'williamV0223',
    port: '5439',
    host: 'hospital-instance.cswgmnrvpjfv.us-west-2.redshift.amazonaws.com',
};

// The values passed in to the options object will be the difference between a connection pool and raw connection
let redshiftClient = new Redshift(client, null);

module.exports = redshiftClient;
 