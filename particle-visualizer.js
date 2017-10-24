//particle-visualizer.js

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function AudioVisualizer(element) {
    //Rendering
    this.scene;
    this.camera;
    this.renderer;
    this.animationId = 0;

    this.element = element;

    //particles
    this.particles;
    this.particleMaterial;
    this.particleColors = new Array();

    this.thetaSpread = new Array()
    this.phiSpread = new Array()
}

AudioVisualizer.prototype.initialize = function () {
	this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 70, this.element.clientWidth / this.element.clientHeight, 1, 1000);
    this.camera.position.z = 200;
    this.camera.position.y = 40;

    var ambientLight = new THREE.AmbientLight( 0x606060 ); // soft white light
	this.scene.add( ambientLight );

    var light = new THREE.PointLight( 0xffffff );
    light.position.set( 60, 40, 20 );
    this.scene.add(light);

	var distance = 30;
	var geometry = new THREE.Geometry();

	for (var i = 0; i < 1500; i++) {

	  var vertex = new THREE.Vector3();

	  this.thetaSpread[i] = THREE.Math.randFloatSpread(360);
	  this.phiSpread[i] = THREE.Math.randFloatSpread(360);

	  var theta = this.thetaSpread[i];
	  var phi = this.phiSpread[i];

	  vertex.x = distance * Math.sin(theta) * Math.cos(phi);
	  vertex.y = distance * Math.sin(theta) * Math.sin(phi);
	  vertex.z = distance * Math.cos(theta);

      this.particleColors[i] = new THREE.Color();
      this.particleColors[i].setHSL( 0.5, 1.0, 0.5 );

	  geometry.vertices.push(vertex);
	}

	geometry.colors = this.particleColors

	this.particleMaterial = new THREE.PointsMaterial({
		size: 4,
		map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/disc.png"),
		vertexColors: THREE.VertexColors,

		transparent: true,
		depthTest: false
	})
	this.particles = new THREE.Points(geometry, this.particleMaterial);

    this.scene.add(this.particles);


    this.renderer = new THREE.WebGLRenderer();
    
    this.renderer.setSize( this.element.clientWidth, this.element.clientHeight );

    this.element.appendChild(this.renderer.domElement);

    var self = this;

    window.addEventListener( 'resize', function() {
    	self.camera.aspect = self.element.clientWidth / self.element.clientHeight;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize( self.element.clientWidth, self.element.clientHeight );
    }, false );
};


AudioVisualizer.prototype.toggle = function() {
}

AudioVisualizer.prototype.render = function(audioSource, clamp=96) {

	// get the average for the first channel
	const array = audioSource.streamData.slice(0, clamp)

	// update particles
 	var time = Date.now() * 0.00015;
	this.particles.rotation.y = time;

	var distance = 30
	var vertices = this.particles.geometry.vertices;
	for ( var i = 0; i < vertices.length; i++ ) {

		var data = array[i % (array.length-1)]
		var augmentationValue = data/5 + distance

		var theta = this.thetaSpread[i];
	  	var phi = this.phiSpread[i];

    	vertices[i].x = augmentationValue * Math.sin(theta) * Math.cos(phi);
		vertices[i].y = augmentationValue * Math.sin(theta) * Math.sin(phi);
	  	vertices[i].z = augmentationValue * Math.cos(theta);

	  	var h = 1 - (data / 600 + 0.1)
	  	this.particleColors[i].setHSL(h, 1, 0.7);
	}

	this.particles.geometry.verticesNeedUpdate = true;
	this.particles.geometry.colorsNeedUpdate = true;
    this.renderer.render(this.scene, this.camera);
}

AudioVisualizer.prototype.animate = function(audioSource) {
	this.render(audioSource);

	var that = this;

	this.animationId = requestAnimationFrame(function() {
    	that.animate(audioSource);
    });
}

AudioVisualizer.prototype.stop = function() {
	cancelAnimationFrame(this.animationId);
}

module.exports = AudioVisualizer;