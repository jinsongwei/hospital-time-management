/**
 *   author: William Jin
 */


const AWS_ACCESS_KEY_ID = 'AKIAJELX7E74NLFTWCWA';
const AWS_SECRET_KEY = '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';

module.exports.config = function () {
    this.AWS = require('aws-sdk');
    this.AWS.config.update({
        region: 'us-west-2', credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_KEY,
        }
    });
    let sts = new this.AWS.STS({apiVersion: '2011-06-15'});

    getSTS((err, data) => {
        let cred = data.Credentials;
        this.AWS.config.update({
            credentials: {
                accessKeyId: cred.AccessKeyId,
                secretAccessKey: cred.SecretAccessKey,
                sessionToken: cred.SessionToken
            }
        });
    });

    function getSTS(callback) {
        let params = {
            DurationSeconds: 129600,
        };
        sts.getSessionToken(params, function (err, data) {
            if (err) {
                console.log("got error \n\n");
                console.log(err, err.stack);
            }
            else callback(null, data);
        });
    }
};



