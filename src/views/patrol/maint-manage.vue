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
          <span>检修内容:</span>
          <a-input v-model="maintName" placeholder="请输入检修内容" :max-length="20" allow-clear />
        </span>
        <span class="sg-query-item">
          <span>检修时间:</span>
          <a-range-picker
            class="datetime"
            v-model="timeRange"
            :placeholder="['开始时间', '结束时间']"
            separator="至"
            show-time
          ></a-range-picker>
        </span>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleMaintArea(null, 'create')">新增</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: 1800 }"
        bordered
        @change="onTableChange"
      >
        <template #progress>
          <a-progress :percent="80" :show-info="false" />
        </template>
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleMaintArea(row, 'update')">编辑</a-button>
            <!-- <a-button size="small" @click="handleMaintArea(row, 'check')">详情</a-button> -->
            <template v-if="row.enable">
              <a-popconfirm title="确定下发该检修配置?" @confirm="handleMaintArea(row, 'issue')">
                <a-button size="small">下发</a-button>
              </a-popconfirm>
              <a-popconfirm title="确定停用该检修配置?" @confirm="handleMaintArea(row, 'disable')">
                <a-button size="small">停用</a-button>
              </a-popconfirm>
            </template>
            <template v-else>
              <a-popconfirm title="确定删除该检修区域?" @confirm="handleMaintArea(row, 'delete')">
                <a-button size="small">删除</a-button>
              </a-popconfirm>
              <a-popconfirm title="确定启用该检修配置?" @confirm="handleMaintArea(row, 'enable')">
                <a-button size="small">启用</a-button>
              </a-popconfirm>
            </template>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="maintModal"
      width="75vw"
      dialog-class="sg-modal"
      :title="maintModalTitle"
      centered
    >
      <a-tabs class="maint-tabs">
        <a-tab-pane key="device" tab="设备模式">
          <a-form-model
            class="sg-form maint-device"
            ref="maintForm"
            label-align="left"
            :model="maintForm"
            :rules="maintRules"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-model-item class="col-8" prop="substation_id" label="变电站" required>
              <a-select
                v-model="maintForm.substation_id"
                :options="maintStations"
                :disabled="maintAction === 'update'"
                placeholder="请选择变电站"
                @select="onMaintStationSelect"
              ></a-select>
            </a-form-model-item>
            <a-form-model-item class="col-8" prop="patrolhost_id" label="巡视主机" required>
              <a-select
                v-model="maintForm.patrolhost_id"
                :options="patrolHosts"
                placeholder="请选择巡视主机"
              ></a-select>
            </a-form-model-item>
            <a-form-model-item class="col-8" prop="name" label="检修内容" required>
              <a-input
                v-model="maintForm.name"
                placeholder="请输入检修内容"
                :max-length="20"
                allow-clear
              />
            </a-form-model-item>
            <a-form-model-item class="col-8" prop="timeRange" label="检修时间" required>
              <a-range-picker
                v-model="maintForm.timeRange"
                :placeholder="['开始时间', '结束时间']"
                style="width: 100%"
                separator="至"
                show-time
              ></a-range-picker>
            </a-form-model-item>
            <a-form-model-item class="col-8" prop="device_level" label="设备层级" required>
              <a-select
                v-model="maintForm.device_level"
                :options="deviceLevels"
                placeholder="请选择设备层级"
              ></a-select>
            </a-form-model-item>
            <a-form-model-item class="col-8" prop="enable" label="是否启用" required>
              <a-switch v-model="maintForm.enable" />
            </a-form-model-item>
            <a-form-model-item
              prop="deviceList"
              label="检修设备"
              :wrapper-col="{ span: 24 }"
              required
            >
              <a-spin :spinning="transferLoad">
                <a-transfer
                  class="maint-device-transfer"
                  :data-source="transferData"
                  :target-keys="maintForm.deviceList"
                  :render="(item) => item.title"
                  :titles="['未选择设备', '已选择设备']"
                  :show-select-all="false"
                  @change="onTransferChange"
                >
                  <template
                    v-slot:children="{ props: { direction, selectedKeys }, on: { itemSelect } }"
                  >
                    <a-tree
                      v-if="direction === 'left'"
                      :tree-data="treeData"
                      :load-data="loadMaintTree"
                      :loaded-keys="loadedKeys"
                      :expanded-keys="expandedKeys"
                      :checked-keys="[...selectedKeys, ...maintForm.deviceList]"
                      :replace-fields="{ title: 'name' }"
                      check-strictly
                      block-node
                      checkable
                      @load="(keys) => (loadedKeys = keys)"
                      @expand="(keys) => (expandedKeys = keys)"
                      @check="(keys, props) => onMaintTreeCheck(keys, props, itemSelect)"
                    ></a-tree>
                  </template>
                </a-transfer>
              </a-spin>
            </a-form-model-item>
          </a-form-model>
        </a-tab-pane>
        <a-tab-pane key="map" tab="地图模式">
          <div class="maint-map">
            <a-popover
              v-model="maintPopup"
              placement="leftTop"
              trigger="click"
              arrow-point-at-center
              overlay-class-name="sg-popover"
              :get-popup-container="(node) => node.parentNode"
            >
              <a-button class="maint-map-popup" type="primary" size="small">
                {{ maintPopup ? '收起' : '展开' }}
              </a-button>
              <template #content>
                <a-form-model
                  class="sg-form maint-map-form"
                  ref="maintForm"
                  :model="maintForm"
                  :rules="maintRules"
                  :label-col="{ span: 5 }"
                  :wrapper-col="{ span: 18 }"
                >
                  <a-form-model-item prop="substation_id" label="变电站" required>
                    <a-select
                      v-model="maintForm.substation_id"
                      :options="maintStations"
                      :disabled="maintAction === 'update'"
                      placeholder="请选择变电站"
                      @select="onMaintStationSelect"
                    ></a-select>
                  </a-form-model-item>
                  <a-form-model-item prop="patrolhost_id" label="巡视主机" required>
                    <a-select
                      v-model="maintForm.patrolhost_id"
                      :options="patrolHosts"
                      placeholder="请选择巡视主机"
                    ></a-select>
                  </a-form-model-item>
                  <a-form-model-item prop="name" label="检修内容" required>
                    <a-input
                      v-model="maintForm.name"
                      placeholder="请输入检修内容"
                      :max-length="20"
                      allow-clear
                    />
                  </a-form-model-item>
                  <a-form-model-item prop="timeRange" label="检修时间" required>
                    <a-range-picker
                      v-model="maintForm.timeRange"
                      :placeholder="['开始时间', '结束时间']"
                      style="width: 100%"
                      separator="至"
                      show-time
                    ></a-range-picker>
                  </a-form-model-item>
                  <!-- <a-form-model-item prop="map" label="检修地图" required>
                    <a-select
                      v-model="maintForm.map"
                      :options="maintMaps"
                      placeholder="请选择检修地图"
                    ></a-select>
                  </a-form-model-item> -->
                  <a-form-model-item
                    ref="coordList"
                    prop="coordList"
                    label="检修区域"
                    :auto-link="false"
                    required
                  >
                    <ul v-if="maintForm.coordList.length > 0" class="maint-map-coords">
                      <!-- <a-input
                        v-for="(item, index) in maintForm.coordList"
                        v-model="maintForm.coordList[index]"
                        placeholder="检修区域坐标"
                        :max-length="20"
                        :key="index"
                        @change="() => $refs.coordList.onFieldChange()"
                      /> -->
                      <li v-for="(item, index) in maintForm.coordList" :key="index">
                        <span>{{ item }}</span>
                        <a-icon
                          class="col-1"
                          type="minus-circle"
                          @click="handleRemoveArea(index)"
                        />
                      </li>
                    </ul>
                    <a-empty v-else description="暂未选中区域" />
                  </a-form-model-item>
                  <a-form-model-item prop="deviceList" label="检修设备">
                    <a-checkbox-group
                      v-if="maintDevices.length > 0"
                      class="maint-map-devices"
                      v-model="maintForm.deviceList"
                      :options="maintDevices"
                    ></a-checkbox-group>
                    <a-empty v-else description="暂未选中设备" />
                  </a-form-model-item>
                  <a-form-model-item prop="enable" label="是否启用">
                    <a-switch v-model="maintForm.enable" />
                  </a-form-model-item>
                </a-form-model>
              </template>
            </a-popover>
            <sg-pmap
              v-if="maintForm.map_path"
              :map-url="maintForm.map_path"
              :map-draw="true"
              @areaSelect="onMaintAreaSelect"
            />
            <a-empty v-else class="sg-empty" description="暂无站点地图" />
          </div>
        </a-tab-pane>
      </a-tabs>
      <template #footer>
        <a-button type="warning" @click="onModalAction('reset')">重置</a-button>
        <a-button type="primary" @click="onModalAction(maintAction)">提交</a-button>
      </template>
    </a-modal>
  </a-row>
