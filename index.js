var postcss = require('postcss');
var ModularScale = require('modular-scale');
var valueParser = require('postcss-value-parser');

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
            var parsedValue = valueParser(decl.value);

            parsedValue.walk(function (node) {
              if (node.type === 'function' && node.value === 'ms') {
                if (node.nodes.length === 1 && node.nodes[0].type === 'word') {
                  var value = parseFloat(node.nodes[0].value);

                  if (!isNaN(value)) {
                    var newValue = ms(value);

                    node.type = 'word';
                    node.value = newValue;

                    result.messages.push({
                      type: 'modular-scale-result',
                      plugin: pluginName,
                      text: 'Modular scale for ' + decl.value + ' is ' + newValue
                    });
                  } else {
                    throw decl.error('Modular scale value should be a number', { plugin: pluginName });
                  }
                } else {
                  throw decl.error('Modular scale value should be a number', { plugin: pluginName });
                }
              }
            });

            decl.value = parsedValue.toString();
        });
    };
});

