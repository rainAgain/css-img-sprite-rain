/**
 * Created by king-king on 2017/2/5.
 */
var fs = require('fs'),
    sprite = require('../index').raw;
fs.readFile('css/base1/base.css', function (err, buffer) {
    var time = new Date();
    if (err) {
        console.log(err);
    } else {
        var content = sprite(buffer, {
            cssSrc: 'css/base1/base.css', // important
            cssDesDir: 'out',
            imgDesDir: 'out',
            hash: true,
            errLog: true
        });
        fs.writeFile('out/result.css', content, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('finished ,spend ' + (new Date() - time) + 'ms')
            }
        });
    }
});
