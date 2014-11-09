/** @module Track */

var Track = function(options){

	var self = this

	self.gain = .5;

	self.current_pattern = []

	/*_______________________________________________________
	@function init
	@description Initialize a new Track
	@arguments none
	@returns undefined
	@private
	*/
	function init(){
		config(self,options);

		var buttons = self.buttons = getClass(".Track .container button",self.viewport)
		buttons[0].onclick = function(){
			self.setSteps(8)
			buttons[0].className = "on"
			buttons[1].className = ""
			buttons[2].className = ""
		}
		buttons[1].onclick = function(){
			self.setSteps(16)
			buttons[0].className = ""
			buttons[1].className = "on"
			buttons[2].className = ""
		}
		buttons[2].onclick = function(){
			self.setSteps(32)
			buttons[0].className = ""
			buttons[1].className = ""
			buttons[2].className = "on"
		}
		buttons[2].className = "on"

		self.mutebutton = buttons[3]
		self.mutebutton.onclick = self.mute

		//These events are for painting steps
		/*
		self.stepview.onmousedown = stepsMouseDown
		self.stepview.onmouseover = stepsMouseOver
		window.onmouseup = stepsMouseUp
		window.onmouseout = stepsMouseOut
		*/

		drawSteps(32)
		self.setSteps(32)
	}

	self.muted = false;
	self.mute = function(){
		self.muted = !self.muted
		self.mutebutton.className = (self.muted)?"mute on" : "mute"
	}

	var painting = false
	var paint_mode

	/*_______________________________________________________
	@function stepsMouseDown
	@description Step mouseup event handler (for painting functionality, not yet implemented)
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function stepsMouseDown(evt){
		if (evt.srcElement.tagName.toLowerCase() === "li" && evt.toElement.tagName.toLowerCase() === "li") {
			painting = true
			paint_mode = undefined;
			evt.cancelBubble = true;
			evt.preventDefault();
		}
	}
	/*_______________________________________________________
	@function stepsMouseOver
	@description Steps mouseover event handler (for painting functionality, not yet implemented)
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function stepsMouseOver(evt){
	if (painting === true && evt.srcElement.tagName.toLowerCase() === "li" && evt.toElement.tagName.toLowerCase() === "li") {
			clickStep(evt)
			evt.cancelBubble = true;
			evt.preventDefault();
		}
	}

	/*_______________________________________________________
	@function stepsMouseOut
	@description Steps mouseout event handler (for painting functionality, not yet implemented)
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function stepsMouseOut(evt){
		if (evt.toElement === null) {
			painting = false
			paint_mode = undefined;
			evt.cancelBubble = true;
			evt.preventDefault();
		}
	}

	/*_______________________________________________________
	@function stepsMouseUp
	@description Steps mouseup event handler (for painting functionality, not yet implemented)
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function stepsMouseUp(evt){
		painting = false
		paint_mode = undefined;
		evt.cancelBubble = true;
		evt.preventDefault();
	}

	/*_______________________________________________________
	@function copySteps
	@description Copies steps when the track length is less than 32 steps
	@arguments ix [Int], iy [Int]
	@returns undefined
	@private
	*/
	function copySteps(ix,iy){
		self.current_pattern[ix].dom.innerHTML = iy+1
		self.current_pattern[ix].on = self.current_pattern[iy].on
		if(self.current_pattern[iy].on){
			self.current_pattern[ix].dom.className = "copyon"
		}
	}

	/*_______________________________________________________
	@function setSteps
	@description Sets number of steps for the track and copies steps if steps is less than 32
	@arguments steps [Int]
	@returns undefined
	@public
	*/
	self.setSteps = function(steps) {
		self.steps = steps
		for (var i=0;i<self.current_pattern.length;i++){
			self.current_pattern[i].dom.className = "disabled"
		}
		for (var i=0;i<self.steps;i++){
			self.current_pattern[i].dom.innerHTML = i+1
			self.current_pattern[i].dom.className = ""
			if (self.current_pattern[i].on===true) {
				self.current_pattern[i].dom.className = "on"
			}
		}
		var start = i
		for (;i<Math.min(32,start+self.steps);i++){
			copySteps(i,i-start)
		}
		var start = i
		for (;i<Math.min(32,start+self.steps);i++){
			copySteps(i,i-start)
		}
		var start = i
		for (;i<Math.min(32,start+self.steps);i++){
			copySteps(i,i-start)
		}

		self.buttons[0].className = (steps==8)?"on":""
		self.buttons[1].className = (steps==16)?"on":""
		self.buttons[2].className = (steps==32)?"on":""

	}

	/*_______________________________________________________
	@function drawSteps
	@description Draws track step DOM elements
	@arguments steps
	@returns undefined
	@private
	*/
	function drawSteps(steps){
		self.stepview.innerHTML = ""
		for (var i=0,step;i<steps;i++) {
			step = addDom(newDom("li"),self.stepview);
			step.setAttribute("step",i)
			step.innerHTML = i+1
			step.onmousedown = clickStep
			step.oncontextmenu = contextClick

			self.current_pattern.push({
				on:false,
				dom:step
			})
		}
	}


	/*_______________________________________________________
	@function contextClick
	@description Step oncontextmenu event handler - right mouse click to adjust individual note velocity
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function contextClick(evt){

		var this_step = self.current_pattern[parseInt(evt.srcElement.getAttribute("step"),10)]
		var knobview = addDom(newDom("div"),getClass(".Track",self.viewport));
		knobview.className = "KnobView"
		var knob = new Knob({
			viewport:knobview,
			callback:setGainFromKnob,
			this_step:this_step,
			knob_value:this_step.gain||.5,
			onFinish:function(thisknob){
				knobview.parentNode.removeChild(knobview);
			}
		})
		knob.knobval = addDom(newDom("div"),knobview);
		knob.knobval.className = "knobval";
		knob.knobval.innerHTML = Math.round(knob.knob_value * 100);

		var width = knobview.offsetWidth;
		var height= knobview.offsetHeight;

		knobview.style.left = (evt.srcElement.offsetLeft + evt.srcElement.offsetParent.offsetParent.offsetLeft - (evt.srcElement.offsetWidth/2))+"px"
		knobview.style.top = (evt.srcElement.offsetTop + evt.srcElement.offsetParent.offsetParent.offsetTop )+"px"

		evt.cancelBubble = true;
		evt.preventDefault();
	}

	/*_______________________________________________________
	@function setGainFromKnob
	@description Sets the individual step gain from a knob callback event
	@arguments Knob [Object]
	@returns undefined
	@private
	*/
	function setGainFromKnob(knob){
		knob.this_step.gain = knob.knob_value
		knob.knobval.innerHTML = Math.round(knob.knob_value * 100)
	}

	/*_______________________________________________________
	@function clearTrack
	@description Clears the track pattern
	@arguments n/a
	@returns undefined
	@public
	*/
	self.clearTrack = function(){
		for (var i=0;i<self.current_pattern.length;i++){
			self.current_pattern[i].on = false
			self.current_pattern[i].gain = .5
		}
		self.setSteps(self.steps);
	}

	/*_______________________________________________________
	@function clickStep
	@description Click event handler for steps, sets step on or off
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function clickStep(evt){

		if (evt.button !== 0) {return}

		var step = parseInt(evt.srcElement.getAttribute("step"),10)

		var this_step = self.current_pattern[step]

		this_step.on = (paint_mode !== undefined) ? paint_mode : !this_step.on

		if (paint_mode === undefined && painting === true) {
			paint_mode = this_step.on
		}

		this_step.dom.className = (this_step.on) ? "on" : ""

		self.setSteps(self.steps)

		evt.preventDefault();
	}

	init();

};