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
          <span>主机名称:</span>
          <a-input
            v-model="hostName"
            placeholder="请输入巡视主机名称"
            :max-length="20"
            allow-clear
          />
        </span>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handlePatrolHost(null, 'create')">新增</a-button>
        <!-- <a-button @click="handleExportData">导出</a-button> -->
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-popconfirm
              title="确定从主机同步巡视主机模型?"
              @confirm="handlePatrolHost(row, 'host')"
            >
              <a-button size="small">巡视主机模型</a-button>
            </a-popconfirm>
            <a-popconfirm
              title="确定从主机同步机器人模型?"
              @confirm="handlePatrolHost(row, 'robot')"
            >
              <a-button size="small">机器人模型</a-button>
            </a-popconfirm>
            <a-popconfirm
              title="确定从主机同步摄像机模型?"
              @confirm="handlePatrolHost(row, 'camera')"
            >
              <a-button size="small">摄像机模型</a-button>
            </a-popconfirm>
            <a-popconfirm title="确定从主机同步点位模型?" @confirm="handlePatrolHost(row, 'point')">
              <a-button size="small">点位模型</a-button>
            </a-popconfirm>
            <a-popconfirm title="确定从主机同步地图文件?" @confirm="handlePatrolHost(row, 'map')">
              <a-button size="small">地图文件</a-button>
            </a-popconfirm>
            <a-popconfirm
              title="确定从主机同步联动配置?"
              @confirm="handlePatrolHost(row, 'linkage')"
            >
              <a-button size="small">联动配置</a-button>
            </a-popconfirm>
            <a-popconfirm title="确定从主机同步任务文件?" @confirm="handlePatrolHost(row, 'task')">
              <a-button size="small">任务文件</a-button>
            </a-popconfirm>
            <a-popconfirm
              title="确定从主机同步检修区域配置文件?"
              @confirm="handlePatrolHost(row, 'area')"
            >
              <a-button size="small">检修区域</a-button>
            </a-popconfirm>
          </div>
        </template>
        <template v-slot:threeOperation="data, row">
          <div class="threeOperation">
            <a-popconfirm
              title="下发三维空间坐标请求指令？"
              @confirm="sendThreemessage(row, 'threeModal1')"
            >
              <a-button size="small">三维空间坐标</a-button>
            </a-popconfirm>
            <a-popconfirm
              title="下发点位编号请求指令？"
              @confirm="sendThreemessage(row, 'threeModal2')"
            >
              <a-button size="small">点位编号</a-button>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </a-col>
    <a-modal v-model="hostModal" :title="hostModalTitle" dialog-class="sg-modal" centered>
      <a-form-model
        class="sg-form"
        ref="hostForm"
        :model="hostForm"
        :rules="hostRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item prop="substation_id" label="变电站" required>
          <a-select
            v-model="hostForm.substation_id"
            :options="hostStations"
            placeholder="请选择变电站"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="name" label="主机名称" required>
          <a-input
            v-model="hostForm.name"
            placeholder="请输入巡视主机名称"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="ip_address" label="主机地址" required>
          <a-input
            v-model="hostForm.ip_address"
            placeholder="请输入巡视主机地址"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="status" label="主机状态">
          <a-switch v-model="hostForm.status" />
        </a-form-model-item>
      </a-form-model>
      <template #footer>
        <a-button type="warning" @click="onModalAction('reset')">重置</a-button>
        <a-button type="primary" @click="onModalAction('submit')">提交</a-button>
      </template>
    </a-modal>
    <a-modal v-model="threeModal1" title="三维空间坐标信息同步" dialogClass="sg-modal" centered>
      <a-form-model-item prop="threetype" label="空间坐标类型" :label-col="{ span: 4 }">
        <a-radio-group v-model="threetype">
          <a-radio :value="0">激光点云坐标</a-radio>
          <a-radio :value="1">经纬度坐标</a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item class="col-12" v-if="threetype==0" prop="threex" label="x值" >
        <a-input v-model="threex" :max-length="20" placeholder="相对坐标x" allow-clear />
      </a-form-model-item>
      <a-form-model-item class="col-12" v-if="threetype==0" prop="threey" label="y值" >
        <a-input v-model="threey" :max-length="20" placeholder="相对坐标y" allow-clear />
      </a-form-model-item>
      <a-form-model-item class="col-12" v-if="threetype==0" prop="threez" label="z值" >
        <a-input v-model="threez" :max-length="20" placeholder="相对坐标z" allow-clear />
      </a-form-model-item>
      <a-form-model-item class="col-12" v-if="threetype==1" prop="threelon" label="经度" >
        <a-input v-model="threelon" :max-length="20" placeholder="经度" allow-clear />
      </a-form-model-item>
      <a-form-model-item class="col-12" v-if="threetype==1" prop="threelat" label="纬度" >
        <a-input v-model="threelat" :max-length="20" placeholder="纬度" allow-clear />
      </a-form-model-item>
      <a-form-model-item class="col-12" v-if="threetype==1" prop="threeele" label="高程" >
        <a-input v-model="threeele" :max-length="20" placeholder="高程" allow-clear />
      </a-form-model-item>
      <template #footer>
        <a-button type="primary" @click="threeModalAction('threeModal1')">提交</a-button>
      </template>
    </a-modal>    
    <a-modal v-model="threeModal2" title="点位编号信息同步" dialogClass="sg-modal" centered>
      <a-form-model-item class="col-12" prop="threepointid" label="点位编号" >
        <a-input v-model="threepointid" :max-length="80" placeholder="点位编号" allow-clear />
      </a-form-model-item>
      <template #footer>
        <a-button type="primary" @click="threeModalAction('threeModal2')">提交</a-button>
      </template>
    </a-modal>        
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';
import { ControlCMD, TASK_PATROL_TYPE, TASK_STATUS } from '@/enum';

