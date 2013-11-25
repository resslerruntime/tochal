/**
 * Instrumentation of the JavaScript language in order to better understand the occurrence of DOM events. Specifically, DOM events which
 * are generated by user-actions are tied to their callback functions. The ordering of event listeners is captured by the
 * instrumentation process as well. For a given webpage, this instrumentation must be done after all DOM elements have been loaded
 * but before any event listeners are added by the original web-application. 
 *   
 */

function traverse(node, func, path) {
	var key, child;

	if (typeof path === 'undefined') {
		path = [];
	}

	function recursiveWrapper(nextNode) {
		traverse(nextNode, func, [node].concat(path));
	}

	// Call analyzer function on current node
	var returnValue = func.call(null, node, path);

	// Recursive check all children of current node
	for (key in node) {
		if (node.hasOwnProperty(key)) {
			child = node[key];
			if (typeof child === 'object' && child !== null) {
				if (Array.isArray(child)) {
					child.forEach(recursiveWrapper);
				} else {
					traverse(child, func, [node].concat(path));
				}
			}
		}
	}
	return returnValue;
}

function exitSnapshot(info) {
	var j, trace = '';
	trace += 'send(JSON.stringify({messageType: "FUNCTION_EXIT", timeStamp: Date.now(), targetFunction: "'
		+info.name+'",lineNo: '
		+info.line+', scopeName: "n/a", counter:traceCounter++}));';
	return trace;
}

function callSnapshot(info, flag) {
	var j, trace = '';

	// front
	if (flag === 'front') {
		trace += 'FCW(';
		// back
	} else {
		trace += ',"'+info.name+'",'+info.line+')';
	}
	return trace;
}

function returnSnapshot(info, flag) {
	var j, trace = '';

	// front
	if (flag === 'front') {
		trace += 'RSW(';
		// back
	} else {
		trace += ',"'+info.name+'",'+info.line+')';
	}
	return trace;
}

function enterSnapshot(info) {
	var j, trace = ''; 
	trace += 'send(JSON.stringify({messageType: "FUNCTION_ENTER", timeStamp: Date.now(), targetFunction: "'
		+info.name+'",lineNo: '
		+info.line+', scopeName: "n\a", counter:traceCounter++}));';
	return trace;
}

