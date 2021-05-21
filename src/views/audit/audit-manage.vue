<template>
  <a-row class="sg-row" :gutter="10">
    <!-- <a-col class="sg-col" :span="4">
      <sg-tree @check="onTreeCheck" />
    </a-col> -->
    <a-col class="sg-col" :span="24">
      <div class="sg-query">
        <span class="sg-query-item">
          <span>事件内容:</span>
          <a-input
            v-model="actionContent"
            placeholder="请输入事件内容"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>事件结果:</span>
          <a-input
            v-model="actionResult"
            placeholder="请输入事件结果"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>操作人员:</span>
          <a-input
            v-model="actionStaff"
            placeholder="请输入操作人员"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>时间范围:</span>
          <a-range-picker
            class="datetime"
            v-model="timeRange"
            :placeholder="['开始时间', '结束时间']"
            separator="至"
            show-time
          ></a-range-picker>
        </span>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleAuditData(null, 'manage')">管理</a-button>
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
            <a-button size="small" @click="handleAuditData(row, 'check')">查看</a-button>
          </div>
        </template>
        <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
          {{ record.content }}
        </p>
      </a-table>
    </a-col>

    <a-modal
      v-model="auditModal"
      width="50vw"
      ok-text="提交"
      title="审计数据管理"
      dialog-class="sg-modal"
      centered
      @ok="onModalConfirm"
    >
      <a-transfer
        class="audit-transfer"
        :data-source="transferData"
        :target-keys="transferKeys"
        :render="(item) => item.title"
        :titles="['未启用数据', '已启用数据']"
        :show-select-all="false"
        @change="onTransferChange"
      >
        <template v-slot:children="{ props: { direction, selectedKeys }, on: { itemSelect } }">
          <a-tree
            v-if="direction === 'left'"
            :tree-data="treeData"
            :replace-fields="{ children: 'group' }"
            :checked-keys="[...selectedKeys, ...transferKeys]"
            check-strictly
            block-node
            show-icon
            checkable
            @check="(keys, props) => onAuditTreeCheck(keys, props, itemSelect)"
          >
            <a-icon slot="marked" type="star" :style="{ fontSize: '16px' }" />
          </a-tree>
        </template>
      </a-transfer>
    </a-modal>
  </a-row>
</template>

<script>
import _ from 'lodash';
import { ACTION_LEVEL, ACTION_COMMAND } from '@/enum';

