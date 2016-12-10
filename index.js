const Promise = require('bluebird');
const random = require("random-js")();
const constants = require('./constants');
const Subordinate = require('./subordinate');
const fs = require('fs');

function newArr(length, fun) {
    return new Array(length).fill(0).map(fun);
}

function pollTransaction(subordinate) {
    return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
            subordinate.poll()
                .then(() => clearInterval(interval))
                .then(() => resolve(false))
                .catch(() => {});
        }, constants.CONSTANT_BACKOFF);
    });
}

function runTransaction(subordinate) {
    return subordinate.start_transaction()
            .catch(() => pollTransaction(subordinate));
}

function runVirtualTransactions() {
    let timestamp = new Date().getTime();

    let subs = newArr(100, () => new Subordinate());

    let allPromises = subs.map(sub => {
            let transactions = newArr(constants.NUM_TRANS, () => runTransaction(sub));
            return Promise.all(transactions);
        });

    return Promise.all(allPromises)
        .then(() => {
            let mil = new Date().getTime() - timestamp;
            return mil;
        });
}

function runBenchmark() {
    Promise.mapSeries(new Array(1000).fill(-10), () => runVirtualTransactions())
        .then(arr => fs.writeFile("output.txt", arr));
}

runBenchmark();