define(['jquery', 'lib/Three', 'lib/requestAnimationFrame', 'lib/cancelAnimationFrame'], function ($, T, ReqFrame, CancelFrame) {

    var Animator = function (opts) {//{{{
        this.opts = $.extend(true, {}, Animator.opts, opts);

        this._isRunning = false;
        this._actors = [];

        this._setupScene();
    };//}}}

    Animator.opts = {//{{{
        mediator: null, // 用于在每一帧publish消息
        container: 'body',
        width: window.innerWidth,
        height: window.innerHeight,
        camera: {
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 1,
            far: 10000,
            pos: [0, 0, 0]
        }
    };//}}}

    var AP = Animator.prototype;

    AP.start = function () {//{{{
        this._isRunning = true;
        this._render();
    };//}}}

    AP.stop = function () {//{{{
        this._isRunning = false;
        CancelFrame(this._timer);
        //this._render();
    };//}}}

    AP.isAnimated = function () {//{{{
        return this._isRunning == true;
    };//}}}

    AP.addActors = function (actors) {//{{{
        for (var i=0, len=actors.length; i<len; ++i) {
            this._actors.push(actors[i]);
        }
    };//}}}

    AP.getIntersects = function(evt) {//{{{
        var mouseX = (evt.clientX / this.opts.width) * 2 - 1,
            mouseY = -(evt.clientY / this.opts.height) * 2 + 1,
            vector = new T.Vector3(mouseX, mouseY, 0.5),
            ray, intersects, intersectActor = null;
                
        this.projector.unprojectVector(vector, this.camera);

        ray = new T.Ray(this.camera.position, vector.subSelf(this.camera.position).normalize());

        intersects = ray.intersectObjects(this.scene.objects);

        return intersects;
    };//}}}

    AP._update = function () {//{{{
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            opts = this.opts,
            mediator = opts.mediator,
            actors = this._actors;

        for (var actorName in actors) {
            if (hasOwnProperty.call(actors, actorName)) {
                actors[actorName] && actors[actorName].update && actors[actorName].update();
            }
        }

        mediator && mediator.publish && mediator.publish('actorsUpdated', this._timer);
    };//}}}

    AP._render = function() {//{{{
        if (this._isRunning) {
            var self = this;

            this._timer = ReqFrame(function(t) { 
                self._render(); 
            });
            
            this._update();

            this.renderer.render(this.scene, this.camera);
        }
    };//}}}

    AP._setupScene = function() {//{{{
        var opts = this.opts;

        this.scene = new T.Scene();

        this.camera = new T.PerspectiveCamera(opts.camera.fov, opts.camera.aspect, opts.camera.near, opts.camera.far);
        this.camera.position = new T.Vector3(opts.camera.pos[0], opts.camera.pos[1], opts.camera.pos[2]);
        this.scene.add(this.camera);

        this.renderer = new T.CanvasRenderer();
        this.renderer.setSize(opts.width, opts.height);

        $(this.opts.container).append(this.renderer.domElement);

        this.projector = new T.Projector();
    };//}}}

    return Animator;
});
