# vue-picker
基于vue2.x的picker

[线上demo](https://jiaochunxiao.github.io/vue-picker/)

## 效果截图

![enter description here][1]


## 使用场景
主要用于移动端选择器

## demo运行

1 git clone

```
git clone https://github.com/jiaochunxiao/vue-picker.git
```
2 进入到仓库文件夹
```
npm install
//或者
cnpm install
```

3
```
npm run dev
```

## 使用说明

父组件中引入

```
<Picker
    ref='picker0'
    element='picker0'
    :data='pickerData[0]'
    @confirmAction='confirmFun'
    cols='2'
    :select-index='[1, 2]'
    @hidePicker='hidePicker'
    :invalid="['李四', '搞笑']"
>
</Picker>
<Picker
    ref='picker1'
    element='picker1'
    :data='pickerData[1]'
    @confirmAction='confirmFun'
    cols='3'
    :select-index='[4, 0, 0]'
    @hidePicker='hidePicker'
    :is-link='true'
    :invalid='["","合肥市","高新区"]'
>
</Picker>
<Picker
    ref='picker2'
    element='picker2'
    :data='pickerData[2]'
    @confirmAction='confirmFun'
    cols='3'
    :is-async='true'
    @hidePicker='hidePicker'
>
</Picker>
<Picker
    ref='picker3'
    element='picker3'
    :data='pickerData[3]'
    :selectVal='selectValDate'
    cols='3'
    @hidePicker='hidePicker'
    @confirmAction='confirmFun'
    @changePicker='changePickerForDate'
>
</Picker>
```
组件中props值：
```
props:{
	'show': {
		type: Boolean,//是否显示
		default: false
	},
	'selectIndex': {//选中的选项的索引
        type: Array
    },
    'selectVal': {//选中的选项的值
        type: Array
    },
	'title':{//弹层中间的标题
		type: String,
		default: ''
	},
	'cancelText':{//取消操作的显示文案
		type: String,
		default: '取消'
	},
	'confirmText': {//确定操作的显示文案
		type: String,
		default: '确定'
	},
	'element':{//关联的元素
		type: String,
		default: ''
	},
	'data':{
		type: Array,//
		default: function(){
			return []
		}
	},
	'invalid':{//不能被选中的选项
		type: Array,
		default: function(){
			return []
		}
	},
	'cols':{//picker列数
		default:''
	},
	'isAsync': {//是否异步
        type: Boolean,
        default: false
    },
    'isLink': {//是否需要联动
		type: Boolean,
		default: false
    },
    'hidePicker':{//隐藏时触发的方法
		type: Function,
		default: function(){}
    },
	'changePicker': {//picker滚动时触发的方法
		type: Function,
		default: function(){}
	},
	'confirmAction': {//确定时触发的方法
		type: Function,
		default: function(){}
	}
}
```
## update

* 2017-02-16 版本1.0.0
* 2017-02-22 版本1.0.1 增加props验证
* 2017-03-09 版本1.0.2 fix warning

## 后记

本组件主要基于 [Huangyi](https://github.com/ustbhuangyi) 的wheel插件和公司同事的vue 1.x的picker组件，在数据交互部分绝大部分保留，针对Vue1.x升级Vue2.x，做了部分修改和开发。

[1]: ./src/assets/picker.gif
