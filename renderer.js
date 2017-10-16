// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const audio = require('./audio-source')
const coverArtAnimation = require('./animation.js');
const electron = require('electron');
// visualizers
const SpectrumVisualizer = require('./spectrum-visualizer.js');
const ParticleVisualizer = require('./particle-visualizer.js');
const CubeVisualizer = require('./cube-visualizer.js');

const playlist = 'stefandasbach/sets/lounge';

var player =  document.getElementById('player');
player.volume = 1;

var selectedVisualizer = 0;
var visualizers = [
    new CubeVisualizer(document.getElementById("cube")), 
    new ParticleVisualizer(document.getElementById("particle")), 
    new SpectrumVisualizer(document.getElementById("spectrum"))
];

var loader = new audio.SoundcloudLoader(player);
var audioSource;

function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 40);
}


function unfade(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 20);
}


/**
Render the album artwork when a new stream is played
*/
function onStream(stream) {
    const art = document.getElementById('cover-art')
	art.src = stream.artwork;

    unfade(art);
    setTimeout(function() {
        fade(art);
    }, 10000)
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
            visualizers[selectedVisualizer].toggle();
            break;
        case 'CHANGE_VISUALIZER':
            selectedVisualizer = (selectedVisualizer+1) % visualizers.length
            animateVisualizer(selectedVisualizer);
            break;
        case 'TOGGLE_PLAY':
            audioSource.toggle();
		default:
			console.log('Unrecognized command: ' + message);
			break;
	}
})

electron.ipcRenderer.on('volume', (event, message) => {
    const volume = Number(message);
    if (volume) {
        audioSource.setVolume(volume)
    }
})

function animateVisualizer(index) {
    for (let i = 0; i<visualizers.length; i++) {
        if (i == index) {
            visualizers[i].element.style.display = 'inline-block'
            visualizers[i].animate(audioSource)
            // hack to fix a redraw bug
            window.dispatchEvent(new Event('resize'));
        } else {
            visualizers[i].element.style.display = 'none'
            visualizers[i].stop();
        }
    }
}


loader.loadStream('https://soundcloud.com/' + playlist, function() {
	const albumArt = loader.albumArt()
	const streamList = loader.streamUrl().map(function(url, idx) {return {"url": url, "artwork": albumArt[idx] ? albumArt[idx] : undefined}})
	audioSource = new audio.SoundCloudAudioSource(player, streamList, onStream);
	audioSource.shuffle();
	audioSource.play()

    // Create visualizers
    for (let i = 0; i<visualizers.length; i++) {
        visualizers[i].initialize();
    }

    // Start the visible one
	animateVisualizer(selectedVisualizer);

}, function() {})












