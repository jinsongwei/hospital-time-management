/**
 *   author: William Jin
 */
 
const index = require('../index');

const event = require('./event.json');

index.handler(event, null, (err)=>{
    if(err) console.error(err, err.stack);
});


