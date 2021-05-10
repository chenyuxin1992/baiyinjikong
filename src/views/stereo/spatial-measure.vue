<template>
  <div class="map">
    <a-input-search
      v-model="keyword"
      class="map-search"
      placeholder="请输入关键字搜索"
      :max-length="20"
      enter-button
      @change="onMapSearch"
    />

    <sg-tmap />

    <a-button-group class="map-tool">
      <a-button
        v-for="item in mapTools"
        type="link"
        :key="item.key"
        :class="{ active: mapTool === item.key }"
        @click="handleMapMeasure(item.key)"
      >
        <sg-icon :name="item.key" /><span>{{ item.text }}</span>
      </a-button>
    </a-button-group>
    <section class="map-measure">
      <header class="map-measure__header">测量信息列表</header>
      <main class="map-measure__result">
        <a-collapse expandIconPosition="right" accordion>
          <a-collapse-panel key="1">
            <template #header><sg-icon name="ranging" /><span>手动测距</span></template>
            <ul class="map-measure__list">
              <li v-for="(item, index) in 10" :key="index">
                <span>手动测距结果：</span><span>{{ item }}</span>
              </li>
            </ul>
          </a-collapse-panel>
          <a-collapse-panel key="2">
            <template #header><sg-icon name="measure" /><span>对地测距</span></template>
            <ul class="map-measure__list">
              <li v-for="(item, index) in 10" :key="index">
                <span>对地测距结果：</span><span>{{ item }}</span>
              </li>
            </ul>
          </a-collapse-panel>
          <a-collapse-panel key="3">
            <template #header><sg-icon name="angle" /><span>角度测量</span></template>
            <ul class="map-measure__list">
              <li v-for="(item, index) in 10" :key="index">
                <span>角度测量结果：</span><span>{{ item }}</span>
              </li>
            </ul>
          </a-collapse-panel>
          <a-collapse-panel key="4">
            <template #header><sg-icon name="area" /><span>面积测量</span></template>
            <ul class="map-measure__list">
              <li v-for="(item, index) in 10" :key="index">
                <span>面积测量结果：</span><span>{{ item }}</span>
              </li>
            </ul>
          </a-collapse-panel>
        </a-collapse>

        <a-button type="primary" block @click="handleSaveResult">保存</a-button>
      </main>
    </section>
  </div>
</template>

<script>
import SgTmap from '@/components/Map/3DMap';

export default {
  name: 'SpatialMeasure',
  components: {
    SgTmap,
  },
  computed: {
    mapTools() {
      return [
        { key: 'ranging', text: '手动测距' },
        { key: 'measure', text: '对地测距' },
        { key: 'angle', text: '角度测量' },
        { key: 'area', text: '面积测量' },
      ];
    },
  },
  data() {
    return {
      keyword: '',
      mapTool: 'ranging',
      manualRanging: [],
      earthRanging: [],
      angleMeasure: [],
      areaMeasure: [],
    };
  },
  methods: {
    handleMapMeasure(key) {
      this.mapTool = key;
      switch (key) {
        case 1:
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          break;
        default:
          break;
      }
    },
    handleSaveResult() {},
    onMapSearch() {},
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
  &-tool {
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 10px;
    right: 10px;
    width: 300px;
    padding: 5px;
    border-radius: 5px;
    background-color: #fff;

    .ant-btn {
      display: flex;
      align-items: center;
      flex-direction: column;
      height: auto;
      padding: 0 5px;
      color: #333;
      border: none;

      > span {
        margin-left: 0;
      }
      &:hover,
      &.active {
        color: @theme-color3;

        .anticon {
          color: @theme-color3;
        }
      }
    }
  }
  &-measure {
    position: absolute;
    top: 80px;
    right: 10px;
    width: 300px;
    border-radius: 5px;

    /deep/ .ant-collapse {
      &-header {
        display: flex;
        align-items: center;
        padding: 5px 10px;

        .anticon {
          margin-right: 10px;
        }
      }
      &-content-box {
        padding: 10px;
      }
    }
    &__header {
      width: 100%;
      height: 4vh;
      padding-left: 10px;
      line-height: 4vh;
      color: #fff;
      font-weight: bold;
      background-color: @theme-color1;
    }
    &__result {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      height: 70vh;
      padding: 10px;
      background-color: #fff;
    }
    &__list {
      max-height: 40vh;
      overflow-y: auto;

      li + li {
        margin-top: 5px;
      }
    }
  }
}
</style>
