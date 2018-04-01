const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

let client;
if (process.env.NODE_ENV !== 'production') {
    client = redis.createClient(keys.redisUrl);
} else {
    client = redis.createClient(keys.redisPort, keys.redisHost, {
        no_ready_check: true
    });
    client.auth(keys.redisPassword, function(err) {
        if (err) {
            throw err;
        }
    });
    client.on('connect', function() {
        console.log('Connected to redis');
    });
}

client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

//because wanna use original "THIS"

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this; //make it chainable
};

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    console.log('this.hashKey: ', this.hashKey);
    console.log('key: ', key);
    console.log('result: ', result);

    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    return result;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};
