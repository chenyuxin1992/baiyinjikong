<template>
  <a-row class="sg-row">
    <a-col class="sg-col" :span="24">
      <div class="sg-query">
        <span class="sg-query-item">
          <span>信号源编码:</span>
          <a-input
            v-model="infoCode"
            placeholder="请输入信号源编码名称"
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
            <a-button size="small" @click="handleLinkageItem(row, 'edit')">修改</a-button>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="linkageModal"
      width="50vw"
      :title="linkageModalTitle"
      dialog-class="sg-modal"
      centered
    >
      <a-form-model
        class="sg-form plan-form"
        ref="linkageForm"
        :model="linkageForm"
        :rules="linkageRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <div class="plan-form-left">
          <header class="plan-form-header">巡视设备</header>
          <a-form-model-item prop="station" label="选择变电站" label-align="right" required>
            <a-cascader
              class="plan-form-station"
              v-model="linkageForm.station"
              :options="stationData"
              :load-data="loadStationTree"
              :field-names="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="请选择集控站/运维班/变电站"
              change-on-select
              @change="onStationChange"
            />
          </a-form-model-item>

          <a-form-model-item prop="content" :wrapper-col="{ span: 24 }">
            <a-spin :spinning="contentLoad">
              <a-tree
                v-if="contentData.length > 0"
                class="plan-form-content"
                v-model="linkageForm.content"
                :tree-data="contentData"
                :load-data="loadContentTree"
                :replace-fields="{ key: 'id', title: 'name' }"
                :check-strictly="false"
                checkable
                @check="onContentCheck"
              ></a-tree>
              <a-empty v-else description="暂无巡视设备数据" />
            </a-spin>
          </a-form-model-item>
        </div>
        <div class="plan-form-right">
          <header class="plan-form-header">基本信息</header>
          <a-form-model-item prop="patrolpoint" label="巡视点位">
            <a-input
              v-model="linkageForm.patrolpoint"
              :disabled="disable"
              placeholder="请输入巡视点位"
            />
          </a-form-model-item>
          <a-form-model-item prop="code" label="信号源编码" required>
            <a-input
              v-model="linkageForm.code"
              placeholder="请输入信号源编码"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item prop="substation" label="厂站" required>
            <a-input
              v-model="linkageForm.substation"
              placeholder="请输入厂站"
              :disabled="disable"
              allow-clear
            />
          </a-form-model-item>

          <a-form-model-item prop="linkage_type" label="请选择联动类型" required>
            <a-radio-group v-model="linkageForm.linkage_type" :options="linkTypes"> </a-radio-group>
          </a-form-model-item>
          <!--抓拍图像-->
          <a-form-model-item prop="snapshot" label="请选择抓拍图像" required>
            <a-radio-group v-model="linkageForm.snapshot" :options="snapShot"> </a-radio-group>
          </a-form-model-item>

          <!-- 视频弹窗-->
          <a-form-model-item prop="video" label="视频弹窗" required>
            <a-radio-group v-model="linkageForm.video" :options="videoType"> </a-radio-group>
          </a-form-model-item>

          <!-- 声光报警  -->
          <a-form-model-item prop="sound" label="声光报警" required>
            <a-radio-group v-model="linkageForm.sound" :options="soundType"> </a-radio-group>
          </a-form-model-item>
          <a-form-model-item prop="routing_key" label="路由键" required>
            <a-input
              v-model="linkageForm.routing_key"
              placeholder="请输入路由键"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>
        </div>
      </a-form-model>
      <a-tree
        class="linkage-tree"
        :tree-data="linkagePointData"
        :load-data="loadPointTree"
        :replace-fields="{ key: 'id', title: 'name' }"
        :checked-keys="linkagePoints"
        checkable
        @check="onTreeCheck"
      />
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
import {
  LINK_TYPE,
  SNAP_SHOT,
  ControlCMD,
  LINKAGE_TYPE,
  VOICE_TYPE,
  DEVICE_LEVEL,
  VIDEO_TYPE,
  VIDEO_TYPE2,
  SOUND_WARN,
} from '@/enum';

