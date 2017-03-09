<template>
	<div class="dev-picker-component">
		<Popup ref='popup'
			@hideFun='hideFun'
			@showFun='showFun'
			@cancelFun='cancelFun'
			@confirmFun='confirmFun'
			:title='title'
			:cancel-text='cancelText'
			:confirm-text='confirmText'
			:action-show='true'
			:mask-close='false'
			:show='show'
		>
			<div class='dev-picker-wrapper'>
                <div class="dev-picker">
                    <div class="dev-picker-content">
                      <div class="dev-mask-top border-1px"></div>
                      <div class="dev-mask-bottom border-1px"></div>
                      <div class="dev-wheel-wrapper wheel-wrapper-hook">
                          <div class="dev-wheel wheel-hook" v-for="(item, wheelIndex) in renderData">
                              <ul class="dev-wheel-scroll wheel-scroll-hook">
                                  <li v-for="(subitem, itemIndex) in item" class="dev-wheel-item" :class="{'disabled': invalid[wheelIndex] && invalid[wheelIndex].indexOf((subitem[subitem.labelKey] || subitem.label)) > -1 }" v-text="subitem[subitem.labelKey] || subitem.label"><!-- {{subitem.label}} -->
                                  </li>
                              </ul>
                          </div>
                      </div>
                    </div>
                    <div class="dev-picker-footer footer-hook"></div>
                  </div>
            </div>
		</Popup>
	</div>
