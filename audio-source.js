// audio-source.js
exports.SoundCloudAudioSource = function(player, streams, onPlayStream, continuous=true) {
	var self = this;
	var streamIndex = 0;
	var analyser;
	var audioCtx = new (window.AudioContext || window.webkitAudioContext);
	analyser = audioCtx.createAnalyser();
	analyser.fftSize = 256;

	var source = audioCtx.createMediaElementSource(player);
	source.connect(analyser);
	analyser.connect(audioCtx.destination);

	//continuous
	if (continuous) {
	    player.addEventListener('ended', function() {self.next()});
	    player.addEventListener('error', function() {self.next()});
	}

	var sampleAudioStream = function() {
	  self.streamData = new Uint8Array(analyser.frequencyBinCount);
	  analyser.getByteFrequencyData(self.streamData);

	  // Calculate an overall volume value
	  var total = 0;
	  for (var i = 0; i < 64; i++) { // Get the volume from the first 64 bins
	    total += self.streamData[i];
	  }
	  self.volume = total;

	  var totalLow = 0;
	  for (var i = 0; i < 31; i++) { // Get the volume from the first 32 bins
	    totalLow += self.streamData[i];
	  }
	  self.volumeLow = totalLow;

	  var totalHi = 0;
	  for (var i = 31; i < 64; i++) { // Get the volume from the second 32 bins
	    totalHi += self.streamData[i];
	  }
	  self.volumeHi = totalHi;
	};

	setInterval(sampleAudioStream, 20);

	// Public properties and methods
	this.volume = 0;
	this.volumeLow = 0;
	this.volumeHi = 0;
	this.streamData = new Uint8Array(analyser.frequencyBinCount);
	this.isPlaying = false;
	this.currentTime = 0;

	this.playStream = function(stream) {
	    player.crossOrigin = 'anonymous';
	    player.setAttribute('src', stream.url);
	    player.play();
	    onPlayStream(stream)
	}

	this.play = function() {
		player.pause();
		this.isPlaying = true;
		player.currentTime = 0;
		this.playStream(streams[streamIndex])
	}

	this.resume = function() {
		player.currentTime = this.currentTime;
		player.play();
		this.isPlaying = true;
	}

	this.toggle = function() {
		this.isPlaying ? this.pause() : this.resume();
	}

	this.pause = function() {
		this.currentTime = player.currentTime;
		player.pause();
		this.isPlaying = false;
	}

	this.next = function() {
		if (streamIndex < streams.length - 1) {
			streamIndex++;
			this.play()
		}
	}

	this.previous = function() {
		if (streamIndex > 0) {
			streamIndex--;
			this.play();
		}
	}

	this.setVolume = function(volume) {
		player.volume = volume;
	}

	this.shuffle = function() {
		streamIndex = 0;
		var j, x, i;
	    for (i = streams.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = streams[i - 1];
	        streams[i - 1] = streams[j];
	        streams[j] = x;
    	}
	}
};

exports.Visualizer = function() {
	var audioSource;
	this.init = function(options) {
	  audioSource = options.audioSource;
	  var container = document.getElementById(options.containerId);        
	};
};

exports.SoundcloudLoader = function(player,uiUpdater) {
	var self = this;
	var client_id = "26095b994cc185bc665f4c9fcce8f211"; // to get an ID go to https://developers.soundcloud.com/
	this.sound = {};
	this.streamUrl = "";
	this.albumArt = "";
	this.errorMessage = "";
	this.player = player;

	/**
	 * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
	 * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
	 * @param track_url
	 * @param callback
	 */
	this.loadStream = function(track_url, successCallback, errorCallback) {
	    SC.initialize({
	        client_id: client_id
	    });
	    SC.get('https://api.soundcloud.com/resolve', { url: track_url }, function(sound) {
	        if (!sound) {
	        	errorCallback();
	        }
	        else if (sound.errors) {
	            self.errorMessage = "";
	            for (var i = 0; i < sound.errors.length; i++) {
	                self.errorMessage += sound.errors[i].error_message + '<br>';
	            }
	            self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
	            errorCallback();
	        } else {

	            if(sound.kind=="playlist"){
	                self.sound = sound;
	                self.streamPlaylistIndex = 0;
	                self.streamUrl = function(){
	                    return sound.tracks.map(function(track) {return track.stream_url + '?client_id=' + client_id});
	                }
	                self.albumArt = function() {
	                	return sound.tracks.map(function(track) {return track.artwork_url});
	                };
	                successCallback();
	            }else{
	                self.sound = sound;
	                self.streamUrl = function(){ return [sound.stream_url + '?client_id=' + client_id]; };
	                self.albumArt = function() {return [sound.artwork_url]};
	                successCallback();
	            }
	        }
	    });
	};
};

