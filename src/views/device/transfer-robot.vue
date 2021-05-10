<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="16">
      <div class="bmap">
        <div id="bmap" class="bmap-container"></div>
        <ul class="bmap-data">
          <li class="total">
            <b>{{ mapData.stationTotal }}</b>
            <span>变电站总数</span>
          </li>
          <li class="station">
            <b>{{ mapData.stationCount }}</b>
            <span>轮转变电站数</span>
          </li>
          <li class="robot">
            <b>{{ mapData.robotCount }}</b>
            <span>轮转机器人数</span>
          </li>
        </ul>
      </div>
    </a-col>
    <a-col class="sg-col" :span="8">
      <a-table
        class="table"
        table-layout="auto"
        row-key="id"
        :loading="robotLoad"
        :columns="robotColumns"
        :data-source="robotData"
        :pagination="robotPage"
        :bordered="true"
        @change="onRobotTableChange"
      >
        <template #title>转运机器人</template>
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleTransferRobot(row.id)">查看</a-button>
          </div>
        </template>
      </a-table>
      <a-table
        class="table"
        table-layout="auto"
        row-key="id"
        :loading="recordLoad"
        :columns="recordColumns"
        :data-source="recordData"
        :pagination="recordPage"
        :bordered="true"
        @change="onRecordTableChange"
      >
        <template #title>机器人转运状况</template>
      </a-table>
    </a-col>
  </a-row>
</template>

<script>
import { ROBOT_TRANSPORT_STATUS } from '@/enum';

