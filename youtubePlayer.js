/*******************************************/
/*      YouTube Overlay Player       */
/*******************************************/

/** settings to include with the embed

	//required scripts:
 	jquery-1.4.2.min.js (jquery-1.4.2.min.js or higher recommended)


 	//this is the only required variable
	id = 'LY67dAT22Pc' - youtube video id 

	//variables can be defined

	autoplay = true; - default is true

	YTplayerWidth = 676 - player width  
    YTplayerHeight = 396 - player height 

    closeOverlayCallback() - callback function after closeOverlay() is called;
 
**/

var YTOverlayPlayer = function() {

    var that = {};
    var player;

    that.id = '';
    that.trackingId = null;
    that.YTplayerWidth = 676;
    that.YTplayerHeight = 396;
    that.closeOverlayCallback = null;  
    that.autoplay = true;
 
    var playing = false;
    var isIE8 = false;
   
    var isTriggeredToPlay = false;
    var autoPlayTimeout;

    that.loadYouTubeAPI = function() {

    	var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		isIE8 = that.checkIE8();
		that.autoPlay();
    },

    that.autoPlay = function() {
		autoPlayTimeout = window.setTimeout(function(){
			if (!isTriggeredToPlay) {
				if (that.autoplay) {
					isTriggeredToPlay = true;
					loadVideo(that.id);
				}
		}	
		window.clearTimeout(autoPlayTimeout);
		}, 4000);
    }
 
	that.open = function(id, trackingId) {
   		if (!isTriggeredToPlay) {
   			isTriggeredToPlay = true;
   			window.clearTimeout(autoPlayTimeout);
 			loadVideo(id, trackingId);
 		}
 		that.reposition();
 		$(window).resize(function() {
 			that.reposition();
 		})	
 	}

 	var loadVideo = function(id, trackingId){
 		
		openOverlay();
		createPlayerContainer();

		if (id == '' || id == null){
			id = that.id; 
		}

 		player = new YT.Player('YTPlayer', {
		    height: that.YTplayerHeight,
		    width:  that.YTplayerWidth,
		    videoId: id,
		    suggestedQuality: 'hd720',
		    playerVars: {
		    	 wmode: "opaque",
				 rel: 0
			    },	 
		    events: {
		      'onReady': onPlayerReady,
		      'onStateChange': onPlayerStateChange,
		      'onError': onPlayerError
		    }
		});

		if (!trackingId && typeof(that.trackingId)!=null){
			trackingId = that.trackingId;
		}

		if (typeof(sCode)!=='undefined') {
		    sCode.trackVideo( trackingId, 'start');
		}
 	}

	var onPlayerError = function(event) {
 	}


    var onPlayerReady = function(event) {
 		var touchEnabled = that.touchEventDetect();
 		event.target.unMute();
 		event.target.setVolume(40); 
        if (!touchEnabled) { 
         	event.target.setPlaybackQuality('hd720');
         	event.target.playVideo();
        }  
	}

	var onPlayerStateChange = function(event){

		var touchEnabled = that.touchEventDetect();
		var screenSize =  window.screen.width;

		if (event.data == YT.PlayerState.PLAYING) {
			if(playing == false) {
                playing = true;
			}	
		} 

		if (event.data == YT.PlayerState.BUFFERING) { 
			event.target.setPlaybackQuality('hd720');
		}	

	}


	var createPlayerContainer = function() {
		var playerContainer;

		if ($.browser.msie) {
			playerContainer = '<div id="YTPlayerContainer"><div id="ie-wrapper"><div id="YTPlayer"></div></div><div id="YTPlayerCloseButton">Close</div></div>'; //adds extra wrappe to remove outlines on iframe in IE 
		} else {
			playerContainer = '<div id="YTPlayerContainer"><div id="YTPlayer"></div><div id="YTPlayerCloseButton">Close</div></div>';
		}

 		$(playerContainer).appendTo($('body'));

 		setCloseOverlay();
	}


	var setCloseOverlay = function() {

		var closeBtn = $('#YTPlayerCloseButton');
		var overlay = $('.yt-overlay');
		var videoContainer = $('#YTPlayerContainer'); 

 		closeBtn.bind('click', function(e){
		 	e.preventDefault();
		 	that.closeOverlay();
		});

 		overlay.bind('click', function(e){
		 	e.preventDefault();
		 	that.closeOverlay();
		});

 	}

 	that.closeOverlay = function() {

 		var closeBtn = $('#YTPlayerCloseButton');
 		var overlay = $('.yt-overlay');
		var videoContainer = $('#YTPlayerContainer'); 
		videoContainer.hide();
		videoContainer.empty().remove();
		closeBtn.unbind('click');
		overlay.unbind('click');

		destroyOverlay();

 	}

 	var destroyOverlay = function() {

 		var overlay = $('.yt-overlay');
		var videoContainer = $('#YTPlayerContainer'); 
		$(overlay).remove();
		$(videoContainer).remove();

		if (player) {

			player.destroy();
			playing = false;
			isTriggeredToPlay = false;

			//callback
			if(that.closeOverlayCallback != null) {
				that.closeOverlayCallback();
			}
		}
	}

	var openOverlay = function() {
		var overlay = new ytOverlayCreator({id:'yt-overlay'});
		overlay.open();
	}


	that.touchEventDetect = function(){
		 return !!('ontouchstart' in window) || !!('onmsgesturechange' in window); 
	},


    that.checkIE8 = function() {
    	if (($.browser.msie) && (parseInt($.browser.version)<9)) {
    		return true;
    	} else {
    		return false;
    	}
    }

    that.reposition = function(el) {

		var el = el ? el : $('#YTPlayerContainer');

		var windowHeight = $(window).height();
		var windowWidth = $(window).width();

		var elementHeight = $(el).find('iframe').height();
		var elementWidth = $(el).find('iframe').width();

		var scrollOffset = $(document).scrollTop();

		var closeBtnHeight = 30;
		var cssOffset;

		var overlay = $('#yt-overlay');

		if (elementWidth > windowWidth) {
			elementWidth = windowWidth-20;
		}

		$(el).css('width', elementWidth+'px');
		$(el).css('margin-left', -elementWidth/2+'px');

		if (scrollOffset < 1) {
			if (windowHeight > elementHeight) {
				cssOffset = (windowHeight-elementHeight)/2+'px';
			} else {
				cssOffset = closeBtnHeight+'px';
			}
		} else {
			if (windowHeight > elementHeight) {
				cssOffset = scrollOffset + (windowHeight-elementHeight)/2+'px';
			} else {
				cssOffset = scrollOffset+closeBtnHeight+'px';
			}
		}

		el.css({
			'position': 'absolute',
			'top': cssOffset
		});

		overlay.css({height:$(document).height()+'px'});
 
	}

	return that;
}

/*********
 *Overlay*
 ********/
var ytOverlayCreator = function(options) {

	var that = {};
	options = options || {id:'yt-overlay'};
	var element = $('<div id="'+options.id+'" class="yt-overlay">');
	
	that.open = function(){
		var body = $('body');
		
		element.css({height:$(document).height()+'px'});
		
		element.bind('click',function(e){
			that.close();
		});
		
		body.append(element);
		
		if(options.openCallback)
			options.openCallback(element);
	}
	
	that.close = function(){
		element.remove();	
		if(options.closeCallback)
			options.closeCallback(element);
	}
	
	that.setCloseCallback = function(callback){
		options.closeCallback = callback;
	}
	
	that.self = function(){
		return element;
	}
	
	return that;

}

var YTOverlayPlayer = YTOverlayPlayer();
YTOverlayPlayer.loadYouTubeAPI();
 
 