</template>
<script>
import Popup from './Popup'
import fetch from 'isomorphic-fetch'
import Wheel from '../assets/wheel.js'
export default{
	components:{
		Popup
	},
	props:{
		'show': {
			type: Boolean,
			default: false
		},
		'selectIndex': {
            type: Array
        },
        'selectVal': {
            type: Array
        },
		'title':{
			type: String,
			default: ''
		},
		'cancelText':{
			type: String,
			default: '取消'
		},
		'confirmText': {
			type: String,
			default: '确定'
		},
		'element':{
			type: String,
			default: '',
            required: true
		},
		'data':{
			type: Array,
			default: function(){
				return []
			},
            required: true
		},
		'invalid':{
			type: Array,
			default: function(){
				return []
			}
		},
		'cols':{
			default:''
		},
		'isAsync': {
            type: Boolean,
            default: false
        },
        'isLink': {
			type: Boolean,
			default: false
        },
        'hidePicker':{
			type: Function,
			default: function(){}
        },
		'changePicker': {
			type: Function,
			default: function(){}
		},
		'confirmAction': {
			type: Function,
			default: function(){}
		}
	},
	data(){
		return {
			selectedIndex: [],
            selectedVal: [],
            selectedIndexTemp: [],
            selectedValTemp: [],
            labelKey: 'label',
            renderData: []
		}
	},
	created(){
		this.initSelectIndex()
        this.init()
    },
    methods:{
    	/**
         * 组件初始化
         */
        init (index) {
			index = index || 0

            let promise = this.initRenderData(index)
            if (promise) {
                promise.then(() => {
                    this.useSelectValFlag = false
                    this.initSelectedIndex()
                	this.initPicker()
                })
            } else {
                this.useSelectValFlag = false
                this.initSelectedIndex()
                this.initPicker()
            }

        },
        /**
         * 需在Dom插入之后执行，绑定事件和初始化滚动
         */
        initPicker () {
            let that = this
            that.$nextTick(() => {
                that.wheels = null
                that.$wheel = that.$el.querySelectorAll('.wheel-hook')
                that.$panel = that.$el.querySelector('.panel-hook')
                that.$wrapper = that.$el.querySelector('.wheel-wrapper-hook')
                that.$scroll = that.$el.querySelector('.wheel-scroll-hook')
                that.$footer = that.$el.querySelector('.footer-hook')
                that.initWheel()
            })
		},
        /**
         * 使用Wheel初始化列滚动
         * 如果之前初始化过，直接启用，否则需新建
         */
        initWheel () {
            let that = this
            if (!that.$wheel) {
                return
            }
            if (!that.wheels) {
                that.wheels = []
                for (let i = 0; i < that.length; i++) {
                    let index = that.selectedIndex[i] || 0
                    that.wheels[i] = new Wheel(that.$wheel[i], {
                        tap: 'wheelTap',
                        selectedIndex: index
                    })
                    let _index = that.wheels[i].ignoreDisabledItem()
                    if (_index !== false) {
                        that.selectedIndex[i] = _index
                    }
                    ;((index) => {
                        that.wheels[index].on('scrollStart', () => {
                            that.scrolling = true
                        })
                        that.wheels[index].on('scrollEnd', () => {
                            that.scrolling = false
                            let selectedIndex = that.wheels[index].getSelectedIndex()
                            if (that.selectedIndex[index] != selectedIndex) {
                                that.changeSelectedVal(index, selectedIndex, false)
                                that.pickerChange(index, selectedIndex)
                            }
                        })
                    })(i);
                }
            } else {
                for (let i = 0; i < that.length; i++) {
                    let _index = that.wheels[i].ignoreDisabledItem()
                    that.wheels[i].enable()
                    if (_index === false) {
                        that.wheels[i].goTo(that.selectedIndex[i])
                    } else {
                        that.selectedIndex[i] = _index
                    }
                }
            }
        },
        /**
         * 针对部分数据，不能被滚动选中
         */
        disableWheel () {
            if (this.wheels) {
                for (let i = 0; i < this.length; i++) {
                    this.wheels[i].disable()
                }
            }
        },
        /**
         * 初始化选中数据
         */
        initSelectIndex () {
            if (this.selectIndex && this.selectIndex.length > 0) {
                this.selectedIndex = this.selectIndex
            } else if (this.selectVal && this.selectVal.length > 0) {
                this.useSelectValFlag = true
            }
        },
        initSelectedIndex () {
            if (!(this.selectedIndex && Array.isArray(this.selectedIndex) && this.selectedIndex.length > 0)) {
                for (let i = 0; i < this.length; i++) {
                    this.selectedIndex[i] = 0
                    this.changeSelectedVal(i, 0, false)
                }
            }
        },
        changeSelectedVal (wheelIndex, selectedIndex, isTemp) {
            try {
                let val = this.renderData[wheelIndex][selectedIndex],
                    _val = (typeof val == 'object')
                            ? {} : val
                if (typeof _val == 'object') {
                    for (let key in val) {
                        if (val.hasOwnProperty(key) && key != 'children') {
                            _val[key] = val[key]
                        }
                    }
                }
                if (isTemp) {
                	this.selectedIndexTemp[wheelIndex] = selectedIndex
                    this.selectedValTemp[wheelIndex] =  _val
                }else {
                    this.selectedIndex[wheelIndex] = selectedIndex
                    this.selectedVal[wheelIndex] = _val
                }
            } catch (e) { }
        },
        /**
         * 初始化渲染数据(renderData)
         * @param  {Number} index [需初始化的起始列的索引值, 一般为init的入参index]
         */
        initRenderData (index) {
            let data = this.data,
                selectedIndex = this.selectedIndex

            if (this.isAsync) {
                //异步数据
                this.length = data.length
                return this.getRenderData(data, index)
            } else if (this.isLink){
                //联动本地数据
                this.renderData = this.arrayTreeFilter(data, (c, i, level) => {
                    let _index = selectedIndex[level] || 0,
                        _flag = ''

                    if (this.useSelectValFlag) {
                        _flag = (c.label == this.selectVal[level])
                        _flag && (this.selectedIndex[level] = i)
                    } else {
                        _flag = (i == (selectedIndex[level] || 0))
                    }
                    return _flag
                }).map((c) => {
                    return c.children
    	        }).filter((c) => {
                    return !!c && c.length
                })
                this.renderData.unshift(data)
                this.fixRenderData()
            } else {
                //如果为初始化，则根据selectVal确定selectedIndex
                if (this.useSelectValFlag) {
                    for (let i = 0; i < data.length; i++) {
                        if (!data[i]) {
                            continue
                        }
                        for (let j = 0; j < data[i].length; j++) {
                            if (data[i][j] && data[i][j].label == this.selectVal[i]) {
                                this.selectedIndex[i] = j
                            }
                        }
                    }
                }
                //否则修正selectedIndex，看是否有超出data[i].length
                else {
                    for (let i = 0; i < data.length; i++) {
                        if (!data[i]) {
                            continue
                        }
                        if (this.selectedIndex[i] > data[i].length - 1) {
                            this.selectedIndex[i] = data[i].length - 1
                        }else if (this.selectedIndex[i] < 0) {
                            this.selectedIndex[i] = 0
                        }
                    }
                }
                //非联动直接使用data
                this.renderData = this.data
                this.fixRenderData()
            }
        },
        /**
         * 依次异步获取多列的数据
         * @param  {Array} data  [所有列的配置]
         * @param  {count} count [递归计数，以initRenderData的index作为初始值]
         */
        getRenderData (data, count) {
            let that = this,
                selectedIndex = that.selectedIndex
            // 返回promise, 确保initPicker在数据获取之后
            let promise =  new Promise((resolve, reject) => {
                /**
                 * 递归方法，依次获取从count开始之后的所有列的数据
                 * @param  {*} selectedVal [上一列的选中数据, 作为asyncData中方法的入参]
                 */
                let walk = (selectedVal) => {

                    if (count >= that.length || !data[count]) {
                        that.fixRenderData()
                        resolve()
                        return
                    }
                    let options = data[count],
                        _asyncData = {},
                        _asyncOptions = {},
                        _responseKey = (options.responseKey || 'result').split('.'),
                        _labelKey = options.labelKey || 'label',
                        _url = options.asyncUrl,
                        _type = options.asyncType || 'GET'
                    // 整理asyncData
                    // 属性直接添加
                    // 方法需先执行得到返回值作为属性值然后添加, ps:方法传入了上一列的selectVal，注意可能为空
                    for (let key in options.asyncData) {
                        if (options.asyncData.hasOwnProperty(key)) {
                            let value = options.asyncData[key],
                                _value = ''
                            if (typeof value == 'function') {
                                _asyncData[key] = value(selectedVal)
                            } else {
                                _asyncData[key] = value
                            }
                        }
                    }
                    if (_type === 'GET') {
                        _url.indexOf('?') < 0 && (_url += '?')
                        for (let key in _asyncData) {
                            _url += (_asyncData[key] + '&')
                        }
                        _url = _url.slice(0,-1)
                    } else if (_type === 'POST') {
                        _asyncOptions['body'] = JSON.stringify(_asyncData)
                    }
                    // 异步获取数据
                    fetch(_url, (Object.assign({}, {
                        type: 'GET'
                    }, _asyncOptions))).then((res) => {

                        if (res.ok) {
                            res.json().then(function(data) {
                                let _index = selectedIndex[count] || 0

                                // 各种不可预料的意外，数据统一置为`[]`
                                try {
                                    //根据responseKey 得到数据
                                    _responseKey.map((c) => {
                                        data[c] && (data = data[c])
                                    })
                                    // console.log(data)
                                    //重置数据中的labelKey
                                    data.map((c, i) => {
                                        c.labelKey = _labelKey
                                        c.label = c[_labelKey]
                                        // c.label = c.labelKey
                                        if (that.useSelectValFlag) {
                                            if (c[_labelKey] == that.selectVal[count]) {
                                                _index = i
                                            }
                                            that.selectedIndex[count] = _index
                                        }
                                    })
                                    // console.log(JSON.stringify(that.selectedIndex))
                                } catch (e) {
                                    data = []
                                }

                                //重置当前列数据
                                that.setArrayVal(data, count)
                                count++
                                //获取下一列数据
                                walk(data[_index])
                            })
                        }

                    })
                }
                // 开始递归
                walk(this.selectedVal[count-1])
            })
            return promise
        },
        /**
         * 根据cols, 使用`[]`补全数组, 防止因为cols设置有误导致出错, 如果超出length则截取
         */
        fixRenderData () {
            let _data = this.renderData

            if (_data.length < this.length) {
                for (let i = this.renderData.length; i < this.length; i++) {
                    this.renderData[i] = []
                }
            } else if (_data.length > this.length) {
                this.renderData = _data.slice(0, this.length)
            }

        },
        /**
         * 设置某一列的数据
         * @param {Array} data  [数据]
         * @param {Number} index [列索引值]
         */
        setArrayVal (data, index) {
        	this.renderData.splice(index, 1, data)
		},
        arrayTreeFilter(data, filterFn, options) {
		    options = options || {}
		    options.childrenKeyName = options.childrenKeyName || 'children'
		    let children = data || []
		    let result = []
		    let level = 0
		    let foundItem
		    do {
		        let foundItem = children.filter( (item, index) => {
		            return filterFn(item, index, level)
		        })[0]
		        if (!foundItem) {
		            break
		        }
		        result.push(foundItem)
		        children = foundItem[options.childrenKeyName] || []
		        level += 1
		    } while(children.length > 0)
		    return result
		},
		pickerChange(wheelIndex, selectedIndex){
            if (this.isLink) {
                //wheelIndex之后的所有列初始化后选中项回到第一位
                for (let i = wheelIndex + 1, len = this.length; i < len; i++) {
                    this.selectedIndex[i] = 0
                }
                this.init(wheelIndex + 1)
            }
			;(typeof this.changePicker == 'function') && this.$emit('changePicker',wheelIndex, this.renderData[wheelIndex][selectedIndex], selectedIndex)
		},
		/**
		 * 取消方法
		 * 重新初始化界面
		 */
		cancelFun(){
			let that = this;
        	// this.show = false;
        	this.$emit('hidePicker');
        	setTimeout( () => {
                that.init()
            }, 0)
        },
        /**
         * 确定方法
         * 向父组件传递选择的数据
         */
        confirmFun(){
        	if (this.scrolling) {
                return false
            }
            for (let i = 0, len = this.length; i < len; i++) {
                this.changeSelectedVal(i, this.selectedIndex[i], false)
            }
            this.$emit('hidePicker');
        	// this.show = false;

        	;(typeof this.confirmAction == 'function') && this.$emit('confirmAction', this.selectedIndex, this.selectedVal, this.element)
        },
        hideFun(){
			this.$emit('hidePicker');
        },
        showFun(){
			console.log('show');
        },
    },
    watch:{
		// show(){
        //     this.show ? this.popupShow = true: this.popupShow = false
		// },
		data(){
			this.init()
		}
	},
	computed: {
        length () {
            // 优先使用cols
            // 其次使用异步联动的data length (异步数据联动)
            // 再其次使用renderData length (本地数据联动)
            if (this.cols) {
                return this.cols
            } else if (this.isAsync) {
                return this.data.length
            } else if (Array.isArray(this.renderData)) {
                return this.renderData.length
            } else {
                return 0
            }
        },
        invalidArray(){
        	if(this.invalid.length == 0){
        		let i = 0,
        			length = this.renderData.length
        		for(;i<length;i++){
        			this.invalid.push('')
        		}
        	}
        }
    }
}
</script>
<style lang="less" scoped>
    @import "../assets/mixin.less";
    * {
    	marigin: 0;
    	padding: 0
    }
    .dev-picker-component{
        text-align: center;
        .unselectable;
        .dev-picker-content{
          	.block;
          	position: relative;
          	.dev-mask-top, .dev-mask-bottom{
            	position: absolute;
            	z-index: 10;
           		width: 100%;
            	height: 68px;
            	pointer-events: none;
        	}
          	.dev-mask-top{
            	.border-bottom-1px(#ccc);
            	top: 0;
            	.gradient-from-bottom(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.9));
            }
          	.dev-mask-bottom{
            	.border-top-1px(#ccc);
            	bottom: 0;
            	.gradient-from-top(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.9));
            }
        }
        .dev-wheel-wrapper{
          	.flex-box;
          	padding: 0 .1rem;
          	.dev-wheel{
            	.flex;
            	height: 173px;
            	overflow: hidden;
            	font-size: .18rem;
            	position: relative;;
            	z-index: 2;
            	.dev-wheel-scroll{
              		margin-top: 68px;
              		line-height: 36px;
              		cursor: p;
              		.dev-wheel-item{
                		height: 36px;
                		overflow: hidden;
                		white-space: nowrap;
                		font-size: .18rem;
                		color: #333;
                		&.disabled{
                    		pointer-events: none;
                    		color: #ddd;
                		}
                	}
                }
            }
        }
      	.dev-picker-footer{
        	.block;
        	height: .2rem;
        }
    }

	@media (-webkit-min-device-pixel-ratio: 1.5), (min-device-pixel-ratio: 1.5){
	  	.border-1px{
		    &::after, &::before{
		      	-webkit-transform: scaleY(.7);
		      	-webkit-transform-origin: 0 0;
		      	transform: scaleY(.7);
		  	}
		    &::after{
		      	-webkit-transform-origin: left bottom;
		    }
		}
	}
	@media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2){
	  	.border-1px{
		    &::after, &::before{
		      	-webkit-transform: scaleY(.5);
		      	transform: scaleY(.5);
		  	}
		}
	}
</style>
