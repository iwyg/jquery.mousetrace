(function ($, global) {
	var doc = global.document,
		body,
		events,	
		tempElem,
		tempElemNeedsPosition,
		hasCssTtansition = global.Modernizr ? global.Modernizr.csstransitions : false,
		hasCssTransform = global.Modernizr ? global.Modernizr.csstransforms3d  : false,
		translateOpen, translateClose,
		setPosition, prefix, fx,
		cancelRequestAnimFrame = (function(){			
			return global.cancelRequestAnimationFrame || 
				global.webkitCancelRequestAnimationFrame || 
				global.mozCancelRequestAnimationFrame || 
				global.oCancelRequestAnimationFrame || 
				global.msCancelRequestAnimationFrame || 
				void 0;			
		}()),
		requestAnimFrame;
		
		if (cancelRequestAnimFrame) {
			requestAnimFrame = (function(){			
				return global.requestAnimationFrame || 
					global.webkitRequestAnimationFrame || 
					global.mozRequestAnimationFrame || 
					global.oRequestAnimationFrame || 
					global.msRequestAnimationFrame || 
					void 0;			
			}());

		}		
	
	function getVendorPrefix (prop) {
		var prefix = [' ', 'moz', 'webkit', 'o', 'ms', 'khtml'],
			cssPrefix = [' ', '-moz-', '-webkit-', '-o-', '-ms-', '-khtml-'],
			testObj = global.document.createElement('div'),
			prefArr = [],
			output,key,p;
			
		function getPrefix ( prefix, property ){
				var prop = property.charAt(0).toUpperCase()+property.substr(1).replace(/(\-)(\w)/,function($0,$1,$2){
						return $2.toUpperCase();
				}),
				pref = !!prefix? prefix.charAt(0).toUpperCase()+prefix.substr(1) : prefix;
				output = testObj.style[pref+prop] !== undefined ? pref : false;
				global.VENDORPREFIX = output;
				return output;
		}
		
		for (key in prefix){
			if (prefix.hasOwnProperty(key)) {
				p = getPrefix(prefix[key],prop);
				if (p){
					prefArr.push(p,cssPrefix[key]);
					return prefArr;
				}				
			}
		}
	}

	setPosition = (function(){
		var transform;
		if ( hasCssTransform ) {
			translateOpen = 'translate3d(';
			translateClose = ',0)';
			prefix = getVendorPrefix('transform');			
			transform = prefix[1] + 'transform';
			
			return function(){
				this.tracer.css(transform, translateOpen + this.mx + 'px, ' + this.my + 'px' + translateClose);
			};
		} else {
			return function(){
				this.tracer.css({
					left: this.mx,
					top: this.my 
				});				
			};			
		}
	}());
	
	fx = (function () {
		var handle,transitionEnd,prefix;
		if ( hasCssTtansition ) {
			
			prefix = getVendorPrefix('transition');
			transitionEnd = prefix[0] === 'Moz'? 'transitionend' :  prefix[0].toLowerCase() + 'TransitionEnd';				
			transitionEnd += '.mousetrace';

				handle = function ( cb ) {
					this.unbind(transitionEnd);
					if ( $.isFunction(cb)) {
						cb.call(this);
					}
				};
			// define transition-timing-functions via CSS
			return {
				show: function (el, callback) {
					el.bind(transitionEnd, function(e){
						handle.call(el, callback);
					});
					
					global.setTimeout(function(){
						el.css({display:'block', opacity:1});
					},0);
					
				},
				hide: function (el, callback) {
					el.bind(transitionEnd, function(e){												
						
						handle.call(el,callback);
						el.css({display:'none'});			
						
					},false);
					
					global.setTimeout(function () {
						el.css({opacity:0});					
					},0);
				}
			};
		} else {
				handle = function( cb ) {
					if ( $.isFunction(cb)) {
						cb.call(this);
					}
				};
			return {
				show: function (el,callback, easing) {
					if (typeof callback === 'string') {
						easing = callback;
					}
					el.fadeIn(200,easing, function(){
						handle.call(el, callback);	
					});
				},
				hide: function(el,callback, easing) {
					if (typeof callback === 'string') {
						easing = callback;
					}					
					el.fadeOut(200,easing, function(){
						handle.call(el, callback);													
					});					
				}
			};			
		}
	}());
	
	function MouseTrace(){
		this.init.apply(this,arguments);
	}
	
	MouseTrace.prototype = {
		name: 'mousetrace'
	};
	
	events = {
		M_MOVE : 'mousemove.' + MouseTrace.prototype.name,
		M_ENTER : 'mouseenter.' + MouseTrace.prototype.name,
		M_LEAVE : 'mouseleave.' + MouseTrace.prototype.name
	};

	
	$.extend(MouseTrace.prototype, {
		init: function (o) {
			this.options = o;			
			this.tracer = $('<div/>').addClass(this.name);			
			this.bind();			
		},
		
		bind: function () {
			var i,l = this.options.content.length;
				
			for (i=0;i<l;i++) {
				body.delegate(this.options.content[i].trigger, events.M_ENTER, this.options.content[i], $.proxy(this.getContent, this))
				.delegate(this.options.content[i].trigger, events.M_LEAVE, this.options.content[i], $.proxy(this.clearContent, this));				
			}
			this.tracer.bind(events.M_ENTER, function(e){
				e.preventDefault();
				//e.stopProbagation();
				return false;
			});	

			body.delegate(this.options.selector, events.M_ENTER, $.proxy(this.show,this))	
			.delegate(this.options.selector, events.M_LEAVE, $.proxy(this.hide,this));
			
			
		},
		getContent : function ( e ) {
			
			if (!!e.data.addClass) {
				this.tracer.addClass(e.data.addClass);
			}
			
			if ($.isFunction(e.data.content)) {
				this.tracer.html(e.data.content.call(this.tracer,$(e.target)));	
			} else {
				this.tracer.html(e.data.content);	
			}			
		},
		clearContent : function ( e ) {
			if (!!e.data.content) {
				this.tracer.html(this.options.staticContent);	
			} 
			if (!!e.data.addClass) {
				this.tracer.removeClass(e.data.addClass);
			}			
		},		
		update : function (e) {
			this.mx = (e.pageX - tempElem.offset().left ) + this.options.correctLeft;
			this.my = (e.pageY - tempElem.offset().top ) + this.options.correctTop;
		},
		show: function (e) {

			// try to find intended target
			var nodeList = $(e.handleObj.selector),
				target;
				if ( nodeList.length < 2 ) {
					target	= nodeList;
				} else {
					target = $(e.target);
					nodeList.each(function(){
						var _t = target.parents().filter(this); 
						if (_t) {target = $(_t);return;}
						else if (this === e.target){target = $(_t);return;}												
					});
				}
			
			body.bind(events.M_MOVE, $.proxy($.proxy(this.update, this)));

			tempElem = target;
			
			if (tempElem.css('position').toLowerCase() === 'static' ) {
				tempElemNeedsPosition = true;
				tempElem.css({position:'relative'});
			} else {
				tempElemNeedsPosition = false;
			}
			
			this.startTrace('trace'); // start timer
			
			this.tracer.css({display:'none'})
				.appendTo(tempElem);
				
			fx.show(this.tracer, this.options.fadeEasing);			
		},
		
		hide: function () {

			body.unbind(events.M_MOVE);
			
			this.stopTrace(); // kill timer
			
			fx.hide(this.tracer, function () {				
				this.detach();
			},this.options.fadeEasing);
			
			if (tempElemNeedsPosition) {
				tempElem.css('position',''); // remove garbage
			}			

		},
		trace: function () {
			setPosition.call(this);
			this.startTrace('trace');
		},

		stopTrace: (function () {
			if (!!cancelRequestAnimFrame) {
				return function(){
						cancelRequestAnimFrame(this.timer);
					};
				} else {
				return function(){
						global.clearTimeout( this.timer );																	
					};
			}
		}()),		
		
		startTrace: (function () {
			if ( !!requestAnimFrame ) {
				return function(fn){
					var that = this;
					this.timer = requestAnimFrame(function(){
						MouseTrace.prototype[fn].call(that);
					});
				};
				
			} else {
				return function (fn) {
					var that = this;				
					this.timer = global.setTimeout(function(){
						that[fn]();						
					}, $.fx.interval);
				};
			}
		}()),		
		
		teardown: function () {
			this.unbind();
			this.tracer.empty().remove();
			
			$.removeData(this.name);
		},
		
		unbind: function () {
			var i,l = this.options.content.length;
				
			for (i=0;i<l;i++) {
				body.undelegate(this.options.content[i].trigger, events.M_ENTER)
				.undelegate(this.options.content[i].trigger, events.M_LEAVE);				
			}	
			body.undelegate(this.options.selector, events.M_ENTER)	
			.undelegate(this.options.selector, events.M_LEAVE)
			.unbind(events.M_MOVE);	
			
		}
	});

	$.fn.mousetrace = function (options) {
		
		var defaults = {
				selector : '',
				staticContent : '',	
				content : [
					{
						trigger : '', // {String} classname
						content : '', // {String} or {Function} returning {String}
						addClass : ''	
					}
				],
				correctLeft:20,
				correctTop:20,
				fadeEasing : 'swing'
			},
			o = $.extend({},defaults, options);
			body = $(doc.body);

			body.data(MouseTrace.prototype.name, new MouseTrace(o));
		return this;
	};

}(this.jQuery,this));
