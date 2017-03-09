<template>
    <div id="app">
        <div class='picker-show picker0' @click='showPicker("picker0")'>
            <p class='left'>非联动选择<p>
            <p class="right" v-text='picker0Data.label' :value='picker0Data.value'></p>
        </div>
        <div class='picker-show' @click='showPicker("picker1")'>
            <p class='left'>本地数据联动<p>
            <p class="right" v-text='picker1Data.label' :value='picker1Data.value'></p>
        </div>
        <div class='picker-show' @click='showPicker("picker2")'>
            <p class='left'>异步数据联动<p>
            <p class="right" v-text='picker2Data.label' :value='picker2Data.value'></p>
        </div>
         <div class='picker-show' @click='showPicker("picker3")'>
            <p class='left'>日期<p>
            <p class="right" v-text='picker3Data.label' :value='picker3Data.value'></p>
        </div>
        <Picker
            ref='picker0'
            element='picker0'
            :show='picker0show'
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
            :show='picker1show'
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
            :show='picker2show'
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
            :show='picker3show'
            :data='pickerData[3]'
            :selectVal='selectValDate'
            cols='3'
            @hidePicker='hidePicker'
            @confirmAction='confirmFun'
            @changePicker='changePickerForDate'
        >
        </Picker>
    </div>

</template>

<script>
import Picker from './components/Picker'
import simple from './assets/simple.js'
import district from './assets/district.js'
import async from './assets/async.js'
const years = [
            {
                label: '2015',
                value: 1
            },{
                label: '2016',
                value: 2
            },{
                label: '2017',
                value: 3
            }
      ]

const getDayData = (n) => {
    var days = []
    for (let i = 0; i < n; i++) {
        days[i] = {label: i + 1}
    }
    return days
}

let mdate = []
export default {
    name: 'app',
    components: {
        Picker
    },
    beforeCreate(){
        let y = new Date().getFullYear()
        let m = new Date().getMonth() + 1
        let d = new Date().getDate()
        this.selectValDate = [y, m, d]
        mdate = [
                    years,
                    getDayData(12),
                    getDayData(new Date(this.selectValDate[0], this.selectValDate[1], 0).getDate())
                ]
    },
    data(){
        return {
            pickerShow: false,
            pickerData: [simple, district, async, mdate],
            picker0Data: {
                'label': '请选择',
                'value': ''
            },
            picker1Data: {
                'label': '请选择',
                'value':  ''
            },
            picker2Data: {
                'label': '请选择',
                'value':  ''
            },
            picker3Data: {
                'label': '请选择',
                'value':  ''
            },
            "picker0show": false,
            "picker1show": false,
            "picker2show": false,
            "picker3show": false,
            mdate: mdate
        }
    },
    methods:{
        showPicker(el){
            this[el + 'show'] = true;
        },
        hidePicker(){
            this.resetPopup();
        },
        confirmFun (seletedIndex, selectVal, element) {
            // this.[elment+'Text'] =
            let value = '', label = ''
            for(let i = 0; i < selectVal.length; i++){
                if(i == (selectVal.length - 1)){
                    label += selectVal[i].label
                    value += selectVal[i].value
                }else{
                    label += selectVal[i].label + ','
                    value += selectVal[i].value + ','
                }
            }
            this[element + 'Data' ] = {
                label: label,
                value: value
            }
        },
        changePickerForDate (wheelIndex, selectVal, selectIndex) {
            if (wheelIndex !== 2) {
                 this.selectValDate[wheelIndex] = selectVal.label
                 var days = getDayData(new Date(this.selectValDate[0], this.selectValDate[1], 0).getDate())
                 this.pickerData[3].splice(2, 1, days)
            }
        },
        resetPopup(){
          this.picker0show = false;
          this.picker1show = false;
          this.picker2show = false;
          this.picker3show = false;
      }
    }
}
</script>

<style lang='less'>
#app {
    width: 100%;
    height: 100%;
    .picker-show{
        display: block;
        width: 98%;
        height: .44rem;
        border-radius: .06rem;
        margin: .1rem auto;
        background-color: #20a0ff;
        color: #fff;
        font-size: .16rem;
        line-height: .44rem;
        .left,
        .right{
            margin: 0;
            box-sizing: border-box;
            padding: 0 .2rem;
            line-height: .44rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .left{
            float: left;
        }
        .right{
            float: right;
        }
    }

}
</style>