</template>

<script>
import _ from 'lodash';
import SgTree from '@/components/Tree/Antd';
import SgPmap from '@/components/Map/2DMap';
import { ControlCMD, DEVICE_LEVEL, OVERHAUL_STATUS } from '@/enum';

export default {
  name: 'MaintManage',
  components: {
    SgTree,
    SgPmap,
  },
  computed: {
    treeData() {
      return this.handleTreeData(this.maintData);
    },
    deviceLevels() {
      return Object.entries(DEVICE_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    maintRules() {
      return {
        name: [{ required: true, message: '请输入检修内容' }],
        substation_id: [{ required: true, message: '请选择变电站' }],
        patrolhost_id: [{ required: true, message: '请选择巡视主机' }],
        device_level: [{ required: true, message: '请选择设备层级' }],
        timeRange: [{ required: true, type: 'array', message: '请选择检修时间' }],
        coordList: [{ required: false, type: 'array', message: '请选择检修设备' }],
        deviceList: [{ required: true, type: 'array', message: '请选择检修设备' }],
        area: [
          {
            required: true,
            type: 'object',
            message: '请选择检修区域',
            validator: (rule, value, callback) => {
              if (Object.values(value).every((coord) => !!coord)) {
                callback(new Error('请选择检修区域'));
              } else {
                callback();
              }
            },
          },
        ],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation.name', align: 'center', width: 150 },
        { title: '检修内容', dataIndex: 'name', align: 'center', width: 150 },
        { title: '检修设备', dataIndex: 'maintDevice', align: 'center', width: 250 },
        { title: '区域坐标', dataIndex: 'rect_list', align: 'center', width: 100 },
        { title: '开始时间', dataIndex: 'start_time', align: 'center', width: 150 },
        { title: '结束时间', dataIndex: 'end_time', align: 'center', width: 150 },
        { title: '检修状态', dataIndex: 'maintState', align: 'center', width: 100 },
        { title: '是否启用', dataIndex: 'maintEnable', align: 'center', width: 100 },
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
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      maintName: '',
      maintAction: '',
      maintMode: 'device',
      maintPopup: true,
      maintModal: false,
      maintModalTitle: '',
      maintForm: {
        name: '',
        substation_id: undefined,
        patrolhost_id: undefined,
        device_level: undefined,
        map_path: undefined,
        enable: false,
        timeRange: [],
        coordList: [],
        deviceList: [],
        area: { tl: '', tr: '', bl: '', br: '' },
      },
      maintData: [],
      maintNodes: [],
      maintDevices: [],
      maintStations: [],
      maintDeviceMap: {},
      patrolHosts: [],
      loadedKeys: [],
      expandedKeys: [],
      transferKeys: [],
      transferData: [],
      transferLoad: false,
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
  async created() {
    this.getSelectData();
    await this.getDeviceData();
    this.getTableData();
  },
  methods: {
    handleTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        item.disableCheckbox = this.transferKeys.includes(item.key);
        if (item.children && item.children.length > 0) {
          this.handleTreeData(item.children);
        }
      }
      return data;
    },
    handleQueryData() {
      this.getTableData();
    },
    handleMaintArea(row, action) {
      this.maintAction = action;
      switch (action) {
        case 'check':
          break;
        case 'issue':
          this.$api
            .postControlApi({
              action: ControlCMD.CONFIG_ISSUE,
              command: 4,
              config_id: row.id,
              syn: '检修区域配置下发',
            })
            .then(() => {
              this.$message.success('检修区域配置下发成功！');
            });
          break;
        case 'create':
          this.maintForm = {
            name: '',
            substation_id: undefined,
            patrolhost_id: undefined,
            device_level: undefined,
            map_path: undefined,
            enable: false,
            timeRange: [],
            coordList: [],
            deviceList: [],
          };
          this.maintModalTitle = '检修区域新增';
          this.maintModal = true;
          break;
        case 'update':
          this.maintForm = {
            ...row,
            enable: !!row.enable,
            substation_id: row.substation.id,
            patrolhost_id: row.patrolhost.id,
            map_path: row.substation.map_path,
            coordList: row.rect_list ? row.rect_list.split(',') : [],
            deviceList: row.device_list ? row.device_list.split(',') : [],
            timeRange: [
              row.start_time && this.$moment(row.start_time),
              row.end_time && this.$moment(row.end_time),
            ],
          };
          this.getTransferData(row.substation.id);
          this.maintModalTitle = '检修区域编辑';
          this.maintModal = true;
          break;
        case 'enable':
          this.$api
            .postBaseApi('overhaularea_update', { data: [{ id: row.id, enable: 1 }] })
            .then((res) => {
              if (!res) return;
              row.enable = 1;
              row.maintEnable = '是';
              this.$message.success('检修区域启用成功！');
            });
          break;
        case 'disable':
          this.$api
            .postBaseApi('overhaularea_update', { data: [{ id: row.id, enable: 0 }] })
            .then((res) => {
              if (!res) return;
              row.enable = 0;
              row.maintEnable = '否';
              this.$message.success('检修区域停用成功！');
            });
          break;
        case 'delete':
          this.$api.postBaseApi('overhaularea_delete', { data: [row.id] }).then(() => {
            this.$message.success('巡视区域删除成功！');
            this.getTableData();
          });
          break;
        default:
          break;
      }
    },
    handleRemoveArea(index) {
      this.maintForm.coordList.splice(index, 1);
    },
    onModalAction(action) {
      switch (action) {
        case 'reset':
          this.$refs.maintForm.resetFields();
          break;
        case 'create':
        case 'update':
          this.$refs.maintForm.validate((valid) => {
            if (valid) {
              const {
                id,
                name,
                enable,
                substation_id,
                patrolhost_id,
                device_level,
                timeRange,
                coordList,
              } = this.maintForm;
              let deviceList = '';
              if (this.maintMode === 'device') {
                let area1 = [],
                  area2 = [],
                  points = [],
                  devices = [];
                for (let i = 0, len = this.maintNodes.length; i < len; i++) {
                  const item = this.maintNodes[i];
                  switch (item.data.props.tier) {
                    case 0:
                      area1.push(item.data.key);
                      break;
                    case 1:
                      area2.push(item.data.key);
                      break;
                    case 2:
                      devices.push(item.data.key);
                      break;
                    case 3:
                      points.push(item.data.key);
                      break;
                    default:
                      break;
                  }
                }
                deviceList =
                  device_level === 1
                    ? area1.toString()
                    : device_level === 2
                    ? area2.toString()
                    : device_level === 3
                    ? points.toString()
                    : device_level === 4
                    ? devices.toString()
                    : '';
              } else {
                deviceList = this.maintForm.deviceList.join(',');
              }
              const [timeStart, timeEnd] = timeRange.map((date) =>
                this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
              );
              this.$api
                .postBaseApi(`overhaularea_${action}`, {
                  data: [
                    {
                      id,
                      name,
                      substation_id,
                      patrolhost_id,
                      device_level,
                      enable: enable ? 1 : 0,
                      start_time: timeStart,
                      end_time: timeEnd,
                      rect_list: coordList.join(','),
                      device_list: deviceList,
                    },
                  ],
                })
                .then(() => {
                  this.$message.success('检修区域提交成功！');
                  this.$refs.maintForm.resetFields();
                  this.maintModal = false;
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
    onTransferChange(targetKeys) {
      this.maintForm.deviceList = targetKeys;
    },
    onMaintTreeCheck(_, props, itemSelect) {
      const { node, checked, checkedNodes } = props;
      itemSelect && itemSelect(node.dataRef.key, checked);
      this.maintNodes = checkedNodes;
      // console.log('checkedNodes: ', checkedNodes);
    },
    onMaintAreaSelect(coord) {
      console.log(coord);
      const { x1, y1, x2, y2 } = coord;
      this.maintForm.coordList.push(`(${x1} ${y1} ${x2} ${y2})`);
      this.$api.postDeviceApi({ x__range: `${x1},${x2}`, y__range: `${y1},${y2}` }).then((res) => {
        if (!res) return;
        // const dataArr = res.results.map((item) => ({ label: item.name, value: item.id }));
        // this.maintDevices = _.uniqBy([...this.maintDevices, ...dataArr], 'value');
        this.maintDevices.push({ label: res.name || res.id, value: res.id });
      });
    },
    onMaintStationSelect(id, option) {
      this.maintForm.patrolhost_id = undefined;
      this.maintForm.map_path = option.data.props.map_path || '';
      this.getTransferData(id);
    },
    loadMaintTree(node) {
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
                  title: item.name,
                  isLeaf: false,
                }));
                this.maintData = [...this.maintData];
                this.transferData = [...this.transferData, ...dataRef.children];
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
                  title: item.name,
                  isLeaf: false,
                }));
                this.maintData = [...this.maintData];
                this.transferData = [...this.transferData, ...dataRef.children];
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
                  title: item.name,
                  isLeaf: true,
                }));
                this.maintData = [...this.maintData];
                this.transferData = [...this.transferData, ...dataRef.children];
              })
              .finally(() => resolve());
            break;
          default:
            return resolve();
        }
      });
    },
    getTransferData(stationId) {
      this.transferLoad = true;
      // 重置设备资源树状态
      this.expandedKeys = [];
      this.loadedKeys = [];
      this.$api
        .getBaseApi('patrolhost', { substation: stationId || this.stationId })
        .then((res) => {
          if (!res || !res.results) return;
          this.patrolHosts = res.results.map((item) => ({ label: item.name, value: item.id }));
        });
      this.$api
        .getBaseApi('area', { substation: stationId, parent__isnull: true })
        .then((res) => {
          if (!res) return;
          const treeData = res.results.map((item) => ({
            ...item,
            tier: 0,
            key: item.id,
            title: item.name,
            isLeaf: false,
          }));
          this.maintData = [...treeData];
          this.transferData = [...treeData];
        })
        .finally(() => {
          this.transferLoad = false;
        });
    },
    getTableData() {
      this.tableLoad = true;
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .getBaseApi('overhaularea_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          substation: this.stationId,
          name__icontains: this.maintName,
          start_time__gte: timeStart,
          end_time__lte: timeEnd,
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
              maintState: item.status != null ? OVERHAUL_STATUS[item.status] : '-',
              maintEnable: item.enble ? '是' : '否',
              maintDevice: item.device_list
                ? item.device_list
                    .split(',')
                    .map((id) => this.maintDeviceMap[id])
                    .join(',')
                : '-',
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getDeviceData() {
      return new Promise((resolve, reject) => {
        Promise.all([this.$api.getBaseApi('area'), this.$api.getBaseApi('device')])
          .then(([res1, res2]) => {
            if (!res1 || !res2) return;
            let maintDeviceMap = {};
            for (const item of res1.results) {
              maintDeviceMap[item.id] = item.name;
            }
            for (const item of res2.results) {
              maintDeviceMap[item.id] = item.name;
            }
            this.maintDeviceMap = maintDeviceMap;
            resolve();
          })
          .catch((err) => reject(err));
      });
    },
    getSelectData() {
      this.$api.getBaseApi('substation').then((res) => {
        if (!res || !res.results) return;
        this.maintStations = res.results.map((item) => ({
          label: item.name,
          value: item.id,
          map_path: `https://${location.hostname}:8443/html/shares/${item.map_path}`,
        }));
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
.maint-device {
  height: 70vh;

  &-transfer {
    width: 100%;
    height: 50vh;
    padding: 0 10px;

    /deep/ .ant-transfer {
      &-list {
        width: 50%;
        height: 100%;
        overflow: hidden;

        &-body {
          width: 100%;
          overflow: auto;
        }
      }
    }
  }
  &-btns {
    display: flex;
    justify-content: flex-end;

    .ant-btn + .ant-btn {
      margin-left: 10px;
    }
  }
}
.maint-map {
  position: relative;
  width: 100%;
  height: 70vh;

  &-popup {
    z-index: 100;
    position: absolute;
    top: 0;
    right: 0;
  }
  &-form {
    width: 25vw;
    height: 60vh;
    overflow-y: auto;
  }
  &-coords {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-height: 20vh;
    overflow-y: auto;

    .ant-input {
      width: 49%;
      margin: 5px 0;
    }
    .ant-input-group-wrapper {
      width: 49%;
    }
    > li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .anticon {
        margin-left: 10px;
        color: @theme-color1;
        font-size: 20px;
      }
    }
  }
  &-devices {
    display: block;
    width: 100%;
    padding-top: 1vh;
    max-height: 20vh;
    overflow-x: hidden;
    overflow-y: auto;

    /deep/ .ant-checkbox-group-item {
      width: 100%;
      .text-ellipsis();
    }
  }
}
</style>
