<template>
  <el-container>
    <el-main id="container"></el-main>
    <el-footer>
      <el-slider
          v-model="timeHold"
          :marks="timeMarks"
          @input="changeTimeHole"
      >
<!--          :step="sliderStep"-->
      </el-slider>
    </el-footer>
    <el-footer>
      <el-button type="primary" icon="el-icon-video-play" circle @click.stop="start"></el-button>
      <el-button type="primary" icon="el-icon-video-pause" circle @click.stop="end"></el-button>
      <el-button type="primary" icon="el-icon-refresh" circle></el-button>
    </el-footer>
  </el-container>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import truckSvg from "@/assets/truck.png";
import { holeList } from './data'
import { carLine2 } from './data'
import GPS from './gpsTransform'
export default {
  name: "TruckView",
  data() {
    return {
      map: null,
      polyline: null,
      marker: null,
      truckMarker: null,
      timeHold: 0,
      timeMarks: {
        // 0: '08:00',
        // 20: '09:00',
        // 40: '10:00',
        // 60: '11:00',
        // 80: '12:00',
        // 100: '13:00',
      },
      sliderStep: 0,
      allPoint: []
    }
  },
  beforeCreate() {
  },
  created() {
  },
  mounted() {
    this.allPoint = holeList.map(item=> {
      return [item.lng, item.lat]
    })

    this.allPoint = this.transformGps(this.allPoint)

    this.timeMarks = this.computedStep("2022-06-09 09:42:13", '2022-06-09 11:44:24')
    this.onInit(this.allPoint);
  },
  methods: {
    transformGps(array) {
      let newPoints = []
      array.forEach(item=> {
        let newmark =  GPS.gcj_encrypt(
            Number(item[1]),
            Number(item[0]),
        )
        newPoints.push(newmark)
      })
      console.log(newPoints)
      let result = []
      newPoints.forEach(item=> {
        result.push([item.lon, item.lat])
      })
      return result
    },
    computedStep(time1, time2) {
      let a = time1
      let b = time2
      // let b = '2022-06-09 09:13:24'

      let aMinutes = a.slice(14, 16)

      let start

      if(aMinutes != 0) {
        start = a.slice(0, 15 )+ '0' + a.slice(16, 20)
      }else {
        start = a
      }

      let res =parseInt( (new Date(b).getTime()-new Date(a).getTime())/10000/60) +2

      let arr = []
      let startTime = new Date(start).getTime()
      let temp = startTime
      for(let i = 0; i< res;i++) {
        startTime = (10 *60 * 1000)*i + temp

        let y = new Date(startTime).getFullYear().toString() // 年
        let m =  (new Date(startTime).getMonth() + 1).toString() // 月
        if(m<10) {
          m = "0" + m
        }
        let d =  new Date(startTime).getDate().toString() // 日
        if(d<10) {
          d = "0"+d
        }
        let H = new Date(startTime).getHours().toString() // 时
        if(H<10) {
          H = "0"+H
        }
        let M = new Date(startTime).getMinutes().toString() // 分
        if(M<10) {
          M = "0"+M
        }
        let S = new Date(startTime).getSeconds().toString() // 秒
        if(S<10) {
          S = "0"+S
        }
        let result = y +"-"+ m+ "-" + d  + ' ' + H +':'+ M+ ':' + S
        arr.push(result)
      }

      let arr2 = []
      let step = (100 / (arr.length -1))

      for(let i =0; i<arr.length; i++) {
        // console.log(step * i, 0000)
        arr2.push(step * i)
      }

      let obj = {}
      for(let i =0; i<arr.length; i++) {
        obj[Math.ceil(arr2[i])] = arr[i].slice(11, 16)
      }
      return obj

    },
    // 改变滑块
    changeTimeHole() {
      // console.log(val)
    },
    //Code Start.
    async onInit(arr) {
      const that = this;
      await AMapLoader.load({
        key: "089cadefca987b96324e8c7a431e31eb",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.MoveAnimation'],       // 需要使用的的插件列表， 如比例尺'AMap.Scale'等
      }).then((AMap) => {
        this.map = new AMap.Map("container", {  //设置地图容器id
          viewMode: "2D",    //是否为3D地图模式
          zoom: 11,           //初始化地图级别
          zooms: [11, 18],
          center: [119.614192, 30.626411]//初始化地图中心点位置
        });

        let markerList = []
        arr.forEach(item=> {
              let marker = new AMap.Marker({
                position: [item[0], item[1]],   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                offset: new AMap.Pixel(0, 0)
              });
              markerList.push(marker)
        })
        that.map.add(markerList)

        // 链接支洞线
        // console.log(this.allPoint)
        // let holePolyLine1 = new AMap.Polyline({
        //   path: this.allPoint.slice(4,32),
        //   strokeColor: '#111',
        //   strokeWeight: 10,
        //   strokeStyle: 'dashed'
        // })
        // this.map.add(holePolyLine1)


        this.map.plugin('AMap.MoveAnimation', function () {
          let passedPolyline = new AMap.Polyline({
            map: that.map,
            strokeColor: "#ff0000",  //线颜色
            strokeWeight: 12,      //线宽
          });
          let truckIcon = new AMap.Icon({
            size: new AMap.Size(24, 64),
            //image: '//a.amap.com/jsapi_demos/static/demo-center-v2/car.png',
            image: truckSvg,
            imageOffset: new AMap.Pixel(0, 0),
            imageSize: new AMap.Size(24, 64)
          })
          that.truckMarker = new AMap.Marker({
            map: that.map,
            zIndex: 10,
            anchor: 'center',
            center: [119.814192, 30.826411],
            icon: truckIcon,
            offset: new AMap.Pixel(0, -26),
          });

          that.truckMarker.on('moving', function (e) {
            console.log("ON Moving=>", e);
            passedPolyline.setPath(e.passedPath);

            // let length = 0
            // for(let key in that.timeMarks) {
            //   console.log(key)
            //   length +=1
            // }
            // console.log(length)

            let step =  100 / Number(that.allPoint.slice(11,30).length)
            that.timeHold = that.timeHold + step;

            that.map.setCenter(e.target.getPosition(), true)
          });

          that.map.setFitView();

        });
      }).then(() => {

      }).catch(() => {
        // console.log(e);
      })
    },
    end() {
      let that = this
      that.truckMarker.stopMove()
    },
    start() {
      let that = this
      that.truckMarker.stopMove()
      that.map.setZoomAndCenter(12, [119.814192, 30.826411])
      setTimeout(()=> {
        that.timeHold = 0

        let newcarLine = carLine2.map(item=> {
          return [item.longitude, item.latitude]
        })

        newcarLine = this.transformGps(newcarLine)

        this.truckMarker.moveAlong(newcarLine, {
          // 每一段的时长
          duration: 150,//可根据实际采集时间间隔设置
          // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
          autoRotation: true,
          zoom: 17
        });
      },2000)
    }
    //End.Code.
  },

}
</script>

<style scoped>
.el-header {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  width: 100%;
  /*max-width: 100vw;*/
  /*min-height: 600px;*/
  height: 700px;
  text-align: center;
  /*line-height: 160px;*/
}

body > .el-container {
  margin-bottom: 40px;
}

</style>
