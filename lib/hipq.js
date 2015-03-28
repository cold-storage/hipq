var _ = require('lodash');

function Hipq(opts) {
  opts = _.merge(opts, {
    dbname: 'hipq',
    dbpw: 'hipq',
    dbport: 5432,
    dbhost: 'localhost'
  });
}

var p = Hipq.prototype;

p.validate = function validate(done) {

};

p.createQueue = function createQueue(queueName, queueDef, done) {
  //
};

p.setHandlers = function setHandlers(queueName, jobName, requestFn, responseFn, retryFn) {

};

p.queueJob = function queueJob(queueName, jobDef, done) {

};

p.endJob = function endJob(queueName, jobName, jobId, response) {

};

module.exports = Hipq;