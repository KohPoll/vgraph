(function(f){var d={crosshair:{mode:null,color:"rgba(170, 0, 0, 0.80)",lineWidth:1}};function e(a){var k={x:-1,y:-1,locked:false};a.setCrosshair=function m(g){if(!g){k.x=-1}else{var h=a.p2c(g);k.x=Math.max(0,Math.min(h.left,a.width()));k.y=Math.max(0,Math.min(h.top,a.height()))}a.triggerRedrawOverlay()};a.clearCrosshair=a.setCrosshair;a.lockCrosshair=function l(g){if(g){a.setCrosshair(g)}k.locked=true};a.unlockCrosshair=function c(){k.locked=false};function b(g){if(k.locked){return}if(k.x!=-1){k.x=-1;a.triggerRedrawOverlay()}}function n(h){if(k.locked){return}if(a.getSelection&&a.getSelection()){k.x=-1;return}var g=a.offset();k.x=Math.max(0,Math.min(h.pageX-g.left,a.width()));k.y=Math.max(0,Math.min(h.pageY-g.top,a.height()));a.triggerRedrawOverlay()}a.hooks.bindEvents.push(function(g,h){if(!g.getOptions().crosshair.mode){return}h.mouseout(b);h.mousemove(n)});a.hooks.drawOverlay.push(function(j,h){var i=j.getOptions().crosshair;if(!i.mode){return}var g=j.getPlotOffset();h.save();h.translate(g.left,g.top);if(k.x!=-1){h.strokeStyle=i.color;h.lineWidth=i.lineWidth;h.lineJoin="round";h.beginPath();if(i.mode.indexOf("x")!=-1){h.moveTo(k.x,0);h.lineTo(k.x,j.height())}if(i.mode.indexOf("y")!=-1){h.moveTo(0,k.y);h.lineTo(j.width(),k.y)}h.stroke()}h.restore()});a.hooks.shutdown.push(function(g,h){h.unbind("mouseout",b);h.unbind("mousemove",n)})}f.plot.plugins.push({init:e,options:d,name:"crosshair",version:"1.0"})})(jQuery);