var postcss = require('postcss');
var ModularScale = require('modular-scale');

function parseValue(value) {
    var number = /\(([^)]+)\)/.exec(value)[1] || 0;
    return parseInt(number, 10);
}

function parseUnit(value) {
    return value.split(')')[1].trim() || 'rem';
}

var pluginName = 'postcss-modular-scale';

module.exports = postcss.plugin(pluginName, function(opts) {
    opts = opts || {};
    var ratios = opts.ratios;
    var bases = opts.bases;

    return function(css, result) {
        var declarations = [];
        var ms = null;

        css.walkDecls(function(decl) {

            if (!decl.value) {
                return;
            }

            if (decl.parent.selector === ':root') {

                if (decl.prop === '--ms-ratios') {
                    ratios = decl.value.split(',');
                    result.messages.push({
                        type: 'modular-scale-ratios',
                        plugin: pluginName,
                        text: 'Modular scale ratios: ' + ratios
                    });
                }

                if (decl.prop === '--ms-bases') {
                    bases = decl.value.split(',');
                    result.messages.push({
                        type: 'modular-scale-bases',
                        plugin: pluginName,
                        text: 'Modular scale bases: ' + bases
                    });
                }
            }

            if (decl.value.indexOf('ms(') !== -1) {
                declarations.push(decl);
            }

        });

        ms = new ModularScale({
            ratios: ratios,
            bases: bases
        });

        declarations.forEach(function(decl) {
            var number = parseValue(decl.value);
            var unit = parseUnit(decl.value);
            var newValue = ms(number) + unit;
            result.messages.push({
                type: 'modular-scale-result',
                plugin: pluginName,
                text: 'Modular scale for ' + decl.value + ' is ' + newValue
            });

            decl.value = ms(number) + unit;
        });
    };
});

