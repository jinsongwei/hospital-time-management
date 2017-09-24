/**
 *   author: William Jin
 */

let index = require('../index');

let event = {
    command : 'SELECT * FROM "case_log" LIMIT 10',
    action: 'query'
};

index.handler(event, null, (err)=>{
    if(err) console.log(err);
    else console.log('success');
});
