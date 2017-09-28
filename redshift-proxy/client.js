/**
 *   author: William Jin
 */

let Redshift = require('node-redshift');

// all credentials are saved in config file.
let client = require('../config/redshift-client');

let redshiftClient = new Redshift(client, null);

module.exports = redshiftClient;
 