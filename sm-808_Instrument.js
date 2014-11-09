/**
@module Instrument
@description Uses Web Audio API to play sounds. Creates a new audio buffer for every play.
*/

var Instrument = function(options){

	var self = this

	/*_______________________________________________________
	Initialize
	@function init
	@description Initialize a new Instrument
	@arguments n/a
	@returns undefined
	@private
	*/
	function init(){
		config(self,options);

		self.AudioContext = (window.AudioContext||window.webkitAudioContext);

		if (self.AudioContext !== undefined) {
			self.audio_context = self.audio_context || new self.AudioContext();
			self.modern = true;
		} else {
			self.modern = false;
		//support audio element if no web-audio api?
		//	self.player = document.createElement("audio")
		//	document.body.appendChild(self.player)
		}

		if (self.viewport && self.modern){
			self.viewportInit(self.viewport);
		}

		if (self.url) {
			self.setSource(self.url,function(err,okay){
				if (okay && self.autoplay){
					self.play();
				}
				if (self.onLoad){
					self.onLoad();
				}
			});
		}
	}

	self.sequencer_is_playing = false
	self.gain = .5;
	self.sources = []
	self.loaded = false
	self.loading = false
	self.viewport_bgcolor = 'rgb(33,33,33)';
	self.viewport_fgcolor = 'rgb(0,251,0)';


	/*_______________________________________________________
	@function stop
	@description Stops all sources, redraw static waveform.
	@arguments n/a
	@returns undefined
	@public
	*/
	self.stop = function(){
		if (self.loaded === false) {return}
		while (self.sources.length>0) {
			self.sources.shift().stop(0)
		}
		self.drawWaveformData();
	}

	/*_______________________________________________________
	@function play
	@description Plays the instrument sound
	@arguments gain [Float]
	@returns undefined
	@public
	*/
	self.play = function(gain){
		if (self.loaded === false) {return}
		self.newPlay(gain);
		self.source.start(0);                           // play the source now
		if (self.drawVisual === undefined && !window.browser_is_mobile) {
			self.draw()
		}
	}

	/*_______________________________________________________
	@function newPlay
	@description Creates a new source from the loaded buffer.
	@arguments gain [Float]
	@returns undefined
	@public
	*/
	self.newPlay = function(gain){
		self.source = self.audio_context.createBufferSource();// creates a sound source
		self.sources.push(self.source)
		self.source.buffer = self.buffer;					// tell the source which sound to play
		var stop_tmr
		self.source.onended = function(){
			if (self.sources.length>0) {self.sources.shift()};
			if (self.sources.length == 0) {
				clearTimeout(stop_tmr)
				stop_tmr = setTimeout(function(){
					stopDrawing()
					if (self.sequencer_is_playing === false) {
						self.drawWaveformData()
					}
				},10)
			}
		}

		self.audio_context_gain = self.audio_context.createGain();
		self.source.connect(self.audio_context_gain);
		self.audio_context_gain.connect(self.audio_context.destination);
		self.audio_context_gain.gain.value = gain || self.gain

		self.analyser = self.audio_context.createAnalyser();
		self.audio_context_gain.connect(self.analyser);

	}


	/*_______________________________________________________
	@function setSource
	@description Loads an mp3 file from a URL, sets the buffer to the mp3 decoded data.
	@arguments url [String], callback [Function]
	@returns undefined
	@public
	*/
	self.setSource = function(url,callback){
		self.loading = true
		self.loaded = false
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			self.audio_context.decodeAudioData(request.response, function(buffer) {
				self.buffer = buffer;
				self.loading = false
				self.loaded = true

				if (self.has_viewport){
					self.drawWaveformData();
				}

				callback(null,true)

			}, function(){
				callback(true,null)
				alert("Could not load: "+url);
			});
		}
		request.send();
	}

	/*_______________________________________________________
	@function setGain
	@description Sets the default gain value and gain of the current source
	@arguments gain [Float]
	@returns undefined
	@public
	*/
	self.setGain = function(gain) {
		if (self.loaded === false) {return}
		self.audio_context_gain.gain.value = gain;
	}


	/*_______________________________________________________
	@function viewportInit
	@description Initialize viewport for showing the waveform data
	@arguments dom [HTMLelement]
	@returns dom [HTMLelement]
	@public
	*/
	self.viewportInit = function(dom){
		if (self.modern !== true) {
			return
		}
		self.view_width = self.view_width || 200;
		self.view_height = self.view_height || 100;
		self.canvas = newDom("canvas");
		self.canvas_context = self.canvas.getContext("2d");
		self.canvas.width = self.view_width;
		self.canvas.height = self.view_height;
		self.canvas.style.width = (self.view_width)+"px";
		self.canvas.style.height = (self.view_height)+"px";
		self.canvas.style.cursor="pointer"
		addDom(self.canvas,dom);

		self.has_viewport = true

		self.canvas.onmousedown = function(evt){
			self.play()
		}

		return self.canvas
	};

	/*_______________________________________________________
	@function draw
	@description Draws an oscilloscope in the viewport canvas element.
	@arguments n/a
	@returns undefined
	@public
	@see https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L128-L205
	*/
	self.draw = function(){
		if (self.loaded === false && self.has_viewport !== true) {return}

		self.drawVisual = requestAnimationFrame(self.draw);

		self.analyser.fftSize = self.bufferLength = 256;
		self.dataArray = new Uint8Array(self.bufferLength);
		self.analyser.getByteTimeDomainData(self.dataArray);

		var WIDTH = self.view_width
		var HEIGHT = self.view_height

		var canvasCtx = self.canvas_context

		self.analyser.getByteTimeDomainData(self.dataArray);

		canvasCtx.globalCompositeOperation = 'source-over';

		canvasCtx.fillStyle = self.viewport_bgcolor;
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		canvasCtx.lineWidth = 4;
		canvasCtx.strokeStyle = self.viewport_fgcolor;

		canvasCtx.beginPath();
		canvasCtx.globalAlpha = 1// lineOpacity ;

		var sliceWidth = WIDTH * 1.0 / self.bufferLength;
		var x = 0;

		for(var i = 0; i < self.bufferLength; i++) {

			var v = self.dataArray[i] / 128.0;
			var y = v * HEIGHT/2;

			if(i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}
			x += 1//sliceWidth;
		}

		canvasCtx.lineTo(self.canvas.width, self.canvas.height/2);
		canvasCtx.stroke();
	}

	/*_______________________________________________________
	@function stopDrawing
	@description Stops the oscilloscope drawing.
	@arguments n/a
	@returns undefined
	@private
	*/
	function stopDrawing() {
		if (self.drawVisual){
			window.cancelAnimationFrame(self.drawVisual);
			self.drawVisual = undefined;
		}
	}

	/*_______________________________________________________
	@function drawWaveformData
	@description Draws a representation of the entire waveform in the viewport canvas
	@arguments none
	@returns undefined
	@public
	@see http://stackoverflow.com/questions/22073716/create-a-waveform-of-the-full-track-with-web-audio-api
	*/
	self.drawWaveformData = function() {

		var canvasWidth = self.view_width
		var canvasHeight = self.view_height

		var buff = self.buffer
		var canvasCtx = self.canvas_context

		var leftChannel = buff.getChannelData(0); // Float32Array describing left channel
		var lineOpacity = canvasWidth / leftChannel.length  ;
		canvasCtx.save();
		canvasCtx.globalCompositeOperation = 'source-over';
		canvasCtx.fillStyle = self.viewport_bgcolor ;
		canvasCtx.fillRect(0,0,canvasWidth,canvasHeight );
		canvasCtx.strokeStyle = self.viewport_fgcolor;

		canvasCtx.globalCompositeOperation = 'lighter';
		canvasCtx.translate(0,canvasHeight / 2);
		canvasCtx.lineWidth = 1;
		canvasCtx.globalAlpha = .6// lineOpacity ;
		for (var i=0; i<  leftChannel.length; i+=16) {
		   // on which line do we get ?
		   var x = Math.floor ( canvasWidth * i / leftChannel.length ) ;
		   var y = leftChannel[i] * canvasHeight / 2 ;
		   canvasCtx.beginPath();
		   canvasCtx.moveTo( x  , 0 );
		   canvasCtx.lineTo( x+1, y );
		   canvasCtx.stroke();
		}
		canvasCtx.restore();
	}

	init(options);

	return self
};

