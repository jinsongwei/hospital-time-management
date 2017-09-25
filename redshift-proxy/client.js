/**
 *   author: William Jin
 */

let Redshift = require('node-redshift');

let client = require('../config/redshift-client');

let redshiftClient = new Redshift(client, null);

module.exports = redshiftClient;
 