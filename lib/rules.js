/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

var _ = require("./util2.js");
var images = require("images");
var path = require("path");
var fs = require("fs");

//Object Rules
var Rules = Object.derive(
    function (id, css, cssSrc) {
        var cssRealPath = path.dirname(cssSrc);
        var self = this
            , __background_re = /(?:\/\*[\s\S]*?(?:\*\/|$))|\bbackground(?:-image)?:([\s\S]*?)(?:;|$)|background-position:([\s\S]*?)(?:;|$)|background-repeat:([\s\S]*?)(?:;|$)|background-size:([\s\S]*?)(?:;|$)/gi
            , __image_url_re = /url\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|[^)}]+)\s*\)/i
            , __support_position_re = /(0|[+-]?(?:\d*\.|)\d+px|left|right)\s+(0|[+-]?(?:\d*\.|)\d+px|top)/i
            , __support_size_re = /(\d+px|auto)\s*(\d+px|auto)/i
            , __repeat_re = /\brepeat-(x|y)/i
            , __sprites_re = /[?&]__spriter?/i
            , __sprites_hook_ld = '<<<'
            , __sprites_hook_rd = '>>>';
        //selectors
        self.id = id;
        //use image url
        self.image = '';
        self.errMessage = "";
        self.repeat = false;
        self.size = [-1, -1];
        self.scale = 1;
        self._position = [0, 0];
        //image has __sprite query ?
        self._is_sprites = false;
        //x,y,z
        self._direct = 'z';
        //left or right
        self._type = null;
        self._have_position = false;

        //获取sprite的配置
        self._settings = {};//fis.config.get('settings.spriter.csssprites');
        /**
         * get position
         * @param res
         * @private
         */
        function _get_position(res) {
            if (!res[1] || !res[2]) {
                return;
            }
            self._have_position = true;
            if (['left', 'right'].indexOf(res[1]) != -1) {
                //left 和 right 都靠右排，so 类型都为`left`
                self._type = 'left';
                self._position[0] = (res[1] == 'left') ? 0 : res[1];
            } else {
                self._position[0] = parseFloat(res[1]);
            }
            self._position[1] = res[2] === 'top' ? 0 : parseFloat(res[2]);
        }

        function logErr(type) {
            self.errMessage += "Time：>>" + new Date() + "<<\n" +
                "Path：>>" + cssSrc + "<<\n" +
                "Id：>>" + id + "<<\n" +
                "Type：>>" + type + "<<\n\n\n";
        }

        function getExName(path) {
            var ex = "";
            for (var i = path.length - 1; i >= 0; i--) {
                if (path[i] == ".") {
                    break;
                }
                ex = path[i] + ex;
            }
            return ex;
        }

        var urlRight = false; //　url是否合乎规范
        var sizePositionRight = true; // background-size不能放在background的前面
        var readImageFail = false; // 图片路径是否错误
        var isBackgroundDirty = false; // background中包含了不该包含的内容
        self._css = css.replace(__background_re, function (m, image, position, repeat, size) {
            var res, info;
            if (size) {
                res = size.match(__support_size_re);
                if (res) {
                    var w = res[1], h = res[2];
                    if (!self.image) {
                        sizePositionRight = false;
                        return __sprites_hook_ld + m + __sprites_hook_rd;
                    }
                    try {
                        var realSize = images(path.join(cssRealPath, self.image)).size();
                    } catch (e) {
                        readImageFail = true;
                        return __sprites_hook_ld + m + __sprites_hook_rd;
                    }
                    if (w === "auto" && h != "auto") {
                        // 把w计算出来
                        self.size[1] = parseFloat(res[2]);
                        self.scale = self.size[1] / realSize.height;
                        if (self.scale == 1) {
                            self.size[0] = self.size[1] = -1;
                        } else {
                            self.size[0] = self.size[1] * realSize.width / realSize.height;
                        }
                    } else if (w != "auto" && h === "auto") {
                        // 把h计算出来
                        self.size[0] = parseFloat(res[1]);
                        self.scale = self.size[0] / realSize.width;
                        if (self.scale == 1) {
                            self.size[0] = self.size[1] = -1;
                        } else {
                            self.size[1] = self.size[0] * realSize.height / realSize.width;
                        }
                    } else if (w === "auto" && h === "auto") {
                        self.size[0] = self.size[1] = -1;
                    } else {
                        self.size[0] = parseFloat(res[1]);
                        self.scale = self.size[0] / realSize.width;
                        if (self.scale == 1) {
                            self.size[0] = self.size[1] = -1;
                        } else {
                            self.size[1] = parseFloat(res[2]);
                        }
                    }
                }
            }
            if (image) {
                var str = image;
                str = str.replace(__image_url_re, "")
                    .replace(__repeat_re, "")
                    .replace(__support_position_re, "")
                    .replace(/no-repeat/gi, "")
                    .trim();
                if (str) {
                    isBackgroundDirty = true;
                    logErr("sprite do not allow " + m.match(/background(-image)?/g)[0] + " contain [" + str + "] remove them");
                }
                //get the url of image
                res = image.match(__image_url_re);
                if (res && res[1]) {
                    info = _.stringQuote(res[1]);
                    info = _.query(info.rest);
                    self.image = info.origin.replace(__sprites_re, '');
                    // 链接不能是http或者是https的文件
                    urlRight = info.query && __sprites_re.test(info.query) && !info.origin.match(/^https?:\/\//);
                    // 仅支持png、gif、jpg、jpeg
                    var support = {
                        png: true,
                        gif: true,
                        jpg: true,
                        jpeg: true
                    };
                    var ex = getExName(self.image);
                    if (urlRight && !support[ex]) {
                        logErr("sprite do not support " + ex + " image");
                        urlRight = false;
                    }
                }
                //judge repeat-x or repeat-y
                res = image.match(__repeat_re);
                if (res) {
                    self.repeat = res[1].trim();
                    self._direct = res[1].trim();
                }
                //if set position then get it.
                res = image.match(__support_position_re);
                if (res) {
                    _get_position(res);
                }
            }
            if (position) {
                //if use background-position, get it.
                res = position.match(__support_position_re);
                if (res) {
                    _get_position(res);
                }
            }
            if (repeat) {
                res = repeat.match(__repeat_re);
                if (res) {
                    self.repeat = res[1].trim();
                    self._direct = res[1];
                }
            }
            return __sprites_hook_ld + m + __sprites_hook_rd;
        });
        if (urlRight) {
            self._is_sprites = true;
        }
        if (self.scale != 1 && self.repeat) {
            self._is_sprites = false;
        }
        if (!sizePositionRight && urlRight) {
            self._is_sprites = false;
            logErr("background-size position is wrong");
        }
        if (readImageFail) {
            self._is_sprites = false;
        }
        if (isBackgroundDirty) {
            self._is_sprites = false;
        }
    },
    {
        getId: function () {
            return this.id;
        },
        getImageUrl: function () {
            return this.image;
        },
        getCss: function () {
            var __sprites_hook_re = /<<<[\s\S]*?>>>/g
                , ret = this._css;
            //if use sprites, replace background-image + background-position to space;
            if (this.isSprites()) {
                ret = ret.replace(__sprites_hook_re, '').trim();
                //压缩会去掉最后一个;所以最前面加一个;
                var pre_pad = '';
                if (ret.length > 0 && ret.charAt(ret.length - 1) != ';') {
                    pre_pad = ';';
                }
                if (this.repeat) {
                    ret += pre_pad + 'background-repeat: repeat-' + this.repeat;
                } else {
                    ret += pre_pad + 'background-repeat: no-repeat;';
                }
            }
            return ret;
        },
        isSprites: function () {
            return this._is_sprites;
        },
        setType: function (type) {
            this._type = type;
        },
        getType: function () {
            return this._type;
        },
        getDirect: function () {
            return this._direct;
        },
        getPosition: function () {
            return this._position;
        },
        havePosition: function () {
            return this._have_position;
        }
    });

module.exports = Rules.factory();
module.exports.wrap = function (id, css, cssRealPath) {
    if (typeof id === 'string') {
        return new Rules(id, css, cssRealPath);
    } else if (id instanceof Rules) {
        return id;
    } else {
        throw  'unable to convert [' + (typeof id) + '] to [Rules] object.';
    }
};
