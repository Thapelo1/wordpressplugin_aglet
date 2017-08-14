/*--------------------------------------------------------------
# Global Variables
--------------------------------------------------------------*/
var	$window 	= $(window),				// Cached window
	scrolledTop = $window.scrollTop(),		// Distance from top
	navStatus 	= 'shut',					// Nav open / closed
	topScreen 	= true,						// Scrolled top = 0
	flipped 	= null,						// Track card flips
	clicked 	= false,					// Track a clicked event
	touched 	= false,					// Track a touched event
	set 		= null,						// Inifinite Scroll Started
	navU 		= navigator.userAgent,		// User Agent
	img_url		= null,
	cheet_playing = false;


var $isSafari = navigator.vendor.indexOf("Apple")==0 && /\sSafari\//.test(navigator.userAgent); // true or false
/*--------------------------------------------------------------
# Set Page Variables
--------------------------------------------------------------*/
if ( $('body.home').length ){ var home_page = true; }
if ( $('section.blog-feed').length ){ var blog_feed = true; }
if ( $('section#intro').length ){ var intro_section = true; }
if ( $('#infinite').length ){ var infinite_scroll = true; }

/*--------------------------------------------------------------
# Run Functions
--------------------------------------------------------------*/
$(function() {

	/*--------------------------------------------------------------
	# Fall back for Mix-Blend-Mode Android Browsers
	--------------------------------------------------------------*/
	var isAndroidMobile = navU.indexOf('Android') > -1 && navU.indexOf('Mozilla/5.0') > -1 && navU.indexOf('AppleWebKit') > -1;

	/*--------------------------------------------------------------
	# Custom Modernizr Tests
	--------------------------------------------------------------*/
	Modernizr.addTest('mix-blend-mode', function(){ return Modernizr.testProp('mixBlendMode'); });
	Modernizr.addTest('firefox', function () { return !!navU.match(/firefox/i); });
	Modernizr.addTest('android', function () { return !!isAndroidMobile; });

	/*--------------------------------------------------------------
	# Fast click for mobile devices
	--------------------------------------------------------------*/
	FastClick.attach(document.body);

	/*--------------------------------------------------------------
	# Global Inits
	--------------------------------------------------------------*/
	nav.init();
	global.init();

	/*--------------------------------------------------------------
	# Components
	--------------------------------------------------------------*/
	if ( $('section#stories').length ){ careers.init(); }					// Module: 	 Stories
	if ( blog_feed ){ blog.feed(); }										// Module: 	 Blog Feed
	if ( $('section#process').length ){ process.init(); projects.init(); } 	// Module: 	 Process
	if ( home_page ){ home.panels(); } 										// Template: Home Page
	if ( $('body.page-template-page-lob').length ){ lob.init(); } 			// Template: Lob Pages
	if ( $('body.featured-technology').length ){ technology.init(); }		// Template: Technology
	if ( $('body.page-template-page-about').length ){ about.init(); }		// Template: About Page
	if ( $('section.touring').length ){ tour.init(); }						// Template: On The Road
	if ( $('body.client-detail').length ){ client.init(); }					// Template: Client Detail
	if ( $('section#locations').length ){ locations.init(); }				// Template: Locations
	if ( $('section.products').length ){ products.init(); }					// Template: Products
	if ( $('body.single-products').length ){ product.init(); }				// Template: Product Single
	if ( $('body.blog').length || $('body.single').length ){ blog.init(); }	// Template: Blog Archive / Single
	if ( $('body.single-stories').length ){ careers.story(); }				// Template: Story Single

	// Set Product Scrolls
	if ( infinite_scroll ){ global.infinite(0); }

	// Run Video Load Last
	video.load();

});

// Debounce Resize
function resizePage() {

	if ( navStatus == 'open' ){
		var winHeight = $window.height();
		nav.open( winHeight );
	}

	// Home Page
	if ( home_page ){
		home.panels();
		video.reload();
	}

	// Blog Feed Images
	if ( blog_feed ){
		blog.feed();
	}

}
// $window.resize($.debounce(400, resizePage));

/*--------------------------------------------------------------
# Scroll Events
--------------------------------------------------------------*/

var triggered = false,
	navFooter = 'open';


global = {
	init: function(){

		global.bg_hover();
		if ( $('section#gallery').length ){
			global.gallery();
		}

		global.noLink();
		global.form();
		global.wysiwyg();
		if ( $('body').hasClass('error404') ){
			global.error404();
		}

	},
	gallery: function(){
		// Timeout because Balanced Gallery fires too fast
		$window.load(function() {

			var height = ( $window.height() * 0.38);

			$('section#gallery').BalancedGallery({
				idealHeight: height,
				shuffleUnorderedPartitions: false,
				padding: 2
			});
		});
	},
	bg_hover: function(){

		$('.bg-hover').on({
			mouseenter: function(e){

				var $this = $(this).find('.bg');

				$this.stop().velocity({
					'scale': 1.07
				}, 800, [0.08,0.4,0,1]);
			},
			mouseleave: function(e){

				var $this = $(this).find('.bg');

				$this.stop().velocity({
					'scale': 1
				}, 800, [0.08,0.4,0,1]);

			}
		});

	},
	images: function(selector){

		// Image switcher for device resolutions
		$(selector).each(function(){
			var $this	= $(this);
				$img 	= $this.find('img');

			if ( $window.width() <= 768 ){
				img_url = $img.data('src_small');
			}
			else {
				img_url = $img.data('src_large');
			}

			$img.attr('src', img_url);
		});

	},
	infinite: function(scrolledTop){

		var distanceBottom  = $(document).height() - $window.height() - scrolledTop,
			nextPage 		= $('#infinite').data('next');

		if ( distanceBottom < 50 && !set && nextPage !== '' ){

			set = true;

			$.ajax({
				url: nextPage,
				type: 'GET',
				success: function(data){

					var $result   = $(data).find('#infinite'), //changed from filter to find - BN 10/3/2016
						$infinite = $('#infinite');

					$infinite.data('next', $result.data('next'));
					$infinite.append( $result.html() );
				}
			}).done(function(){
				if ( $('section.products').length ){
					global.images('section.products article');
					products.display();
				}
				if ( $('section.posts').length ){
					blog.display();
				}
				set = null;
			});
		}
		else if ( nextPage === '' ) {
			// hide loader when finished
			$('#infinite').addClass('end');
			$('section.loader').hide();
		}

	},
	noLink: function(){
		$('.no-link, .no-link a').on('click', function(e){
			e.preventDefault();
		});
	},
	form: function(){

		$('input, textarea').focus(function(){
			$(this).parent().addClass('active');
		});
		$('input, textarea').blur(function(){
			$(this).parent().removeClass('active');
		});

		if ( $('.gform_body').length ){

			$('input.gform_button').wrap('<span class="btn"></span>');

			$('select').selectric({
				arrowButtonMarkup: '<i class="icon-nav-open-arrow"></i>',
				disableOnMobile: false
			});

			$window.load(function(){

				$('.gform_body .gfield:visible').matchHeight();

			});

		}
	},
	IsValidImageUrl : null,
	wysiwyg: function(){

		// Find all links in a post
		$('.wysiwyg a').each(function(){

			var $this 	= $(this),
				url 	= $this.attr('href'),
				ext		= url.substring(url.lastIndexOf('.') + 1);

			// Check url for valid image type
			if(ext ==="gif" || ext === "jpg" ||  ext === "jpeg"|| ext === "png"){
				$this.addClass('zoom');
			}

		});

		// Initialize image zoom
		$('.wysiwyg').magnificPopup({
			delegate: 'a.zoom',
			type:'image',
			zoom: {
		    	enabled: true, // By default it's false, so don't forget to enable it
				duration: 300, // duration of the effect, in milliseconds
				easing: 'ease-in-out', // CSS transition easing function
		  	}
		});
	},
	error404: function(){

		var duration = 10000;

		if ( cheet_playing ){
			duration = 2500;
		}

		i=0;
		$('.laser').each(function(){

			var delay = 300*i;
			$(this).find('span').delay(delay).velocity({ rotateZ : ['-67.5deg', '67.5deg'] }, { duration: duration, loop:true, begin: function(){ $(this).addClass('animate'); } });
			i++;


		});
	}
};

