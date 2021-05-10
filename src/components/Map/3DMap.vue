<template>
  <a-spin class="tmap" :spinning="loading">
    <div id="tmap" class="tmap-wrapper" ref="tmap"></div>
  </a-spin>
</template>

<script>
import * as Three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default {
  name: 'ThreedMap',
  data() {
    return {
      loading: false,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
    };
  },
  mounted() {
    this.initMap();
    this.renderMap();
  },
  beforeDestroy() {
    this.renderer && this.renderer.dispose();
    this.controls && this.controls.dispose();
  },
  methods: {
    initMap() {
      this.loading = true;
      const map = document.getElementById('tmap');
      const style = window.getComputedStyle(map);
      console.log(style.width, style.height);
      const width = +style.width.replace('px', '');
      const height = +style.height.replace('px', '');
      // 初始化场景
      this.scene = new Three.Scene();
      // 添加点光源
      const pointLight = new Three.PointLight(0xffffff);
      pointLight.position.set(200, 200, 200);
      this.scene.add(pointLight);
      // 添加环境光
      const ambientLight = new Three.AmbientLight(0xffffff);
      this.scene.add(ambientLight);
      // 初始化相机
      this.camera = new Three.PerspectiveCamera(45, width / height, 1, 1000);
      this.camera.position.set(0, 30, 30);
      // 初始化渲染器
      this.renderer = new Three.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.domElement.style.outline = 'none';
      map.appendChild(this.renderer.domElement);
      // 初始化控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enablePan = true; // 开启拖拽
      this.controls.enableZoom = true; // 开启缩放
      this.controls.enableDamping = true; // 开启惯性
      this.controls.dampingFactor = 0.25; // 阻尼系数
      this.controls.maxAzimuthAngle = Math.PI / 2;
      this.controls.minAzimuthAngle = -Math.PI / 2;
      this.controls.maxPolarAngle = Math.PI / 2;
      this.controls.minPolarAngle = -Math.PI / 2;
      // 加载模型文件
      const loader = new GLTFLoader();
      return new Promise((resolve, reject) => {
        loader.load(
          '/models/map/map.gltf',
          (gltf) => {
            // 修改模型材质
            // gltf.scene.traverse((obj) => {
            //   obj.material = {};
            // });
            const group = new Three.Group();
            group.add(gltf.scene);
            const box = new Three.Box3();
            box.setFromObject(group);
            const object = new Three.Object3D();
            object.add(group);
            object.position.set(0, 0, 0);
            this.scene.add(object);
            this.loading = false;
            resolve();
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (err) => {
            this.loading = false;
            reject(err);
          }
        );
      });
    },
    renderMap() {
      if (!this.renderer) return;
      requestAnimationFrame(this.renderMap);
      this.renderer.render(this.scene, this.camera);
    },
  },
};
</script>

<style lang="less" scoped>
.tmap {
  width: 100%;
  height: 100%;

  /deep/ .ant-spin-container {
    width: 100%;
    height: 100%;
  }
  &-wrapper {
    width: 100%;
    height: 100%;
    background-color: #ccc;

    canvas {
      outline: none;
    }
  }
}
</style>