export default {
  name: 'RemoteLinkage',
  computed: {
    // 声光报警
    soundType() {
      return Object.entries(SOUND_WARN).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    // 视频弹窗
    videoType() {
      return Object.entries(VIDEO_TYPE2).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    // 声光报警

    // 联动类型
    linkTypes() {
      return Object.entries(LINK_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    // 抓拍图像
    snapShot() {
      return Object.entries(SNAP_SHOT).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    deviceLevels() {
      return Object.entries(DEVICE_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
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
        // substation_id: [{ required: true, message: '请选择变电站' }],
        // patrolhost_id: [{ required: true, message: '请选择巡视主机' }],
        source_name: [{ required: true, message: '请输入联动点位名称' }],
        source_code: [{ required: true, message: '请输入联动点位编码' }],
        source_type: [{ required: true, message: '请输入信号类型' }],
        voice_type: [{ required: false, message: '请选择声音类型' }],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '主键', dataIndex: 'id', align: 'center', width: 200 },
        { title: '巡视点位', dataIndex: 'patrolpoint', align: 'center', width: 200 },
        { title: '信号源编码', dataIndex: 'code', align: 'center', width: 150 },
        { title: '告警描述', dataIndex: 'name', align: 'center', width: 200 },
        { title: '厂站', dataIndex: 'substation', align: 'center', width: 200 },
        { title: '联动类型', dataIndex: 'linkage_type', align: 'center', width: 150 },
        { title: '抓拍图像', dataIndex: 'snapshot', align: 'center', width: 150 },
        { title: '视频弹窗', dataIndex: 'video', align: 'center', width: 150 },
        { title: '声光报警', dataIndex: 'sound', align: 'center', width: 150 },
        { title: '路由键', dataIndex: 'routing_key', align: 'center', width: 150 },
        { title: '操作', align: 'center', width: 120, scopedSlots: { customRender: 'operation' } },
      ];
    },
  },
  data() {
    return {
      disable: true,
      patrolHosts: [],
      infoCode: '',
      linkagePoints: [],
      linkagePointData: [],
      linkageModal: false,
      linkageModalTitle: '',
      linkageAction: '',
      contentLoad: false,
      contentData: [],
      linkageForm: {
        station: [],
        device_level: 3,
        patrolhost_id: '',
        patrolpoint: '',
        code: '',
        substation: '',
        linkage_type: '',
        snapshot: '',
        video: '',
        sound: '',
        routing_key: '',
      },
      stationData: [], // 站点数据
      tableLoad: false,
      tableData: [],
      contentNodes: [], //树状图
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
  watch: {
    linkageModal(bool) {
      this.$api.getBaseApi('maintenanceunit').then((res) => {
        this.stationData = res.results.map((item) => ({
          ...item,
          tier: 0, // 树节点层级
          key: item.id,
          isLeaf: false,
        }));
      });
    },
  },
  methods: {
    //树状图节点选择
    onContentCheck(keys, { checkedNodes }) {
      console.log(keys, '懒洋洋');
      this.contentNodes = checkedNodes;
      let arrNodes = [];

      for (let i = 0, len = this.contentNodes.length; i < len; i++) {
        const item = this.contentNodes[i];
        arrNodes.push(item.data.key);
      }
      if (arrNodes.length == 0) {
        console.log('梅西');
        this.linkageForm.patrolpoint = ' ';
      } else {
        this.linkageForm.patrolpoint = arrNodes.join(',');
      }
    },
    handleQueryData() {
      this.getTableData();
    },
    loadStationTree(options) {
      console.log(options, 'red');
      const option = options[options.length - 1];

      console.log(option.name, '呵呵');

      option.loading = true;
      return new Promise((resolve) => {
        if (option.children) return resolve();
        switch (option.tier) {
          case 0:
            this.$api
              .getBaseApi('maintenanceteam', { maintenanceunit: option.id })
              .then((res) => {
                option.children = res.results.map((item) => ({
                  ...item,
                  tier: 1, // 树节点层级
                  key: item.id,
                  isLeaf: false,
                }));
                this.stationData = [...this.stationData];
              })
              .finally(() => {
                option.loading = false;
              });
            break;

          case 1:
            this.$api
              .getBaseApi('substation', { maintenanceteam: option.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                option.children = res.results.map((item) => ({
                  ...item,
                  tier: 2, // 树节点层级
                  key: item.id,
                  isLeaf: true,
                }));
                this.stationData = [...this.stationData];
              })
              .finally(() => {
                option.loading = false;
              });
            break;
          default:
            return resolve();
        }
      });
    },
    loadContentTree(node) {
      const { dataRef } = node;
      return new Promise((resolve) => {
        if (dataRef.children) return resolve();
        const { device_level } = this.linkageForm;
        switch (dataRef.tier) {
          case 0:
            if (device_level === 1) return resolve();
            this.$api
              .getBaseApi('area', { parent: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 1, // 树节点层级
                  key: item.id,
                }));
                this.contentData = [...this.contentData];
              })
              .finally(() => resolve());
            break;
          case 1:
            if (device_level === 2) return resolve();
            this.$api
              .getBaseApi('device', { area: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 2, // 树节点层级
                  key: item.id,
                }));
                this.contentData = [...this.contentData];
              })
              .finally(() => resolve());
            break;
          case 2:
            if (device_level === 4) return resolve();
            this.$api
              .getBaseApi('patrolpoint', { device: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 3, // 树节点层级
                  key: item.id,
                  isLeaf: true,
                }));
                this.contentData = [...this.contentData];
              })
              .finally(() => resolve());
            break;
          default:
            return resolve();
        }
      });
    },
    onStationChange(res, options) {
      if (res.length === 3) {
        this.contentLoad = true;
        this.linkageForm.substation = res[res.length - 1];
        this.$api
          .getBaseApi('patrolhost', { substation: this.linkageForm.substation })
          .then((res) => {
            if (!res || !res.results) return;
            this.patrolHosts = res.results.map((item) => ({
              text: item.name,
              label: item.name,
              value: item.id,
            }));
          });
        this.$api
          .getBaseApi('area', { substation: this.linkageForm.substation, parent__isnull: true })
          .then((res) => {
            if (!res || !res.results) return;
            this.contentData = res.results.map((item) => ({
              ...item,
              tier: 0, // 树节点层级，
              key: item.id,
              isLeaf: false,
            }));
          })
          .finally(() => {
            this.contentLoad = false;
          });
      }
    },
    handleLinkageItem(row, action) {
      // console.log(row, action, 'one');
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
          // console.log(row, '托尔勒斯');
          this.linkageForm = { ...row };
          console.log(this.linkageForm, '太阳神');
          this.contentData = '';
          this.linkageModalTitle = '本地联动配置编辑';
          this.linkageModal = true;
          break;
        case 'create':
          this.linkageForm = {
            substation: '',
            device_level: '',
            patrolpoint: '',
            code: undefined,
            linkage_type: '',
            snapshot: '',
            video: '',
            sound: '',
            routing_key: '',
          };
          this.contentData = '';

          this.linkageModalTitle = '本地联动配置新增';
          this.linkageModal = true;
          break;
        case 'issue':
          this.$api
            .postControlApi({
              action: ControlCMD.CONFIG_ISSUE,
              command: 5,
              config_id: row.id,
              syn: '本地联动配置下发',
            })
            .then(() => {
              this.$message.success('本地联动配置下发成功！');
            });
          break;
        default:
          break;
      }
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
                this.$message.success('本地联动点位关联成功！');
                this.linkageModal = false;
                this.getTableData();
              });
          }
          break;
        case 'edit':
          this.$refs.linkageForm.validate((valid) => {
            if (valid) {
              let linkageFormedit = {};
              linkageFormedit.id = this.linkageForm.id;
              linkageFormedit.substation = this.linkageForm.substation;
              linkageFormedit.code = this.linkageForm.code;
              linkageFormedit.linkage_type = this.linkageForm.linkage_type;
              linkageFormedit.routing_key = this.linkageForm.routing_key;
              linkageFormedit.snapshot = this.linkageForm.snapshot;
              linkageFormedit.video = this.linkageForm.video;
              linkageFormedit.patrolpoint = this.linkageForm.patrolpoint;
              this.$api.putLocalConfig(linkageFormedit).then((res) => {
                this.$message.success('本地联动方式编辑成功！');
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
              let linkageForm = {};
              linkageForm.substation = this.linkageForm.substation;
              linkageForm.code = this.linkageForm.code;
              linkageForm.linkage_type = this.linkageForm.linkage_type;
              linkageForm.routing_key = this.linkageForm.routing_key;
              linkageForm.snapshot = this.linkageForm.snapshot;
              linkageForm.video = this.linkageForm.video;
              linkageForm.patrolpoint = this.linkageForm.patrolpoint;
              this.$api.postLocalConfig(linkageForm).then((res) => {
                this.$message.success('本地联动配置新增成功！');
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
      this.linkagePoints = keys;
    },
    onTableChange(pagination) {
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
      let params = {};
      params.page_num = this.pagination.current;
      params.page_size = this.pagination.pageSize;
      params.code = this.infoCode;

      this.$api
        .getlocalApi(params)
        .then((res) => {
          if (!res || !res.results) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          this.tableData = res.results.map((item, index) => {
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
            return {
              // ...item,
              index: tableIndex,
              // voiceType: item.voice_type ? VOICE_TYPE[item.voice_type] : '-',
              id: item.id,
              patrolpoint: item.patrolpoint,
              routing_key: item.routing_key,
              code: item.code,
              name: item.name,
              linkage_type: item.linkage_type,
              substation: item.substation,
              sound: item.sound,
              snapshot: item.snapshot,
              video: item.video,
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      this.$api.getBaseApi('area').then((res) => {
        if (!res || !res.results) return;
        this.deviceAreas = res.results.map((item) => ({
          text: item.name,
          label: item.name,
          value: item.id,
        }));
      });
    },
  },
};
</script>

<style lang="less" scoped>
.plan-form {
  display: flex;
  width: 100%;
  overflow: hidden;
  &-left {
    width: 50%;
    padding: 0 10px;
  }
  &-right {
    width: 50%;
    padding: 0 10px;
  }
  &-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 1vh;
  }
  &-station {
    width: 100%;
  }
}
.linkage-tree {
  width: 100%;
  height: 50vh;
  overflow-y: auto;
}
</style>
