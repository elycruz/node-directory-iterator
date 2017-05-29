/**
 * Created by elyde on 5/28/2017.
 */

'use strict';

const path = require('path'),
    {log} = require('../src/utils'),
    dirRecWalk = require('../src/dirWalkRec'),
    SjlFileInfo = require('./../src/SjlFileInfo');

// Recursively walk directory
dirRecWalk (
        // Directory effect factory
        (dirPath, stat, dirName) => (files) => {
                const fileObj = new SjlFileInfo(dirName, dirPath, stat);
                fileObj.files = files;
            // console.log(filePath);
            return fileObj;
        },

        // File effect factory
        (filePath, stat, fileName) => () => {
            // console.log(filePath);
            return new SjlFileInfo(fileName, filePath, stat);
        },

        // Dir to walk
        path.join(__dirname, '/../')
    )
    .then(obj => JSON.stringify(obj, null, 4)) // pretty printed
    .then(log, log);