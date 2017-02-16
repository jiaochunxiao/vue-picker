var TOUCH_EVENT = 1,
	MOUSE_EVENT = 2

var elementStyle = document.createElement('div').style

var vendor = (function () {

	var transformNames = {
		webkit: 'webkitTransform',
		Moz: 'MozTransform',
		O: 'OTransform',
		ms: 'msTransform',
		standard: 'transform'
	}

	for (var key in transformNames) {
		if (elementStyle[transformNames[key]] !== undefined) {
			return key;
		}
	}

	return false
})()

function prefixStyle(style) {
	if (vendor === false)
		return false

	if (vendor === 'standard')
		return style

	return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}

const transform = prefixStyle('transform')

export default {
	extend (target, obj) {
		for (var key in obj) {
			target[key] = obj[key]
		}
	},
	addEvent (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture)
	},
	removeEvent (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	},
	hasClass(obj, cls) {
	   return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    },
    addClass(obj, cls) {
	   if (!this.hasClass(obj, cls)) obj.className += " " + cls;
    },
    removeClass(obj, cls) {
	   if (this.hasClass(obj, cls)) {
		   var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		   obj.className = obj.className.replace(reg, ' ');
	   }
    },
	getStyle(el, styleName) {
		return el.style[styleName] ? el.style[styleName] : el.currentStyle ? el.currentStyle[styleName] : window.getComputedStyle(el, null)[styleName];
	},
	getStyleNum(el, styleName) {
		return parseInt(this.getStyle(el, styleName).replace(/px|pt|em/ig,''));
	},
	setStyle(el, obj){
		if (this.getType(obj) == "object") {
			for (let s in obj) {
				var cssArrt = s.split("-");
					for (var i = 1; i < cssArrt.length; i++) {
						cssArrt[i] = cssArrt[i].replace(cssArrt[i].charAt(0), cssArrt[i].charAt(0).toUpperCase());
					}
				var cssArrtnew = cssArrt.join("");
				el.style[cssArrtnew] = obj[s];
			}
		}else if (this.getType(obj) == "string") {
		   el.style.cssText = obj;
		}
	},
	setStyle(el, obj){
		if (this.getType(obj) == "object") {
			for (let s in obj) {
				var cssArrt = s.split("-");
					for (var i = 1; i < cssArrt.length; i++) {
						cssArrt[i] = cssArrt[i].replace(cssArrt[i].charAt(0), cssArrt[i].charAt(0).toUpperCase());
					}
				var cssArrtnew = cssArrt.join("");
				el.style[cssArrtnew] = obj[s];
			}
		}else if (this.getType(obj) == "string") {
		   el.style.cssText = obj;
		}
	},
	getType(o){
		var _t;
		return ((_t = typeof(o)) == "object" ? o==null && "null" || Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
	},
	getSize(el) {
        if (this.getStyle(el, "display") != "none") {
            return { width: el.offsetWidth || this.getStyleNum(el, "width"), height: el.offsetHeight || this.getStyleNum(el, "height") };
        }
        var _addCss = { display: "", position: "absolute", visibility: 'hidden' };
        var _oldCss = {};
        for (let i in _addCss) {
            _oldCss[i] = this.getStyle(el, i);
        }
 		this.setStyle(el, _addCss);
        var _width = el.clientWidth || this.getStyleNum(el, "width");
        var _height = el.clientHeight || this.getStyleNum(el, "height");

        for (let i in _oldCss) {
            this.setStyle(el, _oldCss);
        }
        return { width: _width, height: _height };
    },
	offset (el) {
		var left = 0;
		var top = 0;

		while (el) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
			el = el.offsetParent;
		}

		return {
			left: left,
			top: top
		}
	},
	momentum (current, start, time, lowerMargin, wrapperSize, options) {
		var distance = current - start;
		var speed = Math.abs(distance) / time;

		var deceleration = options.deceleration;
		var duration = options.swipeTime;

		var destination = current + speed / deceleration * ( distance < 0 ? -1 : 1 );

		destination = Math.round(destination / options.itemHeight) * options.itemHeight;

		if (destination < lowerMargin) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 4 * speed ) : lowerMargin;
			duration = options.swipeBounceTime - options.bounceTime;
		} else if (destination > 0) {
			destination = wrapperSize ? wrapperSize / 4 * speed : 0;
			duration = options.swipeBounceTime - options.bounceTime;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	},
	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	isBadAndroid: /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion)),
	hasTransform: transform !== false,
	hasPerspective: prefixStyle('perspective') in elementStyle,
	hasTouch: 'ontouchstart' in window,
	hasTransition: prefixStyle('transition') in elementStyle,
	eventType: {
		touchstart: TOUCH_EVENT,
		touchmove: TOUCH_EVENT,
		touchend: TOUCH_EVENT,
		mousedown: MOUSE_EVENT,
		mousemove: MOUSE_EVENT,
		mouseup: MOUSE_EVENT
	},
	style: {
		transform: transform,
		transitionTimingFunction: prefixStyle('transitionTimingFunction'),
		transitionDuration: prefixStyle('transitionDuration'),
		transitionDelay: prefixStyle('transitionDelay'),
		transformOrigin: prefixStyle('transformOrigin'),
		transitionEnd: prefixStyle('transitionEnd')
	},
	ease: {
		//easeOutQuint
		swipe: {
			style: 'cubic-bezier(0.23, 1, 0.32, 1)',
			fn (t) {
				return 1 + ( --t * t * t * t * t);
			}
		},
		//easeOutQuard
		swipeBounce: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn (t) {
				return t * (2 - t);
			}
		},
		//easeOutQuart
		bounce: {
			style: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
			fn (t) {
				return 1 - ( --t * t * t * t);
			}
		}
	}
}
