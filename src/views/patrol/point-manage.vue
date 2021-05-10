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
          <span>间隔名称:</span>
          <a-input v-model="bayName" placeholder="请输入间隔名称" :max-length="20" allow-clear />
        </span>
        <span class="sg-query-item">
          <span>设备名称:</span>
          <a-input v-model="deviceName" placeholder="请输入设备名称" :max-length="20" allow-clear />
        </span>
        <span class="sg-query-item">
          <span>视频设备名称:</span>
          <a-input
            v-model="detectorName"
            placeholder="请输入视频设备名称"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>点位名称:</span>
          <a-input v-model="name" placeholder="请输入巡视点位名称" :max-length="20" allow-clear />
        </span>
        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleExportData">导出</a-button>
        <!-- <a-button @click="handleUpdateData">更新</a-button> -->
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
        <template v-slot:video="data">
          <a-icon v-if="data" type="check" />
        </template>
        <template v-slot:robot="data">
          <a-icon v-if="data" type="check" />
        </template>
      </a-table>
    </a-col>
  </a-row>
</template>

<script>
import FileSaver from 'file-saver';
import SgTree from '@/components/Tree/Antd';
import { DEVICE_TYPE, METER_TYPE, RECOGNITION_TYPE } from '@/enum';

export default {
  name: 'PointManage',
  components: {
    SgTree,
  },
  computed: {
    deviceTypes() {
      return Object.entries(DEVICE_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    recognitionTypes() {
      return Object.entries(RECOGNITION_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '间隔名称', dataIndex: 'bayName', align: 'center', width: 150 },
        { title: '设备名称', dataIndex: 'deviceName', align: 'center', width: 150 },
        { title: '部件名称', dataIndex: 'device.name', align: 'center', width: 150 },
        { title: '视频设备名称', dataIndex: 'detector.name', align: 'center', width: 150 },
        { title: '巡视点位', dataIndex: 'name', align: 'center', width: 300, ellipsis: true },
        {
          title: '设备类型',
          dataIndex: 'deviceType',
          align: 'center',
          width: 200,
          filterMultiple: false,
          filters: this.deviceTypes,
        },
        {
          title: '识别类型',
          dataIndex: 'recognitionType',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.recognitionTypes,
        },
        { title: '表计类型', dataIndex: 'meterType', align: 'center', width: 150 },
        {
          title: '视频',
          dataIndex: 'isvideo',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'video' },
        },
        {
          title: '机器人',
          dataIndex: 'isrobot',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'robot' },
        },
        { title: '正常值', dataIndex: 'default_value', align: 'center', width: 100 },
      ];
    },
  },
  data() {
    return {
      name: '',
      stationId: '',
      stationName: '请选择站点',
      bayName: '',
      deviceName: '',
      detectorName: '',
      deviceType: undefined,
      recognitionType: undefined,
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
    handleExportData() {
      this.tableLoad = true;
      this.$api
        .getBaseApi('patrolpoint_csv', {
          substation: this.stationId,
          recognition_type: this.recognitionType,
          device__area__device_type: this.deviceType,
          detector__name__icontains: this.detectorName,
          device__area__name__icontains: this.deviceName,
          device__area__parent__name__icontains: this.bayName,
        })
        .then((res) => {
          if (!res) return;
          const blob = new Blob([`\uFEFF${res}`], { type: 'text/csv;charset=utf-8' });
          FileSaver.saveAs(blob, '巡视点位数据.csv');
          // this.tableLoad = false;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    handleUpdateData() {},
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
      this.pagination.current = pagination.current;
      if (filters['deviceType'] && filters['deviceType'].length > 0) {
        this.deviceType = filters['deviceType'][0];
      } else {
        this.deviceType = undefined;
      }
      if (filters['recognitionType'] && filters['recognitionType'].length > 0) {
        this.recognitionType = filters['recognitionType'][0];
      } else {
        this.recognitionType = undefined;
      }
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      this.$api
        .getBaseApi('patrolpoint_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          substation: this.stationId,
          recognition_type: this.recognitionType,
          device__area__device_type: this.deviceType,
          detector__name__icontains: this.detectorName,
          device__area__name__icontains: this.deviceName,
          device__area__parent__name__icontains: this.bayName,
          name: this.name,
        })
        .then((res) => {
          if (!res || !res.results) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          this.tableData = res.results.map((item, index) => {
            const { device, meter_type, execute_type, recognition_type } = item;
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
            return {
              ...item,
              index: tableIndex,
              isvideo: execute_type === 0 || execute_type === 2,
              isrobot: execute_type === 1 || execute_type === 2,
              bayName: device?.area?.parent.name || '-',
              deviceName: device?.area.name || '-',
              meterType: METER_TYPE[meter_type] || '-',
              recognitionType: RECOGNITION_TYPE[recognition_type] || '-',
              deviceType:
                device?.area.device_type !== null ? DEVICE_TYPE[device?.area.device_type] : '-',
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
  },
};
</script>
