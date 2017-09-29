/**
 *   author: William Jin
 */
 
const index = require('../index');

const event = require('./mock-data');

index.handler(event, null, (err, data)=>{
    if(err) console.error(err, err.stack);
    console.log(data);
});