nav = {
	init: function(){

		nav.toggle();

		$('nav#main').on('mouseenter touchstart', function(){

			if ( navFooter === 'closed' ){
				nav.reveal();
			}

		});

	},
	reset: function(){

		// Animation doesn't allow the style to clear until it's finished so I need a timeout here
		setTimeout(function(){
			$('nav#main, nav#main .primary').removeAttr('style');
			$('nav#main footer').removeClass('hide').removeAttr('style');
		}, 800);

	},

	overlay: function(scrolledTop){

		var banner = $('.banner').height(),
			nav    = $('nav#main');

		if ( banner === null ){
			banner = 0;
		}

		// Handles nav transparency on pages with header images
		if ( navStatus == 'shut' ){

			if ( scrolledTop >= banner - 75 ){
				setTimeout(function(){
					nav.removeClass('top');
				}, 50);
			}
			if ( scrolledTop <= banner - 75 ){
				setTimeout(function(){
					nav.addClass('top');
				}, 50);
			}

		} else {
			nav.removeClass('top');
		}

	},

	toggle: function(){

		$('nav#main .toggle').on('click', function(){

			if ( clicked === false ){
	 			clicked = true;

				var $this = $(this),
					winHeight = $window.height(),
					changeHeight = 55;


				// Height Variables
				if ( $window.width() >= 769 ){
					changeHeight = 78;
				}

				// Close Navigation
				if ( $this.hasClass('open') ){

					// Handles Toggle Animation
					$this.removeClass('open');
					$this.addClass('close');

					nav.close( changeHeight );

				// Open Navigation
				} else {

					// Handles Toggle Animation
					$this.removeClass('close');
					$this.addClass('open');

					nav.open( winHeight );

				}

			}

		});

	},
	open: function( winHeight ){

		navStatus = 'open';

		// If the footer is hidden
		$('nav#main footer').removeClass('hide');

		// Styling for open nav
		$('body').addClass('nav-open');

		if ( $window.width() < 769 ){

			// Open Nav Height
			$('nav#main').delay(100).velocity(
				{
					height: '100vh'
				}, 300, [ 0.23, 1, 0.32, 1 ]
			);

			// Scale BG Image
			$('nav#main .bg').delay(100).velocity(
				{
					scaleX: 1.3,
					scaleY: 1.3
				}, 400, [ 0.165, 0.84, 0.44, 1 ],
				function(){
					clicked = false;
				}
			);

		}

	},
	close: function( changeHeight ){

		navStatus = 'shut';

		// Styling for closed nav
		$('body').removeClass('nav-open');

		// Close Nav Height
		$('nav#main').delay(100).velocity(
			{
				height: changeHeight,
				complete: function(){
					nav.reset();
					setTimeout(function(){ // Footer hide
						$('nav#main footer').addClass('hide');
					}, 300);
				}
			}, 300, [ 0.23, 1, 0.32, 1 ]
		);

		if ( $window.width() <= 768 ){

			// Scale BG Image
			$('nav#main .bg').velocity(
				{
					scaleX: 1,
					scaleY: 1
				}, 400, [ 0.165, 0.84, 0.44, 1 ],
				function(){
					clicked = false;
				}
			);

		}
	},
	collapse: function() {

		var $footer = $('nav#main footer'),
			fHeight = $footer.height() - 3;

		$footer.velocity({
			translateY : -fHeight + 'px'
		}, {
			duration: 300,
			complete: function(){
				navFooter = 'closed';
			}
		});
	},
	reveal: function() {
		$('nav#main footer').velocity({
			translateY : 0
		}, {
			duration: 300,
			complete: function(){
				navFooter = 'open';
			}
		});
	}
};

