/*
 * opts
 *  - amount
 *  - textures []
 *  - opacitys []
 */
function Text(opts) {
    opts = opts || {};
    this._init(opts);
}
Text.prototype._init = function(opts) {
    var amount = opts.amount || 26,
        textures = opts.textures || [],
        opacitys = opts.opacitys || [],
        boid, text, textMaterial;

    this.texts = [];
    this.boids = [];

    for (var i = 0; i < amount; i++) {
        boid = this.boids[i] = new Boid();

        // -200 ~ 200
        boid.position.x = Math.random() * 300 - 200;
        boid.position.y = Math.random() * 400 - 200;
        boid.position.z = Math.random() * 400 - 200;
        // -1 ~ 1
        boid.velocity.x = Math.random() * 2 - 1.5;
        boid.velocity.y = Math.random() * 2 - 1.5;
        boid.velocity.z = Math.random() * 2 - 1.5;

        boid.setAvoidWalls( true );
        boid.setWorldSize(800, 400, 900);

        var opacity = opacitys[i] || (0.1 + Math.random() * 0.9),
            texture = textures[i] || 'textures/h.jpg';
        textMaterial = new THREE.Particle(new THREE.ParticleBasicMaterial({
            map: THREE.ImageUtils.loadTexture(texture),
            opacity: opacity
        }));
        text = this.texts[i] = textMaterial;

        text.position = this.boids[i].position;
        text.doubleSided = true;
    }
};
Text.prototype.runTexts = function(opacity) {
    var boid, text;
    for (var i = 0, len = this.texts.length; i < len; i++) {
        boid = this.boids[i];
        boid.run(this.boids);

        text = this.texts[i];
        opacity && (text.material.opacity -= opacity);
        if (text.material.opacity < 0) text.material.opacity = 1;

        boid && boid.repulse(new THREE.Vector3(-20.0, -20.0, 0));
    }
};
