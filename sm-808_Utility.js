/*____________________________________________________________
@module Utility Functions
*/

/*_______________________________________________________
@function newDom
@description Creates a new DOM element
@arguments tagname [String]
@returns [HTMLelement]
@public
*/
function newDom(tagname){
	return document.createElement(tagname);
}

/*_______________________________________________________
@function addDom
@description Adds a DOM element to the specified DOM element or to <body>
@arguments dom [HTMLelement], target [HTMLelement]
@returns [HTMLelement]
@public
*/
function addDom(dom,target){
	var target = target || document.body
	target.appendChild(dom);
	return dom
}

/*_______________________________________________________
@function removeDom
@description Removes a DOM element
@arguments dom [HTMLelement]
@returns undefined
@public
*/
function removeDom(dom){
	dom.parentElement.removeNode(dom);
}

/*_______________________________________________________
@function getDom
@description Gets a DOM element by id
@arguments id [String]
@returns [HTMLelement]
@public
*/
function getDom(id){
	return document.getElementById(id)
}

/*_______________________________________________________
@function getClassName
@description Get HTML element(s) by class name
@arguments classname [String], dom [HTMLelement]
@returns [HTMLcollection]
@public
*/
function getClassName(classname,dom){
	var target = (dom || document)
	return target.getElementsByClassName(classname)
}

/*_______________________________________________________
@function getClass
@description A simple CSS query
@arguments classpath [String], dom [HTMLelement]
@returns [HTMLelement]/[HTMLcollection]
@public
*/
function getClass(classpath,dom){
	var thisselector = classpath.split(" ")[0]
	if (thisselector == "" || classpath === undefined) {
		return dom
	}
	classpath = classpath.split(" ")
	classpath.shift()
	classpath = classpath.join(" ")

	if (thisselector.substr(0,1)===".") {
		dom = getClassName(thisselector.substr(1),dom)[0];
	} else 	if (thisselector.substr(0,1) === "#") {
		dom = getDom(thisselector.substr(1),dom);
	} else {
		dom = getTags(thisselector,dom);
	}

	return getClass(classpath,dom)
}

/*_______________________________________________________
@function getTags
@description Get all tags under a specified DOM element
@arguments tagname [String], dom [HTMLelement]
@returns [HTMLcollection]
@public
*/
function getTags(tagname,dom){
	var target = (dom || document)
	return target.getElementsByTagName(tagname)
}

/*____________________________________________________________
@function config
@description Add top-level properties in obj2 to obj1
@arguments obj1 [Object], obj2 [Object]
@returns undefined
@public
*/
function config(obj1,obj2){
	for (var selector in obj2){
		obj1[selector] = obj2[selector]
	}
}

/*_______________________________________________________
@function getFile
@description Loads a file from a URL using XMLHttpRequest
@arguments url [String], callback [Function]
@returns undefined
@public
*/
function getFile(url,callback) {
	var request = new XMLHttpRequest();
	if (!request) return;
	request.open("GET",url,true);
	request.onreadystatechange = function () {
		if (request.readyState != 4) {return};
		if (request.status != 200 && request.status != 304) {
			return callback(true,null);
		}
		callback(null,request.response);
	}
	request.send();
}


/*_______________________________________________________
@function calcDelay
@description Calculate millisecond timer delay based on BPM input
@arguments inputBPM [Float]
@returns [Object]
@public
@see http://www.dvfugit.com/beats-per-minute-millisecond-delay-calculator.php
*/
function calcDelay(inputBPM){
	var qtrN = Math.round(((60/inputBPM)*1000)*100000)/100000;
	var wholeN=(qtrN*4);
	var halfN=(qtrN*2);
	var eighthN=(qtrN/2);
	var sixteenN=(qtrN/4);
	var thrityTwoN=(qtrN/8);
	var sixtyFourN=(qtrN/16);
	return {
		1:Math.round(wholeN*100000)/100000,
		2:Math.round(halfN*100000)/100000,
		4:Math.round(qtrN*100000)/100000,
		8:Math.round(eighthN*100000)/100000,
		16:Math.round(sixteenN*100000)/100000,
		32:Math.round(thrityTwoN*100000)/100000,
		64:Math.round(sixtyFourN*100000)/100000
	}
}

