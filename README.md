
# jquery.mousetrace - display information on the fly

## description

The mousetrace plugin lets you display additional information on your website as a fancy mousetracer.

## preperation 

- make sure, the latest [jquery library](http://jquery.com/) is loaded before including the jquery.mousetrace.js. e.g.:

	<script src="path/to/lib/jquery.latest.js"></script>
	<script src="path/to/plugins/jquery.mousetrace.js"></script>

- if you want hardware acceleration and css3 transition support for modern browsers, you may also include the famous [Modernizr Library](http://www.modernizr.com/)

## default setup

	selector : '',			// {String} selector expression provided as single statemanet or a comma seperated list
	staticContent : '',		// {String} or HTMLElement or jQuery Object that is displayed as tatic content on the mousetracer
	contents : [				// define an array of optional triggers, that will envoke the tracer to display new content and add additional classnames
		{
			trigger : '',	// {String} selector expression provided as single statemanet or a comma seperated list
			content : '',	// {String} or {Function} returning {String}
			addClass : ''	// {String} classname to be added	
		}
	],
	correctLeft:20,			// correction value relative to cursor position
	correctTop:20,			// correction value relative to cursor position
	fadeEasing : 'swing'	// default easing. jQuery by default provides 'linear' and 'swing'. Add more easing methods by including the [jquery.easing](http://gsgd.co.uk/sandbox/jquery/easing/) plugin from GSGD


## example setup

	$(document).ready(function(){
		$(this).mousetrace({
			selector : '.show-info',		
			staticContent : 'Hello World',	
			contents : [			
				{
					trigger : 'a.info',	
					/*
					* @param {Object} target: jquery Object, the 'a.info target'
					*/
					content : function(target){
					return target.attr('title');
					},	
					addClass : 'fancy-style'	
				},
				{
					trigger : 'img.description',	
					content : function(target){
						return target.attr('longdesc') || target.attr('title');
					},		
					addClass : 'another-fancy-style'	
				},
				{
					trigger : '.someinvoking-class',	
					content : 'Text to be displayed',		
					addClass : 'another-fancy-style'	
				}
			],
			correctLeft: -40,		
			correctTop: 40,			
			fadeEasing : 'easeInOutQuad'	
		});
	});

## teardown

removeing the plugin instance is easy. Just call `$(body).data('mousetrace').teardown();` and you’re done.

## changelog

### b1.2

- renamed options property from content to contents, makes more sense

### b1.1

- fixed issue: forgott to set initial static Content
- fixed issue: tearDown method wouldn't remove plugin data
 
### b1.0
 
- initial release
 