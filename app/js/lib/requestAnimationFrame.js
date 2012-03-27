define(function () {

    /**
     * Provides requestAnimationFrame in a cross browser way.
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     */

    var requestAnimationFrame = null;

    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
        requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    }

    var lastTime = 0;
    if (!requestAnimationFrame) {
        requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function() { 
                    callback(currTime + timeToCall); 
                }, timeToCall);

            lastTime = currTime + timeToCall;

            return id;
        };
    }

    return requestAnimationFrame;
});
