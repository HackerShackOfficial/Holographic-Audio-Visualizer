// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const audio = require('./audio-source')
const coverArtAnimation = require('./animation.js');
const electron = require('electron');
const SpectrumVisualizer = require('./spectrum-visualizer.js');
const ParticleVisualizer = require('./particle-visualizer.js');

const playlist = 'stefandasbach/sets/lounge';

var player =  document.getElementById('player');
player.volume = 1;
var loader = new audio.SoundcloudLoader(player);

var audioSource;
var form = document.getElementById('form');

var vis;

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
        case 'TOGGLE_VISUALIZER_SETTING':
            vis.toggle()
            break;
		default:
			console.log('Unrecognized command: ' + message);
			break;
	}
})


loader.loadStream('https://soundcloud.com/' + playlist, function() {
	const albumArt = loader.albumArt()
	const streamList = loader.streamUrl().map(function(url, idx) {return {"url": url, "artwork": albumArt[idx] ? albumArt[idx] : undefined}})
	audioSource = new audio.SoundCloudAudioSource(player, streamList, onStream);
	audioSource.shuffle();
	audioSource.play()

	vis = new SpectrumVisualizer()
	vis.initialize(document.getElementById("fullscreen"));
	vis.animate(audioSource);

}, function() {})












