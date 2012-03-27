define(['jquery'], function ($) {

    /*
     * <div class="x">
     *    <div class="x-hd">
     *        #header
     *    </div>
     *    <div class="x-bd">
     *        #body
     *    </div>
     * </div>
     */
    var Base = function(opts) {
        this.opts = $.extend({}, Base.opts, opts);

        this.widget = $('<div>').addClass(this.opts.cls);
    };
    Base.prototype.update = function(info) {
        info.header && this.hd.html(info.header);
        info.body && this.bd.html(info.body);
    };
    Base.prototype.render = function(info) {
        info = info || {};

        var hd = info.header || this.opts.header || $('<div/>'),
            bd = info.body || this.opts.body || $('<div/>');

        this.hd = hd.addClass(this.opts.cls + '-hd');
        this.bd = bd.addClass(this.opts.cls + '-bd');

        this.widget.html('');

        this.widget
            .append(this.hd)
            .append(this.bd)
            .appendTo(this.opts.container);

        return this.widget;
    };
    Base.opts = {
        cls: '',
        header: null,
        body: null,
        container: 'body'
    };


    var Tip = function(opts) {
        this.opts = $.extend({}, Tip.opts, opts);
    };
    Tip.prototype.render = function(info) {
        var style = info.style || {},
            data = info.data || {},
            to = info.to || this.opts.container;

        this.tip && this.tip.remove();
        this.tip = $('<div>').addClass(this.opts.cls);
        this.tip
            .html($.tmpl['object'](this.opts.tmpl, data))
            .css(style)
            .hide()
            .appendTo(to)
            .fadeIn(200);

        return this.tip;
    };
    Tip.prototype.unrender = function() {
        this.tip && this.tip.remove();
    };
    Tip.opts = {
        cls: '',
        tmpl: '',
        container: 'body'
    };

    var List = function(opts) {
        this.opts = $.extend({}, List.opts, opts);
    };
    List.prototype.render = function(data) {
        data = data || {};

        var t = '<li data-index="{index}">' + this.opts.tmpl + '</li>',
            list = $('<ul/>').attr('id', this.opts._id).addClass(this.opts.cls);
        list.html('').html($.tmpl['for'](t, data));

        return $('<div/>').append(list);
    };
    List.prototype.slideTo = function(num, style) {
        var clearedStyle = {}, 
            list = $('#' + this.opts._id), 
            listItem = list.children(), listItemLen = listItem.length, curItem,
            offset, fix = 15, listHeight, listRealHeight;

        $.each(style, function(k, v) { clearedStyle[k] = '' });
        curItem = $(listItem[num - 1]);

        listItem.css(clearedStyle);

        listHeight = list.height();
        listRealHeight = list[0].scrollHeight;
        offset = listRealHeight / listItemLen * (num - 1) 
                 - listHeight / 2 - fix;

        list.animate(
            {scrollTop: offset},
            10,
            function() { curItem.css(style); }
        );
    }
    List.opts = {
        cls: '',
        tmpl: '',
        _id: 'J-WList'
    };

    var Widget = {};
    Widget.Base = Base;
    Widget.Tip = Tip;
    Widget.List = List;

    return Widget;

});
