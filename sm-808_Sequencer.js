/*
@module Sequencer
*/


var Sequencer = function(options){

	var self = this;

	/*_______________________________________________________
	@function init
	@description Initialize new Sequencer
	@arguments n/a
	@returns undefined
	@private
	*/
	function init(){
		config(self,options)

		self.viewport = addDom(newDom("div"));
		self.viewport.className = "SequencerViewport";

		self.template = self.template || getDom("Sequecner_Template").innerHTML;

		self.template = self.template.replace(/\{\{name\}\}/g, "");
		self.viewport.innerHTML = self.template;

		self.Stepsview = getClass(".Sequencer .container .steps ul",self.viewport)[0];

		self.playbutton = getClass(".Sequencer .viewport .playbutton",self.viewport);
		self.playbutton.onmousedown = self.play;

		self.Tracksview = getClass(".Tracks",self.viewport);

		self.buttons = getClass(".Sequencer .container .buttons button",self.viewport);

		self.addtrack = self.buttons[0];
		self.addtrack.onclick = self.openInstrumentList;

		self.save = self.buttons[1];
		self.save.onclick = self.exportCurrentSong;

		self.clearpattern = self.buttons[2];
		self.clearpattern.onclick = self.clearPattern;

		self.adjustbpm = self.buttons[3]
		self.adjustbpm.onmousedown = adjustBPM
		self.adjustbpm.innerHTML = "BPM: "+self.BPM

		drawSteps();
	}

	self.is_playing = false;
	self.BPM = 128;
	self.BPM_range = [80,150];

	self.steps = 32;
	self.timer_interval = calcDelay(self.BPM)[self.steps];
	self.play_step = 0;

	self.tracks = [];
	self.stepbuttons = [];

	self.Instruments = [];

	self.patterns = []; //currently unused, will hold an array of patterns

	/*_______________________________________________________
	@function play
	@description Start playing
	@arguments n/a
	@returns undefined
	@public
	*/
	self.play = function(){
		self.is_playing = !self.is_playing;
		if (self.is_playing) {
			self.play_step = 0;
			timerLoop();
			self.playbutton.className = "playbutton playing";
			self.playbutton.innerHTML = "STOP";
		} else {
			self.play_step = 0;
			clearTimeout(self.tmr);
			self.stepbuttons[self.last_play_step].dom.className = "";
			self.playbutton.className = "playbutton";
			self.playbutton.innerHTML = "PLAY";

			for (var i=0;i<self.tracks.length;i++){
				self.tracks[i].instrument.sequencer_is_playing = false;
				self.tracks[i].instrument.stop();
			}
		}
	}

	/*_______________________________________________________
	@function timerLoop
	@description Main sequencer playback loop
	@arguments n/a
	@returns undefined
	@private
	*/
	function timerLoop(){
		for (var i=0;i<self.tracks.length;i++){
			var track = self.tracks[i]
			var current_step = track.current_pattern[self.play_step]
			var inst = track.instrument.sequencer_is_playing = true
			if (current_step.on === true &&  track.muted !== true){
				track.instrument.play(current_step.gain||.5)
			}
		}
		if (self.last_play_step !== undefined) {
			self.stepbuttons[self.last_play_step].dom.className = ""
		}
		self.stepbuttons[self.play_step].dom.className = "on"
		self.last_play_step = self.play_step

		self.play_step++
		if (self.play_step === self.steps) {self.play_step = 0}
		self.tmr = setTimeout(timerLoop,self.timer_interval)

	}

	/*_______________________________________________________
	@function drawSteps
	@description Draws sequencer step DOM elements
	@arguments n/a
	@returns undefined
	@private
	*/
	function drawSteps(){
		for (var i=0,step;i<self.steps;i++) {
			step = addDom(newDom("li"),self.Stepsview);
			step.setAttribute("step",i)
			step.innerHTML = i+1
			self.stepbuttons.push({
				dom:step
			})
		}
	}

	/*_______________________________________________________
	@function adjustBPM
	@description Click handler for the BPM button to create a new Knob control to set the BPM
	@arguments n/a
	@returns undefined
	@private
	*/
	function adjustBPM(evt){
		evt.srcElement = evt.srcElement || evt.target
		var knobview = addDom(newDom("div"),getClass(".Sequencer",self.viewport));
		knobview.className = "KnobView"
		var knob = new Knob({
			viewport	: knobview,
			callback	: setBPMFromKnob,
			knob_value	: bpmToKnob(self.BPM),
			onFinish	: function(thisknob){
				knobview.parentNode.removeChild(knobview);
				self.adjustbpm.innerHTML = "BPM: "+(self.BPM.toFixed(1))
			}
		})
		knob.knobval = addDom(newDom("div"),knobview);
		knob.knobval.className = "knobval";
		setBPMFromKnob(knob)

		var width = knobview.offsetWidth;
		var height= knobview.offsetHeight;

		var op = evt.srcElement.offsetParent.offsetParent
		knobview.style.left = (evt.srcElement.offsetLeft + op.offsetLeft)+"px"
		knobview.style.top  = (evt.srcElement.offsetTop  + op.offsetTop )+"px"
	}

	/*_______________________________________________________
	@function bpmToKnob
	@description Calculate a value 0-1 based on input BPM relative to BPM_range
	@arguments bpm [Float]
	@returns [Float]
	@private
	*/
	function bpmToKnob(bpm) {
		return (bpm-self.BPM_range[0])/(self.BPM_range[1]-self.BPM_range[0])
	}

	/*_______________________________________________________
	@function setBPMFromKnob
	@description Sets the BPM from a knob callback event
	@arguments Knob [Object]
	@returns undefined
	@private
	*/
	function setBPMFromKnob(knob){
		var new_bpm = ( knob.knob_value * (self.BPM_range[1]-self.BPM_range[0])) +self.BPM_range[0] ///(knob.knob_value * ((self.BPM_range[1]-self.BPM_range[0])+self.BPM_range[0]))
		self.setBPM(new_bpm)
		knob.knobval.innerHTML = new_bpm.toFixed(1);
	}

	/*_______________________________________________________
	@function setBPM
	@description Sets the BPM
	@arguments bpm [Float]
	@returns undefined
	@public
	*/
	self.setBPM = function(bpm){
		self.BPM = bpm
		self.timer_interval = calcDelay(bpm)[self.steps]
	}

	/*_______________________________________________________
	@function stop
	@description Stop playing
	@arguments n/a
	@returns undefined
	@public
	*/
	self.stop = function(){
		for (var i=0;i<self.tracks.length;i++){
			var current_step = self.tracks[i].current_pattern[self.play_step]
			self.tracks[i].instrument.sequencer_is_playing = false
		}
	}

	/*_______________________________________________________
	@function addInstrument
	@description Creates a new track with the selected instrument configuration
	@arguments instrument_config [Object]
	@returns Track [Object]
	@public
	*/
	self.addInstrument = function(instrument_config){
		delete instrument_config.viewport
		delete instrument_config.onLoad

		var new_track = newInstrument(instrument_config)
		getClass(".New_Instrument").style.display = "none";
		return new_track
	}

	/*_______________________________________________________
	@function openInstrumentList
	@description Opens the Add Instrument dialogue
	@arguments n/a
	@returns undefined
	@public
	*/
	self.openInstrumentList = function(){
		getClass(".New_Instrument").style.display = "inline-block";
	}

	/*_______________________________________________________
	@function newInstrument
	@description Creates a new track with a new instrument
	@arguments instrument_config [Object]
	@returns Track [Object]
	@public
	*/
	function newInstrument(instrument_config){

		var track_config = {
			viewport: addDom(newDom("div"),self.Tracksview)
		}

		self.Tracks_template = self.Tracks_template || getDom("Track_Template").innerHTML
		var template = self.Tracks_template.replace(/\{\{name\}\}/g, instrument_config.name )
		track_config.viewport.innerHTML = template;

		instrument_config.view_width = 70;
		instrument_config.view_height = 70;

		instrument_config.viewport = getClass(".Track .viewport",track_config.viewport)

		track_config.instrument = new Instrument(instrument_config)

		var remove_button = getClass(".Track .container .remove",track_config.viewport)
		remove_button.onclick = function(){
			self.removeInstrument(new_track);
		}

		track_config.steps = self.steps
		track_config.stepview = getClass(".Track .container .steps ul",track_config.viewport)[0];
		track_config.Sequencer = self;
		var new_track = new Track(track_config)

		self.tracks.push(new_track)

		return new_track
	}

	/*_______________________________________________________
	@function removeInstrument
	@description Removes a track
	@arguments Instrument [Object]
	@returns undefined
	@public
	*/
	self.removeInstrument = function(inst){
		var removing
		for (var i=0;i<self.tracks.length;i++){
			if (self.tracks[i] === inst) {
				removing = self.tracks.splice(i,1)[0]
				removing.viewport.parentNode.removeChild(removing.viewport)
				break
			}
		}
	}

	/*_______________________________________________________
	@function clearPattern
	@description Clears the current pattern
	@arguments n/a
	@returns undefined
	@public
	*/
	self.clearPattern = function(){
		for (var i=0;i<self.tracks.length;i++){
			self.tracks[i].clearTrack()
		}
	}

	/*_______________________________________________________
	@function exportCurrentSong
	@description Saves the current pattern to a JSON file
	@arguments n/a
	@returns undefined
	@public
	*/
	self.exportCurrentSong = function(){

		var tracks = []
		for (var i=0;i<self.tracks.length;i++){
			var track = self.tracks[i]
			var inst = track.instrument
			var pattern = []
			for (var ix=0;ix<track.current_pattern.length;ix++){
				pattern.push({
					on:track.current_pattern[ix].on,
					gain:track.current_pattern[ix].gain
				})
			}
			var obj = {
				instrument:{
					url:inst.url,
					name:inst.name,
					gain:inst.gain
				},
				pattern: pattern,
				steps:track.steps
			}
			tracks.push(obj)
		}
		var song_data = JSON.stringify(tracks)
		self.saveToFile(song_data)

		console.log(JSON.stringify(tracks))
	}

	/*_______________________________________________________
	@function saveToFile
	@description Automatically download a JSON file
	@arguments json [String]
	@returns undefined
	@public
	*/
	self.saveToFile = function(json){
		var a         = document.createElement('a');
		a.href        = 'data:attachment/json,' + json;
		a.target      = '_blank';
		a.download    = 'song.json';
		document.body.appendChild(a);
		a.click();
	}

	/*_______________________________________________________
	@function getInstrument
	@description Gets a loaded instrument by it's URL path
	@arguments path [String]
	@returns Instrument [Object]
	@public
	*/
	self.getInstrument = function(path){
		for (var i=0;i<self.Instruments.length;i++){
			if (self.Instruments[i].url === path){
				return self.Instruments[i]
			}
		}
	}

	/*_______________________________________________________
	@function loadSong
	@description Loads a song from JSON data
	@arguments songdata [Object]
	@returns undefined
	@public
	*/
	self.loadSong = function(songdata){
		for (var i=0;i<songdata.length;i++){
			var this_track = songdata[i]
			var this_instrument = self.getInstrument(this_track.instrument.url)
			var new_track = self.addInstrument(this_instrument)

			for (var ix=0;ix<new_track.current_pattern.length;ix++){
				config(new_track.current_pattern[ix],this_track.pattern[ix]);
				//new_track.current_pattern[ix].dom = new_track.current_pattern[i].dom
			}
			//new_track.current_pattern = this_track.pattern
			new_track.setSteps(this_track.steps || 32)
		}
	}


	init()

	return self


};