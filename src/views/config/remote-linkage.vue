<template>
  <a-row class="sg-row">
    <a-col class="sg-col" :span="24">
      <div class="sg-query">
        <span class="sg-query-item">
          <span>联动点位:</span>
          <a-input
            v-model="linkagePoint"
            placeholder="请输入联动点位名称"
            :max-length="20"
            allow-clear
          />
        </span>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleLinkageItem(null, 'create')">新增</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: false }"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleLinkageItem(row, 'link')">关联点位</a-button>
            <a-button size="small" @click="handleLinkageItem(row, 'edit')">编辑联动</a-button>
            <a-popconfirm title="确定下发该联动配置?" @confirm="handleLinkageItem(row, 'issue')">
              <a-button size="small">下发</a-button>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal v-model="linkageModal" :title="linkageModalTitle" dialog-class="sg-modal" centered>
      <a-form-model
        v-if="linkageAction === 'create'"
        class="sg-form"
        ref="linkageForm"
        :model="linkageForm"
        :rules="linkageRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item prop="substation_id" label="变电站" required>
          <a-select
            v-model="linkageForm.substation_id"
            :options="substations"
            placeholder="请选择变电站"
            @select="onSubstationSelect"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="patrolhost_id" label="巡视主机" required>
          <a-select
            v-model="linkageForm.patrolhost_id"
            :options="patrolHosts"
            placeholder="请选择巡视主机"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="source_name" label="联动点位名称" required>
          <a-input
            v-model="linkageForm.source_name"
            placeholder="请输入联动点位名称"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="source_code" label="联动点位编码" required>
          <a-input
            v-model="linkageForm.source_code"
            placeholder="请输入联动点位编码"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="source_type" label="信号类型" required>
          <a-input
            v-model="linkageForm.source_type"
            placeholder="请输入信号类型"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
      </a-form-model>
      <a-tree
        v-else-if="linkageAction === 'link'"
        class="linkage-tree"
        :tree-data="linkagePointData"
        :load-data="loadPointTree"
        :replace-fields="{ key: 'id', title: 'name' }"
        :checked-keys="linkagePoints"
        checkable
        @check="onTreeCheck"
      />
      <a-form-model
        v-else
        class="sg-form"
        ref="linkageForm"
        :model="linkageForm"
        :rules="linkageRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item prop="source_name" label="联动点位名称">
          <span>{{ this.linkageForm.source_name }}</span>
        </a-form-model-item>
        <a-form-model-item prop="source_type" label="信号类型">
          <span>{{ this.linkageForm.source_type }}</span>
        </a-form-model-item>
        <a-form-model-item prop="linkage_type" label="联动方式" required>
          <a-checkbox-group
            v-model="linkageForm.linkage_type"
            :options="linkageTypes"
            placeholder="请选择联动方式"
          ></a-checkbox-group>
        </a-form-model-item>
        <a-form-model-item prop="voice_type" label="声音类型">
          <a-radio-group
            v-model="linkageForm.voice_type"
            :options="voiceTypes"
            :disabled="voiceDisable"
            placeholder="请选择声音类型"
          ></a-radio-group>
        </a-form-model-item>
      </a-form-model>

      <template #footer>
        <a-button v-if="linkageAction === 'create'" type="warning" @click="onModalAction('reset')">
          重置
        </a-button>
        <a-button v-else type="default" @click="onModalAction('cancel')">取消</a-button>
        <a-button type="primary" @click="onModalAction(linkageAction)">提交</a-button>
      </template>
    </a-modal>
  </a-row>
</template>

<script>
import { ControlCMD, LINKAGE_TYPE, VOICE_TYPE } from '@/enum';

