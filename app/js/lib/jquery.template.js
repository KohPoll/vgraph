(function($) {
    // 超微型模板引擎
    if (typeof $.tmpl === 'undefined') {
        $.tmpl = {};

        $.tmpl['object'] = function(str, data) {
            var rst = '', reg = /\{(\w+)\}/g;
            rst = str.replace(reg, function(match, dataKey) {
                return data[dataKey];
            });
            return rst;
        };

        $.tmpl['for'] = function(str, data) {
            var rst = [];
            for (var i=0, len=data.length; i<len; ++i) {
                var item = data[i];
                // 增加索引
                item.index || (item.index = i);

                rst.push($.tmpl['object'](str, item));
            }
            return rst.join('');
        };
    }

})(jQuery);
