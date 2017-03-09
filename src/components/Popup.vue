<template>
	<div class="pop-up" :class="{'show': show}">
		<div class="popup-mask" @click='hidePopup'></div>
		<transition :name=from>
			<div class="popup-pannel" v-show='show' :class="[from]">
				<div class="popup-action border-1px" v-if='actionShow'>
					<span class="left" @click='cancelPopup' v-text='cancelText' v-if='cancelText'></span>
					<span class='title' v-text='title'></span>
					<span class="right" @click='confirmPopup' v-text='confirmText' v-if='confirmText'></span>
				</div>
				<div class="pop-content">
					<slot></slot>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
export default{
	props:{
		'show':{
			type: Boolean,
			default: false
		},
		'from': {
			type: String,
			default: 'bottom'
		},
		'actionShow':{
			type: Boolean,
			default: false
		},
		'maskClose':{
			type: Boolean,
			default: true
		},
		'title':{
			type: String,
			default: '标题'
		},
		'cancelText':{
			type: String,
			default: '取消'
		},
		'confirmText': {
			type: String,
			default: '确定'
		},
		'confirmFun': {
			type: Function,
			default: function(){}
		},
		'cancelFun': {
			type: Function,
			default: function(){}
		},
		'showFun': {
			type: Function,
			default: function(){}
		},
		'hideFun': {
      type: Function,
      default: function(){}
    }
	},
	data(){
		return {}
	},
	methods:{
		hidePopup(){
			if(this.maskClose){
				this.$emit('hideFun');
				//this.show = false;
			}
		},
		cancelPopup(){
			console.log('cancel');
			this.$emit('cancelFun');
			//this.show = false;
		},
		confirmPopup(){
			this.$emit('confirmFun');
			//this.show = false;
		}
	},
	watch:{
		// show(){
		// 	this.show? this.$emit('showFun') : '';
		// }
	}
}
</script>

<style lang='less' scoped>
.pop-up{
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	z-index: -1;
	transition: all .5s;
	&.show{
		display: block;
		z-index: 99999;
		opacity: 1;
	}
	.popup-mask{
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, .5);
	}
	.popup-pannel{
		position: absolute;
		left: 0;
		width: 100%;
		min-height: .44rem;
		background-color: #fff;
		&.top{
			top: 0;
		}
		&.bottom{
			bottom: 0;
		}
		.popup-action{
			width: 100%;
			height: .44rem;
			border-bottom: 1px solid #efefef;
			.left,
			.right,
			.title{
				float: left;
				display: inline-block;
				height: 100%;
				text-align: center;
				line-height: .44rem;
			}
			.title{
				width: 60%;
				font-size: .18rem;
				color: #666;
			}
			.left,
			.right{
				width: 20%;
				font-size: .14rem;
			}
			.left{
				color: #999;
			}
			.right{
				color: #20a0ff;
			}
		}
	}
}
.top-enter-active,
.top-leave-active,
.bottom-enter-active,
.bottom-leave-active{
    transition: all .5s;
}
.top-enter,
.top-leave-active{
    transform: translateY(-100%);
}
.bottom-enter,
.bottom-leave-active{
    transform: translateY(100%);
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
