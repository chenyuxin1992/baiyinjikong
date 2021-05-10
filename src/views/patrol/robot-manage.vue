<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <sg-tree @check="onTreeCheck" />
    </a-col>
    <a-col class="sg-col" :span="20">
      <div class="sg-query">
        <span class="sg-query-item">
          <span>变电站:</span>
          <b class="sg-query-item__team">{{ stationName }}</b>
        </span>
        <span class="sg-query-item">
          <span>任务名称:</span>
          <a-input v-model="taskName" placeholder="请输入任务名称" :max-length="20" allow-clear />
        </span>

        <a-button @click="handleQueryData">查询</a-button>
      </div>

      <a-table
        class="sg-table"
        row-key="id"
        table-layout="auto"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: 1800 }"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleRobotItem(row, 'check')">查看</a-button>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="robotModal"
      width="75vw"
      title="机器人详情"
      dialog-class="sg-modal"
      :footer="false"
      centered
    >
      <a-tabs class="robot-tabs">
        <a-tab-pane key="video" tab="实时视频">
          <sg-robot
            class="robot-video"
            :detector="robotData"
            :light-url="robotData.video_address1"
            :infrared-url="robotData.video_address2"
            autoplay
          ></sg-robot>
        </a-tab-pane>
        <a-tab-pane key="map" tab="巡视地图">
          <div class="robot-map">
            <a-popover
              v-model="robotPopup"
              placement="leftTop"
              trigger="click"
              :get-popup-container="(node) => node.parentNode"
            >
              <a-button class="robot-map__popup" type="primary" size="small">
                {{ robotPopup ? '收起' : '展开' }}
              </a-button>
              <template #content>
                <ul class="robot-map__info">
                  <li v-for="(val, key) in robotInfo" :key="key">
                    <span>{{ val }}：</span>
                    <span>{{ robotData[key] }}</span>
                  </li>
                </ul>
              </template>
            </a-popover>
            <sg-pmap :map-url="robotMap" :robots="[robotData]" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';
import SgPmap from '@/components/Map/2DMap';
import SgRobot from '@/components/Monitor/RobotPlayer';
import {
  DETECTOR_TYPE,
  DETECTOR_STATUS,
  ROBOTDETECTOR_STATUS,
  TASK_PATROL_TYPE,
  TASK_STATUS,
  VIDEO_TYPE,
} from '@/enum';

export default {
  name: 'RobotManage',
  components: {
    SgTree,
    SgPmap,
    SgRobot,
  },
  computed: {
    robotInfo() {
      return {
        trafficState: '通讯状态',
        robotState: '运行状态',
        speed: '运行速度',
        mileage: '行驶里程',
        faultAlarm: '故障报警',
        driveExcept: '驱动异常',
        ultrasound: '超声停障',
        rotaryState: '轮转状态',
      };
    },
    taskStates() {
      return Object.entries(TASK_STATUS).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    patrolTypes() {
      return Object.entries(TASK_PATROL_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation.name', align: 'center', width: 150 },
        { title: '巡视主机', dataIndex: 'patrolhost.name', align: 'center', width: 200 },
        { title: '任务名称', dataIndex: 'taskName', align: 'center', width: 200 },
        { title: '机器人名称', dataIndex: 'name', align: 'center', width: 150 },
        { title: '机器人位置', dataIndex: 'coordinate_geography', align: 'center', width: 150 },
        { title: '机器人状态', dataIndex: 'robotState', align: 'center', width: 150 },
        { title: '机器人类型', dataIndex: 'robotType', align: 'center', width: 150 },
        { title: '视频类型', dataIndex: 'videoMode', align: 'center', width: 150 },
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          width: 200,
          scopedSlots: { customRender: 'operation' },
        },
      ];
    },
  },
  data() {
    return {
      dec_type: '',
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      taskName: '',
      robotMap: '',
      robotData: {},
      robotModal: false,
      robotPopup: true,
      tableLoad: false,
      status: '',
      tableData: [{ id: 1, index: 1 }],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
    };
  },
  created() {
    this.status = this.$route.query.status;
    this.dec_type = this.$route.query.type;
    this.stationId = this.$route.query.substation_id;
    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.dec_type = '';
      this.status = '';
      this.getTableData();
    },
    handleRobotItem(row, action) {
      switch (action) {
        case 'check':
          console.log(row);
          this.robotMap = `https://${location.hostname}:8443/html/shares/${row.map_path}`;
          this.robotData = row;
          this.robotModal = true;
          break;
        default:
          break;
      }
    },
    onTreeCheck(_, { node, checked }) {
      const { dataRef } = node;
      if (checked) {
        this.stationName = dataRef.name;
        this.stationId = dataRef.id;
      } else {
        this.stationName = '请选择站点';
        this.stationId = '';
      }
      this.pagination.current = 1;
      this.getTableData();
    },
    onTableChange(pagination) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      this.$api
        .getBaseApi('detector_depth', {
          substation: this.stationId,
          dec_type__in: '1,2,3',
          status: this.status,
        })
        .then((res) => {
          if (!res || !res.results) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          this.tableData = res.results.map((item, index) => {
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
            return {
              ...item,
              index: tableIndex,
              videoMode: VIDEO_TYPE[item.video_mode] || '-',
              robotType: DETECTOR_TYPE[item.dec_type] || '-',
              robotState: ROBOTDETECTOR_STATUS[item.status] || '-',
              trafficState: item.comm_abnormal ? '正常' : '异常',
              rotaryState: item.transport_status ? '值班' : '空闲',
              faultAlarm: item.fault_alarm ? '报警' : '故障',
              driveExcept: item.drive_exception ? '正常' : '异常',
              ultrasound: item.ultrasonic_stopping ? '正常' : '异常',
            };
          });
          this.pagination.total = res.count;

          if (this.dec_type) {
            this.tableData = this.tableData.filter((item) => {
              return item.robotType === DETECTOR_TYPE[this.dec_type];
            });
            this.pagination.total = this.tableData.length;
          }
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {},
  },
};
</script>

<style lang="less" scoped>
.robot-map {
  position: relative;
  width: 100%;
  height: 75vh;

  &__popup {
    z-index: 100;
    position: absolute;
    top: 0;
    right: 0;
  }
  &__info {
    width: 8vw;

    li + li {
      margin-top: 1vh;
    }
  }
}
.robot-video {
  width: 100%;
  height: 75vh;
}
</style>