(function () {
//	Shortcuts for Object methods
	var OdP=Object.defineProperty, OgOPN=Object.getOwnPropertyNames;
	if (! window.__zzkey__) {
		OdP(window, "__zzkey__", {value: "__elmonly__", configurable: false, enumerable: false, writable: false});
	}
	if (! (window[__zzkey__] instanceof Object)) {
		OdP(window, window.__zzkey__, {value: {"DEBUG":true}, configurable: true, enumerable: false, writable: true});
	}
	var ZZ=window[__zzkey__], ZZOm_copyOMmeta=(ZZ.OMmeta)?ZZ.OMmeta.copyOMmeta:function copyOMmeta(){return arguments[1]}, FunctionCallEntry=ZZ.FunctionCallEntry;
	var eventAttributes = ['mouseover', 'onclick', 'hover'];

	/*
	 *  EventlistenersMirror
	 *
	 *  Creates a mirror/wrapper for each event listener
	 *  arg0 - Prototype of object (__proto__) 
	 *  arg1 - seter for event handler (e.g. "addEventListener", "setTimeout"
	 *  arg2 - clear for handler/deconstructor (e.g."removeEventListener")
	 *  arg3 - isLoggingDispatched, flag for tracking events/JavaScript
	 */
	function EventlistenersMirror(arg0, arg1, arg2, arg3) {
		FunctionCallEntry=ZZ.FunctionCallEntry;  
		// restore
		if ((arg0.object instanceof Object) 
				&& (arg0.listeners instanceof Object) 
				&& typeof(this.restore)==="function") {
			this.restore.apply(this, arguments);
		}
		// initialize
		else if ((arg0 instanceof Object)
				&& typeof(arg1)==="string"
					&& typeof(arg2)==="string") {
			this.init.apply(this, arguments); 
		}
		return this; 
	}; ZZ.EventlistenersMirror=EventlistenersMirror;

	var counter=-1;
	function lookup(that, args) {
		if (that instanceof Object) {
			if (that.hasOwnProperty("__em__emid")) {
				that = that.__em__emid;
			}
			else {
				OdP(that, "__em__emid", {value: ++counter});
				that=counter;
			}
		}
		var func=args[1];  
		if (func instanceof Object) {
			if (func.hasOwnProperty("__em__emid")) {
				func = func.__em__emid;
			}
			else {
				OdP(func, "__em__emid", {value: ++counter});
				func=counter;
			}
		}
		else {
			return that;
		}    
		return [that, args[0], func, args[2]].join(" ");
	}; // end of lookup();

//	Need eval() to keep function name
	function overwriteEventListener(originalEventListener, zzem, listeners, dispatched, eventType) {
		return function overwrittenEventListener() {
			if (zzem.isBlockingDispatch === true) {
				return;
			}
			// records the instance when an event gets dispatched
			dispatched.push(new FunctionCallEntry(this, arguments, originalEventListener, zzem));

			var listenerIndexes = Object.getOwnPropertyNames(listeners)

			switch(zzem["setname"]) 
			{
			case "setInterval": 
				// setInterval
				for (i=listenerIndexes.length-1; i >= 0; i--) {
					var listener = listeners[listenerIndexes[i]];
					if (listener.args[0] === originalEventListener 
							&& listener.func.name === "setInterval") { 
						// Print highlight for setInterval
						console.log("Highlight: ");
						console.log(listener.func.name 
								+ "(" 
								+ listener.args[0].name  
								+ "," 
								+ listener.args[1] 
						+ ")");
						console.log(this);
						console.log(originalEventListener);
						break;
					}
				}
				break;
			case "addEventListener":
				/*          for (i=listenerIndexes.length-1; i >= 0; i--) {
              var listener = listeners[listenerIndexes[i]];
              if (listener.args[1] === originalEventListener) { 
				 *///        	  console.log("+++++++++++++++ eventListenerMirror : overwriteEventListener : case(addEventListener) +++++++++++++++");
				logger.logDOMEvent(eventType, this, originalEventListener);
				/*         }
            }
				 */     break;
			case "setTimeout":
				for (i=listenerIndexes.length-1; i >= 0; i--) {
					var listener = listeners[listenerIndexes[i]];
					if (listener.args[0] === originalEventListener 
							&& listener.func.name === "setTimeout") { 
						// Print highlight for setTimeout
						console.log("Highlight: ");
						console.log(listener.func.name 
								+ "(" 
								+ listener.args[0].name  
								+ "," 
								+ listener.args[1] 
						+ ")");
						console.log(this);
						console.log(originalEventListener);
						break;
					}
				}
				break;
			case "setAttribute":
				// TBW
				break;
			default:
				console.log("Unsupported event constructor.");
			}
			/*        if (isTimeout) {
            delete listeners[arguments.callee.ret];
        }
			 */       return originalEventListener.apply(this, arguments);
		};
	};

	EventlistenersMirror.prototype.init= function init(object, setname, clearname, isLoggingDispatched) {

		this.object=object, this.setname=setname, this.clearname=clearname;
		var that=this, count=0, reverse={}, listeners=this.listeners={}, dispatched;
		var isTimeout=(setname==="setTimeout" || setname.indexOf("equestAnimationFrame")>=0);
		if (typeof(isLoggingDispatched)==="boolean") {
			dispatched = this.dispatched = [];
			dispatched.isLoggingDispatched = isLoggingDispatched;
		}
		else if (isTimeout) {
			dispatched = {};
		}
		var seter=object[setname], clear=object[clearname], func=(ZZ.DEBUG===true)?seter:undefined;
		if (typeof(seter) === "function" && seter.name !== "zzel_set") {
			/*
			 *   zzel_set
			 *
			 *   Overwrites the original function that adds event-listeners.
			 */
			function zzel_set(arg0, arg1) {
				if (that.isBlockingElM === true) {	    
					return;
				}

				var indx, orig, owel;
				if (dispatched) {
					if (typeof arg0 === "function") {
						// orig = original function handler
						orig = arg0;
						// owel (overwritten event listener) is the wrapper function, contains orig
						owel = arg0 = overwriteEventListener(orig, that, listeners, dispatched, arg1);
					} else if (typeof arg1 === "function") {
						// orig = original function handler
						orig = arg1;
						// owel (overwritten event listener) is the wrapper function, contains orig
						owel = arg1 = overwriteEventListener(orig, that, listeners, dispatched, arg0);
					}
				}

				// Calling the seter (e.g. addEventListener, setAttribute) with this (zzel_set) 
				// and the original arguments. For example, for "setTimeout('incrementCounter', 1000)"
				// as a handler, seter = setTimeout, arguments = ['overwrittenEventListener', 1000] where
				// 'overwrittenEventListener' is a wrapper containing the line incrementCounter.apply(...) 
				var ret=seter.apply(this, arguments);
				if (isTimeout) { // setTimeout
					owel.ret=ret;
					// set arguments[indx] back to the original
					arguments[indx] = orig;
				} else {
					if (orig) {
						arguments[indx] = orig;
					}
					if (ret === undefined) {// addEventListner
						reverse[lookup(this, arguments)]=count;
						ret=count++;
					}
				}	  
				if (listeners.hasOwnProperty(ret)) {
					// eventlistener has already added to mirror.
					return undefined;
				}
				// records the instance when an event-listener gets registered
				listeners[ret] = new FunctionCallEntry(this, arguments, func, owel);
				return ret;
			}; // end of zzel_set();
			this.seter = seter;	
			object[setname] = zzel_set; // overwrite the original function that adds event-listeners	
			ZZOm_copyOMmeta(seter, zzel_set);
		}

		if (typeof(clear) === "function" && clear.name !== "zzel_clear") {
			function zzel_clear(arg0, arg1) {
				var look=arg0, ret=clear.apply(this, arguments);
				if (arguments.length > 1) { // removeEventListener
					arg1 = lookup(this, arguments);
					look = reverse[arg1];
					delete reverse[arg1];
				}	  
				if (listeners[look] instanceof FunctionCallEntry) {
					arg1 = listeners[look].owel;
					if (arg1) {
						ret = clear.apply(this, arguments);
					}
					listeners[look].free();
				}
				delete listeners[look];

				return ret;
			}; // end of zzel_clear();
			this.clear = clear;
			object[clearname] = zzel_clear; // overwrite the original function that removes event-listeners
			ZZOm_copyOMmeta(clear, zzel_clear);
		}  

		return this;
	};

	EventlistenersMirror.prototype.empty = function empty() {
		var objs=[this.listeners, this.dispatched], i, obj, keys, k, j, fce;
		for (i=objs.length-1; i >= 0; i--) {
			obj = objs[i];
			if (obj instanceof Object) {
				keys = OgOPN(obj);
				for (k=keys.length-1; k >= 0; k--) {
					j = keys[k];
					fce = obj[j];
					if (fce instanceof FunctionCallEntry) {
						fce.free();
						delete obj[j];
					}
				}
			}
		}
	}; // end of clear();

	var ZZ__native__free = (ZZ.__native instanceof Object)?ZZ.__native__.free:undefined;
	EventlistenersMirror.prototype.free = function free() {
		this.empty();
		if (this.hasOwnProperty("seter")) {
			this.object[this.setname] = this.seter;
			delete this.seter;
			delete this.setname;
		}
		if (this.hasOwnProperty("clear")) {
			this.object[this.clearname] = this.clear;
			delete this.clear;
			delete this.clearname;
		}
		delete this.object;  
		if (typeof(ZZ__native__free)==="function") {
			return ZZ__native__free.apply(this, arguments);
		}
	};

})();

