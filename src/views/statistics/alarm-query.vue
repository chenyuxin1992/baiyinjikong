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
          <span>设备名称:</span>
          <a-input v-model="deviceName" placeholder="请输入设备名称" :max-length="20" allow-clear />
        </span>
        <span class="sg-query-item">
          <span>告警内容:</span>
          <a-input v-model="alarmInfo" placeholder="请输入告警内容" :max-length="20" allow-clear />
        </span>
        <!-- <span class="sg-query-item">
          <span>告警类型:</span>
          <a-select
            v-model="alarmType"
            :options="alarmTypes"
            placeholder="请选择告警类型"
            allow-clear
          ></a-select>
        </span> -->
        <span class="sg-query-item">
          <span>告警时间:</span>
          <a-range-picker v-model="timeRange" separator="至"></a-range-picker>
        </span>

        <a-button @click="handleQueryData">查询</a-button>
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
        :bordered="true"
        @change="onTableChange"
      >
        <template #progress>
          <a-progress :percent="80" :show-info="false" />
        </template>
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button v-if="row.status === 2" size="small" @click="handleAlarmItem(row, 'confirm')">
              确认
            </a-button>
            <a-button v-if="row.status === 2" size="small" @click="handleAlarmItem(row, 'mistake')">
              误报
            </a-button>
            <a-button
              v-if="row.status === 2 || row.status === 3"
              size="small"
              @click="handleAlarmItem(row, 'defect')"
            >
              转缺陷
            </a-button>
            <a-button v-if="row.status === 4" size="small" @click="handleAlarmItem(row, 'detail')">
              查看缺陷
            </a-button>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="defectModal"
      width="40vw"
      dialog-class="sg-modal"
      :title="defectModalTitle"
      centered
    >
      <a-form-model
        class="sg-form"
        ref="defectForm"
        :model="defectForm"
        :rules="defectRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item class="col-12" prop="substation_name" label="变电站">
          <a-input v-model="defectForm.substation_name" placeholder="请输入变电站" disabled />
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="plantask_name" label="巡视任务">
          <a-input v-model="defectForm.plantask_name" placeholder="请输入巡视任务" disabled />
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="device_name" label="告警设备">
          <a-input v-model="defectForm.device_name" placeholder="请输入告警设备" disabled />
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="patrolpoint_name" label="告警点位">
          <a-input v-model="defectForm.patrolpoint_name" placeholder="请选择告警点位" disabled />
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="alarm_type" label="告警类型">
          <a-select
            v-model="defectForm.alarm_type"
            :options="alarmTypes"
            placeholder="请选择告警类型"
            disabled
          ></a-select>
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="alarm_level" label="告警等级">
          <a-select
            v-model="defectForm.alarm_level"
            :options="alarmLevels"
            placeholder="请选择告警等级"
            disabled
          ></a-select>
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="record_time" label="告警时间">
          <a-date-picker
            v-model="defectForm.record_time"
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择告警时间"
            style="width: 100%"
            disabled
          ></a-date-picker>
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="reason" label="缺陷原因" required>
          <a-input
            v-model="defectForm.reason"
            placeholder="请输入缺陷原因"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="image" label="告警图片">
          <img v-if="defectForm.image" :src="defectForm.image" alt="#" />
          <a-empty v-else description="暂无图片数据" />
        </a-form-model-item>
        <a-form-model-item class="col-12" prop="finder" label="缺陷发现人" required>
          <a-input
            v-model="defectForm.finder"
            placeholder="请输入缺陷发现人"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
      </a-form-model>
      <template v-if="defectAction === 'defect'" #footer>
        <a-button type="default" @click="onModalAction('cancel')">取消</a-button>
        <a-button type="primary" @click="onModalAction('submit')">提交</a-button>
      </template>
      <template v-else #footer></template>
    </a-modal>
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';
import { underline } from '@/utils';
import { ALARM_TYPE, ALARM_LEVEL, ALARM_STATUS, DATA_SOURCE, DEVICE_TYPE } from '@/enum';

