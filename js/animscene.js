var AnimScene = {
    init: function(opts) {
        this.w = opts.w;
        this.h = opts.h;

        // scene
        this.scene = new THREE.Scene();

        // camera
        this.camera = new THREE.PerspectiveCamera(75, this.w / this.h, 1, 10000);
        this.camera.position.z = 550;
        this.scene.add(this.camera);

        this.interactives = []; //响应hover\click的物体

        // add cube.
        var cubeTextures = [];
        for (var i=1; i<=6; ++i) {
            cubeTextures.push('image/textures/cube/' + i + '.jpg');
        }
        this.cube = new Cube({
                size: 200, 
                pos: [-10, -20, -10000],
                textures: cubeTextures
            });
        this.scene.add(this.cube.entity);
        this.interactives.push(this.cube.entity);

        this.rotY = 1.2; 
        this.rotX = 0.8;

        // add text.
        var textTextures = [];
        for (var i=1; i<=31; ++i) {
            textTextures.push('image/textures/text/' + i + '.png');
        }
        this.textGroup = new Text({
                amount: 31,
                textures: textTextures
            });
        for (var i=0, len=this.textGroup.texts.length; i<len; ++i) {
            this.scene.add(this.textGroup.texts[i]);
        }

        // renderer
        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setSize(this.w, this.h);
        this.container = document.getElementById(opts.container) || document.body;
        this.container.appendChild(this.renderer.domElement);


        // projector(for interactives)
        this.projector = new THREE.Projector();

        // bind interactive event.
        this._bindEvents();

        // fetch data.
        this._fetch('data/fetchdata.php');

        // 
        this._isCubeClicked = false;

        return this;
    },
    //materialIndex到地区的映射(0,1->全部(0),2->大陆(1),3->港澳(2),4->日韩(3),5->其它(4)
    _regionMapper: [0, 0, 1, 2, 3, 4], 
    _fetch: function(url) {
       // simulate request data by ajax.
        this._isLoaded = false;

        var self = this;
        $.getJSON(url, function(data) {
                self._data = data;
                self._isLoaded = true;
            });

        /*
        this.timerId = setTimeout(function() {
                self._isLoaded = true;
                clearTimeout(self.timerId);
            }, 1000);
            */
    },
    _bindEvents: function() {
        var self = this;
        
        var getIntersects = function(evt) {
            var mouseX = (evt.clientX / self.w) * 2 - 1,
                mouseY = -(evt.clientY / self.h) * 2 + 1,
                vector = new THREE.Vector3(mouseX, mouseY, 0.5),
                ray, intersects;
                    
            self.projector.unprojectVector(vector, self.camera);

            ray = new THREE.Ray(self.camera.position, vector.subSelf(self.camera.position).normalize());

            intersects = ray.intersectObjects(self.interactives);

            return intersects;
        };

        var onMousedown = function(evt) {
                var intersects = getIntersects(evt);            

                if (intersects.length > 0) {
                    var materialIdx = intersects[0].face.materialIndex;

                    var region = self._regionMapper[materialIdx];
                    //console.log(region);

                    window.GraphAPI.dataCache = self._data[region];
                    window.GraphAPI.drawGraph('char', 0);

                    self._isCubeClicked = true;
                    //console.log(self.data[materialIdx]);
                }
            },
            onMousemove = function(evt) {
                var intersects = getIntersects(evt);

                if (intersects.length > 0) {
                    self.container.style.cursor = 'pointer';
                    self.rotY = self.rotX = 0;
                } else {
                    self.container.style.cursor = 'auto';
                    self.rotY = 2.4; self.rotX = 1.8;
                }
            };
        
        document.addEventListener('mousedown', onMousedown);
        document.addEventListener('mousemove', onMousemove);
    },
    _render: function() {
        var vec = new THREE.Vector3(1.6, 1.2, 0);

        var cubeEnt = this.cube.entity, 
            rotY = this.rotY, rotX = this.rotX;

        if (this._isLoaded && !this._isCubeClicked && cubeEnt.position.z < -40) {
            cubeEnt.position.z += 100;
        } 
        if (this._isCubeClicked) {
            cubeEnt.position.z -= 30;
            cubeEnt.position.x -= 60;
            cubeEnt.position.y += 50;
            if (cubeEnt.position.z <= -10000) cubeEnt.position.z = -10000;
        }

        cubeEnt.rotation.y += rotY * 0.005;
        cubeEnt.rotation.x += rotX * 0.005;

        if (!this._isCubeClicked) {
            var r = Math.random();
            if (r < 0.55) this.textGroup.runTexts();
            else this.textGroup.runTexts(0.002);
        } else {
            $(this.container).fadeOut(800);
            $('#content').fadeIn(600, function() {
                    $('#cubeLogo').fadeIn(900);
                });
        }

        // render
        this.renderer.render(this.scene, this.camera);
    },
    _animate: function() {
        var self = this;
        requestAnimationFrame(function(t) {
            self._animate();
        });
        this._render();
    },
    run: function() {
        this._animate();
    }
};