export default {
  name: 'AuditManage',
  computed: {
    treeData() {
      return this.handleTreeData(this.auditData);
    },
    actionTypes() {
      return Object.entries(ACTION_COMMAND).map(([key, val]) => ({
        text: val.name,
        label: val.name,
        value: +key,
      }));
    },
    actionLevels() {
      return Object.entries(ACTION_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 100 },
        {
          title: '事件类型',
          dataIndex: 'actionType',
          align: 'center',
          width: 200,
          filterMultiple: false,
          filters: this.actionTypes,
        },
        // { title: '事件指令', dataIndex: 'actionCmd', align: 'center', width: 200 },
        { title: '事件内容', dataIndex: 'command_disp', align: 'center' },
        { title: '事件结果', dataIndex: 'result', align: 'center', width: 200 },
        { title: '事件来源', dataIndex: 'ip', align: 'center', width: 200, sorter: true },
        { title: '操作人员', dataIndex: 'username', align: 'center', width: 200 },
        { title: '操作时间', dataIndex: 'time', align: 'center', width: 200, sorter: true },
        {
          title: '操作等级',
          dataIndex: 'actionLevel',
          align: 'center',
          width: 200,
          filterMultiple: false,
          filters: this.actionLevels,
        },
      ];
    },
  },
  data() {
    return {
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      actionType: undefined,
      actionLevel: undefined,
      actionStaff: '',
      actionResult: '',
      actionContent: '',
      transferKeys: [],
      transferData: [],
      auditData: [],
      auditModel: {
        action: '事件类型',
        command: '事件指令',
        command_disp: '事件内容',
        ip: '事件来源',
        result: '事件结果',
        username: '操作人员',
        time: '操作时间',
        type: '操作等级',
      },
      auditModal: false,
      tableLoad: false,
      tableData: [],
      tableSort: [],
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
    this.getAuditData();
    this.getTableData();
  },
  methods: {
    handleTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        // 跳过标记数据
        if (item.marked) continue;
        // 跳过父级菜单
        if (item.ID) {
          if (this.transferKeys.includes(item.key)) {
            item.enable = 1;
            item.disableCheckbox = true;
          } else {
            item.enable = 0;
            item.disableCheckbox = false;
          }
        }
        if (item.group && Array.isArray(item.group)) {
          this.handleTreeData(item.group);
        }
      }
      return data;
    },
    handleQueryData() {
      this.getTableData();
    },
    handleAuditData(row, action) {
      switch (action) {
        case 'check':
          break;
        case 'manage':
          this.auditModal = true;
          break;
        default:
          break;
      }
    },
    onModalConfirm() {
      this.$api
        .postUserApi('/auditlog/setAuditList', {
          groups: this.treeData,
        })
        .then(() => {
          this.$message.success('审计日志数据设置成功！');
          this.auditModal = false;
        })
        .catch(() => {
          this.$message.success('审计日志数据设置失败！');
        });
    },
    onTableChange(pagination, filters, sorter) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      if (filters['actionType'] && filters['actionType'].length > 0) {
        this.actionType = filters['actionType'][0];
      } else {
        this.actionType = undefined;
      }
      if (filters['actionLevel'] && filters['actionLevel'].length > 0) {
        this.actionLevel = filters['actionLevel'][0];
      } else {
        this.actionLevel = undefined;
      }
      if (sorter.column) {
        this.tableSort = [{ [sorter.field]: { order: sorter.order.replace('end', '') } }];
      } else {
        this.tableSort = [];
      }
      this.getTableData();
    },
    onTransferChange(targetKeys, direction, moveKeys) {
      console.log(targetKeys, direction, moveKeys);
      this.transferKeys = targetKeys;
    },
    onAuditTreeCheck(_, props, itemSelect) {
      const { node, checked } = props;
      itemSelect && itemSelect(node.dataRef.key, checked);
    },
    getAuditData() {
      this.$api.postUserApi('/auditlog/getAuditList').then((res) => {
        if (!res) return;
        const groups = res.groups;
        for (let i = 0; i < groups.length; i++) {
          const model = groups[i];
          model.key = model.name;
          model.title = model.name;
          model.checkable = false;
          if (model.group && Array.isArray(model.group)) {
            model.group = model.group.map((item) => {
              item.key = item.code;
              item.title = item.name;
              item.parent = item.group;
              if (item.marked) {
                item.checkable = false;
                item.slots = { icon: 'marked' };
              }
              this.transferData.push(item);
              if (item.enable && !item.marked) {
                this.transferKeys.push(item.key);
              }
              return _.omit(item, 'group');
            });
          }
        }
        this.auditData = groups;
      });
    },
    getTableData() {
      this.tableLoad = true;
      let params = [];
      this.actionType && params.push({ match: { command: this.actionType } });
      this.actionLevel && params.push({ match: { type: this.actionLevel } });
      this.actionStaff && params.push({ match: { username: this.actionStaff } });
      this.actionResult && params.push({ match: { result: this.actionResult } });
      this.actionContent && params.push({ match: { command_disp: this.actionContent } });
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .postHistoryApi('auditlogs', '_search', {
          from: this.pagination.pageSize * (this.pagination.current - 1),
          size: this.pagination.pageSize,
          sort: this.tableSort,
          query: {
            bool: {
              must: params,
              filter: [{ range: { time: { gte: timeStart, lte: timeEnd } } }],
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
          res.hits.hits.forEach((item, index) => {
            const { _id, _source } = item;
            const { action, command, type } = _source;
            const actionItem = ACTION_COMMAND[command];
            // console.log(actionItem)
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
            const dataItem = {
              ..._source,
              id: _id,
              index: tableIndex,
              actionLevel: ACTION_LEVEL[type] || '-',
              actionType: actionItem ? actionItem.name : '-',
            };
            tableData.push(dataItem);
          });
          this.tableData = tableData;
          this.pagination.total = res.hits.total.value;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.audit-transfer {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50vh;

  /deep/ .ant-transfer {
    &-list {
      flex: auto;
      width: 50%;
      height: 100%;
      overflow: hidden;

      &-body {
        width: 100%;
        overflow: auto;
      }
    }
    &-operation {
      flex: none;
    }
  }
}
</style>
