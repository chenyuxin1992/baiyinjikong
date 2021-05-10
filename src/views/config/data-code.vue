<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="6">
      <section class="query">
        <h3>标准数据代码查询</h3>
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
          <a-form-model-item class="col-12" prop="typeCode" label="标准类型" required>
            <a-input
              v-model="queryForm.typeCode"
              placeholder="请输入标准类型"
              :max-length="42"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item :wrapper-col="{ span: 24 }">
            <a-button type="primary" icon="search" @click="handleQueryData" block>
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
        bordered
        @change="onTableChange"
      >
      </a-table>
    </a-col>
  </a-row>
</template>

<script>
export default {
  name: 'DataCode',
  computed: {
    queryRules() {
      return {
        ip: [{ required: true, message: '请输入IP地址' }],
        port: [{ required: true, message: '请输入端口号' }],
        typeCode: [{ required: true, message: '请输入标准类型' }],
      };
    },
  },
  data() {
    return {
      queryForm: {
        ip: '192.168.1.202',
        port: '18001',
        typeCode: '010401',
      },
      tableLoad: false,
      tableData: [],
      tableColumns: [
        { title: '序号', dataIndex: 'index', align: 'center', width: 100 },
        { title: '标准代码', dataIndex: 'code', align: 'center' },
        { title: '标准代码名称', dataIndex: 'name', align: 'center' },
      ],
    };
  },
  methods: {
    handleQueryData() {
      this.$refs.queryForm.validate((valid) => {
        if (valid) {
          this.tableLoad = true;
          const { typeCode } = this.queryForm;
          this.$api
            .postCommonCode({ typeCode })
            .then((res) => {
              //if (!res) return;
              alert(JSON.stringify(res));
              let data = [];
              res.result.forEach((item, index) => {
                const dataItem = {
                  index: index,
                  code: item.code,
                  name: item.name,
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
