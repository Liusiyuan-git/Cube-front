const template = require('art-template');
const loaderUtils = require('loader-utils');

module.exports = function (source) {
    this.cacheable && this.cacheable();
    const options = Object.assign({
            app: null,
            target: "mobile",
            path: ""
        },
        loaderUtils.getOptions(this)
    );

    for (let key in options) {
        let reg = new RegExp("\\$\\{" + key + "\\}", "g");
        if (options.hasOwnProperty(key)) {
            (source = source.replace(reg, options[key] || ''));
        }
    }

    let meta_json = eval("(" + source + ")");

    let module_name = meta_json.name;

    // if (options.path) {
    //     module_name = options.path + module_name;
    // }

    if (options.target) {
        module_name = module_name + '.' + options.target;
    }

    let module_require_list = meta_json['requires'] || [];
    if (options.target) {
        module_require_list = module_require_list.concat(meta_json['requires_' + options.target] || [])
    }

    let target_states = meta_json['states'].filter(function (_state) {
        return (!options['target'] || !_state['target'] || _state['target'] === options['target'] || _state['target'].indexOf(options['target']) > -1)
    });
    module_require_list = module_require_list.concat(target_states.filter(state => state['require']).map(state => state['require']));

    let module_template_list = target_states.filter(state => state['templateUrl']).map(state => state['templateUrl']);
    var data = {
        module_name: module_name,
        require: module_require_list,
        templates: module_template_list,
        states: target_states
    };
    template.defaults.escape = false;
    return template(__dirname + "/lazy.art", data);
};
