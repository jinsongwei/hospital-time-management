/**
 *   author: William Jin
 */
 
const index = require('../index');

const event = require('./mock-data');

index.handler(event, null, (err)=>{

    if(err) console.error(err, err.stack);
});


