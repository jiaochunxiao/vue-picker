
import _ from './util.js'

var TOUCH_EVENT = 1,
	MOUSE_EVENT = 2

export default class Wheel {
	constructor(el, options) {
		this.wrapper = typeof el === 'string' ? document.querySelector(el) : el
		this.scroller = this.wrapper.querySelector('.dev-wheel-scroll')
		this.items = this.wrapper.querySelectorAll('.dev-wheel-item')

		this.scrollerStyle = this.scroller.style

		this.options = {
			selectedIndex: 0,
			rotate: 30,
			swipeTime: 2500,
			bounceTime: 700,
			adjustTime: 400,
			swipeBounceTime: 1200,
			resizePolling: 60,
			deceleration: 0.001,
			momentumLimitTime: 300,
			momentumLimitDistance: 15
		}

		_.extend(this.options, options);

		//if (this.options.tap === true) {
		//	this.options.tap = 'tap';
		//}
		this.translateZ = _.hasPerspective ? ' translateZ(0)' : ''

		this._init()

		this.refresh()

		this.scrollTo(this.y)

		this.enable()
    }
	_init () {
		this._events = {}

		this._addEvents()
	}
	_addEvents () {
		var eventOperation = _.addEvent
		this._handleEvents(eventOperation)
	}
	_removeEvents () {
		var eventOperation = _.removeEvent
		this._handleEvents(eventOperation)
	}
	_handleEvents (eventOperation) {
		var target = this.options.bindToWrapper ? this.wrapper : window

		eventOperation(window, 'orientationchange', this)
		eventOperation(window, 'resize', this)

		if (this.options.click) {
			eventOperation(this.wrapper, 'click', this, true)
		}

		if (_.hasTouch) {
			eventOperation(this.wrapper, 'touchstart', this)
			eventOperation(target, 'touchmove', this)
			eventOperation(target, 'touchcancel', this)
			eventOperation(target, 'touchend', this)
		} else {
			eventOperation(this.wrapper, 'mousedown', this)
			eventOperation(target, 'mousemove', this)
			eventOperation(target, 'mouseup', this)
		}

		eventOperation(this.scroller, _.style.transitionEnd, this)
	}
	_start (e) {
		var eventType = _.eventType[e.type]

		if (eventType !== TOUCH_EVENT && eventType !== MOUSE_EVENT) {
			return
		}

		if (!this.enabled || (this.initiated && this.initiated !== eventType))
			return

		this.initiated = eventType

		if (!_.isBadAndroid) {
			e.preventDefault()
		}

		this.moved = false
		this.distY = 0

		this._transitionTime()

		this.startTime = +new Date

		this.target = e.target

		if (this.isInTransition) {
			this.isInTransition = false
			var pos = this.getComputedPosition()
			this._translate(Math.round(pos.y))
			this.target = this.items[Math.round(-pos.y / this.itemHeight)]
			//this._trigger('scrollEnd');
		}

		var point = e.touches ? e.touches[0] : e

		this.startY = this.y

		this.pointY = _.hasTouch ? point.pageY : e.pageY

		this._trigger('beforeScrollStart')
	}
	_move (e) {

		if (!this.enabled || _.eventType[e.type] !== this.initiated)
			return

		if (this.options.preventDefault) {
			e.preventDefault()
		}

		var point = e.touches ? e.touches[0] : e

		var pageY = _.hasTouch ? point.pageY : e.pageY

		var deltaY = pageY - this.pointY

		this.dir = deltaY > 0 ? 1 : -1

		this.pointY = pageY

		this.distY += deltaY

		var absDistY = Math.abs(this.distY)
		var timestamp = +new Date

		// We need to move at least 15 pixels for the scrolling to initiate
		if (timestamp - this.startTime > this.options.momentumLimitTime && (absDistY < this.options.momentumLimitDistance)) {
			return
		}

		var newY = this.y + deltaY

		// Slow down if outside of the boundaries
		if (newY > 0 || newY < this.maxScrollY) {
			newY = this.y + deltaY / 3
		}

		if (!this.moved) {
			this.moved = true
			this._trigger('scrollStart')
		}

		this._translate(newY)

		if (timestamp - this.startTime > this.options.momentumLimitTime) {
			this.startTime = timestamp
			this.startY = this.y
		}

		var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
		var pY = this.pointY - scrollTop

		if (pY < this.options.momentumLimitDistance || pY > document.documentElement.clientHeight - this.options.momentumLimitDistance) {
			this._end(e)
		}

	}
	_end (e) {

		if (!this.enabled || _.eventType[e.type] !== this.initiated)
			return
		this.initiated = false

		e.preventDefault()
		// reset if we are outside of the boundaries
		if (this.resetPosition(this.options.bounceTime, _.ease.bounce)) {
			return
		}

		// ensures that the last position is rounded
		var newY = Math.round(this.y)
		var absDistY = Math.abs(newY - this.startY)
		var easing = _.ease.swipe
		var time = 0
		// console.log(this.target)
		// we scrolled less than 15 pixels
		if (!this.moved) {
			time = this.options.adjustTime
			if (this.target.className === 'dev-wheel-scroll') {
				var index = Math.abs(Math.round(newY / this.itemHeight))
				var offset = Math.round((this.pointY + _.offset(this.target).top - this.itemHeight / 2) / this.itemHeight)
				this.target = this.items[index + offset]
			}

			this.scrollToElement(this.target, time, easing)

			this._trigger('scrollCancel')
			return
		}

		this.isInTransition = false
		this.endTime = +new Date
		this.scrollTo(newY)

		var duration = this.endTime - this.startTime

		// start momentum animation if needed
		if (duration < this.options.momentumLimitTime && absDistY > this.options.momentumLimitDistance) {
			var momentumY = _.momentum(this.y, this.startY, duration, this.maxScrollY, this.wrapperHeight, this.options)
			newY = momentumY.destination
			time = momentumY.duration

		} else {
			newY = Math.round(newY / this.itemHeight) * this.itemHeight
			time = this.options.adjustTime
		}

		if (newY !== this.y) {
			// change easing function when scroller goes out of the boundaries
			if (newY > 0 || newY < this.maxScrollY) {
				easing = _.ease.swipeBounce
			}
			this.scrollTo(newY, time, easing)

			return
		}

		this.selectedIndex = Math.abs(this.y / this.itemHeight) | 0

		this._trigger('scrollEnd')
	}
	_resize () {
		if (!this.enabled)
			return

		clearTimeout(this.resizeTimeout)

		this.resizeTimeout = setTimeout(function () {
			this.refresh()
		}.bind(this), this.options.resizePolling)
	}
	_trigger (type) {
		var events = this._events[type]
		if (!events)
			return

		for (var i = 0; i < events.length; i++) {
			events[i].apply(this, [].slice.call(arguments, 1))
		}
	}
	_transitionTime (time) {
		time = time || 0

		this.scrollerStyle[_.style.transitionDuration] = time + 'ms'

		if (!_.isBadAndroid) {
			for (var i = 0; i < this.itemLen; i++) {
				this.items[i].style[_.style.transitionDuration] = time + 'ms'
			}
		}

		if (!time && _.isBadAndroid) {
			this.scrollerStyle[_.style.transitionDuration] = '0.001s'

			if (!_.isBadAndroid) {
				for (var i = 0; i < this.itemLen; i++) {
					this.items[i].style[_.style.transitionDuration] = '0.001s'
				}
			}
		}
	}
	_transitionTimingFunction (easing) {
		this.scrollerStyle[_.style.transitionTimingFunction] = easing

		if (!_.isBadAndroid) {
			for (var i = 0; i < this.itemLen; i++) {
				this.items[i].style[_.style.transitionTimingFunction] = easing
			}
		}
	}
	_transitionEnd (e) {
		if (e.target !== this.scroller || !this.isInTransition) {
			return
		}

		this._transitionTime();
		if (!this.resetPosition(this.options.bounceTime, _.ease.bounce) && this.ignoreDisabledItem(this.options.bounceTime, _.ease.bounce) === false) {
			this.isInTransition = false
			this._trigger('scrollEnd')
		}
	}
	_translate (y) {
		this.scrollerStyle[_.style.transform] = `translateY(${y}px)` + this.translateZ

		if (!_.isBadAndroid) {
			var selectedIndex = this.selectedIndex,
				s = selectedIndex - 2;
			// for (var i = s; i < s + 5; i++) {
			// 	if (i < 0) continue
			// 	if (i >= this.itemLen) break
			// 	var deg = this.options.rotate * (y / this.itemHeight + i)
			// 	this.items[i].querySelector('div').style[_.style.transform] = `rotate3d(1, 0, 0, ${deg}deg)`
			// }
			// for (var i = 0; i < this.itemLen; i++) {
			// 	var deg = this.options.rotate * (y / this.itemHeight + i)
			// 	this.items[i].style[_.style.transform] = `rotate3d(1, 0, 0, ${deg}deg)`
			// }
		}

		this.y = y
	}
	_findNearAbleItem (index) {
		var _items = this.scroller.querySelectorAll('.dev-wheel-item'),
			_index = '',
			_dir = this.dir || -1

		if (!(index == 0 && _dir == 1) && !(index == _items.length - 1 && _dir == -1)){
			for (let i = index - _dir; i >=0 && i < _items.length; i+=(-_dir)) {
				if (_items[i].className.indexOf('disabled') === -1){
					_index = i
					break
				}
			}
		}

		if (_index === '') {
			for (let i = index + _dir; i >=0 && i < _items.length; i+=_dir) {
				if (_items[i].className.indexOf('disabled') === -1){
					_index = i
					break
				}
			}
		}
		// console.log(_dir,index, _index)
		return _index
	}
	enable () {
		this.enabled = true
	}
	disable () {
		this.enabled = false
	}
	on (type, fn) {
		if (!this._events[type]) {
			this._events[type] = []
		}

		this._events[type].push(fn)
	}
	off (type, fn) {
		var _events = this._events[type];
		if (!_events) {
			return
		}

		var count = _events.length

		while (count--) {
			if (_events[count] === fn) {
				_events[count] = undefined
			}
		}
	}
	getOffset () {
		this.scrollOffset = _.offset(this.scroller)
	}
	refresh () {
		//force reflow
		var rf = this.wrapper.offsetHeight

		this.wrapperHeight = parseInt(this.wrapper.style.height) || _.getSize(this.wrapper).height

		this.items = this.wrapper.querySelectorAll('.dev-wheel-item')

		//this.scrollerHeight = parseInt(this.scroller.style.height) || this.scroller.clientHeight
		this.options.itemHeight = this.itemHeight = this.items.length ? _.getSize(this.items[0]).height : 0

		if (this.selectedIndex === undefined) {
			this.selectedIndex = this.options.selectedIndex
		}
		this.y = -this.selectedIndex * this.itemHeight

		this.itemLen = this.items.length

		this.maxScrollY = -this.itemHeight * (this.itemLen - 1)

		this.endTime = 0

		this.scrollOffset = _.offset(this.scroller)
		// console.log(this.scrollOffset.top)

		this._trigger('refresh')

		this.resetPosition()
		// this.ignoreDisabledItem()
	}
	ignoreDisabledItem (time, easing){
		var y = this.y,
			index = this.selectedIndex
		this.target = this.scroller.querySelectorAll('.dev-wheel-item')[index]
		if (this.target && this.target.className.indexOf('disabled') > -1) {
			let _index = this._findNearAbleItem(index),
				_y = this.y + (index - _index) * this.itemHeight
			this.scrollTo(_y, time, easing)
			return _index
		}
		return false
	}
	resetPosition (time, easing) {
		time = time || 0

		var y = this.y

		if (y > 0) {
			y = 0
		} else if (y < this.maxScrollY) {
			y = this.maxScrollY
		}
		// console.log(this.maxScrollY, this.y)
		if (y === this.y)
			return false

		this.scrollTo(y, time, easing)

		return true

	}
	goTo (selectIndex) {
		this.y = -selectIndex * this.itemHeight
		this.scrollTo(this.y)
	}
	scrollTo (y, time, easing) {

		easing = easing || _.ease.bounce

		this.isInTransition = time > 0 && this.y !== y

		this._transitionTimingFunction(easing.style)
		this._transitionTime(time)
		this._translate(y)

		if (y > 0) {
			this.selectedIndex = 0
		} else if (y < this.maxScrollY) {
			this.selectedIndex = this.itemLen - 1
		} else {
			this.selectedIndex = Math.abs(this.y / this.itemHeight) | 0
		}

	}
	scrollToElement (el, time, easing) {

		el = el.nodeType ? el : this.scroller.querySelector(el)

		if (!el || el.className !== 'dev-wheel-item')
			return
		var pos = _.offset(el)

		pos.top -= this.scrollOffset.top

		if (pos.top > 0 || pos.top < this.maxScrollY) {
			return
		}
		pos.top = Math.round(pos.top / this.itemHeight) * this.itemHeight

		this.scrollTo(pos.top, time, easing)
	}
	getComputedPosition () {
		var matrix = window.getComputedStyle(this.scroller, null)

		matrix = matrix[_.style.transform].split(')')[0].split(', ')
		var x = +(matrix[12] || matrix[4])
		var y = +(matrix[13] || matrix[5])

		return {
			x: x,
			y: y
		};
	}
	getSelectedIndex () {
		return this.selectedIndex
	}
	destroy () {
		this._removeEvents()

		this._trigger('destroy')
	}
	handleEvent (e) {
		switch (e.type) {
			case 'touchstart':
			case 'mousedown':
				this._start(e)
				break
			case 'touchmove':
			case 'mousemove':
				this._move(e)
				break
			case 'touchend':
			case 'touchcancel':
			case 'mouseup':
				this._end(e)
				break
			case 'orientationchange':
			case 'resize':
				this._resize()
				break
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e)
				break
			case 'click':
				if (!e._constructed) {
					e.preventDefault()
					e.stopPropagation()
				}
				break
		}
	}
}