(function ZZ_FunctionCallEntry() {

	var ZZ=window[__zzkey__], ZZEM=ZZ.EventlistenersMirror;
	function FunctionCallEntry(arg0, arg1, arg2, arg3) {
		if (typeof(this.restore) === "function"
			&& (arg0 instanceof Object)
			&& (arg0.that instanceof Object) 
			&& (arg0.args	instanceof Array)) {
			this.restore.apply(this, arguments);
		}
		else if ((arg0 instanceof Object) 
				&& (arg1 instanceof Object) 
				&& arg1.length >= 0) {
			this.that	= arg0;
			this.args	= arg1;
			this.timestamp = (new Date()).getTime();
			if (arg2) {
				this.func	= arg2;
			}
			if (arg3 instanceof ZZEM) {
				this.zzem=arg3;
			}
			else if (arg3) {
				this.owel=arg3;
			}	
		}  
		return this;
	}; ZZ.FunctionCallEntry = FunctionCallEntry;

	var ZZ__native__free = (ZZ.__native instanceof Object)?ZZ.__native__.free:undefined;
	FunctionCallEntry.prototype.free = function free() {  
		delete this.that;
		delete this.args;
		delete this.func;
		delete this.owel;
		delete this.zzem;
		if (typeof(ZZ__native__free)==="function") {
			return ZZ__native__free.apply(this, arguments);
		}
	};
})();

