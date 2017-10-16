// cube-visualizer.js
function AudioVisualizer(element) {
    //constants
    this.numberOfCubes = 40;
    this.delta = 0

    //Rendering
    this.scene;
    this.camera;
    this.renderer;
    this.animationId = 0;

    this.activeColorIdx = 0;
    this.colorSelections = [
    	0x82b1ff,
    	0xff2b60,
    	0x42f462,
    	0xe842ff,
    	0xffb938
    ];

    this.element = element;

    this.cubes = new Array();
    this.cubesSides = new Array();
}


AudioVisualizer.prototype.initialize = function () {
	this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, this.element.clientWidth / this.element.clientHeight, 0.1, 1000);

    this.createCubes();
    // Base lighting
	var light = new THREE.PointLight(0x9E15EC, 1, 100, 2);
	light.position.set(-4, 5, -1);
	this.scene.add(light);

	var light = new THREE.PointLight(0x0B8AE2, 1, 100, 2);
	light.position.set(6, 5, 1);
	this.scene.add(light);

	// Ambient light
	this.scene.add(new THREE.AmbientLight(0xbfbfbf));

    this.renderer = new THREE.WebGLRenderer();    
    this.renderer.setSize( this.element.clientWidth, this.element.clientHeight );

    this.element.appendChild(this.renderer.domElement);
    var self = this;

    window.addEventListener( 'resize', function() {
    	self.camera.aspect = self.element.clientWidth / self.element.clientHeight;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize( self.element.clientWidth, self.element.clientHeight );
    }, false );
}

AudioVisualizer.prototype.createCubes = function () {
	for (var x = -3; x <= 3; x++) {
	  for (var z = -3; z <= 3; z++) {
	    var geometry = new THREE.BoxGeometry(1, 1, 1);

	    for (var i = geometry.faces.length - 1; i >= 0; i--) {
	      if (i !== 4 && i !== 5) {
	        geometry.faces[i].color.setHex(this.colorSelections[this.activeColorIdx]);
	        this.cubesSides.push(geometry.faces[i]);
	      }
	    }

	    var material = new THREE.MeshLambertMaterial({color: 0xEEEEEE, vertexColors: THREE.FaceColors});
	    var cube = new THREE.Mesh(geometry, material);

	    cube.position.x = 1.2 * x;
	    cube.position.z = 1.2 * z;

	    console.log(cube)
	    this.cubes.push(cube);
	    this.scene.add(cube);
	  }
	}
}

AudioVisualizer.prototype.setColor = function(color) {
	for (var i = 0; i<this.cubesSides.length; i++) {
		this.cubesSides[i].color.setHex(color);
	}

	for (var j = 0; j<this.cubes.length; j++) {
		this.cubes[j].geometry.colorsNeedUpdate = true;
	}
}

AudioVisualizer.prototype.toggle = function() {
	this.activeColorIdx++;
	this.activeColorIdx = this.activeColorIdx % this.colorSelections.length;
	this.setColor(this.colorSelections[this.activeColorIdx])
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

AudioVisualizer.prototype.render = function(audioSource, clamp=96) {
	var noSignal = 50
	const data = audioSource.streamData.slice(20, 70)
	var step = Math.floor(data.length / this.numberOfCubes)
	for (var i = 0, n = 0; i < this.cubes.length; i++, n+=step) {
	    var val = Math.abs(audioSource[n]) / noSignal;

	    this.cubes[i].scale.y = Math.abs(data[n]) / noSignal;

	    if (this.cubes[i].scale.y <= 1) {
	      this.cubes[i].scale.y = 1;
	    }

	    this.cubes[i].position.y = (this.cubes[i].scale.y / 2) - 0.5;
	  }

	  this.delta += 0.006;
	  var dist = 15;

	  this.camera.lookAt(new THREE.Vector3(0,5,0));
	  this.camera.position.x = Math.sin(this.delta) * dist;
	  this.camera.position.y = Math.cos(62) * dist;
	  this.camera.position.z = Math.cos(this.delta) * dist;

	  this.renderer.render(this.scene, this.camera);
}

module.exports = AudioVisualizer;




