define(["jquery"],function(e){var c=function(f){this.opts=e.extend({},c.opts,f);this.widget=e("<div>").addClass(this.opts.cls)};c.prototype.update=function(f){f.header&&this.hd.html(f.header);f.body&&this.bd.html(f.body)};c.prototype.render=function(h){h=h||{};var g=h.header||this.opts.header||e("<div/>"),f=h.body||this.opts.body||e("<div/>");this.hd=g.addClass(this.opts.cls+"-hd");this.bd=f.addClass(this.opts.cls+"-bd");this.widget.html("");this.widget.append(this.hd).append(this.bd).appendTo(this.opts.container);return this.widget};c.opts={cls:"",header:null,body:null,container:"body"};var a=function(f){this.opts=e.extend({},a.opts,f)};a.prototype.render=function(h){var f=h.style||{},g=h.data||{},i=h.to||this.opts.container;this.tip&&this.tip.remove();this.tip=e("<div>").addClass(this.opts.cls);this.tip.html(e.tmpl.object(this.opts.tmpl,g)).css(f).hide().appendTo(i).fadeIn(200);return this.tip};a.prototype.unrender=function(){this.tip&&this.tip.remove()};a.opts={cls:"",tmpl:"",container:"body"};var b=function(f){this.opts=e.extend({},b.opts,f)};b.prototype.render=function(h){h=h||{};var f='<li data-index="{index}">'+this.opts.tmpl+"</li>",g=e("<ul/>").attr("id",this.opts._id).addClass(this.opts.cls);g.html("").html(e.tmpl["for"](f,h));return e("<div/>").append(g)};b.prototype.slideTo=function(m,g){var o={},n=e("#"+this.opts._id),f=n.children(),l=f.length,p,j,k=15,h,i;e.each(g,function(r,q){o[r]=""});p=e(f[m-1]);f.css(o);h=n.height();i=n[0].scrollHeight;j=i/l*(m-1)-h/2-k;n.animate({scrollTop:j},10,function(){p.css(g)})};b.opts={cls:"",tmpl:"",_id:"J-WList"};var d={};d.Base=c;d.Tip=a;d.List=b;return d});