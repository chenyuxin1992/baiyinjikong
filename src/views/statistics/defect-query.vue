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
          <span>日期范围:</span>
          <a-range-picker v-model="timeRange" separator="至"></a-range-picker>
        </span>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleSyncData">同步</a-button>
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
        <template v-slot:image="data">
          <img v-if="data" :src="data" alt="#" style="display: inline-block; height: 100%" />
          <span v-else>无</span>
        </template>
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleDefectItem(row, 'sync')">同步</a-button>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="defectModal"
      width="40vw"
      title="缺陷记录同步"
      dialog-class="sg-modal"
      centered
    >
      <a-form-model
        class="sg-form"
        ref="defectForm"
        :model="defectForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <template v-for="(val, key) in defectModel">
          <a-form-model-item
            v-if="
              key === 'isFamilyDefect' ||
              key === 'whetherCorrective' ||
              key === 'whetherAcceptanceQual'
            "
            class="col-8"
            :key="key"
            :prop="key"
            :label="val"
            :label-col="{ span: 10 }"
            :wrapper-col="{ span: 14 }"
            :rules="{ required: true, message: `请设置${val}` }"
            required
          >
            <a-switch v-model="defectForm[key]" />
          </a-form-model-item>
          <a-form-model-item
            v-else-if="
              key === 'acceptanceTime' || key === 'correctiveDate' || key === 'discoveredDate'
            "
            class="col-12"
            :key="key"
            :prop="key"
            :label="val"
            :rules="{ required: true, message: `请选择${val}` }"
            required
          >
            <a-date-picker
              v-model="defectForm[key]"
              :placeholder="`请选择${val}`"
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </a-form-model-item>
          <a-form-model-item
            v-else
            class="col-12"
            :key="key"
            :prop="key"
            :label="val"
            :rules="{ required: true, message: `请输入${val}` }"
            required
          >
            <a-input
              v-model="defectForm[key]"
              :placeholder="`请输入${val}`"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>
        </template>
      </a-form-model>
      <template #footer>
        <a-button type="default" @click="onModalAction('cancel')">取消</a-button>
        <a-button type="primary" @click="onModalAction('submit')">提交</a-button>
      </template>
    </a-modal>
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';
import { ALARM_TYPE, ALARM_LEVEL, DATA_SOURCE, DEVICE_TYPE, ALARM_STATUS } from '@/enum';

