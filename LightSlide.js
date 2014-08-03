function LightSlide() {
	var sliderEl = null,
		slider = null,
		curSlide = 0,
		slideCount = 0,
		slideNum = 0,
		images = [],
		running = false,
		autoSlideInterval = null,
		offset = 0,
		defaultTransition = "0.2s ease-in-out",
		reachedEndRight = false,
		reachedEndLeft = false;
		
	var autoSlide = false,
			autoSlideTime = 0,
			autoSlidePaused = false;
	
	var touchDist = 0,
			touchStartX = 0,
			slideSwitchAmount = 30,
			moveDist = 0;
	
	function uppercaseFirst(str) {
		return str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1);
	}
	// Prefix any css property with callback
	function prefix(el, property, style, callback) {
		callback(property, style, el);
		callback(property.toLowerCase(), style, el);
		callback("webkit" + uppercaseFirst(property), style, el);
		callback("moz" + uppercaseFirst(property.toLowerCase()), style, el);
		callback("o" + uppercaseFirst(property), style, el);
		callback("ms" + uppercaseFirst(property), style, el);
	}
	//Prefix element style
	function cssPrefix(el, property, style) {
		prefix(el, property, style, function (prefixedProperty) {
			el.style[prefixedProperty] = style;
		});
	}
	function transition(el, style) { cssPrefix(el, "transition", style); }
	function transform(el, style) { cssPrefix(el, "transform", style); }
	function reorderSlidesNext(e) {
		transition(slider, "none");
		images[0].style.left = "0%";
		if(reachedEndRight) {
			reachedEndRight = false;
			transform(slider, "translateX(" + (offset) + "%)");
		}
		slider.removeEventListener(e.type, reorderSlidesNext);
	}
	function reorderSlidesPrevious(e) {
		transition(slider, "none");
		images[slideCount - 1].style.left = (slideCount - 1) * 100 + "%";
		
		if(reachedEndLeft) {
			reachedEndLeft = false;
			transform(slider, "translateX(" + ((slideCount - 1) * -100 + offset) + "%)");
		}
		slider.removeEventListener(e.type, reorderSlidesPrevious);
	}
	function calculateCurSlide() {
		if (curSlide < 0) {
			curSlide = slideCount - Math.abs(curSlide);
		}
	}
	function slide(direction, callback) {
		if (!running) {
			running = true;
			pause();
			if (direction === "right") {
				slideNum++;
			} else if (direction === "left") {
				slideNum--;
			}
			curSlide = slideNum % slideCount;
			calculateCurSlide();
			transition(slider, defaultTransition);
			callback();
		}
	}
	function transitionEnd(el, callback) {
		prefix(el, "transitionEnd", null, function (prefixedEvent) {
			el.addEventListener(prefixedEvent, callback);
		});
	}
	function touchStart(e) {
		
		if(!running) {
			running = true;
			pause();
			transition(slider, "none");
			touchStartX = e.changedTouches[0].clientX;
			slider.addEventListener("touchmove", touchHandle);
			
		}
		e.preventDefault();
		
	}
	function touchEnd(e) {
		running = false;
		
		transition(slider, defaultTransition);
		
		if(touchDist / sliderEl.offsetWidth * 100 > slideSwitchAmount) {
			previous();
		} else if (touchDist / sliderEl.offsetWidth * 100 < -slideSwitchAmount) {
			next();
		} else {
			reachedEndLeft = reachedEndRight = false;	
			transform(slider, "translateX(" + ((-100 * curSlide) + offset) + "%)");
		}
		slider.removeEventListener("touchmove", touchHandle);
		e.preventDefault();
		
	}
	function touchHandle(e) {
			
			touchDist = e.changedTouches[0].clientX - touchStartX;
			moveDist = touchDist / sliderEl.offsetWidth * 100;
		
		
			if(reachedEndRight) { 
				images[0].style.left = "0%"; 
			}
			if(reachedEndLeft) {
				images[slideCount - 1].style.left = (slideCount - 1) * 100 + "%"; 
			}
			
		
			if(touchDist < 0 && curSlide === slideCount-1) {
				reachedEndRight = true;
				reachedEndLeft = false;
				transitionEnd(slider, reorderSlidesNext);	
				images[0].style.left = 100 * slideCount + "%";
				
			} else if(touchDist > 0 && curSlide === 0) {
				reachedEndLeft = true;
				reachedEndRight = false;
				transitionEnd(slider, reorderSlidesPrevious);
				images[slideCount - 1].style.left = "-100%";
			}
			
			transform(slider, "translateX(" + (moveDist + offset + (-100 * curSlide)) + "%)");
		
	}
	
	
	
	function next() {
		slide("right", function () {
			if (curSlide === 0) {
				reachedEndRight = true;
				transitionEnd(slider, reorderSlidesNext);
				images[0].style.left = 100 * slideCount + "%";
				transform(slider, "translateX(" + ((-100 * slideCount) + offset) + "%)");
			} else {
				transform(slider, "translateX(" + ((-100 * curSlide) + offset) + "%)");
			}
		});
	}
	function previous() {
		slide("left", function () {
			if (curSlide === slideCount - 1) {
				reachedEndLeft = true;
				transitionEnd(slider, reorderSlidesPrevious);
				images[slideCount - 1].style.left = "-100%";
				transform(slider, "translateX(" + (100 + offset) + "%)");
			} else {
				transform(slider, "translateX(" + (-100 * (curSlide % slideCount) + offset) + "%)");
			}
		});
	}
	
	
	function resumeAutoSlide() {
		if(autoSlidePaused && autoSlide) {
			autoSlidePaused = false;
			startAutoSlide(autoSlideTime);
		}
	}
	function startAutoSlide(time) {
		if(time !== autoSlideTime) {
			autoSlide = true;
			autoSlideTime = time;	
		}
		if(autoSlide) {
			autoSlideInterval = setInterval(next, time);	
		}
	}
	function pause() {
		if(!autoSlidePaused) {
			autoSlidePaused = true;
			clearInterval(autoSlideInterval);
			autoSlideInterval = null;
		}
	}
	
	return {
		// First function to initialize slider.
		init: function (_sliderEl, width, height) {
			// Make sliderEl equal to user specified, but default to an element with id of slideshow
			sliderEl = _sliderEl || document.getElementById("slideshow");
			sliderEl.style.position = "relative";
			sliderEl.style.overflowX = "hidden";
			images = sliderEl.children;
			slideCount = images.length;
			if(slideCount < 2) {
				return false;
			}
			slider = document.createElement("div");
			slider.className = "slider";
			slider.style.height = slider.style.width = "100%";
			slider.style.top = slider.style.bottom = "0px";
			for (var j = 0; j < slideCount; j++) {
				slider.appendChild(images[0]);
			}
			images = slider.children;
			sliderEl.appendChild(slider);
			for (var i = slideCount-1; i >= 0; i--) {
				images[i].setAttribute("slide", i+1);
				images[i].style.width = "100%";
				images[i].style.position = "absolute";
				images[i].style.float = "left";
				images[i].style.left = 100 * i + "%";
				images[i].style.top = "0px";
			}
			transition(slider, defaultTransition);
			transitionEnd(slider, function () {
				running = false;
				resumeAutoSlide();
			});
			// Make the slider have a aspect ratio of user 
			//specified height and width, if not specified default to the width and height of first image
			sliderEl.style.paddingBottom = ((height && width) ? (height / width) :
				(images[0].offsetHeight / images[0].offsetWidth)) * 100 + "%";
			// return an element of "this" after initialization, so user can store this instance in a variable.
			// (also nescacary if multiple instances of the slideshow)
			
			slider.addEventListener("touchstart", touchStart);
			slider.addEventListener("touchend", touchEnd);
			
			return this;
		},
		// Slide to next slide
		next: function() {
			next();
		},
		// Slide to previous slide
		previous: function() {
			previous();	
		},
		gotoPosition: function(num) {
			curSlide = num % slideCount;
			calculateCurSlide();
			transform(slider, "translateX(" + ((-100 * curSlide) + offset) + "%)");
		},
		gotoSlide: function(num) {
			curSlide = (num-1) % slideCount;
			calculateCurSlide();
			transform(slider, "translateX(" + ((-100 * curSlide) + offset) + "%)");
		},
		autoSlide: function(time) {
			startAutoSlide(time);
			return this;
		},
		stopAutoSlide: function() {
			autoSlide = false;
			pause();
		},
		getEl: function () { return sliderEl; },
		getSlider: function () { return slider; },
		getImages: function () { return images; },
		getSlide: function() { return curSlide+1; },
		getPosition: function() { return curSlide; },
		getSlideCount: function() { return slideCount; },
		isRunning: function () { return running; }
	};
}

