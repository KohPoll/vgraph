(function() {
    var container;

    var camera, scene, renderer;

    var cube


    function init() {
        container = $('#cubeLogo');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(70, container.width() / container.height(), 1, 1000);
        //camera.position.y = 150;
        camera.position.z = 300;
        scene.add(camera);

        // Cube
        var materials = [];

        for ( var i = 0; i < 6; i ++ ) {
            materials.push(new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff}));
        }

        cube = new THREE.Mesh(new THREE.CubeGeometry(150, 150, 150, 1, 1, 1, materials ), new THREE.MeshFaceMaterial() );
        //cube.position.y = 150;
        cube.overdraw = true;
        scene.add(cube);


        renderer = new THREE.CanvasRenderer();
        renderer.setSize(container.width(), container.height());

        container.append(renderer.domElement);
    }

    //

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        cube.rotation.y += 0.005;
        cube.rotation.z += 0.008;
        renderer.render(scene, camera);
    }

    init();
    animate();

    container.bind('click', function(evt) {
        $(this).fadeOut('600');
        $('#content').fadeOut('700');
        $('#painter').fadeIn('800');

        AnimScene._isCubeClicked = false;
        AnimScene.cube.entity.position.x = 20;
        AnimScene.cube.entity.position.y = -20;
        AnimScene.cube.entity.position.z = -8000;
    });
})();
