/*
 * opts
 *  - pos: [x, y, z]
 *  - size: 200
 *  - textures: []
 */
function Cube(opts) {
    opts = opts || {};
    this._init(opts);
}
Cube.prototype.setTexture = function(texture) {
    this.entity.material.map = THREE.ImageUtils.loadTexture(texture);
};
Cube.prototype._init = function(opts) {
    var materials = [], geometry,
        pos = opts.pos || [], size = opts.size || 200,
        textures = opts.textures || [];

    // generate materials
    for ( var i = 0; i < 6; i ++ ) {
        var color, texture = textures[i], faceMaterial;

        if (texture) {
            faceMaterial = //new THREE.MeshBasicMaterial({color: color});
                new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(texture)});
        } else {
            faceMaterial = 
                new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff});
        }
	
        materials.push(faceMaterial);
    }

    // generate gemotry
    geometry = new THREE.CubeGeometry(size, size, size, 1, 1, 1, materials);

    //this.entity = new THREE.Mesh(geometry, materials);
    this.entity = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial());
    //this.entity.geometry = geometry;
    //this.entity.materials = materials;

    this.entity.position.x = pos[0] || 0;
    this.entity.position.y = pos[1] || 0;
    this.entity.position.z = pos[2] || 0;

    this.entity.overdraw = true;
};