home = {
	panels: function(){

		// Global Stuff
		$('.lob-bg').appendTo('.lobs'); // Move background loop out
		$('section article p').matchHeight(); // Makes paragraphs consistent

		home.start();

		$('body').on('mouseenter touch', 'section', function(e){

			var $this = $(this),
				panel = $this.attr('id');

			// Background Manipulation
			$('.lob-bg').css({ 'z-index' : 1 });
			$('.lob-bg[data-cat="'+ panel +'"]').css({ 'z-index' : 8 });

			if ( $window.width() > 1023  && !$this.hasClass('reset') ){
				home.show(panel);
			}

		});

		$('body').on('touchstart mousedown', 'section', function(e){

			var $this = $(this);

			touched = true;

			if ( $window.width() > 768 ){
				$this.stop().velocity({ scale: 0.99, backgroundColor: '#151515', backgroundColorAlpha: 0.3 }, 100);
			}

		});

		$('body').on('touchend mouseup', 'section', function(e){

			var $this = $(this),
				panel = $this.attr('id');

			touched = false;

			if ( $window.width() > 768 ){

				$this.stop().velocity({ scale: 1, backgroundColorAlpha: 0 }, 100);

			}

			// Background Manipulation
			$('.lob-bg').css({ 'z-index' : 1 }, 100);
			$('.lob-bg[data-cat="'+ panel +'"]').css({ 'z-index' : 8 });

			if ( $window.width() > 1023  && !$this.hasClass('reset') ){
				home.show(panel);
			}

		});

		$('body').on('click', 'section', function(e){

			var $this 	= $(this),
				link 	= $this.find('a.btn').attr('href');

			if ( touched === false ){
				window.location = link;
			}

		});
	},
	show: function(panel){

		$('body').addClass('theme-' + panel);

		var $panel = $('section#' + panel);

		if ( $window.width() >= 1024 ){
			$panel.find('article').velocity({ 'bottom' : 36 });
		}
		$panel.find('article p, article .btn')
			.velocity({
				translateY : 0,
				complete: function(){
					$('section#' + panel).addClass('reset');
				}
			});

		// Check if panel has a video bg
		if ( $('.lob-bg[data-cat="'+ panel +'"] .bg-video').length ){
			video.play(panel); // Play video background
		}

		// Check to see what needs to close
		$('section').each(function(){

			var $this = $(this),
				newPanel = $this.attr('id');

			if ( $this.hasClass('reset') && newPanel != panel ){

				home.hide(newPanel, $this);

			}

		});

	},
	hide: function(panel, $this){

		$('body').removeClass('theme-' + panel);

		var $panel 		= $('section#' + panel),
			p_Height  	= $('section#' + panel + ' article p').height(),
			btn_Height 	= $('section#' + panel + ' article .btn').height();

		$panel.find('article')
			.velocity({ 'bottom' : -(p_Height + btn_Height+28) });
		$panel.find('article p, article .btn')
			.velocity({
				translateY : 50,
				complete: function(){
					$this.removeClass('reset');
				}
			});

		// Check if panel has a video bg
		if ( $('.lob-bg[data-cat="'+ panel +'"] .bg-video').length ){
			video.pause(panel); // Pause video background
		}

	},
	start: function(){

		if ( $('.lobs .front').find('video').length && $window.width() >= 1024 ){

			var panel = $('section.front').attr('id');
			video.play(panel);
		}

		$('body.theme-home section').each(function(){

			var $this = $(this),
				p_Height   = $this.find('p').height(),
				btn_Height = $this.find('.btn').height();

			$this.find('article').css({ 'bottom' : -(p_Height + btn_Height+28) });

			if ( $window.width() >= 1024 ){
				$this.find('p, .btn').css({ 'transform' : 'translateY(50px)' });
			} else {
				$this.find('p, .btn').css({ 'transform' : 'translateY(0)' });
			}

		});

		var reset = $('section.reset').attr('id');
		home.show(reset);

	}
};
video = {

	reload: function(){
		video.unload();
		video.load();
	},
	load: function(){

		// Lazy Load Videos
		if ( $window.width() >= 1024 && $('.bg-video').length ){

			$('video').each(function(){
				var vid_id = $(this).attr('id'),
					$video = $('video#' + vid_id);

				$video.find('source').each(function(){
					var src = $(this).data('src');
					$(this).attr({'src' : src });
				});
				$video[0].load();

			});
		}

	},
	unload: function(){

		if ( $window.width() < 1024 && $('.bg-video').length ){
			$('video source').each(function(){
				$(this).attr({'src' : '' });
			});
		}

	},
	play: function(id){
		$('video#video-' + id)[0].play();
	},
	pause: function(id){
		$('video#video-' + id)[0].pause();
	}
};
scroll = {
	banner: function(scrolledTop){
        var scrollSpeed = (scrolledTop/50),
        	$banner = $('section.banner');

        if ( $banner.hasClass('short') ){
	        scrollSpeed = (scrolledTop/10);
        }

		if ( $banner.height() > scrolledTop ){
	        // Parallax Banner
	        $banner.find('.bg, .bg-video').css({
	            'webkitTransform': 'translateY(' + scrollSpeed + '%)',
	            'MozTransform': 'translateY(' + scrollSpeed + '%)',
	            'msTransform': 'translateY(' + scrollSpeed + '%)',
	            'transform': 'translateY(' + scrollSpeed + '% )'
	        });
		}

	},
	intro: function(scrolledTop){
		var $intro = $('section#intro .bg'),
			distance = $intro.offset().top,
			start			= ( distance - scrolledTop ) - $window.height(),
			scrollSpeed 	= ( start/125 );

		if ( start < 0 && $intro.height() + distance > scrolledTop ){

	        // Parallax Intro
	        $intro.css({
	            'webkitTransform': 'translateY(' + scrollSpeed + '%)',
	            'MozTransform': 'translateY(' + scrollSpeed + '%)',
	            'msTransform': 'translateY(' + scrollSpeed + '%)',
	            'transform': 'translateY(' + scrollSpeed + '% )'
	        });

		}
	},
	corpvideo: function(scrolledTop){
		var $section		= $('section#corporate-video'),
			$bg		 		= $('section#corporate-video .bg'),
			distance 		= $section.offset().top,
			start			= ( distance - scrolledTop ) - $window.height(),
			scrollSpeed 	= ( start/125 );

		if ( start < 0 && $section.height() + distance > scrolledTop ){

	        // Parallax Intro
	        $bg.css({
	            'webkitTransform': 'translateY(' + scrollSpeed + '%)',
	            'MozTransform': 'translateY(' + scrollSpeed + '%)',
	            'msTransform': 'translateY(' + scrollSpeed + '%)',
	            'transform': 'translateY(' + scrollSpeed + '% )'
	        });

		}
	},
	values: function(scrolledTop){
		var $section		= $('section#statement .values'),
			$bg		 		= $('section#statement .values > .bg'),
			distance 		= $section.offset().top,
			start			= ( distance - scrolledTop ) - $window.height(),
			scrollSpeed 	= ( start/125 );

		if ( start < 0 && $section.height() + distance > scrolledTop ){

	        // Parallax Intro
	        $bg.css({
	            'webkitTransform': 'translateY(' + scrollSpeed + '%)',
	            'MozTransform': 'translateY(' + scrollSpeed + '%)',
	            'msTransform': 'translateY(' + scrollSpeed + '%)',
	            'transform': 'translateY(' + scrollSpeed + '% )'
	        });

		}
	},
	value: function(scrolledTop){
		var $section		= $('section#statement .values'),
			$value		 	= $('section#statement aside.value'),
			distance 		= $section.offset().top,
			start			= ( distance - scrolledTop ) - $window.height(),
			scrollSpeed 	= -( start/85 );

		if ( $window.width() > 480 && start < 0 && $section.height() + distance > scrolledTop ){

	        // Parallax Intro
	        $value.css({
	            'webkitTransform': 'translateY(' + scrollSpeed + '%)',
	            'MozTransform': 'translateY(' + scrollSpeed + '%)',
	            'msTransform': 'translateY(' + scrollSpeed + '%)',
	            'transform': 'translateY(' + scrollSpeed + '% )'
	        });

		}
	}
};
lob = {

	init: function(){

		$('section.banner .scrolldown').on('click', function(){
			$('html,body').animate({
			   scrollTop: $('section#intro').offset().top
			}, 1000);
		});

		lob.jump();

		if ( $('section.solutions').length ){
			lob.solution();
		}

	},
	solution: function(){

		// Resize Page
    	function resizePage() {
	    	lob.resetSolution();
	    }
	    $window.resize($.debounce(400, resizePage));

		$('li.solution').on('click', function(){

			var $this = $(this);

			if ( $window.width() <= 768 ){
				if ( $this.hasClass('open') ){
					$this.removeClass('open').velocity({ height: 90 }, 200);
				} else {

					$this.addClass('open');
					var height = $this.find('article').outerHeight();
					$this.removeClass('open');

					$('li.solution.open').removeClass('open').velocity({ height: 90 }, 200);
					$this.addClass('open').velocity({ height: height });
				}
			}

		});

		$('li.solution').on('mouseenter touchstart', function(){

			if ( $window.width() > 768 ){

				lob.resetSolution();

				var $this 	= $(this),
					pHeight = $this.find('p').outerHeight(),
					hHeight = $this.find('h3').outerHeight();

				$this.addClass('open');

				$this.find('h3').css({ 'margin-top' : -(pHeight/2) });
				$this.find('p').css({ 'margin-top' : (hHeight/2) });

			}

		});
		$('li.solution').on('mouseleave', function(){

			lob.resetSolution();

		});

	},
	resetSolution: function(){

		$('li.solution').removeClass('open').removeAttr('style');
		$('li.solution p, li.solution h3').removeAttr('style');

	},
	jump: function(){

		$('nav#jump').on('click', 'a', function(e){

			var $this  		= $(this),
				scroll 		= $this.data('scroll'),
				$scrollTo	= $('section[data-scroll="' + scroll + '"]'),
				distance	= $scrollTo.offset().top,
				docHeight 	= $(document).height(),
				speed 		= ( distance / docHeight )*2500;

			e.preventDefault();

			$('html,body').animate({
			   scrollTop: $scrollTo.offset().top -75
			}, speed);

		});

	}
};
process = {
	mySwiper: null,
	init: function(){

		process.equalizeHeights();

		if ( $window.width() <= 768 ){
			process.sliderInit();
		}

		// Resize Page
    	function resizePage() {

	    	if ( $window.width() <= 768 ){
		    	process.equalizeHeights();
		    	process.sliderInit();
	    	} else {
		    	process.sliderDestroy();
		    	process.equalizeHeights();
	    	}

	    }
	    $window.resize($.debounce(400, resizePage));

	},
	sliderInit: function(){

		// Add Classes
		$('#process ul').addClass('swiper-wrapper');
		$('#process ul li').addClass('swiper-slide');

		// Start Slider
		process.mySwiper = new Swiper ('.process-container', {
			// Controllers
			keyboardControl: true,
			prevButton: 'i.prev-slide',
			nextButton: 'i.next-slide',
			// Styling
			spaceBetween: 0,
			slidesPerView: 'auto',
			// Custom Stuff
			onSlideChangeEnd: function(){
				var activeSlide = $('.swiper-slide-active').index()+1;
				$('.slide-count span.current').text(activeSlide);
			}
    	});
	},
	sliderDestroy: function(){
		if ( $('.process-container').hasClass('swiper-container-horizontal') ){
			// Destroy Swiper
			process.mySwiper.destroy(false, true);
			// Remove Classes
			$('#process ul').removeClass('swiper-wrapper');
			$('#process ul li').removeClass('swiper-slide');
		}
	},
	equalizeHeights: function(){
		$('section#process ul li').matchHeight({
			byRow: false,
		});
	}
};