export default {
  name: 'DefectQuery',
  components: {
    SgTree,
  },
  computed: {
    defectModel() {
      return {
        // ip: '服务器IP',
        // port: '服务器端口',
        acceptanceMonadName: '验收单位',
        acceptanceOpinion: '验收意见',
        acceptanceTime: '验收日期',
        acceptorName: '验收人',
        assetName: '资源名称',
        attachmentsNo: '附件数量',
        classificationName: '分类依据',
        correctiveDate: '消缺日期',
        correctiveMonadName: '消缺单位',
        correctivePeasonName: '消缺人',
        correctiveTeamName: '消缺班组',
        defectContent: '缺陷内容',
        defectMainEquipName: '设备名称',
        defectNumber: '缺陷数量',
        defectProperties: '缺陷等级',
        defectState: '流程状态',
        defectZone: '缺陷部位',
        discoveredDate: '发现日期',
        discovererName: '发现人',
        disposeDetail: '处理结果',
        dutyReasons: '责任原因',
        facilityKind: '设施类型',
        fileName: '缺陷图片',
        findSource: '发现来源',
        kind: '站线类型',
        legacy: '遗留问题',
        lineName: '线路名称',
        mRID: '缺陷记录ID',
        manufacturer: '生产厂家',
        phase: '相别类型',
        principal: '工作负责人',
        professionalClass: '专业分类',
        professionalNature: '专业性质',
        quotMonadName: '发现人单位',
        remarks: '备注内容',
        technicalReason: '技术原因',
        unitType: '部件类型',
        voltageClass: '电压等级',
        isFamilyDefect: '是否家族缺陷',
        whetherAcceptanceQual: '验收是否合格',
        whetherCorrective: '是否已消缺',
      };
    },
    defectRules() {
      return Object.entries(this.defectModel).reduce(
        (acc, [key, val]) => ((acc[key] = [{ require: true, message: `请输入${val}` }]), acc),
        {}
      );
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation_name', align: 'center', width: 150 },
        { title: '设备类型', dataIndex: 'deviceType', align: 'center', width: 150 },
        { title: '设备名称', dataIndex: 'device_name', align: 'center', width: 150 },
        { title: '缺陷描述', dataIndex: 'alarm_disp', align: 'center', width: 150 },
        {
          title: '缺陷图片',
          dataIndex: 'image',
          align: 'center',
          width: 150,
          scopedSlots: { customRender: 'image' },
        },
        { title: '缺陷时间', dataIndex: 'record_time', align: 'center', width: 150 },
        { title: '缺陷原因', dataIndex: 'reason', align: 'center', width: 150 },
        { title: '缺陷发现人', dataIndex: 'finder', align: 'center', width: 100 },
        { title: '缺陷发现时间', dataIndex: 'find_time', align: 'center', width: 150 },
        { title: '缺陷类型', dataIndex: 'defectType', align: 'center', width: 150 },
        { title: '缺陷状态', dataIndex: 'defectState', align: 'center', width: 100 },
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'operation' },
        },
      ];
    },
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      tableLoad: false,
      tableData: [],
      // Array.from({ length: 10 }, (_, index) => ({
      //   id: index,
      //   index: ++index,
      //   substation_name: '棉城变电站',
      //   device_name: '110kV设备区棉魏二线11143D接地刀闸',
      //   device_type_name: '组合电器',
      //   image: Math.random() > 0.5 ? require('@/assets/images/logo.png') : '',
      //   record_time: this.$current(),
      //   defect_time: this.$current(),
      //   defect_disp: '-',
      //   defect_finder: '-',
      //   defectInfo: '-',
      //   defectType: this.$random(10),
      //   defectState: Math.random() > 0.5 ? '是' : '否',
      // })),
      defectModal: false,
      defectTypes: [],
      defectForm: {
        alarm_level: '',
        ip: '',
        port: '',
        acceptanceMonadName: 'test070301测试',
        acceptanceOpinion: '通过',
        acceptanceTime: '2020-07-03 11:21:21',
        acceptorName: '张三',
        assetName: 'test070301测试',
        attachmentsNo: 'test070301测试',
        classificationName: 'test070301测试',
        correctiveDate: '2020-07-03 11:21:21',
        correctiveMonadName: 'test070301测试',
        correctivePeasonName: '詹三',
        correctiveTeamName: '运维班',
        defectContent: '2020-07-03 10:23:24',
        defectMainEquipName: 'test070301测试',
        defectNumber: 'test070301测试',
        defectProperties: 'test07030',
        defectState: '01',
        defectZone: 'test070301测试',
        discoveredDate: '2020-07-03 11:21:24',
        discovererName: 'test070301测试',
        disposeDetail: 'test070301测试',
        dutyReasons: 'test070301测试',
        facilityKind: '0110',
        fileName: 'test070301测试',
        findSource: 'test070301测试',
        isFamilyDefect: true,
        kind: 'test070301测试',
        legacy: 'test070301测试',
        lineName: 'test070301测试',
        mRID: '12123',
        manufacturer: 'test070301',
        phase: 'A相',
        principal: '李四',
        professionalClass: '01',
        professionalNature: '12',
        quotMonadName: 'test070301测试',
        remarks: 'test070301',
        technicalReason: 'test070301测试',
        unitType: 'test07',
        voltageClass: 'test07030',
        whetherAcceptanceQual: true,
        whetherCorrective: true,
      },
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
      deviceType: undefined,
      alarmLevel: undefined,
      defectStutus: 4,
    };
  },
  async created() {
    this.deviceType = this.$route.query.device_type;
    this.alarmLevel = this.$route.query.alarm_level;
    this.stationId = this.$route.query.stationName;
    if (this.$route.query.status) {
      this.defectStutus = this.$route.query.status;
    }

    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    handleSyncData() {},
    handleDefectItem(row, action) {
      switch (action) {
        case 'sync':
          this.defectForm = {
            ...this.defectForm,
            defectCode: row.id,
            defectContent: row.alarm_disp,
            discovererName: row.finder,
            equipmentId: row.device_id,
            equipmentTypeName: row.deviceType,
            fileName: row.image || '-',
            stationName: row.substation_name,
          };
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
              // const { ip, port } = this.defectForm;
              // `http://${ip}:${port}`,
              this.$api.postDefectRecord('add', this.defectForm).then(() => {
                this.defectModal = false;
              });
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
        // console.log(dataRef,"iiiiii")
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
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      let params = [];
      this.defectStutus && params.push({ match: { status: this.defectStutus } });
      this.stationId && params.push({ match: { substation_id: this.stationId } });
      this.alarmLevel && params.push({ match: { alarm_level: this.alarmLevel } });
      this.deviceType && params.push({ match: { device_type: this.deviceType } });
      this.$api
        .postHistoryApi('alarmitems', '_search', {
          from: this.pagination.pageSize * (this.pagination.current - 1),
          size: this.pagination.pageSize,
          query: {
            bool: {
              must: params,
              filter: [{ range: { record_time: { gte: timeStart, lte: timeEnd } } }],
            },
          },
          track_total_hits: true,
        })
        .then((res) => {
          if (!res || !res.hits.total.value) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          let tableData = [];
          for (let i = 0, len = res.hits.hits.length; i < len; i++) {
            const { _id, _source } = res.hits.hits[i];
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + i + 1;
            const dataItem = {
              ..._source,
              id: _id,
              index: tableIndex,
              deviceType: DEVICE_TYPE[_source.device_type] || '-',
              defectType: ALARM_TYPE[_source.alarm_type] || '-',
              defectState: ALARM_STATUS[_source.status] || '-',
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
