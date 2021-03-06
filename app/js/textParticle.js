define(['lib/Three'], function (T) {

    // Based on http://www.openprocessing.org/visuals/?visualID=6910
    var Boid = function() { //{{{
        var vector = new T.Vector3(),
            _acceleration, _width = 600, _height = 700, _depth = 200, _goal, _neighborhoodRadius = 160,
            _maxSpeed = 4, _maxSteerForce = 0.01, _avoidWalls = false;

        this.position = new T.Vector3();
        this.velocity = new T.Vector3();
        _acceleration = new T.Vector3();

        this.setGoal = function ( target ) {
            _goal = target;
        }

        this.setAvoidWalls = function ( value ) {
            _avoidWalls = value;
        }

        this.setWorldSize = function ( width, height, depth ) {
            _width = width;
            _height = height;vector
            _depth = depth;
        }

        this.run = function ( boids ) {
            if ( _avoidWalls ) {

                vector.set( - _width, this.position.y, this.position.z );
                vector = this.avoid( vector );
                vector.multiplyScalar( 5 );
                _acceleration.addSelf( vector );

                vector.set( _width, this.position.y, this.position.z );
                vector = this.avoid( vector );
                vector.multiplyScalar( 5 );
                _acceleration.addSelf( vector );

                vector.set( this.position.x, - _height, this.position.z );
                vector = this.avoid( vector );
                vector.multiplyScalar( 5 );
                _acceleration.addSelf( vector );

                vector.set( this.position.x, _height, this.position.z );
                vector = this.avoid( vector );
                vector.multiplyScalar( 5 );
                _acceleration.addSelf( vector );

                vector.set( this.position.x, this.position.y, - _depth );
                vector = this.avoid( vector );
                vector.multiplyScalar( 5 );
                _acceleration.addSelf( vector );

                vector.set( this.position.x, this.position.y, _depth );
                vector = this.avoid( vector );
                vector.multiplyScalar( 5 );
                _acceleration.addSelf( vector );

            }

            if ( Math.random() > 0.5 ) {
                this.flock( boids );
            }

            this.move();
        }

        this.flock = function ( boids ) {
            if ( _goal ) {
                _acceleration.addSelf( this.reach( _goal, 0.005 ) );
            }

            _acceleration.addSelf( this.alignment( boids ) );
            _acceleration.addSelf( this.cohesion( boids ) );
            _acceleration.addSelf( this.separation( boids ) );
        }

        this.move = function () {
            this.velocity.addSelf( _acceleration );

            var l = this.velocity.length();

            if ( l > _maxSpeed ) {
                this.velocity.divideScalar( l / _maxSpeed );

            }

            this.position.addSelf( this.velocity );
            _acceleration.set( 0, 0, 0 );
        }

        this.checkBounds = function () {
            if ( this.position.x >   _width ) this.position.x = - _width;
            if ( this.position.x < - _width ) this.position.x =   _width;
            if ( this.position.y >   _height ) this.position.y = - _height;
            if ( this.position.y < - _height ) this.position.y =  _height;
            if ( this.position.z >  _depth ) this.position.z = - _depth;
            if ( this.position.z < - _depth ) this.position.z =  _depth;
        }

        //

        this.avoid = function ( target ) {
            var steer = new T.Vector3();

            steer.copy( this.position );
            steer.subSelf( target );

            steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

            return steer;
        }

        this.repulse = function ( target ) {
            var distance = this.position.distanceTo( target );

            if ( distance < 250 ) {
                var steer = new T.Vector3();

                steer.sub( this.position, target );
                steer.multiplyScalar( 0.5 / distance );

                _acceleration.addSelf( steer );
            }
        }

        this.reach = function ( target, amount ) {
            var steer = new T.Vector3();

            steer.sub( target, this.position );
            steer.multiplyScalar( amount );

            return steer;
        }

        this.alignment = function ( boids ) {
            var boid, velSum = new T.Vector3(),
            count = 0;

            for ( var i = 0, il = boids.length; i < il; i++ ) {
                if ( Math.random() > 0.6 ) continue;

                boid = boids[ i ];

                distance = boid.position.distanceTo( this.position );

                if ( distance > 0 && distance <= _neighborhoodRadius ) {
                    velSum.addSelf( boid.velocity );
                    count++;

                }
            }

            if ( count > 0 ) {
                velSum.divideScalar( count );

                var l = velSum.length();

                if ( l > _maxSteerForce ) {
                    velSum.divideScalar( l / _maxSteerForce );
                }

            }

            return velSum;
        }

        this.cohesion = function ( boids ) {
            var boid, distance,
            posSum = new T.Vector3(),
            steer = new T.Vector3(),
            count = 0;

            for ( var i = 0, il = boids.length; i < il; i ++ ) {
                if ( Math.random() > 0.6 ) continue;

                boid = boids[ i ];
                distance = boid.position.distanceTo( this.position );

                if ( distance > 0 && distance <= _neighborhoodRadius ) {
                    posSum.addSelf( boid.position );
                    count++;
                }
            }

            if ( count > 0 ) {
                posSum.divideScalar( count );
            }

            steer.sub( posSum, this.position );

            var l = steer.length();

            if ( l > _maxSteerForce ) {
                steer.divideScalar( l / _maxSteerForce );
            }

            return steer;
        }

        this.separation = function ( boids ) {
            var boid, distance,
            posSum = new T.Vector3(),
            repulse = new T.Vector3();

            for ( var i = 0, il = boids.length; i < il; i ++ ) {
                if ( Math.random() > 0.6 ) continue;

                boid = boids[ i ];
                distance = boid.position.distanceTo( this.position );

                if ( distance > 0 && distance <= _neighborhoodRadius ) {
                    repulse.sub( this.position, boid.position );
                    repulse.normalize();
                    repulse.divideScalar( distance );
                    posSum.addSelf( repulse );
                }
            }

            return posSum;
        }
    } //}}}

    /*
     * opts
     *  - amount
     *  - textures []
     *  - opacitys []
     *  - scene
     */

    function TextParticle(opts) {  //{{{
        opts = opts || {};
        this._init(opts);
    } //}}}

    TextParticle.prototype.update = function() { //{{{
        var r = Math.random(), opacity = 0,
            boid, text;

        if (r >= 0.55) opacity = 0.002;

        for (var i = 0, len = this.particles.length; i < len; i++) {
            boid = this.boids[i];
            boid.run(this.boids);

            text = this.particles[i];
            opacity && (text.material.opacity -= opacity);
            if (text.material.opacity < 0) text.material.opacity = 1;

            boid && boid.repulse(new T.Vector3(-20.0, -20.0, 0));
        }
    } //}}}

    TextParticle.prototype._init = function(opts) { //{{{
        var amount = opts.amount || 26,
            textures = opts.textures || [], opacitys = opts.opacitys || [],
            scene = opts.scene,
            boid;

        this.particles = [];
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
            this.particles[i] = new T.Particle(new T.ParticleBasicMaterial({
                map: T.ImageUtils.loadTexture(texture),
                opacity: opacity
            }));

            this.particles[i].position = this.boids[i].position;
            this.particles[i].doubleSided = true;

            scene && scene.add && scene.add(this.particles[i]);
        }
    }; //}}}

    return TextParticle;
});
