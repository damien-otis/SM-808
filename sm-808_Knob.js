/*
@module Knob
@description Creats a Knob control to adjust values with the mouse.
*/

var Knob = function(options){

	var self = this

	var knob_rot = 0
	var is_down = false
	var start_y
	var rotation

	var is_webkit = 'WebkitAppearance' in document.documentElement.style

	self.knob_value = .5

	/*_______________________________________________________
	@function init
	@description Initialize a new Knob
	@arguments n/a
	@returns undefined
	@private
	*/
	function init(){
		config(self,options)

		self.knob = addDom(newDom("div"),self.viewport)
		self.knob.className = "Knob";
		self.pointer = addDom(newDom("img"),self.knob)
		self.pointer.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAWCAYAAAAmaHdCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjkyRUEyNjk3NjgzMDExRTRCNkMxQ0JCNzc1NTRCRDFEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjkyRUEyNjk4NjgzMDExRTRCNkMxQ0JCNzc1NTRCRDFEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTJFQTI2OTU2ODMwMTFFNEI2QzFDQkI3NzU1NEJEMUQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTJFQTI2OTY2ODMwMTFFNEI2QzFDQkI3NzU1NEJEMUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz75qJh8AAABDklEQVR42mL8//8/Ay7AyMjIBmMD1f3CpY6JAT/gBOI2KI0bgFyCCwMBPxC/A9H41BFyiSoQC0JpBnK9k4xGk+YdaDh8BCmB0pzkeCcKiPmgbD4on2SXnIG6AobP4FSLwwAzNANg2IwU72SSJI7FFUJA/A2HS0DiQsS4JAFPCuWEyhN0yW0croDh23gDFghcCRgAw674DFlHpCHrsBoCBNJA/IdIQ0DqpLEFbBoQMzMQB5ih6hEBCxV8TqQrYBiknhnuHSAIIdEAGA5BNmQvDkUHgXgHlMYmvxdWvKojCf4E4o3QBCWKFnOiUPGNUHUwPeqMQKIOatAaIN4N1PCFUKgCC3AeaJoCBcNNgAADAI9FitPKmmjMAAAAAElFTkSuQmCC"
		self.pointer.ondragstart = function(evt){return false}

		self.knob.addEventListener("mousedown",mouseDown,false);
		window.addEventListener("mousemove",mouseMove,false);
		window.addEventListener("mouseup",mouseUp,false);
		window.addEventListener("mouseout",windowOut,false);

		knob_rot = valToRot(self.knob_value)
	}

	/*_______________________________________________________
	@function setRotate
	@description Sets the rotation angle of the knob
	@arguments deg [Float]
	@returns undefined
	@private
	*/
	function setRotate(deg){
		self.knob.style.transform = "rotate("+deg+"deg)"
		self.knob.style.webkitTransform = "rotate("+deg+"deg)"
	}

	/*_______________________________________________________
	@function value
	@description Sets or gets the current knob value
	@arguments val [Float] - n/a
	@returns undefined - [Float]
	@public
	*/
	self.value = function(val){
		if (val !== undefined){
			var new_val = parseFloat(val)||0
			if (new_val>1){new_val==1}
			if (new_val<0){new_val=0}
			self.knob_value = new_val
		} else {
			return self.knob_value
		}
	}

	/*_______________________________________________________
	@function valToRot
	@description Convert value to rotation and set knob rotation
	@arguments val [Float]
	@returns [Int]
	@private
	*/
	function valToRot(val){
		var new_rot = (val * 280) - 140
		setRotate(new_rot)
		return new_rot
	}

	/*_______________________________________________________
	@function rotToVal
	@description Convert rotation to knob value
	@arguments rot [Float]
	@returns [Float]
	@private
	*/
	function rotToVal(rot){
		var new_val = (rot+140)/280
		return new_val
	}

	/*_______________________________________________________
	@function mouseDown
	@description Mousedown event handler
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function mouseDown(evt){
		is_down = true
		start_y = evt.y || evt.pageY
	}

	/*_______________________________________________________
	@function mouseMove
	@description Mousemove event handler
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function mouseMove(evt){
		if (is_down === true) {
			var diff = start_y - (evt.y||evt.pageY)
			rotation = diff + knob_rot
			if (rotation>140) {rotation=140}
			if (rotation <-140) {rotation=-140}
			setRotate(rotation)
			self.knob_value = rotToVal(rotation)
			self.callback(self)
		}
	}

	/*_______________________________________________________
	@function mouseUp
	@description Mouseup event handler
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function mouseUp(evt){
		if (is_down) {
			is_down = false
			knob_rot = rotation
			if (knob_rot){
				self.knob_value = rotToVal(knob_rot)
			}

			self.knob.removeEventListener("mousedown",mouseDown);
			window.removeEventListener("mousemove",mouseMove)
			window.removeEventListener("mouseup",mouseUp)
			window.removeEventListener("mouseout",windowOut)

			self.callback(self)
			if (self.onFinish){self.onFinish(self)}
		}
	}

	/*_______________________________________________________
	@function windowOut
	@description mouseout on window event hanlder
	@arguments evt [MouseEvent Object]
	@returns undefined
	@private
	*/
	function windowOut(evt){
		if (evt.toElement === null ) {
			is_down = false
		}
	}

	init();

	return self;
};
