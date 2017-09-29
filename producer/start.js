/**
 *   author: William Jin
 */

/**
 * configurable sending records rates.
 */

let hos1 = require('./hospitals/hospital1');
let numRecordsPerSec = 2000;
let seconds = 300;
let recordLimit = 500000;

hos1.send(numRecordsPerSec, seconds, recordLimit);


