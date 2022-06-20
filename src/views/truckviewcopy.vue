<template>
  <el-container>
    <el-header>Header</el-header>
    <el-main id="container"></el-main>
    <el-footer>
      <el-slider
          v-model="timeHold"
          :marks="timeMarks">
      </el-slider>
    </el-footer>
    <el-footer>
      <el-button type="primary" icon="el-icon-video-play" circle @click.stop="start"></el-button>
      <el-button type="primary" icon="el-icon-video-pause" circle></el-button>
      <el-button type="primary" icon="el-icon-refresh" circle></el-button>
    </el-footer>
  </el-container>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import truckSvg from "@/assets/truck.png";

export default {
  name: "TruckView",
  data() {
    return {
      map: null,
      polyline: null,
      truckMarker: null,
      timeHold: 0,
      timeMarks: {
        0: '08:00',
        20: '09:00',
        40: '10:00',
        60: '11:00',
        80: '12:00',
        100: '13:00',
      },
    }
  },
  beforeCreate() {
    //
    console.log('App run beforeCreate.')
  },
  created() {
    //
    console.log('App run created.')
  },
  mounted() {
    //
    console.log('App run mounted.')
    this.onInit();
  },
  beforeDestroy() {
    //
    console.log('App run mounted.')
  },
  destroyed() {
    //
    console.log('App run beforeDestroy.')
  },
  methods: {
    //Code Start.
    async onInit() {
      const that = this;
      await AMapLoader.load({
        key: "089cadefca987b96324e8c7a431e31eb",             // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0",      // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.MoveAnimation'],       // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then((AMap) => {
        this.map = new AMap.Map("container", {  //设置地图容器id
          viewMode: "2D",    //是否为3D地图模式
          zoom: 18,           //初始化地图级别
          center: [116.397428, 39.90923]//初始化地图中心点位置
        });
        this.map.plugin('AMap.MoveAnimation', function () {
          let lineArr = [[116.478935, 39.997761], [116.478939, 39.997825], [116.478912, 39.998549], [116.478912, 39.998549], [116.478998, 39.998555], [116.478998, 39.998555], [116.479282, 39.99856], [116.479658, 39.998528], [116.480151, 39.998453], [116.480784, 39.998302], [116.480784, 39.998302], [116.481149, 39.998184], [116.481573, 39.997997], [116.481863, 39.997846], [116.482072, 39.997718], [116.482362, 39.997718], [116.483633, 39.998935], [116.48367, 39.998968], [116.484648, 39.999861]];

          // 绘制轨迹
          that.polyline = new AMap.Polyline({
            map: that.map,
            path: lineArr,
            showDir: true,
            strokeColor: "#28F",  //线颜色
            // strokeOpacity: 1,     //线透明度
            strokeWeight: 12,      //线宽
            strokeStyle: "dashed"  //线样式
          });

          let passedPolyline = new AMap.Polyline({
            map: that.map,
            strokeColor: "#AF5",  //线颜色
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
            position: [116.478935, 39.997761],
            icon: truckIcon,
            offset: new AMap.Pixel(0, -26),
          });

          that.truckMarker.on('moving', function (e) {
            console.log("ON Moving=>", e);
            passedPolyline.setPath(e.passedPath);
            that.timeHold = that.timeHold + 1;
            that.map.setCenter(e.target.getPosition(), true)
          });

          that.map.setFitView();

          window.startAnimation = function startAnimation() {
            that.truckMarker.moveAlong(lineArr, {
              // 每一段的时长
              duration: 500,//可根据实际采集时间间隔设置
              // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
              autoRotation: true,
            });
          };

          window.pauseAnimation = function () {
            that.truckMarker.pauseMove();
          };

          window.resumeAnimation = function () {
            that.truckMarker.resumeMove();
          };

          window.stopAnimation = function () {
            that.truckMarker.stopMove();
          };
        });
      }).then(() => {

      }).catch(e => {
        console.log(e);
      })
    },
    start() {
      let lineArr = [[116.478935, 39.997761], [116.478939, 39.997825], [116.478912, 39.998549], [116.478912, 39.998549], [116.478998, 39.998555], [116.478998, 39.998555], [116.479282, 39.99856], [116.479658, 39.998528], [116.480151, 39.998453], [116.480784, 39.998302], [116.480784, 39.998302], [116.481149, 39.998184], [116.481573, 39.997997], [116.481863, 39.997846], [116.482072, 39.997718], [116.482362, 39.997718], [116.483633, 39.998935], [116.48367, 39.998968], [116.484648, 39.999861]];
      this.truckMarker.moveAlong(lineArr, {
        // 每一段的时长
        duration: 500,//可根据实际采集时间间隔设置
        // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
        autoRotation: true,
      });
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
  max-width: 100vw;
  min-height: 600px;
  text-align: center;
  line-height: 160px;
}

body > .el-container {
  margin-bottom: 40px;
}

</style>
