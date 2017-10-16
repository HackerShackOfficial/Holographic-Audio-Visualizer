// spectrum-visualizer.js

function AudioVisualizer(element) {
    //constants
    this.numberOfBars = 40;

    //Rendering
    this.scene;
    this.camera;
    this.renderer;
    this.animationId = 0;

    this.element = element;

    this.activeColorIdx = 0;
    this.colorSelections = [
    	0x82b1ff,
    	0xff2b60,
    	0x42f462,
    	0xe842ff,
    	0xffb938
    ];
  

    //bars
    this.bars = new Array();
    this.barMaterials = new Array();

    //particles
    this.particles;
    this.particleMaterial;

    //audio
    this.javascriptNode;
    this.audioContext;
    this.sourceBuffer;
    this.analyser;
}

AudioVisualizer.prototype.initialize = function () {
	this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 70, this.element.clientWidth / this.element.clientHeight, 1, 1000);
    this.camera.position.z = 40
    this.camera.position.y = 20

    var ambientLight = new THREE.AmbientLight( 0x606060 ); // soft white light
	this.scene.add( ambientLight );

    var light = new THREE.PointLight( 0xffffff );
    light.position.set( 60, 40, 20 );
    this.scene.add(light);

    this.createParticles()
    this.createBars()

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

AudioVisualizer.prototype.setColor = function(color) {
	for (var i = 0; i<this.barMaterials.length; i++) {
		this.barMaterials[i].color.setHex(color);
	}
	this.particleMaterial.color.setHex(color);
}

AudioVisualizer.prototype.toggle = function() {
	this.activeColorIdx++;
	this.activeColorIdx = this.activeColorIdx % this.colorSelections.length;
	console.log(this.activeColorIdx)
	this.setColor(this.colorSelections[this.activeColorIdx])
}

AudioVisualizer.prototype.createBars = function () {

    //iterate and create bars
    for (var i = 0; i < this.numberOfBars; i++) {

        var geometry = new THREE.CubeGeometry( 1, 0.5, 0.1);
        //create a material
        this.barMaterials[i] = new THREE.MeshPhongMaterial({
            color: this.colorSelections[this.activeColorIdx],
            specular: 0xffffff,
            shininess: 1
        });

        //create the geometry and set the initial position
        this.bars[i] = new THREE.Mesh(geometry, this.barMaterials[i]);
        this.bars[i].position.x = 2*i - this.numberOfBars
        this.bars[i].position.z = -50
        this.scene.add(this.bars[i]);
    }
};

AudioVisualizer.prototype.createParticles = function () {
    var geometry = new THREE.Geometry();

    particleCount = 2000;

    for (i = 0; i < particleCount; i++) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 1000 - 500;
        vertex.y = Math.random() * 1000 - 500;
        vertex.z = Math.random() * 1000 - 500;

        geometry.vertices.push(vertex);
    }

    this.particleMaterial = new THREE.PointsMaterial(
    	{
    		size: 1, 
    		color: this.colorSelections[this.activeColorIdx],
    		map: new THREE.TextureLoader().load("./particle.png"),
    		blending: THREE.AdditiveBlending,
  			transparent: true
    	});
    this.particles = new THREE.Points(geometry, this.particleMaterial);

    this.particles.rotation.x = Math.random() * 6;
    this.particles.rotation.y = Math.random() * 6;
    this.particles.rotation.z = Math.random() * 6;

    this.scene.add(this.particles);
}

AudioVisualizer.prototype.render = function(audioSource, clamp=96) {
	// get the average for the first channel
	const array = audioSource.streamData.slice(0, clamp)

	// update particles
 	var time = Date.now() * 0.00005;
	this.particles.rotation.y = time;
	this.particleMaterial.size = array[20] / 30;

    //render the scene and update controls
    this.renderer.render(this.scene, this.camera);

    var step = Math.round(array.length / this.numberOfBars);

    //Iterate through the bars and scale the z axis
    for (var i = 0; i < this.numberOfBars; i++) {
        var value = array[i * step] / 4;
        value = value < 1 ? 1 : value;
        this.bars[i].scale.y = value;
    }

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