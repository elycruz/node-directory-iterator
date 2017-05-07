/**
 * Created by u067265 on 5/3/17.
 */

'use strict';

const path = require('path'),

    SjlFileInfo = require('./SjlFileInfo'),

    {readDirectory, readStat, fileObject, log} = require('./utils'),

    {pureCurry3: curry3,
        pureCurry4: curry4} = require('fjl'),

    processForkOnStat = curry4(((filePath, fileName, TypeRep, stat) => {
        if (stat.isDirectory()) {
            return processDirectory(filePath, TypeRep, stat, fileName);
        }
        else if (stat.isFile()) {
            return processFile(filePath, TypeRep, stat, fileName);
        }
        return Promise.resolve(fileObject(TypeRep, fileName, filePath, stat));
    })),

    processDirectory = curry4((dirPath, TypeRep, stat, dirName) => new Promise ((resolve, reject) => readDirectory(dirPath)
        .then(files => {
            return processFiles(dirPath, TypeRep, files)
                .then(processedFiles => {
                    const fileObj = fileObject(TypeRep, dirName, dirPath, stat);
                    fileObj.files = processedFiles;
                    return fileObj;
                });
        })
        // .then(peakOnce)
        .then(resolve, reject))),

    processFile = curry4((filePath, TypeRep, stat, fileName) => new Promise ((resolve, reject) => {
        if (stat.isDirectory()) {
            const fileObj = fileObject(TypeRep, fileName, filePath, stat);
            return processDirectory(filePath, fileObj, TypeRep, stat, fileName)
                .then(files => {
                    fileObj.files = files;
                    return fileObj;
                })
                .then(resolve, reject);
        }
        resolve(fileObject(TypeRep, fileName, filePath, stat));
    })),

    processFiles = curry3((dir, TypeRep, files) => new Promise ((resolve, reject) => {
        return Promise.all(
            files.map(fileName => {
                const filePath = path.join(dir, fileName);
                return readStat(filePath)
                    .then(processForkOnStat(filePath, fileName, TypeRep));
            })
        )
            .then(resolve, reject);
    }));

function dirToTreeLikeRec (TypeRep, dir) {
    TypeRep = TypeRep || SjlFileInfo;
    return readStat(dir)
        .then(stat => {
            const dirName = path.basename(dir);
            return processForkOnStat(dir, dirName, TypeRep, stat);
        });
}

// function OtherFileInfo (fileName, filePath, stat) {
//     this.fileName = fileName;
//     this.filePath = filePath;
//     Object.assign(this, stat);
// }

// Inline test
dirToTreeLikeRec (SjlFileInfo, path.join(__dirname, '/../../gulpw-sample-app'))
    .then(JSON.stringify)
    .then(log);

module.exports = dirToTreeLikeRec;
