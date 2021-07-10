/**
 * Created by elyde on 5/28/2017.
 */

const path = require('path'),

    assert = require('assert').strict,

    {log, error, peak} = require('../src/utils'),

    {keys} = Object,

    dirWalk = require('../src/dirWalk'),

    allYourBasePath = './fixtures/all',

    speciaIntersect = (a, b) => keys(a).reduce((agg, key) => {
        const shouldCopy = Object.prototype.hasOwnProperty.call(b, key);
        const rValue = b[key];
        if (shouldCopy && Array.isArray(rValue)) {
            agg[key] = rValue.map(x => speciaIntersect(a, x));
        } else if (shouldCopy) {
            agg[key] = rValue;
        }
        return agg;
    }, {})
;


(async () => Promise.all([
        [`When reading "${allYourBasePath}" found directories should match expected`, allYourBasePath, {
            fileName: 'all',
            files: [{
                fileName: 'your',
                files: [{
                    fileName: 'base',
                    files: [{
                        fileName: 'are',
                        files: [{
                            fileName: 'belong',
                            files: [{
                                fileName: 'to',
                                files: [{
                                    fileName: 'us',
                                    files: [{
                                        fileName: '.keepdir',
                                    }]
                                }]
                            }]
                        }]
                    }]
                }]
            }]
        }]
    ]
        .map(([testName, dirPath, expected]) => {
            log(testName);

            return dirWalk(
                null,
                () => x => x,
                () => x => x,
                path.join(__dirname, dirPath)
            )
                .then(rslt => assert.deepEqual(expected, speciaIntersect(expected, rslt)))
                .then(log, error)
        }))
        .then(() => log('tests complete'), error)
)();
