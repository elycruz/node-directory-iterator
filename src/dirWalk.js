/**
 * Created by elyde on 6/15/2017.
 */

const path = require('path'),

    {readDirectory, readStat} = require('./utils'),

    FileInfo = require('./FileInfo'),

    processForkOnStat = (TypeRep, filePath, fileName, dirEffectFactory, fileEffectFactory) => stat => {
        if (stat.isDirectory()) {
            return processDirectory(TypeRep, filePath, stat, dirEffectFactory, fileEffectFactory, fileName);
        } else if (stat.isFile()) {
            return processFile(TypeRep, filePath, stat, dirEffectFactory, fileEffectFactory, fileName);
        }
        return fileEffectFactory(filePath, stat, fileName)(new TypeRep(fileName, filePath, stat));
    },

    processDirectory = (TypeRep, dirPath, stat, dirEffectFactory, fileEffectFactory, dirName) => readDirectory(dirPath)
        .then(files => processFiles(TypeRep, dirPath, dirEffectFactory, fileEffectFactory, files))
        .then(files => dirEffectFactory(dirPath, stat, dirName)(new TypeRep(dirName, dirPath, stat, files), files)),

    processFile = (TypeRep, filePath, stat, dirEffectFactory, fileEffectFactory, fileName) => new Promise((resolve, reject) => {
        if (!stat.isDirectory()) {
            resolve(fileEffectFactory(filePath, stat, fileName)(new TypeRep(fileName, filePath, stat)));
        }
        processDirectory(TypeRep, filePath, stat, dirEffectFactory, fileEffectFactory, fileName)
            .then(resolve, reject);
    }),

    processFiles = (TypeRep, dir, dirEffectFactory, fileEffectFactory, files) => Promise.all(
        files.map(fileName => {
            const filePath = path.join(dir, fileName);
            return readStat(filePath)
                .then(processForkOnStat(TypeRep, filePath, fileName, dirEffectFactory, fileEffectFactory));
        })
    ),

    dirWalk = (TypeRep, dirEffectFactory, fileEffectFactory, dir) => readStat(dir)
        .then(stat => {
            const dirName = path.basename(dir);
            return processForkOnStat(TypeRep || FileInfo, dir, dirName, dirEffectFactory, fileEffectFactory)(stat);
        });

module.exports = dirWalk;
