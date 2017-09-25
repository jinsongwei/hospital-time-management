/**
 *   author: William Jin
 */

let hos1 = require('./hospitals/hospital1');

let numRecordsPerSec = 500;
let seconds = 60;
let recordLimit = 1000;

hos1.send(numRecordsPerSec, seconds, recordLimit);


