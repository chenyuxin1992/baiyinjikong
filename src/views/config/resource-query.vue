<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="6">
      <section class="query">
        <h3>变电专业资源通用查询</h3>
        <a-form-model
          class="sg-form query-form"
          ref="queryForm"
          :model="queryForm"
          :rules="queryRules"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          hideRequiredMark
        >
          <a-form-model-item class="col-12" prop="ip" label="IP地址" required>
            <a-input
              v-model="queryForm.ip"
              placeholder="请输入IP地址"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item class="col-12" prop="port" label="端口号" required>
            <a-input
              v-model="queryForm.port"
              placeholder="请输入端口号"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>

          <a-form-model-item class="col-12" prop="id" label="资源ID" required>
            <a-input
              v-model="queryForm.id"
              placeholder="请输入资源ID"
              :max-length="42"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item class="col-12" prop="psrType" label="资源类型" required>
            <a-input
              v-model="queryForm.psrType"
              placeholder="请输入资源类型"
              :max-length="42"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item prop="distribution" label="网络标识" :label-col="{ span: 4 }" required>
            <a-radio-group v-model="queryForm.distribution">
              <a-radio :value="1">主网</a-radio>
              <a-radio :value="0">配网</a-radio>
            </a-radio-group>
          </a-form-model-item>
        </a-form-model>
        <h3>查询条件:</h3>
        <a-form-model
          class="query-params"
          ref="queryParams"
          :model="queryParams"
          :label-col="{ span: 0 }"
          :wrapper-col="{ span: 24 }"
        >
          <a-form-model-item
            v-for="(item, index) in queryParams.list"
            :key="item.fieldName"
            :prop="item.fieldName"
            :label="item.fieldValue"
            required
          >
            <a-input
              class="col-7"
              v-model="item.fieldName"
              placeholder="请输入属性名称"
              :max-length="42"
              allow-clear
            />
            <a-select class="col-3" v-model="item.compare" default-value="=" :show-arrow="false">
              <a-select-option v-for="term in queryTerms" :key="term" :value="term">
                {{ term }}
              </a-select-option>
            </a-select>
            <a-input
              class="col-12"
              v-model="item.fieldValue"
              placeholder="请输入属性值"
              :max-length="100"
              allow-clear
            />
            <a-icon class="col-1" type="minus-circle" @click="handleRemoveParam(index)" />
          </a-form-model-item>
          <a-form-model-item>
            <a-button class="col-11" type="default" icon="plus" @click="handleAddParam">
              添加条件
            </a-button>
            <a-button class="col-11" type="primary" icon="search" @click="handleQueryData">
              查询结果
            </a-button>
          </a-form-model-item>
        </a-form-model>
      </section>
    </a-col>
    <a-col class="sg-col" :span="18">
      <div class="sg-query">
        <a-button @click="handleQueryData">查询</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: true }"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleAuditItem(row, 'edit')">编辑</a-button>
            <a-button size="small" @click="handleAuditItem(row, 'check')">查看</a-button>
          </div>
        </template>
      </a-table>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'ResourceQuery',
  computed: {
    queryRules() {
      return {
        ip: [{ required: true, message: '请输入IP地址' }],
        port: [{ required: true, message: '请输入端口号' }],
        id: [{ required: true, message: '请输入资源ID' }],
        psrType: [{ required: true, message: '请输入资源类型代码' }],
      };
    },
    queryTerms() {
      return ['=', '!=', '<', '>', '>=', '<=', 'in', 'like'];
    },
    tableColumns() {
      return Object.keys(this.tableColumn).map((key) => {
        return { title: key, dataIndex: key, align: 'center', width: 150, ellipsis: true };
      });
    },
  },
  data() {
    return {
      queryForm: {
        ip: '192.168.1.202',
        port: '18001',
        id: '1',
        psrType: 'zf01',
        distribution: 1,
      },
      queryParams: {
        list: [
          {
            compare: '=',
            fieldName: 'psrId',
            fieldValue: '1',
          },
        ],
      },
      tableLoad: false,
      tableData: [],
      tableColumn: {
        maintOrg: '8a1ea5c64bdebad1014bdebc6047087b',
        stationType: 'zf01',
        supplyArea: null,
        buildingArea: 1193.8,
        dispatchMonitor: null,
        fireAcceptance: null,
        type: null,
        arrangement: '01',
        coverArea: 30970,
        isRural: null,
        ctime: '2005-12-12T16:00:00.000+0000',
        geoPositon: null,
        stationCapacity: null,
        equipmentOwner: 'E885DB89EE2A675CE0408D0A5B0463A0',
        psrId: '690ae551a38a10f36376690ae50176690ae54c0008',
        telephone: null,
        ratedDcTransmissionCapacity: null,
        dispatchJurisdiction: null,
        astId: '690ae551a38a10f36376690ae50176690ae54c0008',
        isSmartStation: '0',
        isLoadStation: null,
        dispatchName: null,
        name: '500kV变电站',
        isAvc: '1',
        isGis: '1',
        converterStationType: null,
        lastUpdateTime: null,
        dispatchPermission: null,
        altitude: 500,
        psrState: '20',
        regionalism: '05',
        city: '8a1ea5c64bdebad1014bdebc6047087b',
        importance: null,
        isCentralMonitor: '1',
        dispatchOperation: null,
        highestDispatchJurisdiction: null,
        runDevName: '500kV变电站',
        startTime: '2005-12-08T16:00:00.000+0000',
        stopTime: null,
        transformerQuantity: null,
        address: '西北',
        maintGroup: '8a1ea5c64bdebad1014bdebc604708b4',
        importantLevel: '2',
        contaminationLevel: '04',
        dcSystem: null,
        voltageLevel: '35',
        isFirts: '1',
        fireType: null,
        dutyMode: '2',
        isJunctionStation: '1',
        isN1: null,
      },
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
    };
  },
  methods: {
    handleAddParam() {
      this.queryParams.list.push({ compare: '=', fieldName: '', fieldValue: '' });
    },
    handleRemoveParam(index) {
      this.queryParams.list.splice(index, 1);
    },
    handleQueryData() {
      this.$refs.queryForm.validate((valid) => {
        if (valid) {
          this.tableLoad = true;
          const { id, psrType, distribution } = this.queryForm;
          const filters = this.queryParams.list;
          // `http://${ip}:${port}`,
          this.$api
            .postCommonQuery([
              {
                id,
                psrType,
                distribution,
                params: {
                  filters,
                  size: this.pagination.pageSize,
                  current: this.pagination.current,
                  page: 0,
                  perpage: 0,
                  fields: '',
                  orderBy: '',
                },
              },
            ])
            .then((res) => {
              //if (!res) return;
              alert(JSON.stringify(res));
              const { total, result } = res;
              this.tableColumn = result[0];
              this.tableData = result.map((item, index) => {
                const tableIndex =
                  this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
                return {
                  ...item,
                  id: tableIndex,
                };
              });
              this.pagination.total = total;
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              this.tableLoad = false;
            });
        } else {
          return false;
        }
      });
    },
    onTableChange(pagination) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      this.getTableData();
    },
  },
};
</script>

<style lang="less" scoped>
.query {
  width: 100%;
  height: 100%;
  padding: 10px;
  background-color: #fff;

  &-form {
    margin-top: 1vh;
  }
  &-params {
    width: 100%;
    height: 60vh;
    margin-top: 1vh;
    overflow-y: auto;

    /deep/ .ant-form-item-children {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      > .anticon-minus-circle {
        color: @theme-color1;
        font-size: 20px;
      }
      .col-1 {
        width: 4.17%;
      }
      .col-2 {
        width: 8.33%;
      }
      .col-3 {
        width: 12.5%;
      }
      .col-4 {
        width: 16.67%;
      }
      .col-5 {
        width: 20.83%;
      }
      .col-6 {
        width: 25%;
      }
      .col-7 {
        width: 29.17%;
      }
      .col-8 {
        width: 33.33%;
      }
      .col-9 {
        width: 37.5%;
      }
      .col-10 {
        width: 41.67%;
      }
      .col-11 {
        width: 45.83%;
      }
      .col-12 {
        width: 50%;
      }
      .col-14 {
        width: 58.33%;
      }
    }
  }
}
</style>
