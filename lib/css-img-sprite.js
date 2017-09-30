/**
 * Created by king-king on 2017/1/17.
 */

var fis = {};

//register global letiable
Object.defineProperty(global, 'fis', {
    enumerable: true,
    writable: false,
    value: fis
});

//oo
Function.prototype.derive = function (constructor, proto) {
    if (typeof constructor === 'object') {
        proto = constructor;
        constructor = proto.constructor || function () {
            };
        delete proto.constructor;
    }
    var parent = this;
    var fn = function () {
        parent.apply(this, arguments);
        constructor.apply(this, arguments);
    };
    var tmp = function () {
    };
    tmp.prototype = parent.prototype;
    var fp = new tmp(),
        cp = constructor.prototype,
        key;
    for (key in cp) {
        if (cp.hasOwnProperty(key)) {
            fp[key] = cp[key];
        }
    }
    proto = proto || {};
    for (key in proto) {
        if (proto.hasOwnProperty(key)) {
            fp[key] = proto[key];
        }
    }
    fp.constructor = constructor.prototype.constructor;
    fn.prototype = fp;
    return fn;
};

//factory
Function.prototype.factory = function () {
    var clazz = this;

    function F(args) {
        clazz.apply(this, args);
    }

    F.prototype = clazz.prototype;
    return function () {
        return new F(arguments);
    };
};

var file = require("./file.js");
var fs = require("fs");
var cssParser = require("./cssParser.js");
var imgGen = require('./image.js');
var path = require("path");

/**
 * obj.cssSrc {string}: css源文件路径,绝对路径
 * [obj.cssDesDir]{string}：输出css的路径（相对），默认是和css源文件同一个文件夹
 * [obj.imgDesDir]{string}：输出image的路径（相对），默认是和cssDes同一个文件夹
 * [obj.layout]{string}：布局方式，分为"matrix"和"linear"默认是"linear"
 * [obj.hash]{boolean}：是否给生成的雪碧图添加hash，默认是不添加
 * [obj.errLog]{boolean}：是否添加错误日志，默认是不添加
 * **/

module.exports = function (buffer, obj) {
    var curWorkingDir = process.cwd(),
        // 将content转化成string
        content = buffer.toString("utf-8"),
        res = cssParser(content, path.join(curWorkingDir, obj.cssSrc)),
        images = {},
        cssRealOut = obj.cssDesDir ?
            path.join(curWorkingDir, obj.cssDesDir) :
            path.join(curWorkingDir, path.dirname(obj.cssSrc)),
        content2 = res.content,
        cssFileName = path.basename(obj.cssSrc).split(".")[0],
        imgRealOutputDir = obj.imgDesDir ? path.join(curWorkingDir, obj.imgDesDir) : cssRealOut;

    if (obj.errLog && res.errMessage) {
        fs.writeFileSync("../.spritelog", res.errMessage, {
            flag: "a+"
        });
    }
    if (res.map && res.map.length > 0) {
        res.map.forEach(function (data) {
            images[data.image] = file.wrap(path.join.apply(this, [path.dirname(obj.cssSrc), data.image]));
        });
        var css = imgGen(file, res.map, images, {
            cssFileName: cssFileName,
            cssRealOutputDir: cssRealOut,
            layout: obj.layout,
            imgRealOutputDir: imgRealOutputDir,
            hash: obj.hash
        });
        content2 = content2 + css;
    }
    return Buffer.from(content2);
};

