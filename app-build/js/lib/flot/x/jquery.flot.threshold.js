(function(b){var a={series:{threshold:null}};function c(e){function f(q,A,r,v,k){var g=r.pointsize,l,u,t,h,o,j=b.extend({},A);j.datapoints={points:[],pointsize:g,format:r.format};j.label=null;j.color=k;j.threshold=null;j.originSeries=A;j.data=[];var w=r.points,z=A.lines.show;threspoints=[];newpoints=[];for(l=0;l<w.length;l+=g){u=w[l];t=w[l+1];o=h;if(t<v){h=threspoints}else{h=newpoints}if(z&&o!=h&&u!=null&&l>0&&w[l-g]!=null){var n=(u-w[l-g])/(t-w[l-g+1])*(v-t)+u;o.push(n);o.push(v);for(m=2;m<g;++m){o.push(w[l+m])}h.push(null);h.push(null);for(m=2;m<g;++m){h.push(w[l+m])}h.push(n);h.push(v);for(m=2;m<g;++m){h.push(w[l+m])}}h.push(u);h.push(t);for(m=2;m<g;++m){h.push(w[l+m])}}r.points=newpoints;j.datapoints.points=threspoints;if(j.datapoints.points.length>0){q.getData().push(j)}}function d(i,g,h){if(!g.threshold){return}if(g.threshold instanceof Array){g.threshold.sort(function(k,j){return k.below-j.below});b(g.threshold).each(function(j,k){f(i,g,h,k.below,k.color)})}else{f(i,g,h,g.threshold.below,g.threshold.color)}}e.hooks.processDatapoints.push(d)}b.plot.plugins.push({init:c,options:a,name:"threshold",version:"1.2"})})(jQuery);