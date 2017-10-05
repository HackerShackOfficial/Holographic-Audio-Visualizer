// animation.js
var camera;
var scene;
var renderer;
var mesh;
    
      
    function init(img) {
      
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);
      
        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 1, 1 ).normalize();
        scene.add(light);
      
        var geometry = new THREE.CubeGeometry( 1, 10, 10);
        var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture(img) } );
        var sidesMaterial = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: 0x222222, specular: 0x555555, shininess: 5 } );
        var materials = [material, material, sidesMaterial, sidesMaterial, sidesMaterial, sidesMaterial];
        var meshFaceMaterial = new THREE.MeshFaceMaterial( materials );
      
        mesh = new THREE.Mesh(geometry, meshFaceMaterial );
        mesh.position.z = -20;
        scene.add( mesh );
      
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
      
        window.addEventListener( 'resize', onWindowResize, false );
      
        render();
    }
      
    function animate() {
        // mesh.rotation.x += .04;
        mesh.rotation.y += .02;
      
        render();
        requestAnimationFrame( animate );
    }
      
    function render() {
        renderer.render( scene, camera );
    }
      
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }


module.exports = {
	init: init,
	animate: animate,
	render: render,
	onWindowResize: onWindowResize
}
