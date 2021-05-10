<template>
  <div class="map">
    <a-input-search
      v-model="keyword"
      class="map-search"
      placeholder="请输入关键字搜索"
      :max-length="20"
      enter-button
      allow-clear
      @search="onMapSearch"
    />
    <sg-tmap />

    <a-modal
      v-model="mapModal"
      width="75vw"
      dialog-class="sg-modal"
      :title="mapModalTitle"
      :footer="false"
      centered
    >
      <sg-camera
        class="map-camera"
        v-bind="{
          url: cameraData.url,
          did: cameraData.did,
          cno: cameraData.cno,
          preset: cameraData.preset,
          detector: cameraData.detector,
          autoplay: true,
        }"
      />
    </a-modal>
  </div>
</template>

<script>
import SgTmap from '@/components/Map/3DMap';
import SgCamera from '@/components/Monitor/CameraPlayer';

export default {
  name: 'SpatialAnalysis',
  components: {
    SgTmap,
    SgCamera,
  },
  data() {
    return {
      keyword: '',
      mapModal: true,
      mapModalTitle: '摄像机监控',
      cameraData: {
        url: '',
        did: 1,
        cno: 2,
        preset: null,
        detector: { name: '摄像机监控' },
      },
    };
  },
  methods: {
    onMapSearch(val) {
      console.log(val);
    },
  },
};
</script>

<style lang="less" scoped>
.map {
  position: relative;
  width: 100%;
  height: 100%;

  &-search {
    z-index: 100;
    position: absolute;
    top: 10px;
    left: 10px;
    width: 300px;
  }
  &-camera {
    width: 100%;
    height: 75vh;
  }
}
</style>
