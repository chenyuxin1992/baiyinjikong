<template>
  <a-spin class="pmap" :spinning="loading">
    <div id="stage" class="pmap-wrapper" ref="stage"></div>
  </a-spin>
</template>

<script>
import Konva from 'konva';

export default {
  name: 'PlaneMap',
  props: {
    mapUrl: {
      type: String,
      default: require('@/assets/images/img_substation.jpg'),
    },
    mapDraw: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Array,
      default() {
        return null;
      },
    },
    robots: {
      type: Array,
      default() {
        return null;
      },
    },
  },
  watch: {
    mapUrl(url) {
      if (this.image) {
        this.image.destroy();
        this.image = null;
      }
      this.initMap(url);
    },
  },
  data() {
    return {
      loading: false,
      drawing: false,
      robotHost: {},
      robotData: {},
      robotList: [],
      stage: null,
      layer: null,
      image: null,
      baseLayer: null,
      robotLayer: null,
      rectArea: null,
      rectPrev: null,
      rectCoord: { x1: 0, y1: 0, x2: 0, y2: 0 },
      scale: 1,
      stageW: 0,
      stageH: 0,
      stageX: 0,
      stageY: 0,
    };
  },
  create() {
    this.onWebsocketPush();
  },
  mounted() {
    this.initStage();
    if (this.mapUrl) {
      this.initMap(this.mapUrl);
    }
  },
  beforeDestroy() {
    this.$bus.$off('stomp');
    this.stage && this.stage.destroy();
  },
  methods: {
    onWebsocketPush() {
      this.$bus.$on('stomp', async (msg) => {
        const { action, item } = msg;
        if (action === 'detector_station_status') {
          const { detector_id, type, value } = item;
          const robot = this.robotList.find((item) => item.id === detector_id);
          if (robot && type === 2) {
            robot.status = value;
          }
        }
        if (action === 'robot_station_coordinate') {
          console.log(item);
          const { detector_id, coordinate_pixel } = item;
          const { x, y, angle } = this.pixel2CoordAngle(coordinate_pixel);
          const robot = this.robotList.find((item) => item.id === detector_id);
          if (robot) {
            robot.image.setAttrs({ x, y, rotation: angle });
          }
          this.robotLayer.batchDraw();
        }
        if (action === 'robot_station_route') {
          const { detector_id, coordinate_pixels } = item;
          const robot = this.robotList.find((item) => item.id === detector_id);
          if (robot) {
            robot.path = await this.addRobotPath(coordinate_pixels);
          }
          this.robotLayer.batchDraw();
        }
        if (action === 'task_station_result') {
          const { detector_id } = item;
          this.robotData[detector_id] = item;
        }
      });
    },
    initStage() {
      // const stage = this.$refs.stage.getBoundingClientRect();
      this.stageW = this.$refs.stage.clientWidth;
      this.stageH = this.$refs.stage.clientHeight;
      this.stageX = this.stageW / 2;
      this.stageY = this.stageH / 2;
      this.stage = new Konva.Stage({
        container: 'stage',
        x: this.stageX,
        y: this.stageY,
        width: this.stageW,
        height: this.stageH,
        offsetX: this.stageX,
        offsetY: this.stageY,
      });
    },
    initMap(url) {
      this.loading = true;
      Konva.Image.fromURL(url, (image) => {
        const imageW = image.width();
        const imageH = image.height();
        const imageR = Math.round((imageW / imageH) * 100) / 100;
        const stageR = Math.round((this.stageW / this.stageH) * 100) / 100;
        if (stageR >= imageR) {
          // 页面宽高比大于图片时纵向完整显示
          this.scale = Math.round((this.stageH / imageH) * 100) / 100;
        } else {
          // 页面宽高比小于图片时横向完整显示
          this.scale = Math.round((this.stageW / imageW) * 100) / 100;
        }
        this.stage.scale({ x: this.scale, y: this.scale });
        const offsetX = Math.round(imageW - this.stageW) / 2;
        const offsetY = Math.round(imageH - this.stageH) / 2;
        if (!this.baseLayer) {
          this.baseLayer = new Konva.Layer({
            listening: true,
            offsetX: offsetX,
            offsetY: offsetY,
          });
          this.robotLayer = this.baseLayer.clone();
          this.stage.add(this.baseLayer);
          this.stage.add(this.robotLayer);
        }
        this.baseLayer.on('mousedown', () => {
          if (!this.mapDraw) return;
          const coord = this.stage.getPointerPosition();
          console.log('mousedown: ', coord);
          this.rectCoord.x1 = Math.round(coord.x / this.scale);
          this.rectCoord.y1 = Math.round(coord.y / this.scale);
          if (this.rectArea) {
            this.rectArea.destroy();
            this.rectArea = null;
          }
          this.drawing = true;
        });
        this.baseLayer.on('mousemove', () => {
          if (!this.drawing) return;
          const coord = this.stage.getPointerPosition();
          const coordX = Math.round(coord.x / this.scale);
          const coordY = Math.round(coord.y / this.scale);
          const rectX = coordX > this.rectCoord.x1 ? this.rectCoord.x1 : coordX;
          const rectY = coordY > this.rectCoord.y1 ? this.rectCoord.y1 : coordY;
          const rectW = Math.abs(coordX - this.rectCoord.x1);
          const rectH = Math.abs(coordY - this.rectCoord.y1);
          if (!this.rectArea) {
            this.rectArea = new Konva.Rect({
              x: rectX,
              y: rectY,
              width: rectW,
              height: rectH,
              stroke: 'red',
              strokeWidth: 5,
              listening: true,
            });
            this.baseLayer.add(this.rectArea);
          }
          this.rectArea.setAttrs({ x: rectX, y: rectY, width: rectW, height: rectH });
          this.baseLayer.batchDraw();
        });
        this.baseLayer.on('mouseup', () => {
          if (!this.drawing) return;
          const coord = this.stage.getPointerPosition();
          console.log('mouseup: ', coord);
          const { x1, y1 } = this.rectCoord;
          const coordX = Math.round(coord.x / this.scale);
          const coordY = Math.round(coord.y / this.scale);
          if (x1 > coordX) {
            this.rectCoord.x1 = coordX;
            this.rectCoord.x2 = x1;
          } else {
            this.rectCoord.x2 = coordX;
          }
          if (y1 > coordY) {
            this.rectCoord.y1 = coordY;
            this.rectCoord.y2 = y1;
          } else {
            this.rectCoord.y2 = coordY;
          }
          console.log(this.rectCoord);
          this.$emit('areaSelect', this.rectCoord);
          this.drawing = false;
        });
        this.image = image;
        this.baseLayer.add(this.image);
        // 添加巡视点位
        if (this.points) {
          for (const point of this.points) {
            if (point.map_point) {
              this.addPoint(point);
            }
          }
        }
        // 添加巡视机器人
        if (this.robots) {
          for (const robot of this.robots) {
            const { coordinate_pixel, coordinate_pixels } = robot;
            if (coordinate_pixel) {
              this.addRobot(robot);
            }
            if (coordinate_pixels) {
              this.addRobotPath(robot);
            }
          }
        }
        this.stage.batchDraw();
        this.loading = false;
      });
    },
    addPoint(point, immediate = false) {
      const { x, y } = this.pixel2Coord(point.map_point);
      return new Promise((resolve, reject) => {
        const icon = new Image();
        icon.onload = () => {
          const imageW = Math.round(15 / this.scale);
          const imageH = Math.round(25 / this.scale);
          const image = new Konva.Image({
            x: x,
            y: y,
            width: imageW,
            height: imageH,
            offsetX: imageW / 2,
            offsetY: imageH / 2,
            image: icon,
          });
          image.on('click', () => {
            this.$emit('pointClick');
          });
          this.baseLayer.add(image);
          // 立即绘制元素
          if (immediate) image.draw();
          resolve(image);
        };
        icon.onerror = (err) => {
          reject(err);
        };
        icon.src = require('@/assets/images/icon_point.png');
      });
    },
    addRobot(robot, immediate = false) {
      console.log(robot);
      const { id, name, status, coordinate_pixel } = robot;
      const { x, y, angle } = this.pixel2CoordAngle(coordinate_pixel);
      return new Promise((resolve, reject) => {
        const icon = new Image();
        icon.onload = () => {
          const path = new Konva.Line({
            points: [x, y],
            stroke: '#008c74',
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
          });
          const imageW = Math.round(30 / this.scale);
          const imageH = Math.round(30 / this.scale);
          const image = new Konva.Image({
            x: x,
            y: y,
            width: imageW,
            height: imageH,
            offsetX: imageW / 2,
            offsetY: imageH / 2,
            rotation: angle,
            image: icon,
          });
          image.on('click', () => {
            if (!status) return;
            if (this.robotData[id]) {
              this.$emit('robotClick', { ...this.robotData[id], detector_name: name });
            }
          });
          this.robotLayer.add(path);
          this.robotLayer.add(image);
          // 立即绘制元素
          if (immediate) image.draw();
          this.robotList.push({ id, name, status, path, image });
          resolve(image);
        };
        icon.onerror = (err) => {
          reject(err);
        };
        icon.src = status
          ? require('@/assets/images/icon_robot_online.png')
          : require('@/assets/images/icon_robot_offline.png');
      });
    },
    addRobotPath(pixels, type = 'default', immediate = false) {
      return new Promise((resolve) => {
        const points = pixels.split(',z,a,').reduce((acc, pixel) => {
          const { x, y } = this.pixel2Coord(pixel);
          acc = acc.concat(x, y);
          return acc;
        }, []);
        const strokeColor = type === 'default' ? '#aaa' : '#008c74';
        const path = new Konva.Line({
          points: points,
          stroke: strokeColor,
          strokeWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
        });
        this.robotLayer.add(path);
        immediate && path.draw();
        resolve(path);
      });
    },
    pixel2Coord(pixel) {
      const [x, y] = pixel.split(',');
      const coordX = Math.round(x * this.scale * 100) / 100;
      const coordY = Math.round(y * this.scale * 100) / 100;
      return { x: coordX, y: coordY };
    },
    pixel2CoordAngle(pixel) {
      const [x, y, z, a] = pixel.split(',');
      const coordX = Math.round(x * this.scale * 100) / 100;
      const coordY = Math.round(y * this.scale * 100) / 100;
      return { x: coordX, y: coordY, angle: a };
    },
    getImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.onerror = (err) => {
          reject(err);
        };
        image.src = src;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.pmap {
  width: 100%;
  height: 100%;
  background-color: #fff;

  /deep/ .ant-spin-container {
    width: 100%;
    height: 100%;
  }
  &-wrapper {
    width: 100%;
    height: 100%;
  }
}
</style>