(function () {
	var ZZ=window[__zzkey__], ZZEM=ZZ.EventlistenersMirror, ZZOm_copyObject=(ZZ.OMmeta)?ZZ.OMmeta.copyObject:function(){return arguments[1];};
//	Shortcut variables for Object methods
	var OdP=Object.defineProperty, OgOPD=Object.getOwnPropertyDescriptor, OgOPN=Object.getOwnPropertyNames, OgPO=Object.getPrototypeOf, DcE=document.createElement;
	var elmsonkeys={};
	var isLoggingDispatched=false; /*
	 * true 	 	 -> start logging dispatched events right away; 
	 * false	 	 -> will be logging dispatched events, don't start yet; 
	 */

	var elms = {};

//	Define new property within window[__zzkey__].EventlistenersMirror for tracking replaced listeners
	OdP(ZZEM, "__em__singletonelms", {value: elms, configurable: true, enumerable:false, writable: true});

//	Store browser type for browser specific work arounds 
	var browser = navigator.userAgent.toLowerCase();
	browser=ZZEM.browser=(browser.indexOf("chrome")>=0)?"chrome":(browser.indexOf("firefox")>=0)?"firefox":(browser.indexOf("safari")>=0)?"safari":(browser.indexOf("msie")>=0)?"msie":undefined;
	var isChromeOrSafari = document.hasOwnProperty("onload"), isFirefox = (browser==="firefox");

	/*
	 * addElM 
	 *
	 * Overwrites functions that register eventlisteners
	 */
	function addElM(__proto__, name, o) {  
		if (elms.hasOwnProperty(name)) { // Prototype (e.g. Window, Button) already added
			return name;
		}

		if (__proto__.hasOwnProperty("addEventListener") || __proto__.addEventListener instanceof Function) {
			// Replace/wrap addEventListener method
			elms[name] = new ZZEM(__proto__, "addEventListener", "removeEventListener", isLoggingDispatched);	
		}
		//mostly likely, only IE has this
		if (__proto__.hasOwnProperty("attachEvent")) {
			elms[name+"_attachEvent"] = new ZZEM(__proto__, "attachEvent", "detachEvent", isLoggingDispatched);	
		}   
		return name;
	}; // end of addElM();

	/*
	 *  getOnkeys
	 *
	 *  Get all properties for prototypes (that are used in the webpage). Then iterates through all
	 *  these properties and notes those beginning with "on" (e.g. "onclick", "onhover", etc.). A list
	 *  of these are saved to the elmsonkeys[] array with index 'name', the 'name' of the prototype. 
	 *
	 */
	function getOnkeys(object) {

		var name = object.constructor.name, key, newKeys = [];
		if (!name || name === "Object" || name.length === 0) {
			name = object.toString();
			if (name.length === 0) {
				name = Object.getPrototypeOf(object).constructor.toString().match(/function\s*?(\w*?)\s*?\(/)[1];
			} else {
				name = name.substring(8, name.length-1);
			}
		}

		if (elmsonkeys.hasOwnProperty(name)) {
			// Ignores duplicates with same name (e.g. multiple HTMLTableCellElement)
			return elmsonkeys[name];
		}
		var ownkeys, onkeys=[], k, __proto__ = OgPO(object); // OgPO = Object.getPrototypeOf
		if (isChromeOrSafari) {
			ownkeys = OgOPN(object); // Object.getOwnPropertyNames
			if (! (object instanceof Node)) {
				addElM(__proto__, name);
			}
		} else {
			ownkeys = Object.getOwnPropertyNames(__proto__);  // Object.getOwnPropertyNames


			for (key in object) {
				if (key.indexOf('on') === 0) {
					newKeys.push(key);
				}
			}
			addElM(__proto__, name, object);
			if (browser === "firefox" && (object instanceof XMLHttpRequest)) {
				ownkeys = ownkeys.concat(OgOPN(OgPO(__proto__)));	  
			}
		}

		// var natif = {};
		for (k=ownkeys.length; k--;) {
			key = ownkeys[k];
			if (key.indexOf("on")===0) {
				onkeys.push(key);  // Note: onkeys != ownkeys
			}
		}
		elmsonkeys[name] = newKeys; 
		return newKeys;
	}; // end of getOnkeys()

	ZZEM.getOnkeys=getOnkeys;

	var counter=-1, onkeyDescriptors={};

	/* 
	 * innerHTMLdescriptor
	 * 
	 */
	var innerHTMLdescriptor = {
			configurable: true, enumerable: false
			, get: function getInnerHTML() {
				return this.__em__innerHTML;
			}
	, set: function setInnerHTML(arg0) {
		if (arg0 === this.__em__innerHTML) {
			return arg0;
		}
		var elem = DcE.apply(document, [this.nodeName]);
		elem.innerHTML = arg0;
		while (this.childNodes.length > 0) {
			this.removeChild(this.firstChild);
		}	  
		while (elem.childNodes.length > 0) {
			this.appendChild(elem.firstChild);
		}
		var i, ary=this.querySelectorAll("*");
		for (i=ary.length; i--;) {
			objectOverwriteOn(ary[i]);
		}
		OdP(this, "__em__innerHTML", {value:arg0, configurable:true, enumerable:false, writable:true}); // Object.defineProperty
		return arg0;
	}
	};

	function generateDescriptor(key, type) {
		type = key.substring(2);
		key = "__em__"+key;

		return {
			configurable: true, enumerable: false
			, get: function getOn() {
				return this[key];
			}
		, set: function setOn(arg0) {
			this.removeEventListener(type, this[key], false);
			if (typeof(arg0)==="function") {      
				this.addEventListener(type, arg0, false);
			}
			OdP(this, key, {value:arg0, configurable:true, enumerable:false, writable:true});      
			return arg0;
		}
		};
	}; // end of generateDescriptor();

	function oOwOn_empty(object) {
		return object;
	}

	/*
	 *  objectOverwriteOn
	 *
	 */
	function oOwOn_full(object) {

		// 0) object has already been processed
		if (object.hasOwnProperty("__em__ow")) {
			return object;
		}
		var errkeys = [], actualFunction, matches;
		// 1) modify innerHTML   
		if (object instanceof Node) {  
			// Define new property for holding original innerHTML value
			OdP(object, "__em__innerHTML", {
				value: object.innerHTML,
				configurable: true,
				enumerable: false,
				writable: true
			});
			try {
				OdP(object, "innerHTML", innerHTMLdescriptor);  // Object.defineProperty
			}
			catch (err) {
				if (ZZ.DEBUG===true) {
					errkeys.push("innerHTML");
				}	  
			}
		}
		// 2) get the array of onkeys
		var j, onkey, object_onkey, onkeys=getOnkeys(object), hasOwnm, key;

		// 3) modify onkeys
		for (j=onkeys.length; j--;) {
			onkey = onkeys[j];

			hasOwn = object.hasOwnProperty(onkey);		

			object_onkey = object[onkey];

			if (object_onkey && onkey !== "onload") {
				object[onkey] = null;
			}
			if (! onkeyDescriptors.hasOwnProperty(onkey)) {
				onkeyDescriptors[onkey] = generateDescriptor(onkey);
			}
			try {
				OdP(object, onkey, onkeyDescriptors[onkey]);	 // Object.defineProperty
			}
			catch (err) {
				if (ZZ.DEBUG===true) {
					errkeys.push(onkey);
				}
			}
			if (object_onkey && (typeof object_onkey === 'function') && (object_onkey.name === onkey)) {
				// TODO: Not surefire way to extract actual function 
				/* [1]: function name
				 * [2]: arguments
				 * [3]: function body
				 */
				//matches = object_onkey.toString().match(/function\s*?(\w*?)\s*?\((.*?)\)\s*?\{([^]*)\}/);//(.*?)\}/);

				var astRoot = esprima.parse(object_onkey,  { range: true, loc: true });

				var i, newArguments, actualFunction, newBody, newFn;

				newArguments = object_onkey.toString().substring(object_onkey.toString().indexOf('(')+1,object_onkey.toString().indexOf(')'));
				newArguments = newArguments.split(',');

				// Call Expressions
//				window.console.log('[CallExpression]');
				actualFunction = esmorph.modify(object_onkey.toString(), esmorph.Tracer.CallExpression(callSnapshot));
//				window.console.log(actualFunction);

				// Return Statements
				//				window.console.log('[ReturnStatement]');
				actualFunction = esmorph.modify(actualFunction, esmorph.Tracer.ReturnStatement(returnSnapshot));
				//				window.console.log(actualFunction);

				// Function Declarations
				//				window.console.log('[FunctionDeclaration]');
				actualFunction = esmorph.modify(actualFunction, esmorph.Tracer.FunctionEntrance(enterSnapshot));
				actualFunction = esmorph.modify(actualFunction, esmorph.Tracer.FunctionExit(exitSnapshot));                        
				newBody = actualFunction.toString().substring(actualFunction.toString().indexOf('{')+1,actualFunction.toString().lastIndexOf('}'));
				newFn = new Function(
						"return function " + object_onkey.name + "("+newArguments.join(',')+"){"+newBody+"}"
				)();
				object_onkey = newFn;
				//				window.console.log(newFn.toString());
			}
			if (object_onkey || hasOwn) {
				object[onkey] = object_onkey;
			}

		}  
if (errkeys.length > 0) {
	// Debugging purposes
	console.log(object.nodeName, onkeys.length, errkeys.length);  
}
OdP(object, "__em__ow", {value: ++counter, configurable: false, enumerable: false, writable: false});
return object;
	}; // end of objectOverwriteOn();
//	end of objectOverwriteOn();

//	Choose overwrite function based on browser type
	var objectOverwriteOn = (browser === "safari")?oOwOn_empty:oOwOn_full;

	/*  
	 *  elms_onload()
	 * 
	 *  Function called when DOM content has loaded. Iterates through all document elements, and
	 *  overwrites their original event handlers with our wrapper.
	 *
	 */
	function elms_onload() {  
		delete window.__tmp;
		if (document.head) {
			document.head.onload = null;
		}

		// Removes this DOM event which was added below (line 206) once all listerners have been replaced.
		document.removeEventListener("DOMContentLoaded", elms_onload, false);   
		// Gather all elements into the array all[]
		var i, all = document.querySelectorAll("*");
		for (i=all.length; i--;) {
			// Overwrite/replace each element's handlers
			objectOverwriteOn(all[i]);
		}
	}; // end of elms_onload()
//	When webpage has loaded replace all listeners
	document.addEventListener("DOMContentLoaded", elms_onload, false);
//	Call the overwrite function on the actual document, before wrapping its elements
	objectOverwriteOn(document);

	XMLHttpRequest.name = "XMLHttpRequest";
	window.Window = window.constructor;
	Window.name = "Window";

	/*
	 *  getRequestAnimationFrame()
	 * 
	 *  window.requestAnimationFrame tells the browser that you wish to perform an
	 *  animation and requests that the browser schedule a repaint of the window for
	 *  the next animation frame. The method takes as an argument a callback to be 
	 *  invoked before the repaint. (EXPERIMENTAL)
	 */
	var raf, caf;
	function getRequestAnimationFrame() {
		if (raf) {
			return raf;
		}
		var i;
		if (window.requestAnimationFrame) {
			raf = "requestAnimationFrame";
			caf = "cancelAnimationFrame";
		}
		else {
			raf = ["moz", "webkit", "ms", "o"];
			for (i=raf.length; i--;) {
				if (window[raf[i]+"RequestAnimationFrame"]) {
					caf = raf[i]+"CancelAnimationFrame";
					raf = raf[i]+"RequestAnimationFrame";
					break;
				}
			}
		}
		return raf;
	}; // end of getRequestAnimationFrame;
	ZZEM.getRequestAnimationFrame = getRequestAnimationFrame;

	if (typeof(getRequestAnimationFrame()) === "string") {
		elms.requestAnimationFrame = new ZZEM(Window.prototype, raf, caf, isLoggingDispatched);
	}

	if (objectOverwriteOn === oOwOn_empty) {
		// Safari
		addElM(XMLHttpRequest.prototype, "XMLHttpRequest");
		addElM(Window.prototype, "Window");
		if (window.applicationCache) {
			addElM(OgPO(applicationCache), "DOMApplicationCache");
		}
	}
	else {
		// Not Safari
		objectOverwriteOn(window);
		if (window.applicationCache instanceof Object) {
			objectOverwriteOn(applicationCache);
		}
	}

//	addEventListener() of Chrome, Safari and IE
	if (Node.prototype.hasOwnProperty("addEventListener")) {
		addElM(Node.prototype, "Node"); 
		//addElM(Window.prototype, "Window");
	}
//	addEventListener() of Firefox for HTML Object definitions  
//	if (Element.prototype.hasOwnProperty("addEventListener")) {
	if (browser === "firefox") {

		addElM(HTMLHtmlElement.prototype, "HTMLHtmlElement");
		addElM(HTMLElement.prototype, "HTMLElement");
		addElM(HTMLHeadElement.prototype, "HTMLHeadElement");
		addElM(HTMLLinkElement.prototype, "HTMLLinkElement");
		addElM(HTMLTitleElement.prototype, "HTMLTitleElement");
		addElM(HTMLMetaElement.prototype, "HTMLMetaElement");
		addElM(HTMLBaseElement.prototype, "HTMLBaseElement");
		//addElM(HTMLIsIndexElement.prototype, "HTMLIsIndexElement");
		addElM(HTMLStyleElement.prototype, "HTMLStyleElement");
		addElM(HTMLBodyElement.prototype, "HTMLBodyElement");
		addElM(HTMLFormElement.prototype, "HTMLFormElement");
		addElM(HTMLSelectElement.prototype, "HTMLSelectElement");
		addElM(HTMLOptGroupElement.prototype, "HTMLOptGroupElement");
		addElM(HTMLOptionElement.prototype, "HTMLOptionElement");
		addElM(HTMLInputElement.prototype, "HTMLInputElement");
		addElM(HTMLTextAreaElement.prototype, "HTMLTextAreaElement");
		addElM(HTMLButtonElement.prototype, "HTMLButtonElement");
		addElM(HTMLLabelElement.prototype, "HTMLLabelElement");
		addElM(HTMLFieldSetElement.prototype, "HTMLFieldSetElement");
		addElM(HTMLLegendElement.prototype, "HTMLLegendElement");
		addElM(HTMLUListElement.prototype, "HTMLUListElement");
		addElM(HTMLOListElement.prototype, "HTMLOListElement");
		addElM(HTMLDListElement.prototype, "HTMLDListElement");
		addElM(HTMLDirectoryElement.prototype, "HTMLDirectoryElement");
		addElM(HTMLMenuElement.prototype, "HTMLMenuElement");
		addElM(HTMLLIElement.prototype, "HTMLLIElement");
		addElM(HTMLDivElement.prototype, "HTMLDivElement");
//		addElM(HTMLDivElementPrototype, "HTMLDivElement");
		addElM(HTMLParagraphElement.prototype, "HTMLParagraphElement");
		addElM(HTMLHeadingElement.prototype, "HTMLHeadingElement");
		addElM(HTMLQuoteElement.prototype, "HTMLQuoteElement");
		addElM(HTMLPreElement.prototype, "HTMLPreElement");
		addElM(HTMLBRElement.prototype, "HTMLBRElement");
		//addElM(HTMLBaseFontElement.prototype, "HTMLBaseFontElement");
		addElM(HTMLFontElement.prototype, "HTMLFontElement");
		addElM(HTMLHRElement.prototype, "HTMLHRElement");
		addElM(HTMLModElement.prototype, "HTMLModElement");
		addElM(HTMLAnchorElement.prototype, "HTMLAnchorElement");
		addElM(HTMLImageElement.prototype, "HTMLImageElement");
		addElM(HTMLObjectElement.prototype, "HTMLObjectElement");
		addElM(HTMLParamElement.prototype, "HTMLParamElement");
		//addElM(HTMLAppletElement.prototype, "HTMLAppletElement");
		addElM(HTMLMapElement.prototype, "HTMLMapElement");
		addElM(HTMLAreaElement.prototype, "HTMLAreaElement");
		addElM(HTMLScriptElement.prototype, "HTMLScriptElement");
		addElM(HTMLTableElement.prototype, "HTMLTableElement");
		addElM(HTMLTableCaptionElement.prototype, "HTMLTableCaptionElement");
		addElM(HTMLTableColElement.prototype, "HTMLTableColElement");
		addElM(HTMLTableSectionElement.prototype, "HTMLTableSectionElement");
		addElM(HTMLTableRowElement.prototype, "HTMLTableRowElement");
		addElM(HTMLTableCellElement.prototype, "HTMLTableCellElement");
		addElM(HTMLFrameSetElement.prototype, "HTMLFrameSetElement");
		addElM(HTMLFrameElement.prototype, "HTMLFrameElement");
		addElM(HTMLIFrameElement.prototype, "HTMLIFrameElement");
		addElM(HTMLSpanElement.prototype, "HTMLSpanElement");
	}

//	Functions to be overwritten
	var creators=[
	              ["window", "Image"]
	              , ["DOMImplementation.prototype", "createDocument", "createDocumentType", "createHTMLDocument"]
	              , [(Document.prototype.createElement === document.createElement)?"Document.prototype":"HTMLDocument.prototype", "createAttribute", "createAttributeNS", "createCDATASection", "createComment", "createDocumentFragment", "createElement", "createElementNS", "createTextNode"]
	              ];

	if (typeof(window.XDomainRequest)==="function") {
		creators[0].push("XDomainRequest");	
	}
	if (typeof(DOMImplementation.prototype.createCSSStyleSheet)==="function") {
		creators[1].push("createCSSStyleSheet");
	}

	function generateFuncString(object, key) {
		var nativepath = [object, key].join(".");
		var orig = [object.replace(/\./g,"_"), key].join("_");
		return [
		        , "var ", orig, " = ", nativepath, ";\n"	
		        , "function ", key, "() {\n"
		        , "  var ret;\n"
		        , "  if (this instanceof ", key, ") {\n"
		        , "    switch(arguments.length) {\n"
		        , "      case (0):  ret = new ", orig, "(); break;\n"
		        , "      case (1):  ret = new ", orig, "(arguments[0]); break;\n"
		        , "      case (2):  ret = new ", orig, "(arguments[0], arguments[1]); break;\n"
		        , "      case (3):  ret = new ", orig, "(arguments[0], arguments[1], arguments[2]); break;\n"
		        , "      case (4):  ret = new ", orig, "(arguments[0], arguments[1], arguments[2], arguments[3]); break;\n"
		        , "      case (5):  ret = new ", orig, "(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]); break;\n"
		        , "      case (6):  ret = new ", orig, "(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]); break;\n"
		        , "      case (7):  ret = new ", orig, "(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]); break;\n"
		        , "      case (8):  ret = new ", orig, "(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]); break;\n"
		        , "      case (9):  ret = new ", orig, "(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]); break;\n"  
		        , "      case (10): ret = new ", orig, "(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9]); break;\n"    
		        , "    }\n"  
		        , "  }\n"
		        , "  else {\n"
		        , "    ret = ", orig, ".apply(this, arguments);\n"  
		        , "  }\n"
		        , "  return objectOverwriteOn(ret);\n"
		        , "};\n"  
		        , "descriptor = OgOPD(", object, ", \"", key, "\");\n"  
		        , "if (descriptor && descriptor.hasOwnProperty(\"writable\") && descriptor.configurable) {\n"
		        , "  descriptor.value = ", "copyObject(", orig, ", ", key, ")", ";\n"
		        , "  OdP(", object, ", \"", key, "\", descriptor);\n" 
		        , "}\n"
		        , "else {\n"
		        , "  ", nativepath, " = ", "copyObject(", orig, ", ", key, ")", ";\n"
		        , "}\n"
		        , "OdP(", key, ", \"__em__orig\", {value: ", orig, ", configurable: false, enumerable: false, writable: false});\n"
		        , "if (", orig, ".prototype && ", orig, " === ", orig, ".prototype.constructor) {\n"
		        , "  ", orig, ".prototype.constructor = ", key, ";\n"
		        , "}\n\n"
		        ].join("");
	}; // end of generateFuncString();

	function creatorsOverwriteOn(creators) {
		var code = [
		            "(function creatorsOverwriteOn(objectOverwriteOn, copyObject) {\n"  
		            , "var descriptor, OdP=Object.defineProperty, OgOPD=Object.getOwnPropertyDescriptor;\n"
		            ];
		var i, keys, object, nativepath, k;
		for (i=creators.length; i--;) {
			keys = creators[i];
			object = keys[0];
			for (k=keys.length; --k;) {
				code.push(generateFuncString(object, keys[k]));
			}
		}
		code.push("})(window.__em__objectOverwriteOn, window.__om__copyObject);\n");
		code = code.join("");
		window.__em__objectOverwriteOn = objectOverwriteOn;
		window.__om__copyObject = ZZOm_copyObject;
		var script = document.createElement("script");
		script.textContent = code;
		document.head.appendChild(script);
		delete window.__em__objectOverwriteOn;
		delete window.__om__copyObject;  
		document.head.removeChild(script);	
		return code;
	};// end of creatorsOverwriteOn()
	creatorsOverwriteOn(creators); 
})(); // end of EventlistenersMirror-on.js