export default {
  name: 'AlarmQuery',
  components: {
    SgTree,
  },
  computed: {
    alarmTypes() {
      return Object.entries(ALARM_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    alarmLevels() {
      return Object.entries(ALARM_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    dataSources() {
      return Object.entries(DATA_SOURCE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation_name', align: 'center', width: 150 },
        { title: '设备类型', dataIndex: 'deviceType', align: 'center', width: 150 },
        { title: '设备名称', dataIndex: 'device_name', align: 'center', width: 150 },
        { title: '告警点位', dataIndex: 'patrolpoint_name', align: 'center', width: 150 },
        { title: '告警内容', dataIndex: 'alarm_disp', align: 'center', width: 150 },
        {
          title: '告警类型',
          dataIndex: 'alarmType',
          align: 'center',
          width: 150,
          sorter: true,
          filterMultiple: false,
          filters: this.alarmTypes,
        },
        {
          title: '告警等级',
          dataIndex: 'alarmLevel',
          align: 'center',
          width: 150,
          sorter: true,
          filterMultiple: false,
          filters: this.alarmLevels,
        },
        {
          title: '告警时间',
          dataIndex: 'record_time',
          align: 'center',
          width: 150,
          sorter: true,
          sortDirections: ['ascend', 'descend'],
        },
        {
          title: '告警来源',
          dataIndex: 'alarmSource',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.dataSources,
        },
        { title: '告警状态', dataIndex: 'alarmState', align: 'center', width: 100 },
        { title: '告警次数', dataIndex: 'alarmTimes', align: 'center', width: 100 },
        { title: '是否联动', dataIndex: 'islinkage', align: 'center', width: 100 },
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
      status: '',
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      deviceName: '',
      alarmInfo: '',
      alarmType: undefined,
      alarmLevel: undefined,
      alarmSource: undefined,
      tableLoad: false,
      tableData: [],
      tableSort: [],
      defectAction: '',
      defectModal: false,
      defectModalTitle: '',
      defectForm: {
        device_name: '',
        plantask_name: '',
        substation_name: '',
        patrolpoint_name: '',
        alarm_type: undefined,
        alarm_level: undefined,
        record_time: null,
        reason: '',
        finder: '',
      },
      defectRules: {
        reason: [{ required: true, message: '请输入缺陷原因' }],
        finder: [{ required: true, message: '请输入缺陷发现人' }],
      },
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
      deviceType: '',
    };
  },
  created() {
    this.stationId = this.$route.query.stationId;
    this.alarmLevel = this.$route.query.alarm_level;
    this.deviceType = this.$route.query.device_type;
    this.status = this.$route.query.status;
    this.alarmType = this.$route.query.alarm_type;

    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    handleExportData() {
      this.tableLoad = true;
      let params = [];
      this.stationId && params.push({ match: { substation_id: this.stationId } });
      this.alarmInfo && params.push({ match: { alarm_disp: this.alarmInfo } });
      this.alarmType && params.push({ match: { alarm_type: this.alarmType } });
      this.alarmLevel && params.push({ match: { alarm_level: this.alarm_evel } });
      this.deviceType && params.push({ match: { device_type: this.deviceType } });
      this.deviceName && params.push({ match: { device_name: this.deviceName } });
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          size: 10000,
          sort: this.tableSort,
          query: {
            bool: {
              must: params,
              filter: [
                { range: { record_time: { gte: timeStart, lte: timeEnd } } },
                { range: { status: { gte: 2, lte: 4 } } },
              ],
            },
          },
          aggs: {
            total: { cardinality: { field: 'patrolpoint_id' } },
            count: { terms: { field: 'patrolpoint_id' } },
          },
          collapse: { field: 'patrolpoint_id' },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res) return;
          let alarmCountMap = {};
          const buckets = res.aggregations.count.buckets;
          buckets.forEach((item) => (alarmCountMap[item.key] = item.doc_count));
          let tableData = [];
          const header = this.tableColumns.map((item) => item.title);
          const keys = this.tableColumns.map((item) => item.dataIndex).filter(Boolean);
          for (let i = 0, len = res.hits.hits.length; i < len; i++) {
            const { _id, _source } = res.hits.hits[i];
            const dataItem = {
              ..._source,
              id: _id,
              index: i + 1,
              islinkage: _source.islinked ? '是' : '否',
              // deviceType: DEVICE_TYPE[_source.device_type] || '-',
              deviceType: DEVICE_TYPE[this.deviceType] || '-',
              // alarmType: ALARM_TYPE[_source.alarm_type] || '-',
              alarmType: ALARM_TYPE[this.alarmType] || '-',
              // alarmLevel: ALARM_LEVEL[_source.alarm_level] || '-',
              alarmLevel: ALARM_LEVEL[this.alarm_level] || '-',
              alarmState: ALARM_STATUS[_source.status] || '-',
              alarmSource: DATA_SOURCE[_source.source] || '-',
              alarmTimes: alarmCountMap[_source.patrolpoint_id] || 1,
            };
            tableData.push(keys.map((key) => dataItem[key] || '-'));
          }
          import('@/utils/export').then((excel) => {
            excel.export_json_to_excel({
              header,
              data: tableData,
              autoWidth: true,
              bookType: 'xlsx',
              filename: '告警信息数据',
            });
            this.tableLoad = false;
          });
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    handleAlarmItem(row, action) {
      this.defectAction = action;
      switch (action) {
        case 'confirm':
          this.$api
            .postHistoryApi('alarmitems', `_update/${row.id}?refresh=wait_for`, {
              doc: { status: 3 },
            })
            .then(() => {
              this.getTableData();
            });
          break;
        case 'mistake':
          this.$api
            .postHistoryApi('alarmitems', `_update/${row.id}?refresh=wait_for`, {
              doc: { status: 5 },
            })
            .then(() => {
              this.getTableData();
            });
          break;
        case 'defect':
          this.defectForm = { ...row, reason: '', finder: '', find_time: this.$current() };
          this.defectModalTitle = '告警转缺陷';
          this.defectModal = true;
          break;
        case 'detail':
          this.defectForm = { ...row, record_time: this.$moment(row.record_time) };
          this.defectModalTitle = '缺陷详情信息';
          this.defectModal = true;
          break;
        default:
          break;
      }
    },
    onModalAction(action) {
      switch (action) {
        case 'cancel':
          this.defectModal = false;
          break;
        case 'submit':
          this.$refs.defectForm.validate((valid) => {
            if (valid) {
              this.$api
                .postHistoryApi('alarmitems', `_update/${this.defectForm.id}?refresh=wait_for`, {
                  doc: {
                    ...this.defectForm,
                    status: 4,
                  },
                })
                .then(() => {
                  this.getTableData();
                  this.defectModal = false;
                });
              // this.$api
              //   .postHistoryApi('alarmitems', `_doc`, { ...this.defectForm, status: 1 })
              //   .then(() => {
              //     this.$message.success('告警转缺陷成功！');
              //     this.defectModal = false;
              //   });
            } else {
              return false;
            }
          });
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
    onTableChange(pagination, filters, sorter) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      if (filters['alarmType'] && filters['alarmType'].length > 0) {
        this.alarmType = filters['alarmType'][0];
      } else {
        this.alarmType = undefined;
      }
      if (filters['alarmLevel'] && filters['alarmLevel'].length > 0) {
        this.alarmLevel = filters['alarmLevel'][0];
      } else {
        this.alarmLevel = undefined;
      }
      if (filters['alarmSource'] && filters['alarmSource'].length > 0) {
        this.alarmSource = filters['alarmSource'][0];
      } else {
        this.alarmSource = undefined;
      }
      if (sorter.column) {
        // 排序参数格式转换
        this.tableSort = [
          { [underline(sorter.field)]: { order: sorter.order.replace('end', '') } },
        ];
      } else {
        this.tableSort = [];
      }
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      let params = [];
      this.status && params.push({ match: { status: this.status } });
      this.stationId && params.push({ match: { substation_id: this.stationId } });
      this.alarmInfo && params.push({ match: { alarm_disp: this.alarmInfo } });
      this.alarmType && params.push({ match: { alarm_type: this.alarmType } });
      this.alarmLevel && params.push({ match: { alarm_level: this.alarmLevel } });
      this.alarmSource && params.push({ match: { source: this.alarmSource } });
      this.deviceType && params.push({ match: { device_type: this.deviceType } });
      this.deviceName && params.push({ match: { device_name: this.deviceName } });
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          from: this.pagination.pageSize * (this.pagination.current - 1),
          size: this.pagination.pageSize,
          sort: this.tableSort,
          query: {
            bool: {
              must: params,
              filter: [
                { range: { record_time: { gte: timeStart, lte: timeEnd } } },
                { range: { status: { gte: 2, lte: 4 } } },
              ],
            },
          },
          aggs: {
            count: { terms: { field: 'patrolpoint_id' } },
            total: { cardinality: { field: 'patrolpoint_id' } },
          },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res || !res.hits.hits) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          let alarmCountMap = {};
          const buckets = res.aggregations.count.buckets;
          buckets.forEach((item) => (alarmCountMap[item.key] = item.doc_count));
          let tableData = [];
          for (let i = 0, len = res.hits.hits.length; i < len; i++) {
            const { _id, _source } = res.hits.hits[i];
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + i + 1;
            const dataItem = {
              ..._source,
              id: _id,
              index: tableIndex,
              islinkage: _source.islinked ? '是' : '否',
              deviceType: DEVICE_TYPE[_source.device_type] || '-',
              alarmType: ALARM_TYPE[_source.alarm_type] || '-',
              alarmLevel: ALARM_LEVEL[_source.alarm_level] || '-',
              alarmState: ALARM_STATUS[_source.status] || '-',
              alarmSource: DATA_SOURCE[_source.source] || '-',
              alarmTimes: alarmCountMap[_source.patrolpoint_id] || 1,
            };
            tableData.push(dataItem);
          }
          this.tableData = tableData;
          this.pagination.total = res.hits.total.value;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {},
  },
};
</script>
