define(function(){var f=null;var e=["ms","moz","webkit","o"];for(var h=0;h<e.length&&!f;++h){f=window[e[h]+"CancelAnimationFrame"]||window[e[h]+"CancelRequestAnimationFrame"]}var g=0;if(!f){f=function(a){clearTimeout(a)}}return f});