blog = {
	init: function(){

		blog.display();
		blog.share();

	},
	display: function(){
		var i = 0;

		$('.post.preload').each(function(){
			$(this).delay(150*i).velocity({ 'opacity' : [1, 0], 'translateY' : [0, 100]}, 500, 'ease', function(){
				$(this).removeClass('preload');
			});
			i++;
		});
	},
	feed: function(){

		// Image and button switcher for device resolutions
		$('section.blog-feed ul.posts li').each(function(){
			var $this	= $(this),
				$img 	= $this.find('img'),
				$bg		= $this.find('.bg');

			if ( $window.width() <= 480 ){
				img_url = $img.data('src_small');
			}
			else if ( $window.width() <= 768 ){
				img_url = $img.data('src_med');
				$this.find('.btn').removeClass('btn-inverse');
			}
			else if ( $window.width() > 768 ){
				img_url = '';
				$bg.attr( 'style', 'background-image: url(' + $img.data('src_large') + ');' );
				$this.find('.btn').addClass('btn-inverse');
			}

			$img.attr('src', img_url);
		});

	},
	share: function(url) {

		$('a.facebook-share').on('click', function(e, url){
			e.preventDefault();
	        window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
	        return false;
		});
		$('a.twitter-share').on('click', function(e, url){
			e.preventDefault();
	        window.open($(this).attr('href'), 'twitterShareWindow', 'height=250, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
	        return false;
		});

	}
};
tour = {
	init: function(){
		global.images('section.touring ul.on-the-road li');
		tour.past();

		// On Resize
		function resizePage() {
			global.images('section.touring ul.on-the-road li');
		}
		$window.resize($.debounce(400, resizePage));

		$('section.instagram').on('click', '#sb_instagram .sbi_photo', function(){
			if (!('body').hadClass('logged-in')){
				var link = $(this).attr('href');
				ga('send', 'event', 'instagram photo', 'click', link);
			}
		});

	},
	past:function(){

		var mySwiper = new Swiper ('.tour-container', {
			// Optional parameters
			observer: true,
			watchSlidesProgress: true,
			watchSlidesVisibility: true,
			preloadImages: false,
			spaceBetween: 10,
			slidesPerView: 'auto',
			grabCursor: true,
			freeMode: true,
			freeModeSticky: true,
			keyboardControl: true,
			mousewheelForceToAxis: true,
			mousewheelControl: true,
			mousewheelSensitivity: 1,
			lazyLoading: true,
			lazyLoadingInPrevNext: true,
			prevButton: 'i.prev-slide',
			nextButton: 'i.next-slide'
    	});

	}
};
projects = {
	init: function(){
		projects.images();
		projects.equalizeHeights();
		projects.accordion();

		function resizePage() {
			projects.images();
			projects.equalizeHeights();
		}
		$window.resize($.debounce(400, resizePage));
	},
	images: function(){

		$('section#projects img').each(function(){

			var $img = $(this);

			if ( $window.width() <= 768 ){
				img_url = $img.data('src_small');
			}
			else if ( $window.width() > 768 ){
				img_url = $img.data('src_med');
			}

			$img.attr('src', img_url);

		});

	},
	equalizeHeights: function(){
		$('section#projects .client h4').matchHeight();

		// Removes unwanted CSS styling left by velocity
		$('ul.accordion li, ul.accordion li i').attr('style', '');
	},
	accordion: function(){

		if ( $window.width() > 768 ){
			// Position the first close button on load
			$('li.opened header i.close').css({ 'bottom' : 10 });
		}

		$('li header').on({

			'mouseenter': function(){
				var $this = $(this);

				if ( $this.parent().hasClass('closed') && $window.width() > 768 ){
					$this.find('i.open').stop().velocity({
						bottom: '10px'
					}, 150, [0.08,0.4,0,1]);
				}
			},
			'mouseleave': function(){

				var $this = $(this);

				if ( $this.parent().hasClass('closed') && $window.width() > 768 ){
					$this.find('i.open').stop().velocity({
						bottom: '20px'
					}, 150, [0.08,0.4,0,1]);
				}

			}
		});

		$('section#projects').on('click', 'li.closed', function(){

			var $this  = $(this);

			// Get height
			$this.css({ 'height' : 'auto' });
			  var panelHeight = $this.height();
			$this.attr({ 'style' : '' });

			$this.stop().velocity({
				height: panelHeight
			}, 1200, [0,0.84,0.61,0.98]);

			$this.stop().find('article').velocity({
				opacity: [1, 0],
				translateY: [0, -50]
			}, 800, [0,0.84,0.61,0.98]);

			if ( $window.width() > 768 ){
				$this.find('i.open').stop().velocity({
					bottom: 20
				}, 600, [0.08,0.4,0,1]);

				$this.find('i.close').stop().velocity({
					bottom: [10, -30]
				}, 600, [0.08,0.4,0,1]);
			}

			$this.removeClass('closed').addClass('opened');

		});

		$('section#projects').on('click', 'li.opened header', function(){

			var $this = $(this),
				headerHeight = $this.height();

			$this.stop().parent().velocity({
				height: headerHeight
			}, 400, [0,0.84,0.61,0.98]);

			if ( $window.width() > 768 ){
				$this.find('i.open').stop().velocity({
					bottom: 10
				}, 600, [0.08,0.4,0,1]);
				$this.find('i.close').stop().velocity({
					bottom: [-30]
				}, 600, [0.08,0.4,0,1]);
			}

			$this.parent().removeClass('opened').addClass('closed');

		});

	}
};
about = {
	init: function(){
		$('#promotion .img-wrapper').matchHeight({ byRow: false });
		$('#promotion article').matchHeight({ byRow: false });
		$('#promotion h2').matchHeight({ byRow: false });

		lob.jump();
		about.card();
		about.values();
		about.people();
		about.person();

		$window.scroll( $.throttle( 10, function(){

		    var scrolledTop = $(this).scrollTop();
		    scroll.corpvideo(scrolledTop);
		    scroll.values(scrolledTop);
		    scroll.value(scrolledTop);

		}));

		// Debounce Resize
		function resizePage() {

			about.reset_cards();
			about.reset_diamonds();

			about.mySwiper.destroy(false, true);
			about.people();
			about.resetPerson();

		}
		$window.resize($.debounce(100, resizePage));
	},
	card: function(){

		$('section#solutions .card').on({

			mouseenter: function(){

				var $this = $(this);

				if ( !$this.hasClass('flipped') ){
					$this.stop().velocity({ scale : 0.97 }, 300, [0,1.03,0.68,1.22]);
				}

			},
			mouseleave: function(){

				var $this = $(this);

				if ( !$this.hasClass('flipped') ){
					$this.stop().velocity({ scale : 1 }, 300, [0,1.03,0.68,1.22]);
				}
			}

		});

		// Flip
		$('section#solutions').on('click', '.card', function(){

			var $this = $(this),
				$back = $this.find('.back');

			if ( !flipped && $window.width() < 480 ){

				flipped = true;

				$('.card-container > .back').remove();		// Remove any large card backs from last flip
				//$('.card-container > .front').css('display','none');
				$back.clone().appendTo('.card-container');  // Copy back of small card to larger card

				//Safari Only - BN 06/21/2016
				if ( $isSafari == true) {
					$('#solutions').find('.front').css('display','none');
				}


				$this
					.closest('.card-container')
					.addClass('flipped')
					.velocity({ rotateY : ['-180deg', '0deg'], scale: 0.92 }, 600, [0,1.03,0.68,1.22]);

			}
			else if ( !$this.hasClass('flipped') && $window.width() >= 480 ){
				$this.addClass('flipped');
				$this.find('.flipper').velocity({ rotateY : ['-180deg', '0deg'], scale: 1 }, 600, [0,1.03,0.68,1.22]);


				//Safari Only - BN 06/21/2016
				if ( $isSafari == true) {
					$this.find('.front').css('display','none');
				}

				// Additional Animation
				backSide( $(this).find('.back') );

			}

			function backSide($this){

				$this.find('.overflow').velocity({ scale: [1, 1.02], left : ['0', '110%'] }, 600, [0,1.03,0.60,1.22]);
				$this.find('i').velocity({ left : ['50%', '110%'] }, 600, [0,1.03,0.60,1.22]);

			}

		});

		// Flip Back

		$('section#solutions').on('click', '.flipped', function(){

			var $this = $(this);

			if ( flipped && $window.width() < 480 ){
				flipped = null;
				//Safari Only - BN 06/21/2016
				if ( $isSafari == true) {
					$this.find('.front').css('display','block');
				}
				$this.removeClass('flipped').velocity({ rotateY : '0deg', scale: 1 }, 600, [0.08,0.4,0,1]);
			}
			else if ( $window.width() >= 480 ){
				$this.removeClass('flipped').find('.flipper').velocity({ rotateY : '0deg', scale: 1 }, 600, [0.08,0.4,0,1]);

				//Safari Only - BN 06/21/2016
				if ( $isSafari == true) {
					$this.find('.front').css('display','block');
				}
			}

		});

	},
	values: function(){

		$('article.values').on('touchstart', '.click-wrapper', function(){

			var $this  = $(this);
			// Push Button In
			$this.velocity({ scale : 0.96 }, 200);

		});

		$('article.values').on('touchend', '.click-wrapper', function(){

			var $this  = $(this);
			// Push Button In
			$this.velocity({ scale : 1 }, 200);

		});

		$('article.values').on('click', '.content', function(){

			about.value_toggle($(this));

		});

	},
	value_toggle: function($this){
		if ( $window.width() < 480 ){

			if ( !$this.hasClass('active') && !$this.hasClass('tapped') ){

				// Handle Classes and Animate Heading
				$this.addClass('active tapped').find('h2')
					.velocity({ translateY: ['-150px', '50%'] }, 800, [0.08,0.4,0,1]);

				// Move Paragraph
				$this.find('p')
					.velocity({ translateY: ['-50%', '160%'] }, 800, [0.08,0.4,0,1]);

				// Move arrows and handle 'Tapped' class
				$this.find('i.icon-nav-open-arrow').velocity({ bottom: -80 }, 400, [0.08,0.4,0,1], function(){
					$this.find('i.icon-nav-close-arrow').velocity({ top: -10 }, 400, [0.08,0.4,0,1], function(){
						$this.removeClass('tapped');
					});
				});

			}
			else if ( $this.hasClass('active')  && !$this.hasClass('tapped') ){

				// Handle Classes and Animate Paragraph
				$this.addClass('tapped').removeClass('active').find('p')
					.velocity({ translateY: '160%' }, 800, [0.08,0.4,0,1]);

				// Move Heading
				$this.find('h2')
					.velocity({ translateY: ['-50%', '-1000%'] }, 800, [0.08,0.4,0,1]);

				// Move arrows and handle 'Tapped' class
				$this.find('i.icon-nav-close-arrow').velocity({ top: -80 }, 400, [0.08,0.4,0,1], function(){
					$this.find('i.icon-nav-open-arrow').velocity({ bottom: 20 }, 400, [0.08,0.4,0,1], function(){
						$this.removeClass('tapped');
					});
				});

			}


		}
	},
	reset_cards: function(){
		$('.card-container > .back').remove();		// Remove any large card backs from last flip
		$('section#solutions .card').velocity({ scale : 1 }, 300, [0,1.03,0.68,1.22]);
		$('.card-container.flipped').removeClass('flipped').velocity({ rotateY : '0deg', scale: 1 }, 600, [0.08,0.4,0,1]);
		$('.card.flipped').removeClass('flipped').find('.flipper').velocity({ rotateY : '0deg', scale: 1 }, 600, [0.08,0.4,0,1]);
	},
	reset_diamonds: function(){
		$('section#statement aside.value').removeAttr('style');
		if ( $window.width() >= 480 ){
			$('section#statement aside *').removeAttr('style');
			$('section#statement aside .content').removeClass('active');
		}
	},
	mySwiper: null,
	people: function(){

		var view	= 1,
			column 	= 1;

		if ( $window.width() >= 480 && $window.width() < 769 ){
			view 	= 'auto';
			column 	= 2;
		}
		else if ( $window.width() >= 769 && $window.width() < 1024){
			view 	= 2;
			column 	= 2;
		}
		else if ( $window.width() >= 1024 && $window.width() < 1440 ){
			view 	= 3;
			column 	= 2;
		}
		else if ( $window.width() >= 1440 ){
			view 	= 4;
			column 	= 2;
		}

		about.mySwiper = new Swiper ('.people-container', {
			// Controllers
			keyboardControl: true,
			prevButton: 'i.prev-slide',
			nextButton: 'i.next-slide',

			watchSlidesProgress: true,
			watchSlidesVisibility: true,

			loop: true,
			loopedSlides: 8,

			// Styling
			spaceBetween: 0,
			slidesPerView: view
    	});

	},
	person: function(){

    	$('.people-container article').on('mouseenter click', function(){

	    	var $this = $(this);

			if ( !$this.hasClass('hover')){

		    	$this.addClass('hover');

		    	$this.find('aside').velocity('finish').velocity({  height : '100%' }, 300, [0.645, 0.045, 0.355, 1]);
				$this.find('img').velocity('finish').velocity({ scale : [0.96, 1] }, 300, [0.645, 0.045, 0.355, 1]);
				$this.find('ul.social').velocity('finish').velocity({ translateY : [0, 50] }, 400, [0.19, 1, 0.22, 1]);

				$this.find('.bio').removeAttr('style').show();
				var bioHeight = $this.find('.bio').outerHeight();
				$this.find('.bio').hide();

				$this.find('.bio').velocity('finish').velocity({ height : [bioHeight, 0], translateY: [0, 80], opacity: [1, 0] }, { display: 'block', duration: 800, easing:  [0.19, 1, 0.22, 1] });

			} else {
		    	about.resetPerson();
			}

    	});

    	$('.people-container article').on('mouseleave touchmove touchcancel', function(){
	    	about.resetPerson();
    	});

	},
	resetPerson: function(){

		var $this = $('article.hover');

		$this.removeClass('hover');
    	$this.find('aside, img, ul.social').velocity('reverse');

    	$this.find('.bio').velocity('finish').velocity({ height : 0, translateY: 80, opacity: 0 }, { display: 'none' }, 200, [0.19, 1, 0.22, 1]);

	}
};
// Technology Page
technology = {
	init: function(){
		technology.categories();
	},
	categories: function(){

		$('nav.categories h3').on('click', function(){

			var $this = $(this),
				$nav  = $('nav.categories'),
				i = 0;

			if ( clicked === false && $window.width() <= 768 ){

				clicked = true;

				if ( !$this.hasClass('active') ){

					// Get nav height
					$nav.find('ul').show();
					  var height = $nav.find('ul').height();
					  $nav.find('ul').css({ 'height' : 0 });

					$this.addClass('active');

					// Animate Nav
					$nav.find('ul').velocity({ 'height' : height }, 300, function(){ clicked = false; });

					// Animate elements with a delay
					$nav.find('li').each(function(){
						$(this).delay(80*i).velocity({ 'opacity' : [1, 0], 'translateY' : [0, 20] }, 300, 'ease');
						i++;
					});

				} else {

					$this.removeClass('active');

					$nav.find('ul').velocity({ 'height' : 0 }, 300, function(){
						clicked = false;
						$nav.find('ul').hide().removeAttr('style');
						$nav.find('li').removeAttr('style');
					});

				}

			}

		});

		$('nav.categories h3').on('touchstart', function(){
			var $this = $(this);

			$this.velocity({ 'scale' : 0.95 }, 150);
			$this.addClass('arrowOut');

		});
		$('nav.categories h3').on('touchend', function(){
			var $this = $(this);

			$this.velocity({ 'scale' : 1 }, 150);
			$this.removeClass('arrowOut');
			$this.addClass('arrowIn');
		});

	}
};
// Product Grid
products = {
	init: function(){

		global.images('section.products article');
		products.product();
		products.display();

		$('section.products .product').matchHeight(); // Fixes bug where percentage based heights hides bottom border ¯\_(ツ)_/¯

		// Debounce Resize
		function resizePage() {

			global.images('section.products article');

		}
		$window.resize($.debounce(200, resizePage));
	},
	product: function(){

		$('.products').on('touchstart', '.product', function(){
			if ( !$(this).hasClass('no-link') ){
				$this = $(this);
				$this.find('a').velocity({ 'scale' : 0.98 }, 100);
			}
		});

		$('.products').on('touchend', '.product', function(){
			$this = $(this);
			$this.find('a').velocity({ 'scale' : 1 }, 100);
		});

		$('.products').on('mouseenter', '.product', function(){
			if ( !$(this).hasClass('no-link') ){
				$this = $(this);
				$this.find('a').velocity({ 'scale' : 0.95 }, [ 300, 18 ]);
			}
		});

		$('.products').on('mouseleave', '.product', function(){
			$this = $(this);
			$this.find('a').velocity({ 'scale' : 1 }, 100);
		});

	},
	display: function(){

		var i = 0;

		$('.product.preload').each(function(){
			$(this).delay(120*i).velocity({ 'opacity' : [1, 0], 'scale' : [1, 0.9]}, 300, 'ease', function(){
				$(this).removeClass('preload');
			});
			i++;
		});

	}
};
product = {
	init: function(){

		$('section.info > *').matchHeight();
		product.video();

	},
	video: function(){

		$('a.launch-video').on('click', function(e){

			e.preventDefault();

			var $this 		= $(this),
				service 	= $this.data('service'),
				vidID		= $this.data('id'),
				vid_height 	= null,
				embed 		= null;

			if ( !$this.hasClass('disabled') ){

				$this.addClass('disabled');

				if ( service == 'youtube' ){
					embed = '<iframe src="https://www.youtube.com/embed/'+ vidID +'?rel=0&amp;showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen autoplay></iframe>';
				}
				else if ( service == 'vimeo' ){
					embed = '<iframe src="https://player.vimeo.com/video/'+ vidID +'?autoplay=1&color=006db6&title=0&byline=0&portrait=0&badge=0" width="500" height="245" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
				}

				  /* Get video height */
				  $('section.video').show();
				  vid_height = ( $('.video-container').width() * 0.5625 );
				  $('section.video').removeAttr('style');

				  console.log(vid_height);

				$('section.video').addClass('open').find('.video-container').velocity({ 'height' : [vid_height, 0] }, 200);
				$('section.video .video-container').append(embed).velocity({ 'opacity' : 1 }, 300, function(){ $('section.video').removeAttr('style'); });

				$('html,body').animate({
				   scrollTop: $('section.video').offset().top -90
				}, 800);
			}

		});

		$('section.video .close').on('click', function(){
			$('section.video').velocity({ 'height' : 0 }, 300, function(){
				$('section.video').removeClass('open').removeAttr('style');
				$('section.info a.disabled').removeClass('disabled');
			});
			$('section.video .video-container').empty().removeAttr('style');
		});

	}
};
client = {
	init: function(){
		global.images('section.products article');
	}
};
locations = {
	init: function(){

		global.images('section#locations article');

		$('section#locations article > *').matchHeight();

		// Debounce Resize
		function resizePage() {

			global.images('section#locations article');

		}
		$window.resize($.debounce(200, resizePage));
	}
};
careers = {
	init: function(){
		careers.stories();
		$('section#stories aside .container').matchHeight({ byRow: false});
	},
	stories: function(){
		$('section#stories aside a').on('mouseenter touchstart', function(){

			var $this = $(this);

			$this.find('.container').velocity({
				left: -45
			},{
				duration: 200,
				easing: [0,0.84,0.61,0.98]
			});
			$this.find('.container > *').velocity({
				translateX: 35
			},{
				duration: 200,
				easing: [0,0.84,0.61,0.98]
			});

		});
		$('section#stories aside a').on('mouseleave touchend', function(){

			var $this = $(this);

			$this.find('.container, .container > *').velocity('stop').velocity('reverse');

		});
	},
	story: function(){

		bannerHeight(true);

		// Resize Page
    	function resizePage() {
	    	bannerHeight();
	    }
	    $window.resize($.debounce(150, resizePage));

		function bannerHeight(init){
			var getHeight = $window.width()*0.35,
				height 	  = Math.round(getHeight);

			if ( init === true ){
				$('section.banner').css({ 'height' : height });
			} else {
				$('section.banner').velocity({ 'height' : height });
			}


		}

	}
};

// cheet('↑ ↑ ↓ ↓ ← → ← → b a', function () {
cheet('↑ ↑ ↓ ↓ ← → ← → b a', function () {
	if ( cheet_playing === false && $('body.page-template-page-lob').length ){
		cheet_playing = true;
		konami.init();
	}
});
konami = {

	init: function(){

		nav.collapse();
		$('#lasers').remove();

		/*jshint multistr: true */
		var html = '<section id="special" style="opacity:0">\
						<aside id="lasers">\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
							<div class="laser ready"><span></span></div>\
						</aside>\
						<header></header>\
						<p class="light disclaimer" style="display:none">Disclaimer: Safari doesn\'t support lasers like Chrome or Firefox does. Get a better show on Chrome!</p>\
					</section>',
		audioElement = document.createElement('audio');
		audioElement.setAttribute('src', '/wp-content/themes/lmg/js/You_There.mp3');

		audioElement.currentTime = 155;

		$('body').append(html);
		$('body').find('#special').velocity({ opacity: 1 }, 800);
		$('body').addClass('lock');

		var count  = $('.laser').length,
			dist   = (135 / count),
			colors = Array('red','green','DeepPink','BlueViolet','blue', 'cyan' ),
			dancer = new Dancer();

		var i = 1;
		$('.laser').each(function(i){

			$(this).find('span').css({ 'transform' : 'rotateZ('+ (-67.5 + (i*dist)) +'deg)' });
			i++;

		});


		// Safari has a bug that doesn't support createMediaElementSource so we're not loading this in safari
		if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {

			// not going to do anything
			dancer.load( audioElement ); // And finally, lets pass in our Audio element to load
			dancer.play();

			$('.disclaimer').show();

			(function(){

			    var randomElements = null;

				if ( $('.flash').length ){
					var direction = Math.floor((Math.random()* 2 )),
						$flash	  = null;

					if ( direction === 0 ){
						$flash = $('.flash').next();
					} else {
						$flash = $('.flash').prev();
					}
				} else {
					randomElements = $('#lasers .ready').get().sort(function(){
					  return Math.round(Math.random())-0.2;
					}).slice(0,2);
				}

				var color = colors[Math.floor(Math.random()*colors.length)];
				$('#lasers .laser span').css({ 'background' : color, 'box-shadow': '1px 1px 10px '+ color });

				$(randomElements).addClass('flash').removeClass('ready').delay(50).queue(function(next){
					$(this).removeClass('flash').addClass('ready');
					next();
				});
			    setTimeout(arguments.callee, 200);
			})();

		} else {

			var	sequence = dancer.createKick({
					decay: 0.1,
					threshold: 0.05,
					frequency: [1, 8],
					onKick: function ( mag ) {

						var randomElements = null;

						if ( $('.flash').length ){
							var direction = Math.floor((Math.random()* 2 )),
								$flash	  = null;

							if ( direction === 0 ){
								$flash = $('.flash').next();
							} else {
								$flash = $('.flash').prev();
							}
						} else {
							randomElements = $('#lasers .ready').get().sort(function(){
							  return Math.round(Math.random())-0.2;
							}).slice(0,2);
						}

						$(randomElements).addClass('flash').removeClass('ready').delay(mag*250).queue(function(next){
							$(this).removeClass('flash').addClass('ready');
							next();
						});
					}
				}),
				blink = dancer.createKick({
					decay: 0.1,
					threshold: 0,
					frequency: [0, 10],
					onKick: function ( mag ) {


						var randomElements = $('#lasers .ready').get().sort(function(){
							  return Math.round(Math.random())-0.2;
							}).slice(0,2),
							colors = Array('green','DeepPink','BlueViolet'),
							color  = colors[Math.floor(Math.random()*colors.length)];

						$(randomElements).find('span').css({ 'background' : color, 'box-shadow': '1px 1px 10px '+ color });

						$(randomElements).addClass('flash').removeClass('ready').delay(mag*500).queue(function(next){
							$(this).removeClass('flash').addClass('ready');
							next();
						});
					}
				}),
				sweep = dancer.createKick({
					decay: 0.1,
					threshold: 0.08,
					frequency: [4, 6],
					onKick: function ( mag ) {

						var randomElements = $('#lasers .ready').get().sort(function(){
						  return Math.round(Math.random())-0.3;
						}).slice(0,3);

						$(randomElements).removeClass('ready').velocity({ opacity: 1 }, { duration: mag*2500, complete: function(){
							$(this).velocity({ opacity: 0 }, { duration: mag*2500, complete: function(){
								$(this).addClass('ready');
							} });
						} } );
					}
				}),
				kick = dancer.createKick({
					frequency: [0, 2],
					threshold: 0,
					decay: 0.5,
					onKick: function ( mag ) {
						$('#special header').css({ 'opacity' : ( mag * 1.3) });
					},
					offKick: function ( mag ) {

						$('#special header').css({ 'opacity' : 0.2 });
					}
				}),
				color = dancer.createKick({
					frequency: [5, 10],
					threshold: 0.1,
					decay: 0.5,
					onKick: function ( mag ) {
						var color = colors[Math.floor(Math.random()*colors.length)];
						$('#lasers .laser span').css({ 'background' : color, 'box-shadow': '1px 1px 10px '+ color });
					}
				}),
				logo = dancer.createKick({
					frequency: [5, 10],
					threshold: 0,
					decay: 0.5,
					onKick: function ( mag ) {
						$('.banner .logo').css({'display' : 'block', 'transform' : 'scale('+( 1 + mag )+')' });
					},
					offKick: function ( mag ) {

						$('.banner .logo').css({ 'scale' : (1) });
					}
				});

			// Let's turn this kick on right away
			sequence.on();
			kick.on();
			logo.on();
			color.on();

			dancer.onceAt( 217, function() {
				sequence.off();
				sweep.on();
				color.off();
			}).onceAt(263, function(){
				blink.on();
			}).onceAt(283, function(){
				sweep.off();
			}).onceAt(285, function(){
				sequence.on();
				color.on();
				sweep.off();
				blink.off();
			}).onceAt(405, function(){
				// kill it
				$('#special').velocity({ opacity: 0 }, { duration: 800, complete: function(){ $('#special').remove(); cheet_playing = false; $('body').removeClass('lock'); } });
			}).load( audioElement );
			dancer.play();

		}

	}

};