export default {
  name: 'TransferRobot',
  computed: {
    robotColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '机器人名称', dataIndex: 'name', align: 'center' },
        { title: '计划轮转次数', dataIndex: 'plantimes', align: 'center' },
        { title: '实际轮转次数', dataIndex: 'realtimes', align: 'center' },
        { title: '操作', align: 'center', width: 100, scopedSlots: { customRender: 'operation' } },
      ];
    },
    recordColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 20 },
        { title: '变电站', dataIndex: 'name', align: 'center', width: 40, ellipsis: true },
        { title: '计划进站时间', dataIndex: 'plan_time', align: 'center', width: 20 , ellipsis: true},
        { title: '实际进站时间', dataIndex: 'start_time', align: 'center', width: 20 ,ellipsis: true},
        { title: '执行状态', dataIndex: 'state', align: 'center ', width: 20, ellipsis: true },
      ];
    },
  },
  data() {
    return {
      bmap: null,
      mapData: {
        stationTotal: 0,
        stationCount: 0,
        robotCount: 0,
      },
      robotId: null,
      robotLoad: false,
      robotData: [],
      robotPage: { total: 0, current: 1, pageSize: 5, size: 'small' },
      recordLoad: false,
      recordData: [],
      recordPage: { total: 0, current: 1, pageSize: 5, size: 'small' },
    };
  },
  mounted() {
    this.initBMap();
    this.getTransferRobotData();
    this.getTransferStatisData();
  },
  methods: {
    initBMap() {
      this.bmap = new BMap.Map('bmap', { minZoom: 12, maxZoom: 15 });
      // const tileLayer = new BMap.TileLayer();
      // tileLayer.getTilesUrl = function (tileCoord, zoom) {
      //   var x = tileCoord.x;
      //   var y = tileCoord.y;
      //   var url = `tiles/${zoom}/${x}/${y}/.jpg`;
      //   return url;
      // };
      // this.bmap.addTileLayer(tileLayer);
      this.bmap.centerAndZoom(new BMap.Point(104.20099072, 36.5278121), 12);
      this.bmap.enableScrollWheelZoom(true);
    },
    addMarker({ type, robot, station, datetime }) {
      const { name, longitude, latitude } = station;
      const point = new BMap.Point(longitude, latitude);
      const icon = new BMap.Icon(
        require('@/assets/images/icon_station.png'),
        new BMap.Size(20, 20),
        { imageSize: new BMap.Size(20, 20) }
      );
      const marker = new BMap.Marker(point, { icon: icon });
      const label = new BMap.Label(name, { offset: new BMap.Size(10, 20) });
      label.setStyle({
        border: 'none',
        fontWeight: 'bold',
        backgroundColor: 'tranparent',
        transform: 'translateX(-50%)',
      });
      marker.setLabel(label);
      this.bmap.addOverlay(marker);
      const infoString =
        type === 'out' ? `${robot.name}于${datetime}转出` : `${robot.name}于${datetime}转入`;
      const infoWindow = new BMap.InfoWindow(infoString, { enableCloseOnClick: false });
      marker.openInfoWindow(infoWindow);
    },
    handleTransferRobot(id) {
      this.robotId = id;
      this.recordPage.current = 1;
      this.getTransferRecordData();
    },
    onRobotTableChange(pagination) {
      this.robotPage.current = pagination.current;
      this.getTransferRobotData();
    },
    onRecordTableChange(pagination) {
      this.recordPage.current = pagination.current;
      this.getTransferRecordData();
    },
    getTransferCount(data) {
      return new Promise((resolve, reject) => {
        this.$api
          .getBaseApi('robottransportplan_count', data)
          .then((res) => resolve(res.count))
          .catch((err) => reject(err));
      });
    },
    getTransferRobotData() {
      this.robotLoad = true;
      this.$api
        .getBaseApi('detector', {
          page_num: this.robotPage.current,
          page_size: this.robotPage.pageSize,
          dec_type__in: '1,4,5',
          istransport: 1,
        })
        .then((res) => {
          // console.log(res);
          if (!res || !res.results) return;
          let robotData = [];
          res.results.forEach(async (item, index) => {
            const tableIndex = this.robotPage.pageSize * (this.robotPage.current - 1) + index + 1;
            const plantimes = await this.getTransferCount({ detector_id: item.id });
            const realtimes = await this.getTransferCount({ detector_id: item.id, status: 1 });
            robotData.push({ ...item, plantimes, realtimes, index: tableIndex });
          });
          this.robotData = robotData;
          this.robotPage.total = res.count;
        })
        .finally(() => {
          this.robotLoad = false;
        });
    },
    getTransferRecordData() {
      // 先清除地图上标记
      this.bmap && this.bmap.clearOverlays();
      this.$api
        .getBaseApi('robottransportrecord_depth', {
          page_num: this.recordPage.current,
          page_size: this.recordPage.pageSize,
          robottransportplan__detector_id: this.robotId,
        })
        .then((res) => {
          if (!res || !res.results) return;
          let recordData = [];
          res.results.forEach((item, index) => {
            const { robottransportplan } = item;
            this.addMarker({
              type: 'out',
              robot: robottransportplan.detector,
              station: robottransportplan.substation_out,
              datetime: item.start_time,
            });
            this.addMarker({
              type: 'in',
              robot: robottransportplan.detector,
              station: robottransportplan.substation_in,
              datetime: item.end_time,
            });
            const tableIndex = this.recordPage.pageSize * (this.recordPage.current - 1) + index + 1;
            recordData.push({
              ...item,
              index: tableIndex,
              plan_time: robottransportplan.start_time,
              state: ROBOT_TRANSPORT_STATUS[robottransportplan.status] || '-',
              name: robottransportplan.substation_out.name + '→' + robottransportplan.substation_in.name,
            });
          });
          this.recordData = recordData;
          console.log(recordData);
          this.recordPage.total = res.count;
        });
    },
    getTransferStatisData() {
      this.$api.getBaseApi('substation_count').then((res) => {
        if (!res) return;
        this.mapData.stationTotal = res.count;
      });
      this.$api.getBaseApi('substation_count', { istransport: 1 }).then((res) => {
        if (!res) return;
        this.mapData.stationCount = res.count;
      });
      this.$api
        .getBaseApi('detector_count', { istransport: 1, dec_type__in: '1,4,5' })
        .then((res) => {
          if (!res) return;
          this.mapData.robotCount = res.count;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.bmap {
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 5px #aaa;

  &-container {
    width: 100%;
    height: 100%;
  }
  &-data {
    display: flex;
    align-items: center;
    position: absolute;
    top: 10px;
    left: 10px;

    li {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 1px solid currentColor;

      > b {
        font-size: 20px;
        margin-bottom: 5px;
      }
      + li {
        margin-left: 10px;
      }
      &.total {
        color: @link-color;
      }
      &.robot {
        color: @error-color;
      }
      &.station {
        color: @success-color;
      }
    }
  }
}

.table {
  width: 100%;
  height: 44vh;
  background-color: #fff;

  /deep/ .ant-table {
    width: 100%;

    th {
      height: 5vh;
      padding: 0 10px;
      font-weight: bold;
      background-color: @theme-color6;
    }
    td {
      height: 6vh;
      padding: 0 10px;
    }
    &-title {
      height: 4vh;
      padding: 0 15px;
      line-height: 4vh;
      font-size: 16px;
      font-weight: bold;
      background-color: @theme-color6;
    }
    &-content {
      width: 100%;
      height: 35vh;
    }
    &-placeholder {
      border: none;
    }
    &-pagination {
      display: flex;
      align-items: center;
      height: 5vh;
      margin: 0 10px;
    }
  }
}
</style>
