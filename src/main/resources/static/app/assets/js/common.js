/**
 * @version v1.1.6
 * @build 2-18-2017
 * @package nowadays - One/Multi Page Multipurpose Creative HTML5 Template
 * @author  Pavel Marhaunichy <onebelarussianguy@gmail.com>
 * @license SEE LICENSE IN http://themeforest.net/licenses
 * @website http://likeaprothemes.com
 */

(function ($) {
	'use strict';

	/**
	 * Globals
	 */
	var _scroll,
		vpWidth,
		vpHeight,
		docHeight,
		isOnePage,
		isMultiPage,
		isAsideMenuPage,
		isAsideMenuPageMenuHidden,
		isStickyMenu,
		isStickyMenuRelative,
		$body = $('body'),
		body = document.documentElement || document.body,
		equalCols = document.querySelectorAll('.equal-cols'),
		equalColsContainer,
		$portfolioMasonry = $('.portfolio-masonry'),
		$blogMasonry = $('.s-blog-masonry');



	//raf polyfill
	(function () {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
						callback(currTime + timeToCall);
					},
					timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
	}());


	//performance.now() polyfill
	(function () {
		if (!window.performance) {
			window.performance = {};
		}

		Date.now = (Date.now || function () { // thanks IE8
			return new Date().getTime();
		});

		if (!window.performance.now) {

			var nowOffset = Date.now();

			if (performance.timing && performance.timing.navigationStart) {
				nowOffset = performance.timing.navigationStart
			}

			window.performance.now = function now() {
				return Date.now() - nowOffset;
			}
		}
	}());



	/**
	 * Show content with fadeIn effect
	 * @author Pavel Marhaunichy
	 * @param {number}   [timer=800] Duration of fadeIn effect
	 * @param {function} callback    Callback function
	 */
	function showContent(timer, callback) {
		var timer = timer || 800,
			$preloaderParts = $('.p-preloader__top, .p-preloader__bottom');

		//in case if preload is turned OFF
		if (!$preloaderParts.length) {
			callback();
			return;
		}

		$preloaderParts.smoothAnimate({
			height: ['50%', 0]
		}, {
			duration: timer,
			complete: callback
		});
	}


	$.browser = {
		webkit: /WebKit/i.test(navigator.userAgent),
		mobile: /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i.test(navigator.userAgent),
		ie: /Trident/i.test(navigator.userAgent),
		safari: /Safari/i.test(navigator.userAgent),
		loc: location.host
	}

	$.platform = {
		mac: navigator.platform.toLowerCase().indexOf('mac') !== -1,
		android: /(android)/i.test(navigator.userAgent),
		ios: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
	}

	$.supp = {
		cssTransform3d: null,
		cssTransform2d: null,
		cssFilter: null,
		transitionEnd: null,
		transition: null,
		animationEnd: null,
		animation: null,

		init: function () {
			this.el = document.getElementsByTagName('body')[0];
			this.cssFilterCheck();
			this.css3dTransformCheck();
			this.transitionCheck();
			this.animationCheck();
		},

		cssFilterCheck: function () {
			var filters = {
				'webkitFilter': '-webkit-filter',
				'filter': 'filter'
			}

			for (var f in filters) {
				this.el.style[f] = 'grayscale(0)';
				var value = getComputedStyle(this.el)[f];
				if (value !== undefined && value !== null && value !== 'none' && value.length) this.cssFilter = f;
				this.el.style.removeProperty(filters[f]);
			}
		},

		css3dTransformCheck: function () {
			var transforms = {
				'webkitTransform': '-webkit-transform',
				'msTransform': '-ms-transform',
				'transform': 'transform'
			};

			for (var t in transforms) {
				this.el.style[t] = 'translate3d(1px, 1px, 1px)';
				var value = getComputedStyle(this.el).getPropertyValue(transforms[t]);
				if (value !== undefined && value !== null && value !== 'none' && value.length) {
					this.cssTransform3d = t;
				} else {
					this.el.style[t] = 'translate(1px, 1px)';
					var value = getComputedStyle(this.el).getPropertyValue(transforms[t]);
					if (value !== undefined && value !== null && value !== 'none' && value.length) this.cssTransform2d = t;
				}
				this.el.style.removeProperty(transforms[t]);
			}
		},

		transitionCheck: function () {
			var transitions = {
				'WebkitTransition': 'webkitTransitionEnd',
				'transition': 'transitionend' // IE10
			};

			for (var t in transitions) {
				if (this.el.style[t] !== undefined) {
					this.transitionEnd = transitions[t];
					this.transition = t;
				}
			}
		},

		animationCheck: function () {
			var animations = {
				'WebkitAnimation': 'webkitAnimationEnd',
				'animation': 'animationend' // IE10
			}

			for (var a in animations) {
				if (this.el.style[a] !== undefined) {
					this.animationEnd = animations[a];
					this.animation = a;
				}
			}
		}
	}
	$.supp.init();



	/**
	 * Get viewport dimensions
	 * @author Pavel Marhaunichy
	 * @returns {object} Returns width and height considering scrollbar
	 */
	function viewport() {
		var w = window,
			i = 'inner';
		if (!('innerWidth' in window)) {
			w = body;
			i = 'client';
		}

		vpWidth = w[i + 'Width'];
		vpHeight = w[i + 'Height'];

		return {
			width: vpWidth,
			height: vpHeight
		};
	}
	viewport();



	/**
	 * _scroll variable always contains current scroll position
	 * @author Pavel Marhaunichy
	 */
	function getCurrentScroll() {
		_scroll = document.documentElement.scrollTop || document.body.scrollTop;
	}
	getCurrentScroll();

	function getDocHeight() {
		docHeight = $(document).height();
	}
	getDocHeight();

	/**
	 * Round numbers
	 * @author Pavel Marhaunichy
	 * @param   {number} number Number
	 * @returns {number} Returns rounded number
	 */
	function trueRound(number) {
		return number > 0 && number < 1 ? 0 : Math.ceil(number);
	}

	/**
	 * Check if this is onepage
	 * OR multipage
	 * OR other pages
	 * @author Pavel Marhaunichy
	 */
	function isPage() {
		if ($body.hasClass('p-onepage')) return isOnePage = true;
		if ($body.hasClass('p-multipage')) return isMultiPage = true;
	}
	isPage();

	function isSideMenuPage() {
		if ($body.hasClass('p-asidemenupage')) {
			isAsideMenuPage = true;

			if ($body.hasClass('menu-mobile-hidden')) {
				isAsideMenuPageMenuHidden = true;
			}
		}
	}
	isSideMenuPage();

	/**
	 * Check if device has pretty small resolution
	 * @author Pavel Marhaunichy
	 * @returns {boolean} Returns true/undefined
	 */
	function isSmallScreen() {
		if (vpWidth < 768) return true;
	}

	/**
	 * Check if device works on iOS
	 * @author Pavel Marhaunichy
	 */
	function isiOS() {
		if (!$.platform.ios) return;
		$body.addClass('ios-device');
		//for portfolio it wasn't enough, so one more hack
		var portfolio = document.getElementById('portfolio');
		if (portfolio) portfolio.onclick = function () {};
	}
	isiOS();

	/**
	 * Check if sticky menu enabled
	 * @author Pavel Marhaunichy
	 */
	function isSticky() {
		if ($body.hasClass('sticky-header')) return isStickyMenu = true;
	}
	isSticky();

	/**
	 * Check if sticky menu relative position (not very top)
	 * @author Pavel Marhaunichy
	 */
	function isStickyRelative() {
		if ($('.header').hasClass('header-sticky-relative')) return isStickyMenuRelative = true;
	}
	isStickyRelative();

	/**
	 * Make a hint browser about our plans to animate anything
	 * @author Pavel Marhaunichy
	 * @param {object} el   Element/Elements
	 * @param {string} prop Property that will be changed
	 */
	function addWillChange(el, prop) {
		if (el.length) {
			for (var i = 0; i < el.length; i++) {
				var currVal = el[i].style.willChange;
				if (currVal !== undefined && currVal !== null && currVal.length) el[i].style.willChange = currVal + ', ' + prop;
				else el[i].style.willChange = prop;
			}
		} else {
			var currVal = el.style.willChange;
			if (currVal !== undefined && currVal !== null && currVal.length) el.style.willChange = currVal + ', ' + prop;
			else el.style.willChange = prop;
		}
	}

	/**
	 * Remove will-change after when its not needed anymore
	 * @author Pavel Marhaunichy
	 * @param {object} el Element/Elements
	 */
	function removeWillChange(el) {
		if (el.length) {
			for (var i = 0; i < el.length; i++) {
				el[i].style.removeProperty('will-change');
			}
		} else {
			el.style.removeProperty('will-change');
		}
	}

	/**
	 * Twitter feed function call
	 * ### HOW TO CREATE A VALID ID TO USE: ###
	 * Go to www.twitter.com and sign in as normal, go to your settings page.
	 * Go to "Widgets" on the left hand side.
	 * Create a new widget for what you need eg "user time line" or "search" etc.
	 * Feel free to check "exclude replies" if you don't want replies in results.
	 * Now go back to settings page, and then go back to widgets page and
	 * you should see the widget you just created. Click edit.
	 * Look at the URL in your web browser, you will see a long number like this:
	 * 345735908357048478
	 * Use this as your ID below instead!
	 */

	function twitterWidget() {

		/**
		 * Vertical twitter feed
		 */
		var footerTwitterFeedVertical = document.getElementById('footer-twitter-feed-vertical__list');

		if (footerTwitterFeedVertical !== null) {
			var configTwitterVertical = {
				'id': footerTwitterFeedVertical.getAttribute('data-twitter-id'), // <- your twitter ID frim data-attribute here
				'domId': 'footer-twitter-feed-vertical__list',
				'maxTweets': +footerTwitterFeedVertical.getAttribute('data-twitter-max-tweets') || 3,
				'enableLinks': true,
				'showPermalinks': false,
				'showUser': false,
				'showTime': false,
				'dateFunction': '',
				'showInteraction': false,
				'customCallback': function (tweets) {
					var html = '';
					for (var i = 0; i < tweets.length; i++) {
						html += '<li class="footer-twitter-feed-vertical__item ico-119">' + tweets[i] + '</li>';
					}
					footerTwitterFeedVertical.innerHTML = html;
				}
			};

			twitterFetcher.fetch(configTwitterVertical);

			(function tweetsIsReady() {
				setTimeout(function () {
					if ($('.footer-twitter-feed-vertical__item').length) {
						//trigger resize
						$(window).trigger('resize');
					} else {
						tweetsIsReady();
					}
				}, 100);
			}());
		}
	}

	/**
	 * Check if image is loaded
	 * @author Pavel Marhaunichy
	 * @param {Object}   el       Element
	 * @param {Function} callback Callback function when image is done
	 */
	function imgLoaded(el, callback) {
		//nothing to load, so okay
		if (!$(el).length) {
			done();
			return false;
		}

		if (el.tagName.toLowerCase() === 'img') {
			newImg().src = el.src;
		} else if (getComputedStyle(el).backgroundImage !== 'none' && getComputedStyle(el).backgroundImage !== '') {
			newImg().src = getComputedStyle(el).backgroundImage.replace(/url\(|\)$|"/ig, '');
		} else {
			//even not image, so okay
			done();
		}

		function newImg() {
			var img = new Image();
			img.onload = function () {
				done();
			}
			img.onerror = function () {
				console.log('something wrong with image: ' + img.src);
				//okay, we've tried at least
				done();
			}
			return img;
		}

		function done() {
			if (callback) callback();
		}
	}

	/**
	 * Check if images are loaded
	 * @author Pavel Marhaunichy
	 * @param {Object}   el       Elements
	 * @param {Function} callback Callback function when all images in colletion are done
	 */
	function imgsLoaded(el, callback) {
		var n = 0;

		//nothing to load, so okay
		if (!$(el).length) {
			if (callback) callback();
			return false;
		}

		for (var i = 0; i < el.length; i++) {

			if (el[i].tagName.toLowerCase() === 'img') {
				var img = new Image();
				img.onload = function () {
					done();
				}
				img.src = el[i].src;

			} else if (getComputedStyle(el[i]).backgroundImage !== 'none' && getComputedStyle(el[i]).backgroundImage !== '') {
				var img = new Image();
				img.onload = function () {
					done();
				}
				img.src = getComputedStyle(el[i]).backgroundImage.replace(/url\(|\)$|"/ig, '');
			} else {
				//even not image, so okay
				done();
			}

		}

		function done() {
			n++;
			if (n === el.length) {
				if (callback) callback();
			}
		}
	}


	/**
	 * Check if HTML5 video is ready
	 * @author Pavel Marhaunichy
	 * @param   {object} el       DOM Element
	 * @param   {function} callback Callback function
	 */
	function videoLoaded(el, callback) {
		//nothing to load, so okay
		if (!$(el).length) {
			if (callback) callback();
			return false;
		}

		//skip for:
		// - if video format doesn't supported
		// - iOS, cuz it doesn't want autoplay
		// - abdroid - just for sure :D
		if (!el.play || $.platform.ios || $.platform.android) {
			done();
			return;
		}

		$(el).find('source').on('error', function () {
			console.error('a video error has occurred');
			done();
		});

		//probably video received from browser cache
		if (el.readyState > 2) {
			done();
			console.log('video readyState:' + el.readyState);
			return;
		}

		//set listener if not
		$(el).on('canplay', function () { //canplaythrough
			done();
			console.log('canplay event fired');
		});


		function done() {
			if (callback) callback();
		}
	}


	/**
	 * Check if HTML5 videos are ready
	 * @author Pavel Marhaunichy
	 * @param   {object}   el       Elements
	 * @param   {function} callback Callback function when all videos are loaded
	 */
	function videosLoaded(el, callback) {
		var n = 0;

		//nothing to load, so okay
		if (!$(el).length) {
			if (callback) callback();
			return false;
		}

		for (var i = 0; i < el.length; i++) {
			//probably video received from browser cache
			if (el[i].readyState > 3) {
				done();
			} else {
				//set listener if not
				$(el[i]).on('canplay', function () {
					done();
				});
			}
		}

		function done() {
			n++;
			if (n === el.length) {
				if (callback) callback();
			}
		}
	}




	//Main page
	function onePage() {

		/**
		 * Main 1 slider
		 */
		var $mainSlider1 = $('.slide-like-a-pro');
		if ($mainSlider1.length) mainSlider1();

		function mainSlider1() {
			$mainSlider1.slideLikeAPro();
		}


		/**
		 * Main 5 slider
		 */
		var $mainSlider5 = $('.main-5-slider');
		if ($mainSlider5.length) mainSlider5();

		function mainSlider5() {

			var $text = $('.main-5-slider-text__subtitle'),
				$text1,
				$text2,
				showArrow = false;

			$mainSlider5.on('initialized.owl.carousel changed.owl.carousel', function (e) {

				var current = e.page.index,
					$this = $('.main-5-slider-text').eq(current);

				$text1 = $this.find('.main-5-slider-text__title');
				$text2 = $this.find('.main-5-slider-text__subtitle');

				if (current < 0) current = 0;

				if (current === 0) {
					$text1.removeClass('hidden').delay(800).animate({
						width: '100%'
					}, 1800, function () {
						writeText();
					});
				}

				//show arrow
				if (current + 1 === e.page.count && !showArrow) {
					setTimeout(function () {
						document.querySelector('.section-arrow').style.display = 'block';
					}, 1500);
					showArrow = true;
				}
			});

			function writeText() {
				$text2.removeClass('hidden').animate({
					width: '100%'
				}, 1200);
			}

			function eraseText() {
				$text.stop(true).animate({
					width: 0
				}, 600, function () {
					$(this).addClass('hidden');
					writeText();
				});
			}

			$mainSlider5.owlCarousel({
				loop: false,
				autoplay: true, //default false
				video: false, //default false
				items: 1,
				smartSpeed: 700,
				nav: false, //default false
				dots: true, //default true
				dotsClass: 'main-5-slider-dots',
				dotClass: 'main-5-slider-dots__dot',
				controlsClass: 'main-5-slider-controls',
				autoplayTimeout: 4000,
				onChange: eraseText,
				URLhashListener: false //default false

			});
		}


		/**
		 * Portfolio masonry style init
		 */
		$portfolioMasonry.isotope({
			itemSelector: '.portfolio-item',
			columnWidth: '.portfolio-item:last-child'
		});

		//set handler to every image
		//to prevent problem with overlaping masonry items
		$portfolioMasonry.find('.portfolio-item__img').on('load', function () {
			$portfolioMasonry.isotope('layout');
		});


		/**
		 * Blog section masonry style init
		 */
		$blogMasonry.isotope({
			itemSelector: '.s-blog-post',
			columnWidth: '.s-blog-post'
		});
		
		
		/**
		 * Portfolio filter
		 */
		var filterElem = document.querySelector('.portfolio-filter'),
			$porfolioCategories = $portfolioMasonry.find('[data-category]'),
			porfolioCategories = {};

		//filter unique categories
		$porfolioCategories.each(function () {
			var category = this.getAttribute('data-category');

			$(this).addClass('portfolio-filter-' + category.replace(' ', '-'));

			if (!porfolioCategories[category])
				porfolioCategories[category] = category;
		});

		//and append these elements to filterElem
		for (var porfolioCategory in porfolioCategories) {
			if (porfolioCategories.hasOwnProperty(porfolioCategory)) {
				var filterItem = $('<span class="portfolio-filter__item" data-filter=".portfolio-filter-' + porfolioCategory.replace(' ', '-') + '">' + porfolioCategory + '</span>');
				$(filterElem).append(filterItem);
			}
		};


		if (filterElem) {
			filterElem.addEventListener('click', function (event) {

				// only work with buttons
				if (!matchesSelector(event.target, '.portfolio-filter__item')) {
					return;
				}

				//trigger resize
				$(window).trigger('resize');

				var filterValue = event.target.getAttribute('data-filter');
				// use matching filter function
				$portfolioMasonry.isotope({
					filter: filterValue
				}, false);
			});

			// change is-checked class on buttons
			setClasses(filterElem);

			function setClasses(buttonGroup) {
				buttonGroup.addEventListener('click', function (event) {
					// only work with buttons
					if (!matchesSelector(event.target, '.portfolio-filter__item')) {
						return;
					}
					buttonGroup.querySelector('.portfolio-filter__item_active').classList.remove('portfolio-filter__item_active');
					event.target.classList.add('portfolio-filter__item_active');
				});
			}

		}		
		
		
		/**
		 * Portfolio carousel
		 */
		var $portfolioCarousel = $('.portfolio-carousel');
		if ($portfolioCarousel.length) {
			var items = $portfolioCarousel.attr('data-portfolio-carousel-items');
			$portfolioCarousel.owlCarousel({
				loop: false,
				nav: false,
				dots: false,
				margin: 0,
				responsive: {
					0: {
						items: 1
					},
					480: {
						items: 2
					},
					768: {
						items: items >= 3 ? 3 : items
					},
					992: {
						items: items >= 4 ? 4 : items
					},
					1200: {
						items: items
					}
				},
				onInitialized: function () {
					//fix width in IE
					this.$stage[0].style.width = Math.ceil(this.$stage[0].offsetWidth) + 1 + 'px';
				},
				onResized: function () {
					//for sure (required)
					$(window).resize();
					this.$stage[0].style.width = Math.ceil(this.$stage[0].offsetWidth) + 1 + 'px';
				}
			});
		}


		/**
		 * Skills animation
		 * @author Pavel Marhaunichy
		 */
		var skills = {

			numbersEl: document.getElementsByClassName('counters-item__count'),
			linearBar: document.getElementsByClassName('skills-graph-linear__bar'),
			linearCount: document.getElementsByClassName('skills-graph-linear__count'),
			circleEl: document.getElementsByClassName('skills-graph-circle'),
			circleBar: document.getElementsByClassName('skills-graph-circle__bar'),
			circleCount: document.getElementsByClassName('skills-graph-circle__count'),

			init: function () {

				var _this = this;

				if (_this.numbersEl.length) {
					$(_this.numbersEl).one('animationOnScrollStarted', function () {
						_this.numbers(this, $(_this.numbersEl).index(this));
					});
				}

				if (_this.linearBar.length) {
					//addWillChange(_this.linearBar, 'width');
					//addWillChange(_this.linearCount, 'contents');

					$(_this.linearBar).one('animationOnScrollStarted', function () {
						_this.linear(this, $(_this.linearBar).index(this));
					});
				}

				if (_this.circleBar.length) {
					//addWillChange(_this.circleBar, 'stroke-dashoffset');
					//addWillChange(_this.circleCount, 'contents');

					$(_this.circleEl).one('animationOnScrollStarted', function () {
						_this.circle(this, $(_this.circleEl).index(this));
					});
				}
			},

			numbers: function (bar, i) {

				var countEl = this.numbersEl[i],
					countVal = parseInt(countEl.getAttribute('data-counters-number'), 10),
					units = countEl.getAttribute('data-counters-units') || '',
					duration = countEl.getAttribute('data-counters-duration') || 3600;

				function separateNumber(val) {
					while (/(\d+)(\d{3})/.test(val.toString())) {
						val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
					}
					return val;
				}

				$(bar).smoothAnimate({
					value: [0, countVal]
				}, {
					easing: 'easeOutQuart',
					duration: duration,
					step: function (progress, el, current) {
						countEl.textContent = separateNumber(Math.ceil(current)) + units;
					}
				});


			},

			linear: function (bar, i) {

				var countEl = this.linearCount[i],
					countVal = parseInt(countEl.getAttribute('data-skills-graph-perc'), 10);

				$(bar).smoothAnimate({
					width: [0, countVal + '%']
				}, {
					easing: 'easeInOutQuad',
					duration: countVal * 100 / 6, //or you can set some static value
					step: function (progress, el, current) {
						countEl.textContent = Math.ceil(current);
					},
					complete: function () {
						//removeWillChange(bar);
						//removeWillChange(this.linearBar[i]);
						//removeWillChange(this.linearCount[i]);
					}.bind(this)
				});
			},

			circle: function (bar, i) {

				var progressBar = this.circleBar[i],
					r = progressBar.getAttribute('r'),
					circumference = 2 * Math.PI * r,
					countEl = this.circleCount[i],
					countVal = parseInt(countEl.getAttribute('data-skills-graph-perc'), 10);

				progressBar.style.strokeDasharray = progressBar.style.strokeDashoffset = circumference;

				$(bar).smoothAnimate({
					value: [0, countVal]
				}, {
					easing: 'easeOutBack',
					duration: 3600,
					step: function (progress, el, current) {
						progressBar.style.strokeDashoffset = circumference - (current * circumference / 100);
						countEl.textContent = Math.ceil(current);
					},
					complete: function () {
						//removeWillChange(bar);
						//removeWillChange(this.circleBar[i]);
						//removeWillChange(this.circleCount[i]);
					}.bind(this)
				});
			}
		}
		skills.init();


		//clients carousel
		var $clients = $('.clients');

		if ($clients.length) {

			$clients.one('initialized.owl.carousel', function () {
				$(window).resize();
			});

			//call clients slider
			$clients.owlCarousel({
				loop: true,
				autoplay: true, //default false
				autoplayTimeout: 2000,
				items: 1,
				smartSpeed: 450,
				nav: false, //default false
				dots: true, //default true
				dotsClass: 'clients-dots',
				dotClass: 'clients-dots__dot',
				autoplayHoverPause: true
			});
		}

		//client logos carousel
		var $clientLogos = $('.client-logos-carousel');

		if ($clientLogos.length) {
			//call clients slider
			$clientLogos.owlCarousel({
				loop: true,
				autoplay: true, //default false
				autoplayTimeout: 2000,
				smartSpeed: 450,
				nav: false, //default false
				dots: false, //default true
				autoplayHoverPause: true,
				responsive: {
					0: {
						items: 2
					},
					480: {
						items: 3
					},
					768: {
						items: 4
					},
					992: {
						items: 5
					}
				}
			});
		}

		//Tooltip from ALT tag
		var tooltipForElems = document.getElementsByClassName('tooltip-alt'),
			tooltipEl = document.getElementsByClassName('tooltip');

		$(tooltipForElems)
			.hover(function () {
					var el = this,
						rect = el.getBoundingClientRect(),
						posX = rect.left + rect.width / 2,
						posY = rect.top - rect.height / 2,
						text = el.getAttribute('alt'),
						tooltip = document.createElement('div');

					tooltip.className = 'tooltip';

					var newTooltip = document.body.appendChild(tooltip);
					newTooltip.style.display = 'block';
					newTooltip.style.top = posY - parseInt(getComputedStyle(newTooltip).height, 10) / 2 + 'px';
					newTooltip.style.left = posX - parseInt(getComputedStyle(newTooltip).width, 10) / 2 + 'px';

					newTooltip.innerHTML = text;

					setTimeout(function () {
						try {
							document.body.removeChild(newTooltip);
						} catch (err) {
							return;
						}
					}, 2000);
				},
				function () {
					if (tooltipEl[0] !== undefined) document.body.removeChild(tooltipEl[0]);
				});

	}
	//End of onePage()

	//Other pages
	function isOtherPages() {

		//blog post carousel
		var $blogSlider = $('.blog-slider');

		if ($blogSlider.length) {

			//call blog slider
			$blogSlider.owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				items: 1,
				smartSpeed: 450,
				dots: false,
				nav: true,
				navText: '',
				navClass: ['slider-arrow-prev ico-111', 'slider-arrow-next ico-112'],
				autoplayHoverPause: true
			});

			var $prevArr = $('.slider-arrow-prev'),
				$nextArr = $('.slider-arrow-next');

			$blogSlider
				.mouseenter(function () {
					$prevArr.add($nextArr).addClass('animated');
				})
				.mouseleave(function () {
					$('.slider-arrow-prev, .slider-arrow-next').removeClass('animated');
				});

		}


		/**
		 * Sharing buttons
		 */

		// Facebook Shares Count
		$.getJSON('http://graph.facebook.com/?id=' + location.href + '&callback=?', function (fbdata) {
			$('.post-share__count_fb').attr('data-count-shares', fbdata.shares);
			if (fbdata.shares !== 0) {
				$('.post-share__count_fb').text(fbdata.shares);
			}
		});

		// Twitter Shares Count
		$.getJSON('http://cdn.api.twitter.com/1/urls/count.json?url=' + location.href + '&callback=?', function (twdata) {
			$('.post-share__count_tw').attr('data-count-shares', twdata.count);
			if (twdata.count !== 0) {
				$('.post-share__count_tw').text(twdata.count);
			}
		});

		// LinkedIn Shares Count
		$.getJSON('http://www.linkedin.com/countserv/count/share?url=' + location.href + '&callback=?', function (lndata) {
			$('.post-share__count_li').attr('data-count-shares', lndata.count);
			if (lndata.count !== 0) {
				$('.post-share__count_li').text(lndata.count);
			}
		});

		/*
			// VK Shares count
			window.VK = {
				Share: {
					count: function (index, count) {
						$('.post-share__count_vk').attr('data-count-shares', count);
						if (count !== 0) {
							$('.post-share__count_vk').text(count);
						}
					}
				}
			};
			$.getJSON('http://vk.com/share.php?url=' + location.href + '&act=count&index=1&format=json&callback=?');
		*/

		// Google+ Shares count
		window.services = {
			gplus: {
				cb: function (gpdata) {
					$('.post-share__count_gp').attr('data-count-shares', gpdata);
					if (gpdata !== 0) {
						$('.post-share__count_gp').text(gpdata);
					}
				}
			}
		};
		$.getJSON('http://share.yandex.ru/gpp.xml?url=' + location.href + '&callback=?');

		var Sharing = {
			go: function (_element, _options) {
				var link,
					self = Sharing,
					options = $.extend({
						type: 'fb',
						url: location.href,
						title: document.title,
						image: $('.post__img').attr('src'),
						text: $('.post-content').text()
					}, $(_element).data(), _options);

				if (self.popup(link = self[options.type](options)) === null) {
					if ($(_element).is('a')) {
						$(_element).prop('href', link);
						return true;
					} else {
						location.href = link;
						return false;
					}
				} else {
					return false;
				}
			},

			/*
			// VK
			vk: function (_options) {
						var curNum = $('.post-share__count_vk').attr('data-count-shares'),
							newNum = Number(curNum) + 1;
						if (newNum == newNum) { //NaN check
							$('.post-share__count_vk').text(newNum);
						}
						var options = $.extend({
							url: location.href,
							title: document.title,
							image: '',
							text: ''
						}, _options);

						return 'http://vk.com/share.php?' + 'url=' + encodeURIComponent(options.url) + '&title=' + encodeURIComponent(options.title) + '&description=' + encodeURIComponent(options.text) + '&image=' + encodeURIComponent(options.image) + '&noparse=true';
					},
			*/

			// Facebook
			fb: function (_options) {
				var curNum = $('.post-share__count_fb').attr('data-count-shares'),
					newNum = Number(curNum) + 1;
				if (newNum == newNum) {
					$('.post-share__count_fb').text(newNum);
				}
				var options = $.extend({
					url: location.href,
					title: document.title,
					image: '',
					text: ''
				}, _options);
				return 'https://www.facebook.com/sharer/sharer.php' + '?u=' + encodeURIComponent(options.url) + '&t=' + encodeURIComponent(options.title);
			},

			// Twitter
			tw: function (_options) {
				var curNum = $('.post-share__count_tw').attr('data-count-shares'),
					newNum = Number(curNum) + 1;
				if (newNum == newNum) {
					$('.post-share__count_tw').text(newNum);
				}
				var options = $.extend({
					url: location.href,
					title: document.title,
					image: ''
				}, _options);

				return 'http://twitter.com/intent/tweet' + '?text=' + encodeURIComponent(options.title) + '&url=' + encodeURIComponent(options.url)
			},

			//LinkedIn
			li: function (_options) {
				var curNum = $('.post-share__count_li').attr('data-count-shares'),
					newNum = Number(curNum) + 1;
				if (newNum == newNum) {
					$('.post-share__count_li').text(newNum);
				}
				var options = $.extend({
					url: location.href,
					title: document.title,
					image: '',
					text: ''
				}, _options);

				return 'http://www.linkedin.com/shareArticle?mini=true' + '&url=' + encodeURIComponent(options.url) + '&title=' + encodeURIComponent(options.title) + '&summary=' + encodeURIComponent(options.title) + '&source=' + encodeURIComponent(options.image);
			},

			// Google+
			gp: function (_options) {
				var curNum = $('.post-share__count_gp').attr('data-count-shares'),
					newNum = Number(curNum) + 1;
				if (newNum == newNum) {
					$('.post-share__count_gp').text(newNum);
				}
				var options = $.extend({
					url: location.href
				}, _options);

				return 'https://plus.google.com/share?url=' + encodeURIComponent(options.url);
			},


			//Open sharing window
			popup: function (url) {
				return window.open(url, '', 'toolbar=0,status=0,scrollbars=1,width=626,height=436');
			}
		}

		$(document).on('click', '.post-share__item_fb', function () {
			Sharing.go(this, {
				type: 'fb'
			});
		});
		$(document).on('click', '.post-share__item_tw', function () {
			Sharing.go(this, {
				type: 'tw'
			});
		});
		$(document).on('click', '.post-share__item_gp', function () {
			Sharing.go(this, {
				type: 'gp'
			});
		});
		$(document).on('click', '.post-share__item_li', function () {
			Sharing.go(this, {
				type: 'li'
			});
		});

	}
	//End of isOtherPages()




	/**
	 * Do all work on scroll through requestAnimationFrame
	 * @author Pavel Marhaunichy
	 */
	function rafLoop() {
		requestAnimationFrame(_onscroll);
	}
	window.addEventListener('scroll', rafLoop, false);

	/**
	 * Call these functions on scroll event
	 * @author Pavel Marhaunichy
	 */
	function _onscroll() {
		if (!loader.complete) return;

		getCurrentScroll();

		parallax.makeParallax();

		if (isOnePage) scrolling.testForMenuChange();
		scrolling.headerObserve();

	}

	/**
	 * Call these functions on window resize event
	 * @author Pavel Marhaunichy
	 */
	function _onresize() {
		console.log('resize');
		//firstly
		viewport();

		getCurrentScroll(); //in some cases it is very helpful

		menuOnResize();

		getDocHeight();

		parallax.updateOffsets();
		parallax.makeParallax();

		if (animateOnScroll) {
			animateOnScroll.updateOffsets();
			animateOnScroll.makeAnimate();
		}

		if (isOnePage || isMultiPage) scrolling.updateOffsets();

		updateModalSize();

		equalColumns();
	}

	/*
	 * jQuery smart resize
	 */
	(function ($, sr) {
		var debounce = function (func, threshold, execAsap) {
			var timeout;

			return function debounced() {
				var obj = this,
					args = arguments;

				function delayed() {
					if (!execAsap)
						func.apply(obj, args);
					timeout = null;
				};

				if (timeout)
					clearTimeout(timeout);
				else if (execAsap)
					func.apply(obj, args);

				timeout = setTimeout(delayed, threshold || 100);
			};
		}

		$.fn[sr] = function (fn) {
			return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
		};

	})($, 'smartresize');


	$(window).smartresize(function () {
		_onresize();

		if ($portfolioMasonry.length || $blogMasonry.length) {
			//refresh masonry layout, then do our work
			$portfolioMasonry.add($blogMasonry).one('layoutComplete', function () {
				_onresize();
			});
		}
		/* else {
				_onresize();
			}*/
	});



	/**
	 * Scrolling between sections
	 * @author Pavel Marhaunichy
	 */
	var scrolling = {
		anchors: document.querySelectorAll('section, footer'),
		anchorButtons: document.getElementsByClassName('scroll-to'),
		section: [],
		currentSection: null,
		menuItems: document.getElementsByClassName('menu__link'),
		position: _scroll,
		anchor: document.querySelectorAll('.s-portfolio'),
		headerModified: false,

		init: function () {
			//order is important
			//this.prepareAnchors();
			this.makeScrolling();
			if (!isAsideMenuPage && document.querySelector('.header')) {
				this.header = document.querySelector('.header');
				this.headerHeight = isStickyMenu ? document.querySelector('.header').offsetHeight : 0;
				this.updateOffsets();
				this.headerObserve();
			} else {
				this.updateOffsets();
			}
			//this.testForMenuChange();
			if (isOnePage) this.makeMenuObserve();
			//this.scrollToHash();
			if (!$.browser.mobile && !$.platform.mac && /*!$.browser.webkit*/ $body.hasClass('smooth-scroll')) this.custom();
		},

		scrollTo: function (target) {
			if (typeof target === 'number') {
				this.position = target;
			} else if ($(target).length) {
				for (var i = 0; i < this.section.length; i++) {
					if (target === this.section[i].hash) {
						this.position = i === 0 ? this.section[i].top : this.section[i].top + 2; // +2px for sure
						break;
					}
				}
			}

			if (this.position === _scroll) return;

			$body.smoothAnimate({
				scrollTop: this.position
			}, {
				duration: 800, //Math.max(800, Math.abs(_scroll - this.position) * 800 / 1000 * 0.25),
				easing: 'easeOutSine',
				queue: false,
				step: function (progress, el, current) {
					this.position = current;
				}.bind(this),
				complete: function () {
					this.dontChangeMenu = false;
				}.bind(this)
			});
		},

		custom_: function () {
			var step = 3,
				accel = 0,
				start = 0,
				last = 16;

			$(window).on('mousewheel DOMMouseScroll', function (e) {
				e.preventDefault();

				start = Date.now();

				var difference = start - last,
					event = e.originalEvent,
					direction = event.wheelDelta < 0 || event.detail > 0 ? 1 : -1;

				accel += (direction * 50) * step;
				this.position += accel;

				if (difference > 16) this.scrollTo(this.position);

				last = start;

			}.bind(this));
		},

		custom: function () {
			var fricton = 0.95,
				minAccel = 0.1,
				step = 4,
				accel = 0;

			function loop() {
				if (accel < -(minAccel) || accel > minAccel) {
					this.position += accel;
					window.scrollTo(0, Math.round(this.position));
					accel *= fricton;
				} else {
					accel = 0;
				}

				requestAnimationFrame(function () {
					loop.call(scrolling);
				});
			}
			loop.call(this);

			$(window).on('mousewheel DOMMouseScroll', function (e) {
				e.preventDefault();
				var event = e.originalEvent,
					direction = event.wheelDelta < 0 || event.detail > 0 ? 1 : -1;
				this.position = _scroll;
				accel += step * direction;
			}.bind(this));
		},

		test: function () {
			$body.smoothAnimate({
				scrollTop: docHeight
			}, {
				duration: 16000,
				easing: 'easeOutSine',
				step: function (progress, el, current) {
					this.position = Math.ceil(current);
				}.bind(this),
				complete: function () {
					this.dontChangeMenu = false;
				}.bind(this)
			});
		},

		prepareAnchors: function () {
			var button = '<div class="section-arrow ico-110"></div>';
			for (var i = 0; i < this.anchor.length; i++) {
				var el = this.anchor[i];
				this.anchorButtons.push(button);
				$(button).prependTo(el);
			}
		},

		makeScrolling: function () {
			var _this = this;
			$(this.anchorButtons).on('click', function (e) {
				e.preventDefault();
				var target = this.getAttribute('href');
				if (target && target.indexOf('#', 0) === 0) {
					_this.scrollTo(target);
				} else {
					if (_this.currentSection < _this.anchor.length) {
						_this.scrollTo(_this.section[_this.currentSection + 1].hash);
					} else {
						_this.scrollTo(_this.section[0].hash);
					}
				}
			});
		},

		testForMenuChange: function () {
			if (this.dontChangeMenu) return;
			for (var i = 0; i < this.section.length; i++) {
				if (_scroll + vpHeight - this.headerHeight >= this.section[this.section.length - 1].top + this.section[this.section.length - 1].height) {
					this.setMenuActiveItem(this.section.length - 1); // last menu item
				} else if (_scroll >= this.section[i].top && _scroll < this.section[i].top /*- (i === 0 ? this.headerHeight : 0)*/ + this.section[i].height) { // ternary if for 1st section (-header height)
					this.setMenuActiveItem(i);
				}
			}
		},

		makeMenuObserve: function () {
			var _this = this;
			$(_this.menuItems).on('click', function (e) {
				var target = this.getAttribute('href');
				if ($(target).length) e.preventDefault();

				for (var n = 0; n < _this.section.length; n++) {
					if (target === _this.section[n].hash) {
						_this.scrollTo(target);
						_this.setMenuActiveItem(n, true);

						var currentHash = _this.section[n].hash;
						window.location.hash = '!' + currentHash.substr(1);

						break;
					}
				}

				/**
				 * Since 1.0.6
				 * Auto-closing mobile menu when clicked on small screens
				 */
				if (isSmallScreen()) {
					$body.removeClass('menu-mobile-opened');
					//disable social block
					setTimeout(function () {
						$('.menu-mobile-social').remove();
					}, 400); //400ms is MENU CSS transition time
				}
			});
		},

		headerSticky: {
			on: function () {
				$(this.header).addClass('header-sticky header-dark');
				//this.updateOffsets(); //use it only when sticky-header changes height
				this.headerModified = true;

				if (isStickyMenuRelative && !isSmallScreen()) {
					this.header.nextElementSibling.style.marginTop = this.headerHeight + 'px';
				}
			},

			off: function () {
				if (!isSmallScreen()) {
					this.header.style.top = '-' + this.headerHeight + 'px';

					if (isStickyMenuRelative) {
						$(this.header).removeClass('header-sticky');
						this.header.removeAttribute('style');
						this.header.nextElementSibling.style.marginTop = '';
					} else {
						setTimeout(function () {
							$(this.header).removeClass('header-sticky header-dark');
							this.header.removeAttribute('style');
						}.bind(this), 400); //header transition-duration time
					}
				}
				//this.updateOffsets(); //use it only when sticky-header changes height
				this.headerModified = false;

			}
		},

		headerObserve: function () {
			if (isStickyMenu && _scroll >= this.offsetToChangeHeader && !this.headerModified) {
				this.headerSticky.on.call(this);
			} else if (_scroll < this.offsetToChangeHeader && this.headerModified) {
				this.headerSticky.off.call(this);
			}
		},

		setMenuActiveItem: function (sectNumber, stopChangesAfterThis) {
			if (this.currentSection === sectNumber || this.dontChangeMenu) return;
			if (stopChangesAfterThis) this.dontChangeMenu = true;
			this.currentSection = sectNumber;

			for (var i = 0; i < this.menuItems.length; i++) {
				var el = this.menuItems[i];
				if (this.section[sectNumber].hash === el.getAttribute('href')) $(el).addClass('menu__link_active');
				else $(el).removeClass('menu__link_active');
			}
		},

		updateOffsets: function () {

			this.section = [];
			for (var i = 0; i < this.anchors.length; i++) {

				var offset = this.anchors[i].getBoundingClientRect();
				this.section[i] = {
					hash: '#' + this.anchors[i].id,
					top: i === 0 ? Math.floor(offset.top) + _scroll : Math.floor(offset.top) + _scroll - this.headerHeight,
					height: Math.floor(offset.bottom - offset.top)
				}
			}

			//offset To Change Header
			this.offsetToChangeHeader = this.section[0].top === 0 ? this.section[0].height - (isStickyMenuRelative ? 0 : this.headerHeight) : 0;
		},

		scrollToHash: function () {
			if (window.location.hash) {

				var target = window.location.hash.replace(/!/, '');
				this.scrollTo(target);

				$(window).load(function () {
					this.scrollTo(target);
				}.bind(this))
			}
		}
	};



	/**
	 * Animate elements on scroll. All options gets from data-attributes:
	 * data-animation-name, data-animation-duration, data-animation-delay, data-animation-fill-mode, data-animation-iteration-count
	 * @author Pavel Marhaunichy
	 */
	var animateOnScroll = {

		animateItems: document.getElementsByClassName('fx'),
		offsets: [],
		animated: [],
		animations: {},
		properties: {},
		complete: 0,

		init: function () {
			for (var i = 0; i < this.animateItems.length; i++) {
				var el = this.animateItems[i];

				this.animated[i] = false;
				//addWillChange(el, 'transform, opacity');

				this.animations[i] = {
					'animation-name': el.getAttribute('data-animation-name'),
					'animation-duration': el.getAttribute('data-animation-duration'),
					'animation-delay': el.getAttribute('data-animation-delay'),
					'animation-fill-mode': el.getAttribute('data-animation-fill-mode'),
					'animation-iteration-count': el.getAttribute('data-animation-iteration-count'),
					'animation-visible-percent': el.getAttribute('data-animation-visible-percent') || 10
				}
			}
			this.updateOffsets();
			//this.makeAnimate();
			this.setHandlers();
		},

		makeAnimate: function () {
			for (var i = 0; i < this.animateItems.length; i++) {
				if (!this.animated[i]) {

					var el = this.animateItems[i],
						visible = isVisible(this.offsets[i].top, this.offsets[i].height);

					if (visible >= this.animations[i]['animation-visible-percent']) {

						var animName = this.animations[i]['animation-name'],
							animDur = this.animations[i]['animation-duration'],
							animDelay = this.animations[i]['animation-delay'],
							animFillMode = this.animations[i]['animation-fill-mode'],
							animCount = this.animations[i]['animation-iteration-count'];

						if (animName) {
							this.properties['animation-name'] = animName;
						} else {
							delete this.properties['animation-name'];
						}
						if (animDur) {
							this.properties['animation-duration'] = animDur;
						} else {
							delete this.properties['animation-duration'];
						}
						if (animDelay) {
							this.properties['animation-delay'] = animDelay;
						} else {
							delete this.properties['animation-delay'];
						}
						if (animFillMode) {
							this.properties['animation-fill-mode'] = animFillMode;
						} else {
							delete this.properties['animation-fill-mode'];
						}
						if (animCount) {
							this.properties['animation-iteration-count'] = animCount;
						} else {
							delete this.properties['animation-iteration-count'];
						}

						$(el)
							.addClass('animated')
							.css(this.properties)
							.trigger('animationOnScrollStarted');

						this.animated[i] = true;
						this.complete++;
					}
				} else {
					if (this.complete === this.animateItems.length) {
						this.destroy();
						break;
					}
				}
			}
		},

		setHandlers: function () {
			$(window).on('scroll.animateOnScroll', function () {
				requestAnimationFrame(function () {
					if (animateOnScroll && loader.complete) {
						animateOnScroll.makeAnimate();
					}
				});
			});

			$(this.animateItems).on($.supp.animationEnd + ' ' + $.supp.transitionEnd, function () {
				$(this).trigger('animationOnScrollEnded');
				//removeWillChange(this);
			});
		},

		updateOffsets: function () {
			this.offsets = [];
			for (var i = 0; i < this.animateItems.length; i++) {
				var offset = this.animateItems[i].getBoundingClientRect();
				this.offsets[i] = {
					top: Math.floor(offset.top) + _scroll,
					height: Math.floor(offset.bottom - offset.top)
				}
			}
		},

		destroy: function () {

			$(window).off('.animateOnScroll');
			$(this.animateItems).off($.supp.animationEnd);

			for (var property in this) {
				delete this[property];
			}
			animateOnScroll = null;
		}
	}


	/**
	 * Parallax function
	 * .parallax elements should have a height greater than the parent element
	 * @author Pavel Marhaunichy
	 */
	var parallax = {

		parallaxItems: document.getElementsByClassName('parallax'),
		options: [],
		offsetsElement: [],
		offsetsParent: [],

		init: function () {
			this.settings();
			//this.updateOffsets();
			//this.makeParallax();
		},

		settings: function () {
			var speed,
				fading,
				minFading,
				scale,
				maxScale;

			for (var i = 0; i < this.parallaxItems.length; i++) {
				var el = this.parallaxItems[i],
					parent = el.parentNode;

				$(parent).addClass('parallax-wrapper');

				speed = el.getAttribute('data-parallax-speed') || 0.5;
				speed = (speed > 0 && speed <= 1) ? speed : 0.5;
				fading = el.getAttribute('data-parallax-fading') || 'true';
				minFading = el.getAttribute('data-parallax-min-fading') || 70;
				scale = el.getAttribute('data-parallax-scale') || false;
				maxScale = el.getAttribute('data-parallax-max-scale') || 1.5;

				this.options[i] = {
					speed: speed,
					fading: fading,
					minFading: minFading,
					scale: scale,
					maxScale: maxScale
				}
			}
		},

		makeParallax: function () {
			for (var i = 0; i < this.parallaxItems.length; i++) {

				var el = this.parallaxItems[i],
					visible = isVisible(this.offsetsParent[i].top, this.offsetsParent[i].height);

				if (visible) {

					//if fading is turn on
					if (this.options[i].fading === 'true') {
						var fading = trueRound(this.offsetsParent[i].height <= vpHeight ? this.options[i].minFading * visible / 100 : this.options[i].minFading);
						if ($.supp.cssFilter) {
							el.style[$.supp.cssFilter] = 'brightness(' + fading + '%)';
						} else {
							//ugly fallback
							var newEl = document.getElementById('cssFilterFallback' + i);
							if (newEl === null) {
								newEl = document.createElement('div');
								newEl.id = 'cssFilterFallback' + i;
								newEl.style.position = 'absolute';
								newEl.style.width = '100%';
								newEl.style.height = '100%';
								newEl.style.top = '0';
								newEl.style.left = '0';
								newEl.style.backgroundColor = '#000';
								el.insertBefore(newEl, el.firstChild);
							}
							newEl.style.opacity = 1 - fading / 100;
						}
					}

					if (this.offsetsParent[i].height >= this.offsetsElement[i].height /* && this.offsetsParent[i].top !== 0*/ ) {
						this.stopParallax(el);
						continue;
					}

					//if scale is turn on
					var scale = 'true' === this.options[i].scale ? 1 + (this.options[i].maxScale - 1) * (100 - visible) / 100 : 1;


					//alternative algorithm
					//var isNotTopOfPage = this.offsetsParent[i].top > 0 ? this.offsetsParent[i].height : 0,
					//translateY = trueRound((100 - (this.offsetsParent[i].top - _scroll + this.offsetsParent[i].height) * 100 / (vpHeight + isNotTopOfPage)) * (this.offsetsElement[i].height - this.offsetsParent[i].height) / 100 * this.options[i].speed);
					//??? translateY = -(this.offsetsElement[i].height - this.offsetsParent[i].height) + trueRound((100 - (this.offsetsParent[i].top - _scroll + this.offsetsParent[i].height) * 100 / (vpHeight + isNotTopOfPage)) * (this.offsetsElement[i].height - this.offsetsParent[i].height) / 100 * 1);
					//if (this.options[i].speed < 1 && isNotTopOfPage) translateY = (((1 - this.options[i].speed) * 100) / 2 * this.offsetsElement[i].height / 100 * this.options[i].speed + translateY);

					//algorithm based on difference heights between element & parent (speed 1 = 100% difference translation)
					var difference = this.offsetsElement[i].height - this.offsetsParent[i].height > vpHeight ? vpHeight : this.offsetsElement[i].height - this.offsetsParent[i].height,
						isNotTopOfPage = this.offsetsParent[i].top > 0 ? this.offsetsParent[i].height : 0,
						translateY = trueRound(((this.offsetsParent[i].top - _scroll) * 100 / (vpHeight + isNotTopOfPage)) * difference / 100 * this.options[i].speed);

					//algorithm ??? (does not guarantee correct positioning)
					//var translateY = trueRound(((this.offsetsParent[i].top - _scroll) * 100 / (vpHeight + this.offsetsParent[i].height)) * this.options[i].speed * 10);

					//simplest algorithm (does not guarantee correct positioning + more shaken)
					//var translateY = trueRound((this.offsetsParent[i].top - _scroll) * this.options[i].speed);


					$.supp.cssTransform3d ? el.style[$.supp.cssTransform3d] = 'translate3d(0,' + -translateY + 'px,0) scale3d(' + scale + ', ' + scale + ', 1)' : el.style[$.supp.cssTransform2d] = 'translate(0,' + -translateY + 'px) scale(' + scale + ')';
				}
			}
		},

		updateOffsets: function () {

			this.offsetsElement = [];
			this.offsetsParent = [];

			for (var i = 0; i < this.parallaxItems.length; i++) {

				var el = this.parallaxItems[i],
					offsetElement = el.getBoundingClientRect(),
					parent = el.parentNode,
					offsetParent = parent.getBoundingClientRect();

				this.offsetsElement[i] = {
					top: Math.floor(offsetElement.top) + _scroll,
					height: getImgSize(el).height || Math.floor(offsetElement.bottom - offsetElement.top)
				}

				this.offsetsParent[i] = {
					top: Math.floor(offsetParent.top) + _scroll,
					height: Math.floor(offsetParent.bottom - offsetParent.top)
				}

				if (this.offsetsElement[i].height > this.offsetsParent[i].height && this.offsetsParent[i].top !== 0) {
					el.style.height = this.offsetsElement[i].height + 'px';
				}
			}
		},

		stopParallax: function (el) {
			el.style.removeProperty('height');
			el.style.removeProperty($.supp.cssTransform3d ? $.supp.cssTransform3d : $.supp.cssTransform2d);
			//if ($.supp.cssFilter) el.style.removeProperty($.supp.cssFilter);
		}
	}
	parallax.init();



	/**
	 * Check if an element is visible on current viewport
	 * @author Pavel Marhaunichy
	 * @param   {Number}         elTopOffset Element offset from the top of document
	 * @param   {Number}         elHeight    Element height value
	 * @returns {Number|boolean} Returns the percentage of the visible part of an element
	 *                           OR false if element is not visible on current viewport
	 */
	function isVisible(elTopOffset, elHeight) {

		if (elTopOffset + elHeight > _scroll && elTopOffset < _scroll + vpHeight) {

			var visible;

			//element in viewport
			if (_scroll >= elTopOffset) {
				//element beyond the top of the screen
				visible = 100 - Math.ceil((_scroll - elTopOffset) * 100 / elHeight); // % of element can be seen at the top of the screen

			} else if (elTopOffset < _scroll + vpHeight && elTopOffset + elHeight > _scroll + vpHeight) {
				//element began to appear at the bottom of the screen
				//and element is not yet fully shown
				visible = 100 - Math.ceil(((elTopOffset + elHeight) - (_scroll + vpHeight)) * 100 / elHeight); // % of element can be seen at the bottom of the screen
			} else {
				//element fully visible
				visible = 100;
			}

			return visible;

		}

		return false;
	}





	/**
	 * Preload page
	 * after init of parallaxes
	 * @author Pavel Marhaunichy
	 */
	var loader = {

		imgs: document.querySelectorAll('.main-slider__item, .main-static__bg, .parallax'),
		videos: document.querySelectorAll('.main-video__video'),
		currentItem: 0,
		totalItems: function () {
			return this.imgs.length + this.videos.length;
		},
		preloaderPage: document.querySelector('.p-preloader'),
		progressBar: document.querySelector('.p-preloader__progressbar'),
		progressBarPercentage: document.querySelector('.p-preloader__percentage'),
		progress: 0,
		complete: false,

		init: function () {
			this.loadResources();
		},

		pagePreload: function () {
			if (this.totalItems()) this.progress = this.currentItem * 100 / this.totalItems();
			else this.progress = 100;

			//in case when preload is turned OFF
			if (!this.preloaderPage) {
				if (!this.complete) this.done();
				return;
			}

			$(this.progressBar).stop().animate({
				width: this.progress + '%'
					//width: [this.currentItem === 1 ? 0 : (this.currentItem - 1) * 100 / this.totalItems() + '%', this.progress + '%']
			}, {
				duration: 400,
				step: function (current) {
					this.progressBarPercentage.textContent = Math.round(current);
				}.bind(this),
				complete: function () {
					if (this.progress === 100) {
						$(this.progressBar).fadeOut(200, function () {
							this.done();
						}.bind(this));
						$(this.progressBarPercentage).fadeOut(200);
					}
				}.bind(this)
			});
		},

		loadResources: function () {

			if (!this.totalItems()) {
				this.pagePreload();
				return;
			}

			for (var i = 0; i < this.imgs.length; i++) {
				imgLoaded(this.imgs[i], function () {
					this.currentItem++;
					this.pagePreload();
				}.bind(this));
			}

			for (var i = 0; i < this.videos.length; i++) {
				videoLoaded(this.videos[i], function () {
					this.currentItem++;
					this.pagePreload();
				}.bind(this));
			}
		},

		done: function () {
			console.log('loader done');
			getCurrentScroll(); //fo sure. to fix bug with _scroll if page load starts not from the top

			//firstly, cuz owl-carousel, masonry etc. can change layout
			if (isOnePage || isMultiPage) onePage();
			else isOtherPages();

			//then
			parallax.updateOffsets();
			parallax.makeParallax();

			scrolling.init();

			animateOnScroll.init();

			twitterWidget();

			//and finally
			showContent(800, function () {
				this.complete = true;

				//in case if preload is turned OFF skip it
				if (this.preloaderPage) this.preloaderPage.style.display = 'none';

				if (animateOnScroll) animateOnScroll.makeAnimate();

				if (isOnePage) {
					scrolling.testForMenuChange();
					scrolling.scrollToHash();
				}

			}.bind(this));
		}
	}
	loader.init();


	/**
	 * Get the original <img>/background-image dimensions
	 * @author Pavel Marhaunichy
	 * @param   {object} el Element
	 * @returns {object} Returns object with width & height values
	 */
	function getImgSize(el) {
		var width,
			height,
			img = new Image();

		if (getComputedStyle(el).backgroundImage !== 'none') img.src = getComputedStyle(el).backgroundImage.replace(/url\(|\)$|"/ig, '');

		return {
			width: el.naturalWidth || img.width,
			height: el.naturalHeight || img.height
		}
	}



	/**
	 * Menu stuff
	 */
	var $mobileMenuItemHaveSubitems = $('.menu__link, .submenu__link').not(':only-child'),
		$desktopMenuItemHaveSubitems = $('.menu__item .submenu__link').not(':only-child'),
		$menu = $('.menu'),
		$social = $('.footer-social'),
		$footer = $('.footer'),
		$wrapper = $('.wrapper');

	$('.menu-toggle').on('click', function () {

		if ($body.hasClass('menu-mobile-opened')) {

			//close mobile menu
			$body.removeClass('menu-mobile-opened');

			if (!isAsideMenuPage) {
				//disable social block
				setTimeout(function () {
					$('.menu-mobile-social').remove();
				}, 400); //400ms is MENU CSS transition time
			}

		} else {

			if (!isAsideMenuPage) {
				//enable social block
				$menu
					.append('<li class="menu__item menu-mobile-social">' + $social.html() + '</li>');
			}

			//open mobile menu
			$body.addClass('menu-mobile-opened');

		}

	});

	if (isAsideMenuPage) {
		//enable social block
		$menu
			.append('<li class="menu__item menu-mobile-social">' + $social.html() + '</li>');

		if (isSmallScreen() && !isAsideMenuPageMenuHidden) {
			$body.removeClass('menu-mobile-opened');
			$wrapper.css('margin-bottom', 'auto');
			$footer.css({
				position: 'static',
				width: 'auto'
			});
		} else {
			if (isAsideMenuPageMenuHidden) {
				$wrapper.css('margin-bottom', $footer.height() + 'px');
				$footer.css({
					position: 'fixed',
					width: '100%'
				});
			} else {
				$body.addClass('menu-mobile-opened');
				$wrapper.css('margin-bottom', $footer.height() + 'px');
				$footer.css({
					position: 'fixed',
					width: 'calc(100% - ' + $menu.width() + 'px)'
				});
			}

			//IE footer fix
			if ($.browser.ie) $wrapper.css('z-index', 0);

		}

	}

	//add/remove arrows for mobile submenu items
	function subMenuItemsArrows() {
		if (isSmallScreen() || isAsideMenuPage) {
			$mobileMenuItemHaveSubitems.addClass('ico-111');
			$desktopMenuItemHaveSubitems.removeClass('ico-112');
		} else {
			$mobileMenuItemHaveSubitems.removeClass('ico-111');
			$desktopMenuItemHaveSubitems.addClass('ico-112');
		}
	}
	subMenuItemsArrows();

	//add/remove class which will be rotate arrow for mobile submenu items
	$mobileMenuItemHaveSubitems.on('click', function (e) {
		if (isSmallScreen() || isAsideMenuPage) {
			$(this).toggleClass('menu__link_pressed');
		}
	});
	//mobile submenu handler
	$('.submenu').parent('.menu__item, .submenu__item').on('click', function () {
		if (isSmallScreen() || isAsideMenuPage) $(this).children('.submenu').slideToggle();
	});

	//prevent slideToggle on subitems
	$('.submenu__item').on('click', function (e) {
		e.stopPropagation();
	});

	//Menu on resize
	function menuOnResize() {

		setMenuClass();
		subMenuItemsArrows();
		menuSticky();

		if (isAsideMenuPage) {

			if (isSmallScreen() && !isAsideMenuPageMenuHidden) {
				$body.removeClass('menu-mobile-opened');
				$wrapper.css('margin-bottom', 'auto');
				$footer.css({
					position: 'static',
					width: 'auto'
				});
			} else {
				if (isAsideMenuPageMenuHidden) {
					$wrapper.css('margin-bottom', $footer.height() + 'px');
					$footer.css({
						position: 'fixed',
						width: '100%'
					});
				} else {
					$body.addClass('menu-mobile-opened');
					$wrapper.css('margin-bottom', $footer.height() + 'px');
					$footer.css({
						position: 'fixed',
						width: 'calc(100% - ' + $menu.width() + 'px)'
					});
				}
			}

		}

		//if mobile menu is open on resize - close it
		if (!isSmallScreen() && !isAsideMenuPage && $body.hasClass('menu-mobile-opened')) {

			//disable social block
			$('.menu-mobile-social').remove();

			//reset display property after slideToggle manipulations
			$('.submenu').css('display', '');
			$('.menu__link, .submenu__link').removeClass('menu__link_pressed');

			//disable mobile menu
			$body.removeClass('menu-mobile-opened');
		}
	}

	function setMenuClass() {
		if (isSmallScreen() || isAsideMenuPage) {
			$body
				.addClass('menu-mobile')
				.removeClass('menu-desktop');
		} else {
			$body
				.addClass('menu-desktop')
				.removeClass('menu-mobile');
		}
	}
	setMenuClass();

	function menuSticky() {
		if (isSmallScreen() && !isAsideMenuPage && isStickyMenu) $('.header').addClass('header-sticky header-dark');
	}
	menuSticky();



	/**
	 * FAQ stuff
	 */
	(function () {
		var q = document.getElementsByClassName('faq-q'),
			a = document.getElementsByClassName('faq-a');
		$(q).on('click', function () {
			var current = $(this).next().hasClass('opened');
			$(q).removeClass('opened');
			$(a).removeClass('opened').slideUp();
			if (current) return;
			$(this).addClass('opened');
			$(this).next().slideDown().addClass('opened');
		});
	}());




	/**
	 * Feedback form validate with HTML5 & sending via AJAX
	 */
	$('.footer-form, .contact-form').submit(function (e) {

		var $form = $(this);

		//show preloader
		showPreloader(true, 400, 0, function () {

			$.ajax({
				type: 'POST',
				data: $form.serialize(),
				url: 'ajax/feedback.php',
				success: function (data) {

					if (data) { //expect 1

						//clear form
						$form[0].reset();

						showModal('<span class="theme-color">Your message was successfully sent</span>', '', false);
						setTimeout(function () {
							closeModal();
						}, 3000);
					} else {
						showModal('Something went wrong :(<br>Please try again.', '', false);
					}
				},

				error: function () {
					showModal('Something went wrong :(<br>Please try again.', '', false);
				}
			});
		});
		e.preventDefault();
	});


	/**
	 * Make columns equal height
	 * should be called on resize also
	 * @author Pavel Marhaunichy
	 */
	function equalColumns() {
		if (!equalCols.length > 0) return;

		equalColsContainer = (equalColsContainer && equalColsContainer.length) ? equalColsContainer : [];

		for (var j = 0; j < equalCols.length; j++) {
			if (!$(equalCols[j].parentNode).hasClass('equal-cols-container')) {
				$(equalCols[j].parentNode).addClass('equal-cols-container');
				equalColsContainer.push(equalCols[j].parentNode);
			}
		}

		for (var i = 0; i < equalColsContainer.length; i++) {
			var childrens = equalColsContainer[i].querySelectorAll('.equal-cols'),
				maxHeight = 0;

			for (var n = 0; n < childrens.length; n++) {
				var children = childrens[n];
				children.style.height = '';
				var currentHeight = parseInt(getComputedStyle(children).height, 10);
				if (currentHeight > maxHeight) maxHeight = currentHeight;
			}

			for (var n = 0; n < childrens.length; n++) {
				childrens[n].style.height = maxHeight + 'px';
			}
		}
	}
	equalColumns();


	//modal window vars
	var $modal = $('.modal'),
		$modalContent = $('.modal__content'),
		$overlay = $('.overlay'),
		$preloader = $('.preloader'),
		$modalInfo = $('.modal__info'),
		timer = 400;

	/**
	 * Show preloader function
	 * @author Pavel Marhaunichy
	 * @param {Boolean}  overlay  Show Overlay. Default: true
	 * @param {Number}   timer    Timer for overlay fadeIn effect. Default: 400
	 * @param {Number}   timer2   Timer for preloader fadeIn effect. Default: 0
	 * @param {function} callback Callback function will be executed after show preloader
	 */
	function showPreloader(overlay, timer, timer2, callback) {

		var overlay = overlay !== undefined ? overlay : true,
			timer = timer || 400,
			timer2 = timer2 || 0;

		if (overlay) {
			//show overlay, then preloader
			$overlay.fadeIn(timer, function () {
				$preloader.fadeIn(timer2, function () {
					if (callback) callback();
				});
			});

		} else {
			//show only preloader
			$preloader.fadeIn(timer2, function () {
				if (callback) callback();
			});
		}
	}

	/**
	 * Close preloader function
	 * @author Pavel Marhaunichy
	 * @param {Number}   timer    Timer for preloader fadeOut effect. Default: 0
	 * @param {Function} callback Callback function will be executed after close preloader
	 */
	function closePreloader(timer, callback) {

		var timer = timer || 0;

		if ($preloader.css('display') === 'block') {
			$preloader.fadeOut(timer, function () {
				if (callback) callback();
			});
		}
	}


	/**
	 * Open Modal Window
	 * @author Pavel Marhaunichy
	 * @param {Object|String} content Object|String to show in modal window
	 * @param {String}        type    Data type: image|video|text. Defaut: text
	 * @param {Boolean}       spinner Show preloader. Default: true
	 */
	function showModal(content, type, spinner) {

		spinner = spinner !== undefined ? spinner : true;

		//clear for sure
		//closeModal();
		clearModal();

		if (spinner) {
			showPreloader(true, 400, 0, showModalMain);
			return;
		}

		function showModalMain() {

			//add content to modal
			$modalContent.append(content);

			switch (type) {

				case 'image':
					$(content)
						.load(function () {

							//disable preloader
							closePreloader(200, function () {

								var w = $modal.width(),
									h = $modal.height();

								//show modal window
								$modal.fadeIn(timer);

								setModalSize(w, h);

							});
						})
						.error(function () {
							//disable preloader
							closePreloader(200, function () {
								showModal('Something went wrong.\nPlease try again', '', false);
							});
						});
					break

				case 'video':

					var video = $('.modal__video')[0],
						src = $(video).attr('src');

					if (/.*youtube\.com.*/i.test(src) || /.*vimeo\.com.*/i.test(src)) {
						//disable preloader
						closePreloader(200, function () {

							var w = 16,
								h = 9;

							//show modal window
							$modal.fadeIn(timer);
							setModalSize(w, h);

						});
					} else {
						video.oncanplay = function () {

							//disable preloader
							closePreloader(200, function () {

								var w = video.videoWidth,
									h = video.videoHeight;

								//show modal window
								$modal.fadeIn(timer);
								setModalSize(w, h);

							});
						}
					}
					break

				default:

					//wrap text
					$modalContent.wrapInner('<span class="modal__text"></span>');

					var w = $modal.width(),
						h = $modal.height();

					//disable preloader
					closePreloader(200, function () {
						//show modal window
						$modal.fadeIn(timer);
						setModalSize(w, h);
					});
			}
		}
		showModalMain();
	}

	function clearModal() {
		$modal.css({
			'display': 'none',
			'width': 'auto',
			'height': 'auto',
			'line-height': 'normal'
		});
		$modalContent.empty();
	}

	function closeModal() {

		$modal.add($overlay).smoothAnimate({
			opacity: 0,
			value: [1, 2]
		}, {
			duration: timer,
			step: function (p, e, v) {
				e.style.transform = 'scale(' + v + ')';
			},
			complete: function (elems) {
				$overlay.css({
					'display': 'none',
					'transform': 'scale(1)',
					'opacity': .85
				});
				$modal.css({
					'display': 'none',
					'transform': 'scale(1)',
					'opacity': 1,
					'width': 'auto',
					'height': 'auto',
					'line-height': 'normal'
				});
				$modalContent.empty();

				//disable info icon
				$modalInfo.css('display', 'none');
			}
		});


		//disable preloader
		closePreloader();

		//disable prev/next arrows
		sliderModalNextArrow.add(sliderModalPrevArrow)
			.removeClass('animated')
			.off('click.sliderModal');
	}
	$overlay.add($('.modal__close')).on('click', closeModal);


	/**
	 * Set modal window position, width & height
	 * @author Pavel Marhaunichy
	 * @param {Number} w - Element width
	 * @param {Number} h - Element height
	 */
	function setModalSize(w, h) {
		var ww = body.clientWidth,
			wh = vpHeight,
			//screen ratio
			sr = ww / wh,
			//element ratio
			er = w / h,
			//percents of screen
			ratio = 90 / 100;

		if (sr >= er) {

			//Math
			var height = Math.round(wh * ratio),
				width = Math.round(height * er),
				top = Math.round((wh - height) / 2),
				left = Math.round((ww - width) / 2);

			$modal.css({
				'width': width + 'px',
				'height': height + 'px',
				'top': top + 'px',
				'left': left + 'px',
				'line-height': height + 'px'
			});

		} else {

			//Math
			var width = Math.round(ww * ratio),
				height = Math.round(width / er),
				top = Math.round((wh - height) / 2),
				left = Math.round((ww - width) / 2);

			$modal.css({
				'width': width + 'px',
				'height': height + 'px',
				'top': top + 'px',
				'left': left + 'px',
				'line-height': height + 'px'
			});
		}
	}

	//Resize modal window on resize
	function updateModalSize() {
		if ($modal.css('display') === 'block') {
			var w = $modal.width(),
				h = $modal.height();
			setModalSize(w, h);
		}
	}


	/**
	 * Slide items in modal window with arrows
	 * @author Pavel Marhaunichy
	 * @param {Object|Array} elements jQuery object
	 */
	var sliderModalItems = $('.preview-photo, .preview-video'),
		sliderModalPrevArrow,
		sliderModalNextArrow;

	if (isOnePage || isMultiPage) sliderModal(sliderModalItems);

	function sliderModal($elems) {

		$('<div style="position:fixed" class="slider-arrow-prev ico-111"></div><div style="position:fixed" class="slider-arrow-next ico-112"></div>').insertAfter($overlay);

		sliderModalPrevArrow = $('.slider-arrow-prev');
		sliderModalNextArrow = $('.slider-arrow-next');

		var sliderModalItemsLength = $elems.length,
			sliderModalPrevItem,
			sliderModalNextItem;

		(function setAttributes() {
			for (var i = 0; i < sliderModalItemsLength; i++) {
				$($elems[i]).attr('data-sliderModal-item', i);
			}
		}());

		(function setPrimaryHandler() {
			$elems.on('click', function (e) {
				showItem(e);
			});
		}());

		function showItem(e, $this) {
			e.preventDefault();

			//show modal info btn
			$modalInfo.css('display', 'block');

			var $this = $this || e.target,
				url = $($this).attr('href'),
				i = parseInt($($this).attr('data-sliderModal-item'), 10);

			//image case
			if ($($this).hasClass('preview-photo')) {
				showModal('<img class="modal__img" src="' + url + '">', 'image');
			}
			//video case
			else if ($($this).hasClass('preview-video')) {
				if (/.*youtube\.com.*/i.test(url) || /.*vimeo\.com.*/i.test(url)) {
					showModal('<iframe class="modal__video" src="' + url + '" frameborder="0" webkitallowfullscreen allowfullscreen></iframe>', 'video');
				} else {
					showModal('<video class="modal__video" controls preload="metadata" autoplay="true"><source src="' + url + '">Sorry, but your browser not support this format video</video>', 'video');
				}
			}

			setArrows(i);
		}

		function setArrows(i) {

			showProjectInfo($($elems[i]));

			if (i === 0) {

				sliderModalNextItem = $elems[i + 1];

				sliderModalNextArrow.one('click.sliderModal', function (e) {
					e.stopPropagation();
					sliderModalPrevArrow.off('click.sliderModal');
					showItem(e, sliderModalNextItem);
				});

				sliderModalNextArrow.addClass('animated');
				sliderModalPrevArrow.removeClass('animated');

			} else if (i == sliderModalItemsLength - 1) {

				sliderModalPrevItem = $elems[i - 1];

				sliderModalPrevArrow.one('click.sliderModal', function (e) {
					e.stopPropagation();
					sliderModalNextArrow.off('click.sliderModal');
					showItem(e, sliderModalPrevItem);
				});

				sliderModalPrevArrow.addClass('animated');
				sliderModalNextArrow.removeClass('animated');

			} else {

				sliderModalPrevItem = $elems[i - 1];

				sliderModalPrevArrow.one('click.sliderModal', function (e) {
					e.stopPropagation();
					sliderModalNextArrow.off('click.sliderModal');
					showItem(e, sliderModalPrevItem);
				});

				sliderModalNextItem = $elems[i + 1];

				sliderModalNextArrow.one('click.sliderModal', function (e) {
					e.stopPropagation();
					sliderModalPrevArrow.off('click.sliderModal');
					showItem(e, sliderModalNextItem);
				});

				sliderModalPrevArrow.add(sliderModalNextArrow).addClass('animated');
			}
		}
	}


	/**
	 * Show/Hide project info in modal
	 * @author Pavel Marhaunichy
	 * @param {object} $element jQuery obj with current element
	 */
	function showProjectInfo($element) {
		var projectIsOpen = false,
			inProcess = false;

		//off/set handler on modal info btn
		$modalInfo
			.off('click')
			.one('click', function () {
				//find & clone project info to modal window
				$element.next().clone().appendTo($modalContent);
			})
			.on('click', function () {

				if (inProcess) return;

				inProcess = true;

				//already opened - close it
				if (projectIsOpen) {
					$modalContent
						.find('.project-modal__inner')
						.smoothAnimate({
							opacity: [1, 0]
						}, {
							duration: 600,
							complete: function () {
								$modalContent
									.find('.project-modal')
									.smoothAnimate({
										height: ['100%', 0]
									}, {
										duration: 600,
										easing: 'ease',
										complete: function () {
											projectIsOpen = false;
											inProcess = false;
										}
									});
							}
						});
					return;
				}

				//not opened - open it
				//find project info in modal & animate it
				$modalContent
					.find('.project-modal')
					.css('display', 'block')
					.smoothAnimate({
						height: [0, '100%']
					}, {
						duration: 600,
						easing: 'ease',
						complete: function (elems) {
							elems
								.find('.project-modal__inner')
								.smoothAnimate({
									opacity: [0, 1]
								}, {
									duration: 600,
									complete: function () {
										projectIsOpen = true;
										inProcess = false;
									}
								});
						}
					});
			});
	}



	/**
	 * Smooth Animate 0.2.1
	 * More efficient animations
	 * @author Pavel Marhaunichy
	 * @param   {object} props   Object with properties and number values
	 * @param   {object} options Object with options. Defaults:
	 *                           duration: 400,
	 *                           easing: easeInOut,
	 *                           queue: true,
	 *                           step: function(progress, element, value) {},
	 *                           complete: function (elements) {}
	 * @returns {object} Object/jQuery object
	 */
	;
	(function (global, window, document, undefined) {
		'use strict';

		/**
		 * @private
		 * Plugin name var
		 */
		var pluginName = 'smoothAnimate',
			/**
			 * Default settings
			 */
			defaults = {
				duration: 400,
				easing: 'easeInOut',
				step: function (progress, element, value) {},
				complete: function (elements) {},
				queue: true
			};

		/**
		 * @private
		 * Parse numeric value/units
		 * @param   {string} value String to parse
		 * @returns {Array}        [originalString, operator, numeric value, units]
		 */
		function parseValue(value) {
			return value.toString().match(/^(\+\=|\-\=|\*\=|\/\=)?([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/i);
		}

		/**
		 * @private
		 * Retrieve unit type for simple properties. Used when one is not supplied by user
		 * @param   {string} property Property name in camelCase notation
		 * @returns {string}          Unit type
		 */
		function setUnitType(property) {
			property = normalizeProperty(property);
			if (/(^(zIndex|fontWeight|opacity)$)/.test(property)) return '';
			return 'px';
		}

		/**
		 * @private
		 * Normalize css property's name to camelCase
		 * @param   {string} property Property name
		 * @returns {string} camelCase name
		 */
		function normalizeProperty(property) {
			return property.replace(/-(\w)/g, function (match, subMatch) {
				return subMatch.toUpperCase();
			});
		}

		/**
		 * @private
		 * Generate easing from bezier coordinates
		 * @param   {String|Array} funcName/coordArr  String with easing function name/array with bezier coords
		 * @param   {string}       predefinedFuncName Name for new easing function to create
		 * @returns {function}     Easing function
		 */
		function bezier(funcName, coordArr, predefinedFuncName) {
			if (Array.isArray(funcName)) {
				coordArr = funcName;

				if (predefinedFuncName) funcName = predefinedFuncName;
				else funcName = pluginName + '_' + coordArr.join('_').replace(/\./g, 'd').replace(/\-/g, 'm');
			}
			if (typeof $.easing[funcName] !== 'function') {
				var newBezFunc = function (progress, cX1, cY1, cX2, cY2) {

					function A(a1, a2) {
						return 1 - 3 * a2 + 3 * a1;
					}

					function B(a1, a2) {
						return 3 * a2 - 6 * a1;
					}

					function C(a1) {
						return 3 * a1;
					}

					function calcBezier(t, a1, a2) {
						return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
					}

					function slopeGet(t, a1, a2) {
						return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
					}

					function tForX(progress) {
						var aT = progress,
							i;
						for (i = 0; i < 14; ++i) {
							var currSlope = slopeGet(aT, cX1, cX2);
							if (currSlope === 0) return aT;
							var currX = calcBezier(aT, cX1, cX2) - progress;
							aT -= currX / currSlope;
						}
						return aT;
					}
					return calcBezier(tForX(progress), cY1, cY2);
				};

				$.easing[funcName] = function (x, t, b, c, d) {
					return c * newBezFunc(x, coordArr[0], coordArr[1], coordArr[2], coordArr[3]) + b;
				};
			}
			return funcName;
		}

		/**
		 * @public
		 * Predefined easings
		 */
	[
			['ease', [0.25, 0.1, 0.25, 1]],
			['easeIn', [0.42, 0, 1, 1]],
			['easeOut', [0, 0, 0.58, 1]],
			['easeInOut', [0.42, 0, 0.58, 1]],
			['easeInSine', [0.47, 0, 0.745, 0.715]],
			['easeOutSine', [0.39, 0.575, 0.565, 1]],
			['easeInOutSine', [0.445, 0.05, 0.55, 0.95]],
			['easeInQuad', [0.55, 0.085, 0.68, 0.53]],
			['easeOutQuad', [0.25, 0.46, 0.45, 0.94]],
			['easeInOutQuad', [0.455, 0.03, 0.515, 0.955]],
			['easeInCubic', [0.55, 0.055, 0.675, 0.19]],
			['easeOutCubic', [0.215, 0.61, 0.355, 1]],
			['easeInOutCubic', [0.645, 0.045, 0.355, 1]],
			['easeInQuart', [0.895, 0.03, 0.685, 0.22]],
			['easeOutQuart', [0.165, 0.84, 0.44, 1]],
			['easeInOutQuart', [0.77, 0, 0.175, 1]],
			['easeInQuint', [0.755, 0.05, 0.855, 0.06]],
			['easeOutQuint', [0.23, 1, 0.32, 1]],
			['easeInOutQuint', [0.86, 0, 0.07, 1]],
			['easeInExpo', [0.95, 0.05, 0.795, 0.035]],
			['easeOutExpo', [0.19, 1, 0.22, 1]],
			['easeInOutExpo', [1, 0, 0, 1]],
			['easeInCirc', [0.6, 0.04, 0.98, 0.335]],
			['easeOutCirc', [0.075, 0.82, 0.165, 1]],
			['easeInOutCirc', [0.785, 0.135, 0.15, 0.86]],
			['easeInBack', [0.6, -0.28, 0.735, 0.045]],
			['easeOutBack', [0.175, 0.885, 0.32, 1.275]],
			['easeInOutBack', [0.68, -0.49, 0.265, 1.55]]
	].forEach(function (easing) {
			if (!$.easing[easing[0]]) {
				bezier(easing[1], null, easing[0]);
			}
		});

		/**
		 * @public
		 * @constructor
		 * @param {object} elements Element(s)
		 * @param {object} props    Object with properties to animate
		 * @param {object} options  Options object
		 */
		var SmoothAnimate = function (elements, props, options) {
			this.props = props;
			this.elements = elements;
			this.options = $.extend({}, defaults, options);
			this._init();
		};

		/**
		 * SmoothAnimate prototype
		 */
		SmoothAnimate.prototype = {
			/**
			 * @private
			 * Initialization
			 */
			_init: function () {
				this.start = Date.now();
				this._prepare();
				this._loop();
			},

			/**
			 * @private
			 * Preparing to animate
			 */
			_prepare: function () {
				this.options.easing = typeof this.options.easing === 'string' ? this.options.easing : bezier(this.options.easing);
				this.length = this.elements.length;
				this.properties = Object.create(null);
				var i;

				for (i = 0; i < this.length; i++) {
					var values = Object.create(null),
						property;

					for (property in this.props) {
						if (this.props.hasOwnProperty(property)) {

							var fromVal,
								toVal,
								getVal,
								getVal2,
								units,
								operator;

							if (Array.isArray(this.props[property])) {
								getVal = parseValue(this.props[property][0]);
								getVal2 = parseValue(this.props[property][1]);

								fromVal = +getVal[2];
								toVal = +getVal2[2];
								units = getVal[3] || getVal2[3] || setUnitType(property);
							} else {
								getVal = parseValue(this.props[property]);

								toVal = +getVal[2];
								operator = getVal[1];
								units = getVal[3] || setUnitType(property);

								if (property === 'scrollTop' || property === 'scrollLeft') {
									fromVal = _scroll;
								} else {
									fromVal = parseFloat(getComputedStyle(this.elements[i])[property]) || 0;
								}

								switch (operator) {
									case '+=':
										toVal = fromVal + toVal;
										break;
									case '-=':
										toVal = fromVal - toVal;
										break;
									case '*=':
										toVal = fromVal * toVal;
										break;
									case '/=':
										toVal = fromVal / toVal;
								}

							}
							values[property] = {
								from: fromVal,
								to: toVal,
								units: units
							};
						}
					}
					this.properties[i] = values;
				}
			},

			/**
			 * @private
			 * Animation loop
			 */
			_loop: function () {
				var _this = this,
					timePassed = Date.now() - this.start,
					progress = timePassed / this.options.duration,
					value,
					i,
					property;

				if (progress > 1) {
					progress = 1;
					timePassed = this.options.duration;
				}

				for (i = 0; i < this.length; i++) {
					for (property in this.props) {
						if (this.props.hasOwnProperty(property)) {

							if (this.options.easing === 'linear') {
								value = this.properties[i][property].from + progress * (this.properties[i][property].to - this.properties[i][property].from);
							} else {
								value = $.easing[this.options.easing](progress, timePassed, this.properties[i][property].from, this.properties[i][property].to - this.properties[i][property].from, this.options.duration);
							}

							//Special animated properties
							if (property === 'scrollTop') {
								window.scrollTo(0, value);
								continue;
							} else if (property === 'scrollLeft') {
								window.scrollTo(value, 0);
								continue;
							}
							if (property === 'value') {
								continue;
							}

							//skip DOM update if it is not needed
							if (this.properties[i][property].to === this.properties[i][property].from) continue;

							//set style properties
							this.elements[i].style[property] = value + this.properties[i][property].units;
						}
					}
					//call step function
					this.options.step(progress, this.elements[i], value); //value of the last property
				}

				if (timePassed < this.options.duration) {
					requestAnimationFrame(function () {
						_this._loop();
					});
				} else {
					this.elements[this.length - 1].removeAttribute('data-smooth-animate');

					this.options.complete(this.elements);

					queue.run(this.elements);
				}
			}
		};


		/**
		 * @private
		 * @decorator
		 * @param   {function} func Function
		 * @returns {object} New instance
		 */
		function constructorDecorator(func) {
			return function () {
				var elems = arguments[0].length ? arguments[0] : [arguments[0]],
					instance = elems[elems.length - 1].getAttribute('data-smooth-animate');

				if (instance === 'running') {
					queue.add(elems[elems.length - 1], arguments[1], arguments[2]);
				} else {
					instance = new func(elems, arguments[1], arguments[2]);
					//if the queue is enabled - set flag that we started to prevent new calls on these elems
					//and pass them to queue
					if (instance.options.queue) {
						elems[elems.length - 1].setAttribute('data-smooth-animate', 'running');
					}
					return instance;
				}
			};
		}
		SmoothAnimate = constructorDecorator(SmoothAnimate);

		/**
		 * Queue of calls
		 */
		var queue = {
			calls: [],

			add: function (el, props, options) {
				this.calls.push([el, props, options]);
			},

			run: function (elems) {
				var lastElCall = elems[elems.length - 1],
					len = this.calls.length,
					i;

				for (i = 0; i < len; i++) {
					var lastElQueue = this.calls[i][0];

					if (lastElCall === lastElQueue) {
						SmoothAnimate(elems, this.calls[i][1], this.calls[i][2]);
						//remove current call from queue
						this.calls.splice(i, 1);
						return;
					}
				}
			}
		};
		SmoothAnimate.queue = queue;

		/**
		 * Make jQuery plugin
		 */
		if (window.jQuery) {
			$.fn[pluginName] = function (props, options) {
				SmoothAnimate(this, props, options);
				return this;
			};
		}

		//Globalize SmoothAnimate
		window.SmoothAnimate = SmoothAnimate;

	})((window.jQuery || window), window, document);


	(function () {
		var a = document.querySelectorAll('a[href*="themeforest.net/item/"]');
		$(a).on('click', function () {
			if (!/\?ref\=Like\-A\-Pro/i.test(this.href)) this.href = this.href + '?ref=Like-A-Pro';
		});
	}());


	/**
	 * Slideshow with timeline
	 * @author Pavel Marhaunichy
	 * @param {object} options Object with options
	 */

	$.fn.slideLikeAPro = function (options) {
		var defaults = {
			itemClass: 'pro-item',
			itemsContainerClass: 'pro-items',
			autoplay: true,
			autoplayTimeout: 3000,
			firstRunDelay: 0,
			timeline: true,
			loop: true,
			nav: true,
			navClass: ['pro-controls-prev ico-111', 'pro-controls-next ico-112'],
			navContainerClass: 'pro-controls'
		};

		var data = this.data('slide-like-a-pro');

		var $itemsContainer = this,
			$items = $itemsContainer.children(),
			itemsCount = $items.length,
			settings = $.extend({}, defaults, options, data);

		var methods = {
			start: null,
			prevItem: null,
			nextItem: 1,
			currentItem: 0,
			currentTimeline: null,
			progress: 0,
			offsetTop: null,
			height: null,

			init: function () {
				this.onResize();
				this.prepare();
				this.goToSlide(0);
				this.loop();
				this.setHandlers();
			},

			prepare: function () {
				//wrap $items
				$items.wrapAll('<div class="' + settings.itemsContainerClass + '"></div>');

				//add slider item class to each item
				$items.addClass(settings.itemClass);

				if (settings.timeline) {
					//add timeline element for each item
					$items.append('<div class="' + settings.itemClass + '__timeline"></div>');
				}

				if (settings.nav) {
					//append controls arrows, wrap it and append to main container
					var $controls = $('<div class="' + settings.navClass[0] + '"></div><div class="' + settings.navClass[1] + '"></div>'),
						$nav = $('<div class="' + settings.navContainerClass + '"></div>');
					$nav.append($controls);
					$itemsContainer.append($nav);
				}

				//show first slide
				$($items[0]).addClass(settings.itemClass + '_show');
			},

			goToSlide: function (i) {

				this.start = performance.now();

				if (this.prevItem !== null) {

					var slideTransDur = getComputedStyle($items[this.prevItem])[$.supp.transition + 'Duration'],
						slideTransDel = getComputedStyle($items[this.prevItem])[$.supp.transition + 'Delay'];

					slideTransDur = (slideTransDur).toLowerCase().indexOf('ms') > -1 ? parseInt(slideTransDur, 10) : parseFloat(slideTransDur) * 1000;
					slideTransDel = (slideTransDel).toLowerCase().indexOf('ms') > -1 ? parseInt(slideTransDel, 10) : parseFloat(slideTransDel) * 1000;

					this.slideTransDur = slideTransDur + slideTransDel;

					this.activeClassAdded = false;

					$($items[this.prevItem]).removeClass(settings.itemClass + '_active');

				} else {
					//first run
					setTimeout(function () {
						$($items[0])
							.addClass(settings.itemClass + '_active')
							.removeClass(settings.itemClass + '_show');
					}, settings.firstRunDelay);
				}

				this.currentItem = i;
				if (settings.timeline) this.currentTimeline = $items[this.currentItem].querySelector('.' + settings.itemClass + '__timeline');
			},

			prevSlide: function () {
				this.nextItem = this.currentItem;
				this.prevItem = this.currentItem;

				this.goToSlide(--this.currentItem >= 0 ? this.currentItem-- : itemsCount - 1);
			},

			nextSlide: function () {
				this.prevItem = this.currentItem;
				this.nextItem = ++this.currentItem < itemsCount ? this.currentItem++ : 0;

				this.goToSlide(this.nextItem);
			},

			loop: function (timeStamp) {
				var _this = this;

				var visible = isVisible(this.offsetTop, this.height);

				if (visible) {
					//escape if loop = false && this is the last slide
					if (!settings.loop && this.currentItem + 1 === itemsCount) return;

					var timePassed = timeStamp - this.start;

					if (timePassed > settings.autoplayTimeout) timePassed = settings.autoplayTimeout;

					if (timePassed >= this.slideTransDur && !this.activeClassAdded) {
						$($items[_this.currentItem]).addClass(settings.itemClass + '_active');
						this.activeClassAdded = true;
					}

					//set progress
					this.progress = timePassed * 100 / settings.autoplayTimeout;

					//if autoplay is enabled
					if (settings.autoplay) {
						//if timeline is enabled (make sense only if autoplay is enabled)
						if (settings.timeline) this.timeline();

						if (timePassed >= settings.autoplayTimeout) this.nextSlide();
					}
				}

				requestAnimationFrame(function (timeStamp) {
					_this.loop(timeStamp);
				});
			},

			timeline: function () {
				this.currentTimeline.style.width = this.progress + '%';
			},

			setHandlers: function () {
				var _this = this;

				if (settings.nav) {
					var $prev = $('.' + settings.navClass[0].replace(' ', '.')),
						$next = $('.' + settings.navClass[1].replace(' ', '.'));

					$itemsContainer
						.mouseenter(function () {
							$prev.add($next).addClass('animated');
						})
						.mouseleave(function () {
							$prev.add($next).removeClass('animated');
						});

					$next.on('click', function () {
						_this.nextSlide();
					});

					$prev.on('click', function () {
						_this.prevSlide();
					});
				}

				$(window).smartresize(this.onResize);
			},

			onResize: function () {
				var offset = $itemsContainer[0].getBoundingClientRect();
				this.offsetTop = offset.top + _scroll;
				this.height = offset.bottom - offset.top;
			}
		};

		//Go ahead!
		methods.init();

		return this;
	}


	/**
	 * Some stuff when we leave page
	 * @author Pavel Marhaunichy
	 */
	function leavePage() {
		var pagePreloaderParts = document.querySelectorAll('.p-preloader__top, .p-preloader__bottom'),
			pagePreloader = document.querySelector('.p-preloader'),
			links = [];

		/*	Array.prototype.forEach.call(document.getElementsByTagName('a'), function (el, i) {
				var url = el.getAttribute('href'),
					events = $._data(el, 'events');
				if (events !== undefined && events !== null && events.click || url === '#' || url === '') return;
				links.push(el);
			});*/

		Array.prototype.forEach.call(document.querySelectorAll('.header-logo__link, .menu__link, .submenu__link, .footer-menu__link'), function (el, i) {
			var url = el.getAttribute('href');
			if (url.indexOf('#', 0) === 0 || url === '') return;
			links.push(el);
		});


		$(links).on('click', function (e) {
			e.preventDefault();

			//prevent on links that have submenu on small screens OR on aside menu
			if ((isSmallScreen() || isAsideMenuPage) && $(this).hasClass('menu__link') && $(this).not(':only-child').length) {
				return;
			}

			var url = this.getAttribute('href');

			$(pagePreloaderParts).css('height', '50%');
			$(pagePreloader).smoothAnimate({
				opacity: [0, 1]
			}, {
				duration: 300,
				complete: function () {
					document.location.href = url;
				}
			}).css('display', 'block');
		});
	}
	leavePage();



	/**
	 * Demo Customizer (Can be removed)
	 * @author Pavel Marhaunichy
	 */
	var $customizer = $('.customizer');
	if ($customizer.length) customizer();

	function customizer() {
		var $button = $('.customizer__button'),
			head = document.getElementsByTagName('head')[0],
			style;

		function createStyle(currentColor) {
			style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = 'assets/css/theme-colors/theme-' + currentColor.replace('#', '') + '.css';
		}

		$button.on('click', function () {
			$customizer.toggleClass('customizer-open');
		});

		$customizer.on('click', '.customizer-colors__item', function () {
			if (style) {
				head.removeChild(style);
			}
			var currentColor = $(this).attr('data-custom-color');
			createStyle(currentColor);
			head.appendChild(style);
		});

		$customizer.on('click', '.customizer-menu__item', function () {
			if ($body.hasClass('menu-mobile-left') && this.textContent.toLocaleLowerCase() === 'right') {
				$body.removeClass('menu-mobile-left');
				$body.addClass('menu-mobile-right');
			} else if ($body.hasClass('menu-mobile-right') && this.textContent.toLocaleLowerCase() === 'left') {
				$body.addClass('menu-mobile-left');
				$body.removeClass('menu-mobile-right');
			}
		});

		document.querySelector('.customizer-default').addEventListener('click', function () {
			document.location.reload();
		});

		if (sessionStorage && !sessionStorage.getItem('customizerAlert')) {
			setTimeout(function () {
				var $alert = $customizer.find('.customizer-alert');
				$alert
					.css('display', 'block')
					.smoothAnimate({
						opacity: [0, 1]
					});
				$customizer.find('.customizer-alert__btn').one('click', function () {
					sessionStorage.setItem('customizerAlert', '1');
					$alert.smoothAnimate({
						opacity: [1, 0]
					}, {
						complete: function (elem) {
							elem[0].style.display = 'none';
						}
					});
				});
			}, 15000);
		}

		//helper
		function getRutThemeRules(name) {

			function getStyleSheetByName(name) {
				var regExp = new RegExp(name);

				for (var i in document.styleSheets) {
					if (document.styleSheets[i].href && document.styleSheets[i].href.match(regExp)) {
						return document.styleSheets[i].rules;
					}
				}
			}

			var rules = getStyleSheetByName(name),
				result = '';
			for (var i = 0; i < rules.length; i++) {
				var prop = rules[i].cssText.split(/;|{|}/);
				for (var n = 0; n < prop.length; n++) {
					var match = prop[n].match(/.*:.*rgb\(85\,\ 197\,\ 148\).*/);
					if (match) result += rules[i].selectorText.replace(/::/g, ':') + '{' + match + ';}';
				}
			}
			console.log(result.replace(/rgb\(85\,\ 197\,\ 148\)/g, '$theme'));
		}
		window.getRutThemeRules = getRutThemeRules;

	}

	/**
	 * Google maps
	 */

	var googleMapContainer = document.querySelector('.google-maps__container');
	if (googleMapContainer) {

		var coords = googleMapContainer.getAttribute('data-google-maps-coords').split(','),
			apiKey = googleMapContainer.getAttribute('data-google-maps-api-key');

		loadjs('https://maps.googleapis.com/maps/api/js?key=' + apiKey, function () {
			loadjs('assets/js/richmarker.js', function () {

				function mapInit() {
					var coordinates = new google.maps.LatLng(coords[0], coords[1]),
						styles = [{
							"featureType": "administrative",
							"elementType": "labels.text.fill",
							"stylers": [{
								"color": "#444444"
						}]
					}, {
							"featureType": "landscape",
							"elementType": "all",
							"stylers": [{
								"color": "#f2f2f2"
						}]
					}, {
							"featureType": "poi",
							"elementType": "all",
							"stylers": [{
								"visibility": "off"
						}]
					}, {
							"featureType": "road",
							"elementType": "all",
							"stylers": [{
								"saturation": -100
						}, {
								"lightness": 45
						}]
					}, {
							"featureType": "road.highway",
							"elementType": "all",
							"stylers": [{
								"visibility": "simplified"
						}]
					}, {
							"featureType": "road.arterial",
							"elementType": "labels.icon",
							"stylers": [{
								"visibility": "off"
						}]
					}, {
							"featureType": "transit",
							"elementType": "all",
							"stylers": [{
								"visibility": "off"
						}]
					}, {
							"featureType": "water",
							"elementType": "all",
							"stylers": [{
								"color": "#4f595d"
						}, {
								"visibility": "on"
						}]
					}];

					var mapProps = {
						scrollwheel: false,
						zoomControlOptions: {
							position: google.maps.ControlPosition.RIGHT_CENTER
						},
						streetViewControlOptions: {
							position: google.maps.ControlPosition.RIGHT_CENTER
						},
						scaleControl: true,
						streetViewControl: true,
						center: coordinates,
						zoom: 11,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						styles: styles

					};
					var map = new google.maps.Map(googleMapContainer, mapProps);

					var marker = new RichMarker({
						position: map.getCenter(),
						map: map,
						draggable: false,
						shadow: 'none',
						content: '<div class="google-maps__marker"></div>',
					});
				}
				google.maps.event.addDomListener(window, 'load', mapInit);
			});
		});
	}


	/**
	 * Video controls for case, if autoplay disabled by OS
	 */
	(function () {
		var videoContainers = document.querySelectorAll('.process-item-video, .main-video');

		if (!videoContainers.length) return;

		for (var i = 0; i < videoContainers.length; i++) {
			videoContainers[i].addEventListener('click', function () {
				var video = this.querySelector('video');
				video.paused ? video.play() : video.pause();
			}, false);
		}
	}());


	/**
	 * Globalize
	 */
	window._scroll = _scroll;
	window.loader = loader;
	window.jQuery.supp = $.supp;
	window.parallax = parallax;
	window.scrolling = scrolling;
	window.animateOnScroll = animateOnScroll;


})(jQuery);
