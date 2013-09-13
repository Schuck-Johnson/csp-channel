var chan = require('../channel.dev.js');
var get_exports = function (obj, name) {
    var i, key, new_name,
        exports = [name],
        base_name = name,
        export_names = Object.keys(obj);

    for(i in export_names) {
        key = export_names[i];
        new_name = [base_name, key].join('.');
        if (Object.prototype.toString.apply(obj[key]) === '[object Object]') {
            exports = exports.concat(get_exports(obj[key], new_name));
        } else {
            exports.push(new_name);
        }
    }
    return exports;

};

var create_export_string = function(exports) {
    var i, new_exports = [];
    for (i in exports) {
        new_exports.push([exports[i], ' = ', exports[i], ';'].join(''));
    }

    return ['/** @export */\n',new_exports.join('\n/** @export */\n')].join('');
};

var exp = get_exports(chan, 'chan');
var exp_str = create_export_string(exp);
console.log(exp_str);
