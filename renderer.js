// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const audio = require('./audio-source')
const coverArtAnimation = require('./animation.js');
const electron = require('electron');

const playlist = 'stefandasbach/sets/lounge';

var player =  document.getElementById('player');
player.volume = 1;
var loader = new audio.SoundcloudLoader(player);

var audioSource;
var form = document.getElementById('form');

function onStream(stream) {
	console.log(stream)
	document.getElementById('cover-art').src = stream.artwork;
}

// Controls
electron.ipcRenderer.on('control', (event, message) => {
	switch(message) {
		case 'NEXT':
			audioSource.next();
			break;
		case 'PREVIOUS':
			audioSource.previous();
			break;
		default:
			console.log('Unrecognized command: ' + message);
			break;
	}
})


function AudioVisualizer() {
    //constants
    this.numberOfBars = 40;

    //Rendering
    this.scene;
    this.camera;
    this.renderer;
    this.controls;

    this.element;

    //this.color = 0xff2b60;
    this.color = 0x82b1ff;

    //bars
    this.bars = new Array();
    this.barMaterial;

    //particles
    this.particles;
    this.particleMaterial;

    //audio
    this.javascriptNode;
    this.audioContext;
    this.sourceBuffer;
    this.analyser;
}

//initialize the visualizer elements
AudioVisualizer.prototype.initialize = function (element) {

	this.element = element
	this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 70, this.element.clientWidth / this.element.clientHeight, 1, 1000);

    var ambientLight = new THREE.AmbientLight( 0x606060 ); // soft white light
	this.scene.add( ambientLight );

    var light = new THREE.PointLight( 0xffffff );
    light.position.set( 60, 40, 20 );
    this.scene.add(light);

    geometry = new THREE.Geometry(); /*	NO ONE SAID ANYTHING ABOUT MATH! UGH!	*/

    particleCount = 2000; /* Leagues under the sea */

    /*	Hope you took your motion sickness pills;
	We're about to get loopy.	*/

    for (i = 0; i < particleCount; i++) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 1000 - 500;
        vertex.y = Math.random() * 1000 - 500;
        vertex.z = Math.random() * 1000 - 500;

        geometry.vertices.push(vertex);
    }

    this.particleMaterial = new THREE.PointCloudMaterial(
    	{
    		size: 1, 
    		color: this.color,
    		map: THREE.ImageUtils.loadTexture("./particle.png"),
    		blending: THREE.AdditiveBlending,
  			transparent: true
    	});
    this.particles = new THREE.PointCloud(geometry, this.particleMaterial);

    this.particles.rotation.x = Math.random() * 6;
    this.particles.rotation.y = Math.random() * 6;
    this.particles.rotation.z = Math.random() * 6;

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

AudioVisualizer.prototype.setColor = function(color) {
	this.color = color;
	this.barMaterial.color = color;
	this.particleMaterial.color = color;
}

//create the bars required to show the visualization
AudioVisualizer.prototype.createBars = function () {

    //iterate and create bars
    for (var i = 0; i < this.numberOfBars; i++) {

        var geometry = new THREE.CubeGeometry( 1, 0.5, 0.1);
        //create a material
        this.barMaterial = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: 0xffffff,
            shininess: 1
        });

        //create the geometry and set the initial position
        this.bars[i] = new THREE.Mesh(geometry, this.barMaterial);
        this.bars[i].position.x = 2*i - this.numberOfBars
        this.bars[i].position.z = -50
        //this.bars[i].position.set(i - this.numberOfBars/2, 0, -45);
        //add the created bar to the scene
        this.scene.add(this.bars[i]);
    }
};

AudioVisualizer.prototype.render = function(audioSource, clamp=100) {
	// get the average for the first channel
	const array = audioSource.streamData.slice(0, 96)

	// update particles
 	var time = Date.now() * 0.00005;
	this.particles.rotation.y = time;
	this.particleMaterial.size = array[20] / 30;

	this.camera.rotation.y = time;
	this.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));

    //render the scene and update controls
    this.renderer.render(this.scene, this.camera);

    var step = Math.round(array.length / this.numberOfBars);

    //Iterate through the bars and scale the z axis
    for (var i = 0; i < this.numberOfBars; i++) {
        var value = array[i * step] / 4;
        value = value < 1 ? 1 : value;
        this.bars[i].scale.y = value;
    }

    var that = this

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(function() {
    	that.render(audioSource);
    });
}


loader.loadStream('https://soundcloud.com/' + playlist, function() {
	const albumArt = loader.albumArt()
	const streamList = loader.streamUrl().map(function(url, idx) {return {"url": url, "artwork": albumArt[idx] ? albumArt[idx] : undefined}})
	audioSource = new audio.SoundCloudAudioSource(player, streamList, onStream);
	audioSource.shuffle();
	audioSource.play()

	const vis = new AudioVisualizer()
	vis.initialize(document.getElementById("fullscreen"));
	vis.createBars();
	vis.render(audioSource);

}, function() {})












