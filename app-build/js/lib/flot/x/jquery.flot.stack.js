(function(f){var d={series:{stack:null}};function e(b){function a(n,o){var i=null;for(var l=0;l<o.length;++l){if(n==o[l]){break}if(o[l].stack==n.stack){i=o[l]}}return i}function c(Z,M,P){if(M.stack==null){return}var ae=a(M,Z.getData());if(!ae){return}var S=P.pointsize,O=P.points,N=ae.datapoints.pointsize,U=ae.datapoints.points,V=[],Y,l,L,T,X,aa,Q=M.lines.show,K=M.bars.horizontal,j=S>2&&(K?P.format[2].x:P.format[2].y),s=Q&&M.lines.steps,R=true,ac=K?1:0,i=K?0:1,W=0,ab=0,ad;while(true){if(W>=O.length){break}ad=V.length;if(O[W]==null){for(m=0;m<S;++m){V.push(O[W+m])}W+=S}else{if(ab>=U.length){if(!Q){for(m=0;m<S;++m){V.push(O[W+m])}}W+=S}else{if(U[ab]==null){for(m=0;m<S;++m){V.push(null)}R=true;ab+=N}else{Y=O[W+ac];l=O[W+i];T=U[ab+ac];X=U[ab+i];aa=0;if(Y==T){for(m=0;m<S;++m){V.push(O[W+m])}V[ad+i]+=X;aa=X;W+=S;ab+=N}else{if(Y>T){if(Q&&W>0&&O[W-S]!=null){L=l+(O[W-S+i]-l)*(T-Y)/(O[W-S+ac]-Y);V.push(T);V.push(L+X);for(m=2;m<S;++m){V.push(O[W+m])}aa=X}ab+=N}else{if(R&&Q){W+=S;continue}for(m=0;m<S;++m){V.push(O[W+m])}if(Q&&ab>0&&U[ab-N]!=null){aa=X+(U[ab-N+i]-X)*(Y-T)/(U[ab-N+ac]-T)}V[ad+i]+=aa;W+=S}}R=false;if(ad!=V.length&&j){V[ad+2]+=aa}}}}if(s&&ad!=V.length&&ad>0&&V[ad]!=null&&V[ad]!=V[ad-S]&&V[ad+1]!=V[ad-S+1]){for(m=0;m<S;++m){V[ad+S+m]=V[ad+m]}V[ad+1]=V[ad-S+1]}}P.points=V}b.hooks.processDatapoints.push(c)}f.plot.plugins.push({init:e,options:d,name:"stack",version:"1.2"})})(jQuery);