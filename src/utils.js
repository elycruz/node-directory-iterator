/**
 * Created by elyde on 5/6/2017.
 */

const fs = require('fs').promises,

    util = require('util'),

    inspect = util.inspect.bind(util),

    {log, error, warn} = console,

    peak = (...args) => (log('peak: ', ...args.map(arg => inspect(arg, {depth: 100})), args.pop())),

    readDirectory = fs.readdir,

    readStat = fs.lstat,

    fileObject = (TypeRep, fileName, filePath, stat) => new TypeRep(fileName, filePath, stat);

module.exports = {
    readDirectory,
    readStat,
    fileObject,
    log,
    warn,
    error,
    peak,
};
