var Rules = require('./rules.js');
var fs = require("fs");
module.exports = function (content, cssRealPath) {
    var _arr_css = []
        , _content;
    var errMessage = "";
    _content = content.replace(/(?:\/\*[\s\S]*?(?:\*\/|$))|([^{}\/]*)\{([^{}]*)}/gi, function (m, selector, css) {
        if (css) {
            var rules = Rules.wrap(selector.trim(), css.trim(), cssRealPath);
            errMessage += rules.errMessage;
            if (rules.isSprites()) {
                _arr_css.push(rules);
                css = rules.getCss();
            }
            // css代码压缩
            css = css.replace(/\?__spriter?\s*(["')])/g, "$1");
            css = css.replace(/(^\s*)|(\s*$)/gm, "");
            return selector + '{' + css + '}';
        }
        return m;
    });
    return {
        content: _content,
        map: _arr_css,
        errMessage: errMessage
    };
};
