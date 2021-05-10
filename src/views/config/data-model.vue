<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="6">
      <section class="query">
        <h3>按设备类型数据字典查询</h3>
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
            <a-input v-model="queryForm.ip" placeholder="请输入IP地址" allow-clear />
          </a-form-model-item>
          <a-form-model-item class="col-12" prop="port" label="端口号" required>
            <a-input v-model="queryForm.port" placeholder="请输入端口号" allow-clear />
          </a-form-model-item>
          <a-form-model-item class="col-12" prop="psrType" label="设备编码" required>
            <a-input
              v-model="queryForm.psrType"
              placeholder="请输入设备编码"
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
          <a-form-model-item prop="modeltype" label="模型类型" :label-col="{ span: 4 }" required>
            <a-radio-group v-model="queryForm.modeltype">
              <a-radio :value="0">资源</a-radio>
              <a-radio :value="1">资产</a-radio>
              <a-radio :value="2">拓扑</a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item :wrapper-col="{ span: 24 }">
            <a-button type="primary" icon="search" @click="handleQueryData" block
              >查询结果
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
        bordered
        @change="onTableChange"
      >
      </a-table>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'DataModel',
  computed: {
    queryRules() {
      return {
        ip: [{ required: true, message: '请输入IP地址' }],
        port: [{ required: true, message: '请输入端口号' }],
        psrType: [{ required: true, message: '请输入设备编码' }],
        distribution: [{ required: true, message: '请选择主配网标识' }],
        modeltype: [{ required: true, message: '请选择模型类型' }],
      };
    },
  },
  data() {
    return {
      queryForm: {
        ip: '192.168.1.202',
        port: '18001',
        psrType: '0301',
        distribution: 0,
        modeltype: 0,
      },
      tableLoad: false,
      tableData: [],
      tableColumns: [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '表名', dataIndex: 'tableName', align: 'center' },
        { title: '属性名', dataIndex: 'columnName', align: 'center' },
        { title: '属性中文名', dataIndex: 'columnComment', align: 'center' },
        { title: '数据类型', dataIndex: 'dataType', align: 'center' },
        { title: '数据长度', dataIndex: 'length', align: 'center' },
        { title: '数据精度', dataIndex: 'precision', align: 'center' },
        { title: '是否允许为空', dataIndex: 'nullable', align: 'center' },
        { title: '伸展', dataIndex: 'isStretch', align: 'center' },
        { title: '类型', dataIndex: 'typeCode', align: 'center' },
      ],
    };
  },
  methods: {
    handleQueryData() {
      this.$refs.queryForm.validate((valid) => {
        if (valid) {
          this.tableLoad = true;
          const { psrType, modeltype, distribution } = this.queryForm;
          this.$api
            .postModelSemantics({ psrType, modeltype: String(modeltype), distribution: String(distribution) })
            .then((res) => {
              //if (!res) return;
              alert(JSON.stringify(res));
              let data = [];
              res.result[0].fields.forEach((item, index) => {
                const dataItem = {
                  index: index,
                  tableName: item.tableName,
                  columnName: item.columnName,
                  columnComment: item.columnComment,
                  dataType: item.dataType,
                  length: item.length,
                  precision: item.precision,
                  nullable: item.nullable,
                  isStretch: item.isStretch,
                  typeCode: item.typeCode,
                };
                data.push(dataItem);
              });
              this.tableData = data;
            })
            .catch(err => {console.log(err)})
            .finally(() => {
              this.tableLoad = false;
            });
        } else {
          return false;
        }
      });
    },
    onTableChange(pagination, filters, sorter) {
      console.log(pagination, filters, sorter);
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
