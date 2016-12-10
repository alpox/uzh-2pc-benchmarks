const Promise = require('bluebird');
const constants = require('./constants');
const random = require("random-js")();

module.exports = class {
    constructor() {
        this.active = true;
    }

    poll() {
        if(this.active) return Promise.resolve();
        else return Promise.reject(); // No timeout, because not handled on poll
    }

    _timeout(reject) {
        Promise.delay(constants.TIMEOUT)
            .then(() => reject());
    }

    start_transaction() {
        return new Promise((resolve, reject) => {
            if(!this.active)
                this._timeout(reject);

            // An error occurs in 0.1% of the time
            if(random.integer(0,9)/10 == constants.ERROR_RATE) {
                this.active = false;
                this._timeout(reject);
                return setTimeout(() => this.active = true, constants.REBOOT_DELAY);
            }

            // No error here
            return resolve(true);
        });
    }
}