export default {
  name: 'HostManage',
  components: {
    SgTree,
  },
  computed: {
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
    hostRules() {
      return {
        name: [{ required: true, message: '请输入巡视主机名称' }],
        ip_address: [{ required: true, message: '请输入巡视主机地址' }],
        substation_id: [{ required: true, message: '请选择变电站' }],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation.name', align: 'center', width: 120 },
        { title: '巡视主机名称', dataIndex: 'name', align: 'center', width: 140  },
        { title: '地址', dataIndex: 'ip_address', align: 'center', width: 110 },
        { title: '状态', dataIndex: 'hostState', align: 'center', width: 60 },
        { title: '模型文件同步', align: 'center', scopedSlots: { customRender: 'operation' } },
        { title: '三维信息指令', align: 'center', scopedSlots: { customRender: 'threeOperation' }  },
      ];
    },
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      hostName: '',
      hostStations: [],
      hostModal: false,
      threeModal1: false,
      threeModal2: false,
      hostModalTitle: '',
      hostForm: { name: '', ip_address: '', substation_id: undefined, status: false },
      tableLoad: false,
      tableData: [],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
      threetype: 0,
      threex: '',
      threey: '',
      threez: '',
      threelon: '',
      threelat: '',
      threeele: '',
      threepointid: '',
      threeSub: '',
    };
  },
  created() {
    this.getSelectData();
    this.getTableData();
    this.onWebsocketPush();
  },
  beforeDestroy() {
    this.$bus.$off('stomp');
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    sendThreemessage(row, action) {
      this.threeSub = row.substation.id;
      switch (action) {
        case 'threeModal1':
          this.threeModal1 = true;
          break;
        case 'threeModal2':
          this.threeModal2 = true;
          break;      
        default:
          break;
      }
    },
    handlePatrolHost(row, action) {
      switch (action) {
        case 'create':
          this.hostModalTitle = '巡视主机新增';
          this.hostModal = true;
          break;
        case 'host':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 1,
              syn: row.name + '巡视主机模型同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('巡视主机模型同步命令下发成功！');
            });
          break;
        case 'robot':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 2,
              syn: row.name + '机器人模型同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('机器人模型同步命令下发成功！');
            });
          break;
        case 'camera':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 3,
              syn: row.name + '摄像机模型同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('摄像机模型同步命令下发成功！');
            });
          break;
        case 'point':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 4,
              syn: row.name + '点位模型同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('点位模型同步命令下发成功！');
            });
          break;
        case 'map':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 5,
              syn: row.name + '地图文件同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('地图文件同步命令下发成功！');
            });
          break;
        case 'linkage':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 6,
              syn: row.name + '联动配置同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('联动配置同步命令下发成功！');
            });
          break;
        case 'task':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 7,
              syn: row.name + '任务文件同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('任务文件同步命令下发成功！');
            });
          break;
        case 'area':
          this.$api
            .postControlApi({
              action: ControlCMD.MODEL_SYNC,
              command: 8,
              syn: row.name + '检修区域配置同步',
              substation_id: row.substation.id,
            })
            .then(() => {
              this.$message.success('检修区域配置同步命令下发成功！');
            });
          break;
        default:
          break;
      }
    },
    onModalAction(action) {
      switch (action) {
        case 'reset':
          this.$refs.hostForm.resetFields();
          break;
        case 'submit':
          this.$refs.hostForm.validate((valid) => {
            if (valid) {
              this.$api
                .postBaseApi('patrolhost_create', {
                  data: [{ ...this.hostForm, status: this.hostForm.status ? 1 : 0 }],
                })
                .then(() => {
                  this.$refs.hostForm.resetFields();
                  this.hostModal = false;
                  this.getTableData();
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
    threeModalAction(action) {
      switch (action) {
        case 'threeModal1':
          this.$api
            .postControlApi({
              action: 122,
              command: 1,
              substation_id: this.threeSub,
              items: [{type: String(this.threetype), x: this.threex, y: this.threey, z: this.threez, lon: this.threelon, lat: this.threelat, ele: this.threeele }],
            })
            .then(() => {
              this.$message.success('三维同步指令下发成功！');
              this.threeModal1 = false;
            });
          break;
        case 'threeModal2':
          this.$api
            .postControlApi({
              action: 122,
              command: 2,
              substation_id: this.threeSub,
              items: [{pointid: this.threepointid}],
            })
            .then(() => {
              this.$message.success('三维同步指令下发成功！');
              this.threeModal2 = false;
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
    onTableChange(pagination) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      this.getTableData();
    },
    onWebsocketPush() {
      this.$bus.$on('stomp', (msg) => {
        const { action, item } = msg;
        switch (action) {
          case 'detector_file_synchronized':
            if (item.success) {
              this.$message.success('巡视设备模型同步成功！');
            } else {
              this.$message.warn('巡视设备模型同步失败！失败原因：' + item.detail);
            }
            break;
          case 'point_file_synchronized':
            if (item.success) {
              this.$message.success('巡视点位模型同步成功！');
            } else {
              this.$message.warn('巡视点位模型同步失败！失败原因：' + item.detail);
            }
            break;
          case 'effect_file_synchronized':
            if (item.success) {
              this.$message.success('联动配置模型同步成功！');
            } else {
              this.$message.warn('联动配置模型同步失败！失败原因：' + item.detail);
            }
            break;
          case 'task_file_synchronized':
            if (item.success) {
              this.$message.success('任务配置模型同步成功！');
            } else {
              this.$message.warn('任务配置模型同步失败！失败原因：' + item.detail);
            }
            break;
          case 'overhaularea_file_synchronized':
            if (item.success) {
              this.$message.success('检修区域模型同步成功！');
            } else {
              this.$message.warn('检修区域模型同步失败！失败原因：' + item.detail);
            }
            break;
          case '3d_station_information':
            alert('三维信息指令结果-摄像机编码:' + item.cameracode + ';水平坐标:' + item.pan + ';垂直坐标:' + item.tilt + ';镜头倍数:' + item.zoom);
            break;            
          default:
            break;
        }
      });
    },
    getTableData() {
      this.tableLoad = true;
      this.$api
        .getBaseApi('patrolhost_depth', {
          substation: this.stationId,
          name__icontains: this.hostName,
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
              hostState: item.status ? '在线' : '离线',
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
        this.hostStations = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
  },
};
</script>
