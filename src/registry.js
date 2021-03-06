window.Widgets =
(function($, Vue, Core) {

    var Widgets = {};

    Widgets.Palette = (function() {

        var map = {};
        var arr = [];

        var categories = function() { return arr; }
        var category = function(n, category) {

            if (n in map) {
                return map[n];
            } else {
                category.name = n;
                map[n] = category;
                arr.push(category);
            }

            return this;
        }

        var widget = function(path) {
            var segments = path.split('/');
            return this.category(segments[0]).group(segments[1]).widget(segments[2]);
        }

        var item = function(path, context) {
            var segments = path.split('/');
            return this.category(segments[0]).group(segments[1]).item(segments[2])
                .widget(context)
                .then(d => {
                    var w = $.extend(true, {}, d);
                    delete w.props;
                    delete w.tabs;
                    return w;
                })
        }

        var descriptor = function(path) {
            var segments = path.split('/');
            return this.category(segments[0]).group(segments[1]).item(segments[2]);
        }

        function generateId(prefix) {
            let rtn = Math.random().toString(36).substr(2, 9);
            return prefix ? prefix + rtn : rtn;
        }

        return {
            categories: categories,
            category: category,
            widget: widget,
            item: item,
            descriptor: descriptor,
            placeholder: function(content) { return Widgets.StubWidgetFactory(content) },
            generateId: generateId,
        };
    })();

    Widgets.Category = function(name, title, ignore) {

        var map = {};
        var arr = [];

        var groups = function() { return arr; }
        var group = function(n, group) {

            if (n in map) {
                return map[n];
            } else {
                group.name = `${name}/${n}`;
                map[n] = group;
                arr.push(group);
            }

            return this;
        }

        Widgets.Palette.category(name, {
            title: title,
            groups: groups,
            group: group,
            ignore: ignore,
        });

        return Widgets.Palette.category(name);
    };

    Widgets.Group = function(category, name, title, ignore) {

        var map = {};
        var arr = [];

        var items = function() { return arr; }
        var item = function(n, item) {

            if (n in map) {
                return map[n];
            } else {
                item.name = `${this.name}/${n}`;
                map[n] = item;
                arr.push(item);
            }

            return this;
        }

        var w_map = {};
        var w_arr = [];

        var widgets = function() { return w_arr; }
        var widget = function(n, widget) {

            if (n in w_map) {
                return w_map[n];
            } else {
                widget.name = `${this.name}/${n}`;
                w_map[n] = widget;
                w_arr.push(widget);
            }

            return this;
        }

        category.group(name, {
            title: title,
            items: items,
            item: item,
            widgets: widgets,
            widget: widget,
            ignore: ignore,
        });

        return category.group(name);
    };

    Widgets.Widget = function(group, config) {

        var name = config.name;

        group.widget(config.name, config);

        return group.widget(name);
    }

    Widgets.clone = function(original) {
        return JSON.parse(JSON.stringify(original));
    }

    Widgets.create = function(config) {

        var result = {
            name: config.name,
            title: config.title,
            tag: config.tag,
            setup: config.setup,
            widgets: config.widgets,
            tabs: [],
            props: [],
            params: {},
            overrides: {},
            designer: Object.assign({
                fill: false,
                hidden: false,
                editable: false,
                unlocked: false,
            }, config.designer)
        };

        function visit(w, m) {

            if (m.override) {

                if ('tabs' in m) w.tabs = JSON.parse(JSON.stringify(m.tabs));
                if ('props' in m) w.props = JSON.parse(JSON.stringify(m.props));

            } else {

                if ('tabs' in m) w.tabs = w.tabs.concat(m.tabs);
                if ('props' in m) w.props = w.props.concat(m.props);
            }

        }

        if (config.mixins) {

            for (var i = 0; i < config.mixins.length; i++) {
                var m = config.mixins[i];
                visit(result, m);
            }
        }

        visit(result, config);

        return result;
    };

    Widgets.buildParam = function(prop, param) {

        if (prop.type == 'action') {
            param.action = param.action || 'actions/execute'
        }

        if (prop.props) {
            if (prop.type == 'multiple') {
                param.value = param.value == null ? [] : param.value;
                // param.proto = param.proto == null ? {} : param.proto;
                for (var j = 0; j < param.value.length; j++) {
                    Widgets.buildParams(prop.props, param.value[j]);
                }
            } else if (prop.type == 'object') {
                param.value = param.value == null ? {} : param.value;
                Widgets.buildParams(prop.props, param.value);
            } else if (prop.type == 'action') {
                param.action = param.action == null ? 'actions/execute' : param.action;
                Widgets.buildParams(prop.props, param.value);
            } else if (prop.type == 'asis') {
                param.value = param.value == null ? {} : param.value;
            }
        }

        return param
    }

    Widgets.buildParams = function(props, params) {

        for (let prop of props) {

            let param = params[prop.name] = params[prop.name] || { value: null }; // TODO Set a type-dependent initial value

            Widgets.buildParam(prop, param)
        }
    }

    Widgets.build = function(proto, params) { // proto is a widget or a composite property

        var w = Object.assign(JSON.parse(JSON.stringify(proto)), {
            params: params || {}
        });

        Widgets.buildParams(w.props, w.params);

        return w;
    }

    Widgets.Item = function(group, config) {

        var name = config.name;

        group.item(config.name, config);

        return group.item(name);
    };

    Widgets.Prop = function(name, title, type, tab, placeholder) {
        return {
            name: name,
            title: title,
            type: type,
            tab: tab,
            placeholder: placeholder,
        };
    }

    Widgets.Param = function(value) {
        return {
            value: value || undefined,
        }
    }

    // Vue.service('palette', Widgets.Palette);

    return Widgets;

})(jQuery, Vue, Core);
