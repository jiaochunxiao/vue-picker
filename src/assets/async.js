const asyc = [
    {
        asyncUrl: './static/json/asyncData0.json',
        asyncData: {
            parentId: 1
        },
        asyncType: 'GET',
        labelKey: 'text',
        responseKey: ''
    },
    {
        asyncUrl: './static/json/asyncData1.json',
        asyncData: {
            parentId: function (parentVal) {
                if (parentVal) {
                    return parentVal.value
                }else {
                    return ''
                }
            }
        },
        labelKey: '',
        responseKey: 'result.dataList'
    },
    {
        asyncUrl: './static/json/asyncData2.json',
        asyncData: {
            parentId: function (parentVal) {
                if (parentVal) {
                    return parentVal.value
                }else {
                    return ''
                }
            }
        },
        labelKey: '',
        responseKey: ''
    }
]
export default asyc