export default {
  name: 'RemoteLinkage',
  computed: {
    voiceDisable() {
      return this.linkageForm.linkage_type.indexOf(1) === -1;
    },
    voiceTypes() {
      return Object.entries(VOICE_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    linkageTypes() {
      return Object.entries(LINKAGE_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    linkageRules() {
      return {
        substation_id: [{ required: true, message: '请选择变电站' }],
        patrolhost_id: [{ required: true, message: '请选择巡视主机' }],
        source_name: [{ required: true, message: '请输入联动点位名称' }],
        source_code: [{ required: true, message: '请输入联动点位编码' }],
        source_type: [{ required: true, message: '请输入信号类型' }],
        voice_type: [{ required: false, message: '请选择声音类型' }],
        linkage_type: [{ required: true, type: 'array', message: '请选择联动方式' }],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation.name', align: 'center', width: 150 },
        { title: '巡视主机', dataIndex: 'patrolhost.name', align: 'center' },
        { title: '联动点位名称', dataIndex: 'source_name', align: 'center' },
        { title: '联动点位编码', dataIndex: 'source_code', align: 'center' },
        { title: '信号类型', dataIndex: 'source_type', align: 'center', width: 150 },
        // { title: '巡视点位', dataIndex: 'linkagePoints', align: 'center', width: 150 },
        { title: '联动方式', dataIndex: 'linkageType', align: 'center', width: 150 },
        { title: '声音类型', dataIndex: 'voiceType', align: 'center', width: 150 },
        { title: '操作', align: 'center', width: 300, scopedSlots: { customRender: 'operation' } },
      ];
    },
  },
  data() {
    return {
      substations: [],
      patrolHosts: [],
      linkagePoint: '',
      linkagePoints: [],
      linkagePointData: [],
      linkageModal: false,
      linkageModalTitle: '',
      linkageAction: '',
      linkageForm: {
        substation_id: undefined,
        patrolhost_id: undefined,
        voice_type: undefined,
        source_name: '',
        source_code: '',
        source_type: '',
        linkage_type: [],
      },
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
    this.getSelectData();
    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.pagination.current = 1;
      this.getTableData();
    },
    handleLinkageItem(row, action) {
      this.linkageAction = action;
      switch (action) {
        case 'link':
          this.linkageForm = row;
          this.$api.getBaseApi('area', { parent__isnull: true }).then((res) => {
            if (!res) return;
            this.linkagePointData = res.results.map((item) => {
              return {
                ...item,
                tier: 0,
                key: item.id,
                checkable: false,
              };
            });
            this.linkageModalTitle = '远程联动点位关联';
            this.linkageModal = true;
          });
          break;
        case 'edit':
          this.linkageForm = { ...row, linkage_type: row.linkage_type.split(',').map(Number) };
          this.linkageModalTitle = '远程联动方式编辑';
          this.linkageModal = true;
          break;
        case 'create':
          this.linkageForm = {
            substation_id: undefined,
            patrolhost_id: undefined,
            voice_type: undefined,
            source_name: '',
            source_code: '',
            source_type: '',
            linkage_type: [],
          };
          this.linkageModalTitle = '远程联动配置新增';
          this.linkageModal = true;
          break;
        case 'issue':
          this.$api
            .postControlApi({
              action: ControlCMD.CONFIG_ISSUE,
              command: 5,
              config_id: row.id,
              syn: '远程联动配置下发',
            })
            .then(() => {
              this.$message.success('远程联动配置下发成功！');
            });
          break;
        default:
          break;
      }
      console.log(this.linkageForm);
    },
    onModalAction(action) {
      switch (action) {
        case 'link':
          if (!this.linkagePoints.length) {
            this.$message.warn('请选择要关联联动的点位！');
          } else {
            this.$api
              .postBaseApi('linkageconfig_update', {
                data: [{ id: this.linkageForm.id, patrolpoint_list: this.linkagePoints.join(',') }],
              })
              .then(() => {
                this.$message.success('远程联动点位关联成功！');
                this.linkageModal = false;
                this.getTableData();
              });
          }
          break;
        case 'edit':
          this.$refs.linkageForm.validate((valid) => {
            if (valid) {
              const { id, voice_type, linkage_type } = this.linkageForm;
              this.$api
                .postBaseApi('linkageconfig_update', {
                  data: [{ id, voice_type, linkage_type: linkage_type.join(',') }],
                })
                .then(() => {
                  this.$message.success('远程联动方式编辑成功！');
                  this.$refs.linkageForm.resetFields();
                  this.linkageModal = false;
                  this.getTableData();
                });
            } else {
              return false;
            }
          });
          break;
        case 'create':
          this.$refs.linkageForm.validate((valid) => {
            if (valid) {
              const {
                substation_id,
                patrolhost_id,
                source_name,
                source_code,
                source_type,
              } = this.linkageForm;
              this.$api
                .postBaseApi('linkageconfig_create', {
                  data: [{ substation_id, patrolhost_id, source_name, source_code, source_type }],
                })
                .then(() => {
                  this.$message.success('远程联动配置提交成功！');
                  this.$refs.linkageForm.resetFields();
                  this.linkageModal = false;
                  this.getTableData();
                });
            } else {
              return false;
            }
          });
          break;
        case 'cancel':
          this.linkageModal = false;
          break;
        case 'reset':
          this.$refs.linkageForm.resetFields();
          break;
        default:
          break;
      }
    },
    onSubstationSelect(id) {
      this.linkageForm.patrolhost_id = undefined;
      this.$api.getBaseApi('patrolhost', { substation: id }).then((res) => {
        if (!res || !res.results) return;
        this.patrolHosts = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
    onTreeCheck(keys) {
      console.log(keys);
      this.linkagePoints = keys;
    },
    onTableChange(pagination) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      this.getTableData();
    },
    loadPointTree(node) {
      const { dataRef } = node;
      return new Promise((resolve) => {
        if (dataRef.children) return resolve();
        switch (dataRef.tier) {
          case 0:
            this.$api
              .getBaseApi('area', { parent: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 1,
                  key: item.id,
                  checkable: false,
                }));
                this.linkagePointData = [...this.linkagePointData];
              })
              .finally(() => resolve());
            break;
          case 1:
            this.$api
              .getBaseApi('device', { area: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 2,
                  key: item.id,
                  checkable: false,
                }));
                this.linkagePointData = [...this.linkagePointData];
              })
              .finally(() => resolve());
            break;
          case 2:
            this.$api
              .getBaseApi('patrolpoint', { device: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 3,
                  key: item.id,
                  isLeaf: true,
                  checkable: true,
                }));
                this.linkagePointData = [...this.linkagePointData];
              })
              .finally(() => resolve());
            break;
          default:
            return resolve();
        }
      });
    },
    getTableData() {
      this.tableLoad = true;
      this.$api
        .getBaseApi('linkageconfig_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          source_name__icontains: this.linkagePoint,
        })
        .then((res) => {
          if (!res || !res.results) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          this.tableData = res.results.map((item, index) => {
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
            const linkageTypes = item.linkage_type && item.linkage_type.split(',');
            return {
              ...item,
              index: tableIndex,
              voiceType: item.voice_type ? VOICE_TYPE[item.voice_type] : '-',
              linkageType: linkageTypes
                ? linkageTypes.map((key) => LINKAGE_TYPE[key]).join(',')
                : '-',
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      this.$api.getBaseApi('substation').then((res) => {
        if (!res || !res.results) return;
        this.substations = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
      this.$api.getBaseApi('patrolhost').then((res) => {
        if (!res || !res.results) return;
        this.patrolHosts = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
  },
};
</script>

<style lang="less" scoped>
.linkage-tree {
  width: 100%;
  height: 50vh;
  overflow-y: auto;
}
</style>
