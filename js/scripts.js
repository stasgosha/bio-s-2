// TODO: ↓↓↓ remove this script ↓↓↓
// Current menu item highlithing
$(function () {
	var location = window.location.href;
	var cur_url = location.split('/').pop();

	$('.top-nav li, .mobile-top-nav li, .footer-nav li').each(function () {
		var link = $(this).find('a').attr('href');

		// console.log(link);

		if (cur_url == '') {
			cur_url = 'index.html';
		}

		if (cur_url == link)
		{
			$(this).addClass('current-menu-item');
			$(this).parents('li').addClass('current-menu-parent');
		}
	});
});



document.addEventListener('DOMContentLoaded', function(){

	// Page Nav Highlighting
	// Cache selectors
	let topMenu = $('.top-nav ul');

	if ($(window).width() < 768) {
		topMenu = $('.mobile-top-nav ul')
	}

	let lastId,
		topMenuHeight = 0,
		// All list items
		menuItems = topMenu.find("a"),
		// Anchors corresponding to menu items
		scrollItems = menuItems.map(function() {
			var item = $($(this).attr("href"));
			if (item.length) {
				return item;
			}
		});

	// Bind to scroll
	$(window).scroll(function() {
		let fromTop = $(this).scrollTop() + topMenuHeight + 300;

		let cur = scrollItems.map(function() {
			if ($(this).offset().top < fromTop){
				if ($(this).offset().top + $(this).outerHeight() > $(window).scrollTop() + $(window).height()) {
					return this;
				}
			}
		});

		cur = cur[cur.length - 1];
		let id = cur && cur.length ? cur[0].id : "";

		if (lastId !== id) {
			lastId = id;
			menuItems.removeClass("active");
			menuItems.filter("[href='#" + id + "']").addClass("active");
		}
	});

	// Accordions
	$('.accordion, .js-accordion').each(function(i, el){
		$(el).find('> .ac-header, > .ac-header > .ac-opener').click(function(e){
			e.preventDefault();
			e.stopPropagation();

			$(el).find('> .ac-content').stop().slideToggle(300);
			// $(el).find('.slick-slider').slick('setPosition');
			$(el).toggleClass('opened');
		});

		if ($(el).hasClass('opened-on-load')) {
			$(el).find('.ac-header').trigger('click');
		}
	});

	$('[data-fancybox]').fancybox();

	// Find Component
	$('.find-component').each(function(i, cmp){
		let leftLimit = 1, 
			rightLimit = 3;

		let points = $(cmp).find('.points circle');
		let labels = $(cmp).find('.arc-label');
		let scaleMask = $(cmp).find('#scale-mask');

		let leftArrow = $(cmp).find('.left-limit');
		let rightArrow = $(cmp).find('.right-limit');

		let leftArrowPosition = leftLimit,
			rightArrowPosition = rightLimit;

		let pointsPositions = {};


		let pointsRotateAngle = [50, 41, 34, 22, 11, 0, -4, -12, -18, -30, -45, -52];

		let pointsValues = [1, 3, 5, 7, 10, 12, 15, 20, 30, 40, 60, 100];

		$(points).each(function(i, el){
			pointsPositions[$(el).data('value')] = i;
		});

		leftArrow.css({
			left: getPointXY(leftLimit).x - 20,
			top: getPointXY(leftLimit).y - 20,
			transform: `rotate(${ pointsRotateAngle[leftLimit] }deg)`
		});

		rightArrow.css({
			left: getPointXY(rightLimit).x - 20,
			top: getPointXY(rightLimit).y - 20,
			transform: `rotate(${ pointsRotateAngle[rightLimit] }deg)`
		});

		function getPointXY(pointNumber){
			return {
				x: +$(points).eq(pointNumber).attr('cx'),
				y: +$(points).eq(pointNumber).attr('cy')
			};
		}

		function animateArrowMove(arrow, from, to){
			let stepsCount = Math.abs(to - from);

			if (stepsCount <= 0) {
				return false;
			}

			let direction = 1;
			if (from > to) {
				direction = -1; // move left
			}

			let currentPosition = from;

			let currentPositionXY = getPointXY(currentPosition);

			let arrowInterval = setInterval(function(){
				currentPositionXY = getPointXY(currentPosition);

				if (arrow == 'right'){
					rightArrow.css({
						'left': currentPositionXY.x - 20,
						'top': currentPositionXY.y - 20,
						'transform': `rotate(${ pointsRotateAngle[currentPosition] }deg)`
					});
				} else{
					leftArrow.css({
						'left': currentPositionXY.x - 20,
						'top': currentPositionXY.y - 20,
						'transform': `rotate(${ pointsRotateAngle[currentPosition] }deg)`
					});
				}

				stepsCount--;
				currentPosition += direction;

				if (arrow == 'right') {
					rightArrowPosition = currentPosition;
				} else{
					leftArrowPosition = currentPosition;
				}

				if (stepsCount < 0) {
					clearInterval(arrowInterval);

					if (arrow == 'right') {
						rightArrowPosition = to;
					} else{
						leftArrowPosition = to;
					}
				}
			}, 50);
		}

		function updateArc(){
			let min = getPointXY(leftLimit),
				max = getPointXY(rightLimit);

			// Mask
			scaleMask.attr({
				'x': min.x,
				'width': max.x - min.x
			});

			// Points and labels
			$(points).removeClass('active');
			$(labels).removeClass('active');
			for (let i = leftLimit; i <= rightLimit; i++) {
				$(points).eq(i).addClass('active');
				$(labels).eq(i).addClass('active');
			}
		}

		$(cmp).find('[data-value]').click(function(e){
			e.preventDefault();

			let pointPosition = pointsPositions[$(this).data('value')];

			if (pointPosition < leftLimit) {
				leftLimit = pointPosition;

				animateArrowMove('left', leftArrowPosition, leftLimit);

			} else if (pointPosition > rightLimit){
				rightLimit = pointPosition;

				animateArrowMove('right', rightArrowPosition, rightLimit);

			}

			if (pointPosition - leftLimit <= rightLimit - pointPosition) {
				leftLimit = pointPosition;

				animateArrowMove('left', leftArrowPosition, leftLimit);

			} else{
				rightLimit = pointPosition;

				animateArrowMove('right', rightArrowPosition, rightLimit);
			}

			$('#range-from').val( pointsValues[leftLimit] );
			$('#range-to').val( pointsValues[rightLimit] );

			updateArc();
		});

		$(cmp).find('.type-button').click(function(e){
			$(this).addClass('active').siblings().removeClass('active');
			$(this).siblings('input').val( $(this).text() );
		});

		// Range Field
		jcf.setOptions('Range', {});

		jcf.replace( $('.range-field') );

		let selectedRange = jcf.getInstance( document.getElementById('selected-range') );

		$(cmp).find('#selected-range').on('change', function(e){
			$('#range-from').val( pointsValues[selectedRange.values[0] - 1] );
			$('#range-to').val( pointsValues[selectedRange.values[1] - 1] );
		});

		updateArc();
	});

	// Fields
	$('.input-wrapper input').on('change keyup', function(e){
		if ($(this).val() !== '') {
			$(this).addClass('not-empty');
		} else{
			$(this).removeClass('not-empty');
		}
	});

	// Sliders
	function equalSlideHeight(slider){
		$(slider).on('setPosition', function () {
			$(this).find('.slick-slide').height('auto');
			var slickTrack = $(this).find('.slick-track');
			var slickTrackHeight = $(slickTrack).height();
			$(this).find('.slick-slide').css('height', slickTrackHeight + 'px');
		});
	}

	let arrowsButtons = {
		prevArrow: '<button type="button" class="slick-prev" aria-label="Предыдущий"><svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M.25 4.4L4.4.26a.84.84 0 011.18 1.19L2.03 5l3.56 3.57a.84.84 0 01-1.18 1.18L.25 5.6a.84.84 0 010-1.18zm5-.25L8.55.67a.82.82 0 011.2 0c.33.35.33.92 0 1.27l-2.7 2.85 2.7 2.85c.33.34.33.91 0 1.26a.82.82 0 01-1.2 0l-3.3-3.48a.93.93 0 010-1.27z" fill="#9CC155"/></svg></button>',
		nextArrow: '<button type="button" class="slick-next" aria-label="Следующий"><svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M9.75 4.4L5.6.26a.84.84 0 00-1.18 1.19L7.97 5 4.41 8.57a.84.84 0 001.18 1.18L9.75 5.6a.84.84 0 000-1.18zm-5-.25L1.45.67a.82.82 0 00-1.2 0 .93.93 0 000 1.27l2.7 2.85-2.7 2.85a.93.93 0 000 1.26c.33.35.87.35 1.2 0l3.3-3.48a.93.93 0 000-1.27z" fill="#fff"/></svg></button>'
	}

	if ($(window).width() < 992) {
		$('.bubbles-list').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: true,
			dots: false,
			infinite: true,
			speed: 600,
			...arrowsButtons
		});

		$('.features-list').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: true,
			dots: false,
			infinite: true,
			speed: 600,
			...arrowsButtons
		});

		$('.fit-list-wrapper').each(function(i, el){
			$(el).find('.fit-list').slick({
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: true,
				dots: true,
				appendArrows: $(el).find('.slider-nav'),
				appendDots: $(el).find('.slider-nav'),
				infinite: true,
				speed: 600,
				...arrowsButtons,
				responsive: [
					{
						breakpoint: 768,
						settings: {
							slidesToShow: 2
						}
					},
					{
						breakpoint: 576,
						settings: {
							slidesToShow: 3,
							centerMode: true,
							centerPadding: 0
						}
					}
				]
			});

			equalSlideHeight( $(el).find('.fit-list') );
		});
	}

	$('.product-modal-component').each(function(i, cmp){
		$(cmp).find('.big-images-slider').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: false,
			dots: false,
			infinite: true,
			speed: 600,
			asNavFor: $(cmp).find('.previews-slider')
		});

		$(cmp).find('.previews-slider').slick({
			slidesToShow: 4,
			slidesToScroll: 1,
			arrows: true,
			...arrowsButtons,
			dots: false,
			infinite: true,
			speed: 600,
			asNavFor: $(cmp).find('.big-images-slider'),
			focusOnSelect: true,
			responsive: [
				{
					breakpoint: 576,
					settings: {
						slidesToShow: 3
					}
				}
			]
		});
	});

	$('.about-slider').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: true,
		dots: false,
		infinite: true,
		speed: 600,
		...arrowsButtons
	});

	$('.circle-slider').each(function(i, el){
		$(el).find('.slides').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: true,
			dots: false,
			infinite: true,
			speed: 600,
			...arrowsButtons,
			appendArrows: $(el)
		});
	});

	$('.products-slider-wrapper').each(function(i, el){
		$(el).find('.products-slider').slick({
			slidesToShow: 4,
			slidesToScroll: 1,
			arrows: true,
			dots: true,
			appendArrows: $(el).find('.slider-nav'),
			appendDots: $(el).find('.slider-nav'),
			infinite: true,
			speed: 600,
			...arrowsButtons,
			responsive: [
				{
					breakpoint: 1200,
					settings: {
						slidesToShow: 3
					}
				},
				{
					breakpoint: 768,
					settings: {
						slidesToShow: 2
					}
				}
			]
		});

		equalSlideHeight( $(el).find('.products-slider') );
	});

	// Scroll to anchor
	$(document).on('click', 'a[href^="#"]', function (event) {
		event.preventDefault();

		if ($.attr(this, 'href') === '#') {
			return false;
		}

		let offset = 90;

		// if ($(window).width() < 992) {
		// 	offset = 56;
		// }

		$('html, body').animate({
			scrollTop: $($.attr(this, 'href')).offset().top - offset
		}, 500);
	});

	// Menu opener
	$('.menu-opener').click(function(e){
		e.preventDefault();

		$(this).toggleClass('active');
		$('.mobile-top-nav').toggleClass('opened');
		$('.header').toggleClass('nav-opened');
	});

	if ($(window).width() < 992) {
		$('.mobile-top-nav a').click(function(e){
			$('.menu-opener').trigger('click');
		});
	}

	// Sticky Header
	function stickyHeader(){
		let header = document.querySelector('.header');

		if (!!header) {
			window.scrollY > 90
				? header.classList.add('sticky')
				: header.classList.remove('sticky');
		};
	}


	window.addEventListener('scroll', stickyHeader);
	setTimeout(stickyHeader, 100);

	// Modals
	$('.modal').css('display','block');

	$('.modal-dialog').click(e => e.stopPropagation());
	$('.modal').click(function(e){
		hideModal( $(this) );
		$('.video-modal .modal-video').html('<div id="modal-video-iframe"></div>');
	});

	$('.modal-close, .js-modal-close').click(function(e){
		e.preventDefault();

		hideModal( $(this).closest('.modal') );
		$('.video-modal .modal-video').html('<div id="modal-video-iframe"></div>');
	});

	$('[data-modal]').click(function(e){
		e.preventDefault();
		e.stopPropagation();

		hideModal('.modal');

		if ($(this).data('modal-tab') != undefined) {
			goToTab($(this).data('modal-tab'));
		}

		showModal( $(this).data('modal') );
	});

	// Tabs
	function goToTab(tabId, handler){
		if (handler == undefined) {
			handler = false;
		}

		let dest = $( tabId );
		dest.stop().fadeIn(300).siblings().hide(0);

		$('[data-tab="'+tabId+'"]').addClass('current').parent().siblings().find('[data-tab]').removeClass('current');
	}

	$("[data-tab]").click(function(e){
		e.preventDefault();
		let dest = $(this).data('tab');

		goToTab(dest, $(this));

		// $(dest).find('.slick-slider').slick('setPosition');
	});

	$(".filter-nav, .tabs-nav, .cmp-tabs-nav").each(function(i, el){
		$(el).find('[data-tab]').eq(0).click();
	});

	$('.tabs-select').on('change', function(){
		goToTab($(this).val());
	});


	// Video
	$('.big-video-block:not([data-video-modal])').on('click', function () {
		$(this).addClass('playing');

		let videoId = $(this).data('video-id');

		let videoType = $(this).data('video-type') ? $(this).data('video-type').toLowerCase() : 'youtube';

		if (videoType == 'youtube') {
			$(this).find('.block-video-container').append('<div class="video-iframe" id="'+videoId+'"></div>');
			createVideo(videoId, videoId);
		} else if(videoType == 'vimeo'){
			$(this).find('.block-video-container').append('<iframe allow="autoplay" class="video-iframe" src="https://player.vimeo.com/video/'+videoId+'?playsinline=1&autoplay=1&transparent=0&app_id=122963">');
		} else if(videoType == 'mp4'){
			$(this).find('.block-video-container').append('<video controls playsinline autoplay src='+videoId+'></video>');
			$(this).find('.block-video-container video')[0].play();
		}
	});

	$('[data-video-modal]').click(function(e){
		e.preventDefault();
		e.stopPropagation();

		let videoId = $(this).data('video-modal');
		let videoType = $(this).data('video-type');

		if (videoType == 'youtube') {
			$('#modal-video-iframe').removeClass('vimeo youtube').addClass('youtube').append('<div class="video-iframe" id="'+videoId+'"></div>');
			createVideo(videoId, videoId);
		} else if(videoType == 'vimeo'){
			$('#modal-video-iframe').removeClass('vimeo youtube').addClass('vimeo').html('<iframe class="video-iframe" allow="autoplay" src="https://player.vimeo.com/video/'+videoId+'?playsinline=1&autoplay=1&transparent=1&app_id=122963">');
		}

		hideModal('.modal');

		showModal( "#video-modal" );
	});

	var player;
	function createVideo(videoBlockId, videoId) {
		player = new YT.Player(videoBlockId, {
			videoId: videoId,
			playerVars: {
				'autohide': 1,
				'showinfo' : 0,
				'rel': 0,
				'loop': 1,
				'playsinline': 1,
				'fs': 0,
				'allowsInlineMediaPlayback': true
			},
			events: {
				'onReady': function (e) {
					// e.target.mute();
					// if ($(window).width() > 991) {
						setTimeout(function(){
							e.target.playVideo();
						}, 200);
					// }
				}
			}
		});
	}
});

function getScrollWidth(){
	// create element with scroll
	let div = document.createElement('div');

	div.style.overflowY = 'scroll';
	div.style.width = '50px';
	div.style.height = '50px';

	document.body.append(div);
	let scrollWidth = div.offsetWidth - div.clientWidth;

	div.remove();

	return scrollWidth;
}

let bodyScrolled = 0;
function showModal(modal){
	$(modal).addClass('visible');
	bodyScrolled = $(window).scrollTop();
	$('body, .header').addClass('modal-visible')
			 .scrollTop(bodyScrolled)
			 .css('padding-right', getScrollWidth());
}

function hideModal(modal){
	$(modal).removeClass('visible');
	bodyScrolled = $(window).scrollTop();
	$('body, .header').removeClass('modal-visible')
			 .scrollTop(bodyScrolled)
			 .css('padding-right', 0);
}