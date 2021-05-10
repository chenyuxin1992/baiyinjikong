<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <sg-tree @check="onTreeCheck" />
    </a-col>
    <a-col class="sg-col" :span="20">
      <div class="sg-query">
        <a-icon
          class="sg-query-icon"
          :type="isCollapsed ? 'right' : 'down'"
          @click="isCollapsed = !isCollapsed"
        />
        <span class="sg-query-item">
          <span>变电站:</span>
          <b class="sg-query-item__team">{{ stationName }}</b>
        </span>
        <span class="sg-query-item">
          <span>设备名称:</span>
          <a-input v-model="deviceName" placeholder="请输入设备名称" :max-length="20" allow-clear />
        </span>
        <span class="sg-query-item">
          <span>设备型号:</span>
          <a-input
            v-model="deviceModel"
            placeholder="请输入设备型号"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>设备来源:</span>
          <a-input
            v-model="deviceSource"
            placeholder="请输入设备来源"
            :max-length="20"
            allow-clear
          />
        </span>
        <div class="sg-query sg-query-collapse" :class="{ active: !isCollapsed }">
          <span class="sg-query-item">
            <span>使用单位:</span>
            <a-input
              v-model="deviceUnit"
              placeholder="请输入使用单位"
              :max-length="20"
              allow-clear
            />
          </span>
          <span class="sg-query-item">
            <span>生产厂家:</span>
            <a-input
              v-model="manufacturer"
              placeholder="请输入生产厂家"
              :max-length="20"
              allow-clear
            />
          </span>
        </div>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleQueryReset">重置</a-button>
        <a-button @click="handleExportData">导出</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: 2000 }"
        bordered
        @change="onTableChange"
      >
        <template #progress>
          <a-progress :percent="80" :show-info="false" />
        </template>
        <template v-slot:operation>
          <div class="operation">
            <a-button size="small" @click="handleMaintainRecord">维护记录</a-button>
            <a-button size="small" @click="handleTransferRecord">转运记录</a-button>
          </div>
        </template>
      </a-table>
    </a-col>
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';
import { CAMERA_TYPE, DETECTOR_TYPE, DETECTOR_STATUS, VIDEO_TYPE } from '@/enum';

export default {
  name: 'DeviceLedger',
  components: {
    SgTree,
  },
  computed: {
    videoTypes() {
      return Object.entries(VIDEO_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    cameraTypes() {
      return Object.entries(CAMERA_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    deviceTypes() {
      return Object.entries(DETECTOR_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    deviceStates() {
      return Object.entries(DETECTOR_STATUS).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 75 },
        { title: '变电站', dataIndex: 'substation.name', align: 'center', width: 150 },
        { title: '设备名称', dataIndex: 'name', align: 'center', width: 150 },
        {
          title: '设备类型',
          dataIndex: 'deviceType',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.deviceTypes,
        },
        { title: '设备型号', dataIndex: 'device_model', align: 'center', width: 150 },
        { title: '生产厂家', dataIndex: 'manufacturer', align: 'center', width: 150 },
        { title: '使用单位', dataIndex: 'use_unit', align: 'center', width: 150 },
        {
          title: '使用类型',
          dataIndex: 'cameraType',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.cameraTypes,
        },
        {
          title: '视频类型',
          dataIndex: 'videoType',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.videoTypes,
        },
        { title: '安装位置', dataIndex: 'place', align: 'center', width: 150 },
        {
          title: '运行状态',
          dataIndex: 'deviceState',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.deviceStates,
        },
        { title: '在线时长', dataIndex: 'online_time', align: 'center', width: 150 },
        { title: '离线时长', dataIndex: 'offline_time', align: 'center', width: 150 },
        { title: '设备来源', dataIndex: 'device_source', align: 'center', width: 150 },
        // { title: '操作', align: 'center', width: 200, scopedSlots: { customRender: 'operation' } },
      ];
    },
  },
  data() {
    return {
      isCollapsed: true,
      stationId: '',
      stationName: '请选择站点',
      deviceName: '',
      deviceUnit: '',
      deviceModel: '',
      deviceSource: '',
      manufacturer: '',
      videoType: undefined,
      cameraType: undefined,
      deviceType: undefined,
      deviceState: undefined,
      tableLoad: false,
      tableData: [],
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
    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    handleQueryReset() {
      this.stationId = '';
      this.deviceName = '';
      this.deviceUnit = '';
      this.deviceModel = '';
      this.deviceSource = '';
      this.manufacturer = '';
      this.videoType = undefined;
      this.cameraType = undefined;
      this.deviceType = undefined;
      this.deviceState = undefined;
      this.pagination.current = 1;
      this.getTableData();
    },
    handleExportData() {},
    handleMaintainRecord() {},
    handleTransferRecord() {},
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
    onTableChange(pagination, filters) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      if (filters['videoType'] && filters['videoType'].length > 0) {
        this.videoType = filters['videoType'][0];
      } else {
        this.videoType = undefined;
      }
      if (filters['cameraType'] && filters['cameraType'].length > 0) {
        this.cameraType = filters['cameraType'][0];
      } else {
        this.cameraType = undefined;
      }
      if (filters['deviceType'] && filters['deviceType'].length > 0) {
        this.deviceType = filters['deviceType'][0];
      } else {
        this.deviceType = undefined;
      }
      if (filters['deviceState'] && filters['deviceState'].length > 0) {
        this.deviceState = filters['deviceState'][0];
      } else {
        this.deviceState = undefined;
      }
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      this.$api
        .getBaseApi('detector_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          substation: this.stationId,
          dec_type: this.deviceType,
          status: this.deviceState,
          video_mode: this.videoType,
          camera_type: this.cameraType,
          name__icontains: this.deviceName,
          use_unit__icontains: this.deviceUnit,
          device_model__icontains: this.deviceModel,
          device_source__icontains: this.deviceSource,
          manufacturer__icontains: this.manufacturer,
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
              videoType: VIDEO_TYPE[item.video_mode] || '-',
              deviceType: DETECTOR_TYPE[item.dec_type] || '-',
              cameraType: CAMERA_TYPE[item.camera_type] || '-',
              deviceState: DETECTOR_STATUS[item.status] || '-',
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {},
  },
};
</script>
