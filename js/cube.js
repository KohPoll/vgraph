define(['lib/Three'], function (T) {

    /*
     * opts
     *  - pos: [x, y, z]
     *  - size: 200
     *  - textures: []
     *  - moveSpped: [x, y, z]
     *  - rotSpeed: [x, y, z]
     *  - scene: 
     */
    function Cube(opts) { //{{{
        opts = opts || {};
        this._init(opts);

        this.speedX = 0;
        this.speedY = 0;
        this.speedZ = 0;

        this.rotX = opts.rotSpeed[0] || 0;
        this.rotY = opts.rotSpeed[1] || 0;
        this.rotZ = opts.rotSpeed[2] || 0;

        this.farestDist = 0;
        this.nearestDist = 0;
        this.arrviedEnd = 'none';

        this._isAnimated = true;
    } //}}}

    Cube.prototype.start = function () {//{{{
        this._isAnimated = true;
    };//}}}

    Cube.prototype.stop = function () {//{{{
        this._isAnimated = false;
    };//}}}

    Cube.prototype.move = function (info) {//{{{
        // info : { speed: [speedX, speedY, speedZ], near: x, far: x}       
        var speed = info.speed;

        this.speedX = speed[0];
        this.speedY = speed[1];
        this.speedZ = speed[2];

        this.nearestDist = info.near;
        this.farestDist = info.far;
    };//}}}

    Cube.prototype.update = function () { //{{{
        if (this._isAnimated) {
            var mesh = this.mesh;

            mesh.rotation.y += this.rotY;
            mesh.rotation.x += this.rotX;
            mesh.rotation.z += this.rotZ;

            if (mesh.position.z < this.nearestDist || mesh.position.z > this.farestDist) {
                mesh.position.z += this.speedZ;
                mesh.position.x += this.speedX;
                mesh.position.y += this.speedY;
            } else {
                if (mesh.position.z >= this.nearestDist) {
                    this.arrivedEnd = 'near';
                }
                if (mesh.position.z <= this.farestDist) {
                    this.arrviedEnd = 'far';
                }
            }
        }
    }; //}}}

    Cube.prototype._init = function (opts) { //{{{
        var materials = [], geometry,
            pos = opts.pos || [], size = opts.size || 200,
            scene = opts.scene,
            textures = opts.textures || [];

        // generate materials
        for (var i=0; i<6; i++) {
            var color, texture = textures[i], faceMaterial;

            if (texture) {
                faceMaterial = //new T.MeshBasicMaterial({color: color});
                    new T.MeshBasicMaterial({map: T.ImageUtils.loadTexture(texture)});
            } else {
                faceMaterial = 
                    new T.MeshBasicMaterial({color: Math.random() * 0xffffff});
            }
        
            materials.push(faceMaterial);
        }

        // generate gemotry
        geometry = new T.CubeGeometry(size, size, size, 1, 1, 1, materials);
        this.mesh = new T.Mesh(geometry, new T.MeshFaceMaterial());

        this.mesh.position.x = pos[0] || 0;
        this.mesh.position.y = pos[1] || 0;
        this.mesh.position.z = pos[2] || 0;

        this.mesh.overdraw = true;

        scene && scene.add && scene.add(this.mesh);
    }; //}}}

    return Cube;
});

