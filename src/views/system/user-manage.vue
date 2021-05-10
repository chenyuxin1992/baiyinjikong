<template>
  <a-row class="sg-row">
    <a-col class="sg-col" :span="24">
      <div class="sg-query">
        <span class="sg-query-item">
          <span>用户名称:</span>
          <a-input v-model="userName" placeholder="请输入用户名称" :max-length="20" allow-clear />
        </span>
        <span class="sg-query-item">
          <span>用户昵称:</span>
          <a-input v-model="nickName" placeholder="请输入用户昵称" :max-length="20" allow-clear />
        </span>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleUserManage(null, 'create')">新增</a-button>
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
        <template v-slot:avatar="data">
          <img class="user-avatar" :src="data" alt="#" />
        </template>
        <template v-slot:userRole="data, row">
          <a-select
            class="user-select"
            :options="userRoles"
            :default-value="data"
            placeholder="请选择用户角色"
            @change="onUserRoleChange($event, row)"
          ></a-select>
          <a-input-number
            v-if="row.authorityId == '333'"
            class="user-select"
            v-model="row.priority" 
            :min="1" 
            :max="10"
            @change="onUserPriorityChange($event, row)"
          ></a-input-number>
        </template>
        <template v-slot:operation="data, row">
          <div class="operation">
            <!-- <a-button size="small" @click="handleUserManage(row, 'edit')">编辑</a-button> -->
            <a-popconfirm title="确定删除该用户?" @confirm="handleUserManage(row, 'delete')">
              <a-button size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
        <template v-slot:fingerprint="data, row">
          <div class="fingerprint">
            <!-- <a-button size="small" @click="handleUserManage(row, 'edit')">编辑</a-button> -->
            <div v-if="row.FingerPrintID">已录入</div>
            <a-popconfirm v-if="!row.FingerPrintID" title="确定录入该用户指纹?" @confirm="setFingerprint(row)">
              <a-button size="small">录入</a-button>
            </a-popconfirm>
          </div>
        </template>        
      </a-table>
    </a-col>

    <a-modal
      v-model="userModal"
      width="30vw"
      dialogClass="sg-modal"
      :title="userModalTitle"
      centered
    >
      <a-form-model
        class="sg-form user-form"
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 15 }"
      >
        <a-form-model-item prop="username" label="用户名称" required>
          <a-input
            v-model="userForm.username"
            placeholder="请输入用户名称"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item
          v-show="userAction === 'create'"
          prop="password"
          label="用户密码"
          required
        >
          <a-input-password
            v-model="userForm.password"
            placeholder="请输入用户密码"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="nickName" label="用户昵称" required>
          <a-input
            v-model="userForm.nickName"
            placeholder="请输入用户昵称"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="authorityId" label="用户角色" required>
          <a-select
            v-model="userForm.authorityId"
            :options="userRoles"
            placeholder="请选择用户角色"
          ></a-select>
        </a-form-model-item>
        <!--a-form-model-item prop="headerImg" label="用户头像">
          <a-upload
            class="user-form__upload"
            name="avatar"
            accept="image/*"
            list-type="picture-card"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            :show-upload-list="false"
            @change="onUploadChange"
          >
            <img
              v-if="userForm.headerImg"
              :src="userForm.headerImg"
              width="100"
              height="100"
              alt="#"
            />
            <a-icon v-else type="plus" :style="{ fontSize: '24px' }" />
          </a-upload>
        </a-form-model-item-->
      </a-form-model>

      <template #footer>
        <a-button v-if="userAction === 'create'" type="warning" @click="handleUserAction('reset')">
          重置
        </a-button>
        <a-button v-else type="default" @click="handleUserAction('cancel')">取消</a-button>
        <a-button type="primary" @click="handleUserAction(userAction)">提交</a-button>
      </template>
    </a-modal>
  </a-row>
</template>

<script>
import stompInit from '@/utils/stomp';
import { sm4Encrypt } from '@/utils';

export default {
  name: 'UserManage',
  computed: {
    userRoleMap() {
      return this.userRoles.reduce((acc, item) => ((acc[item.authorityId] = item), acc), {});
    },
    userRules() {
      return {
        username: [{ required: true, message: '请输入用户名称' }],
        password: [{ required: true, message: '请输入用户密码' }],
        nickName: [{ required: true, message: '请输入用户昵称' }],
        authorityId: [{ required: true, message: '请选择用户角色' }],
      };
    },
    tableColumns() {
      return [
        { title: '用户ID', dataIndex: 'ID', align: 'center', width: 100 },
        // {
        //   title: '用户头像',
        //   dataIndex: 'userAvatar',
        //   align: 'center',
        //   width: 200,
        //   scopedSlots: { customRender: 'avatar' },
        // },
        { title: '用户名称', dataIndex: 'userName', align: 'center' },
        { title: '用户昵称', dataIndex: 'nickName', align: 'center' },
        {
          title: '用户角色',
          dataIndex: 'authorityId',
          align: 'center',
          scopedSlots: { customRender: 'userRole' },
        },
        { title: '用户指纹', align: 'center', width: 200, scopedSlots: { customRender: 'fingerprint' } },
        { title: '操作', align: 'center', width: 200, scopedSlots: { customRender: 'operation' } },
      ];
    },
    
  },
  data() {
    return {
      userRoles: [],
      userModal: false,
      userModalTitle: '',
      userAction: '',
      userName: '',
      nickName: '',
      userForm: {
        username: '',
        password: '',
        nickName: '',
        headerImg: undefined,
        authorityId: undefined,
      },
      tableLoad: false,
      tableData: [],
      stompSub: null,
      stompClient: null,
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
      priority: 1
    };
  },
  async created() {
    await this.getSelectData();
    this.getTableData();
    this.initStompClient();
  },
  mounted() {
    this.$bus.$on('stomp', (msg) => {
      if (msg.action == '2500') {
        if (msg) {
          this.$message.success(msg.tip);
        }
      }
    });
  },  
  beforeDestroy() {
    if (this.stompSub) {
      this.stompSub.unsubscribe();
      this.stompSub = null;
    }
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.stompClient = null;
    }
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    initStompClient() {
      stompInit().then((client) => {
        this.stompClient = client;
        this.stompSub = client.subscribe('/exchange/nik_base/patrol', (msg) => {
          if (!msg) return;
          const body = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body;
          this.$bus.$emit('stomp', body);
        });
      });
    },
    setFingerprint(row) {
      this.$api.postUserApi('/base_cas/finger', {uuid: row.uuid}).then((res) => {
        if (!res) return;
      });
    },
    handleUserManage(row, action) {
      this.userAction = action;
      switch (action) {
        case 'edit':
          this.userForm = { ...row, username: row.userName };
          this.userModalTitle = '用户管理编辑';
          this.userModal = true;
          break;
        case 'create':
          this.userModalTitle = '用户管理新增';
          this.userModal = true;
          break;
        case 'delete':
          this.$api
            .postUserApi('/user/deleteUser', { id: row.ID })
            .then(() => {
              this.$message.success('用户删除成功!');
              this.getTableData();
            })
            .catch(() => {
              this.$message.success('用户删除失败!');
            });
          break;
        default:
          break;
      }
    },
    handleUserAction(action) {
      switch (action) {
        case 'edit':
          this.$refs.userForm.validate((valid) => {
            if (valid) {
              return true;
            } else {
              return false;
            }
          });
          break;
        case 'create':
          this.$refs.userForm.validate((valid) => {
            if (valid) {
              const { username, password, nickName, authorityId } = this.userForm;
              if (username === password) {
                return this.$message.warn('用户名称和密码不能相同!');
              }
              const sm4Password = sm4Encrypt(password);
              this.$api
                .postUserApi('/user/register', { username, password: sm4Password, nickName, authorityId })
                .then(() => {
                  this.$message.success('用户创建成功！');
                  this.$refs.userForm.resetFields();
                  this.userModal = false;
                  this.getTableData();
                });
            } else {
              return false;
            }
          });
          break;
        case 'cancel':
          this.userForm = {
            username: '',
            password: '',
            nickName: '',
            headerImg: undefined,
            authorityId: undefined,
          };
          this.userModal = false;
          break;
        case 'reset':
          this.$refs.userForm.resetFields();
          break;
        default:
          break;
      }
    },
    onUserRoleChange(val, row) {
      this.$api
        .postUserApi('/user/setUserAuthority', { uuid: row.uuid, authorityId: val })
        .then(() => {
          this.$message.success('用户角色设置成功！');
          this.getTableData();
        });
    },
    onUserPriorityChange(val, row) {
      this.$api
        .postUserApi('/user/setUserPriority', { uuid: row.uuid, priority: val })
        .then(() => {
          this.$message.success('用户优先级设置成功！');
        });
    },
    onUploadChange({ file }) {
      // console.log(file);
      if (file.status === 'done') {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.addEventListener('load', () => {
          this.userForm.headerImg = reader.result;
        });
      }
    },
    onTableChange(pagination, filters, sorter) {
      console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      this.$api
        .postUserApi('/user/getUserList', {
          page: this.pagination.current,
          pageSize: this.pagination.pageSize,
        })
        .then((res) => {
          // console.log(res);
          if (!res) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          const { list, total } = res;
          this.tableData = list.map((item) => ({
            ...item,
            id: item.ID,
            userRole: this.userRoleMap[item.authorityId].authorityName || '-',
            userAvatar: item.headerImg || require('@/assets/images/icon_avatar.png'),
          }));
          this.pagination.total = total;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      return new Promise((resolve, reject) => {
        this.$api
          .postUserApi('/authority/getAuthorityList', { page: 1, pageSize: 1000 })
          .then((res) => {
            if (!res) return resolve();
            this.userRoles = res.list.map((item) => ({
              ...item,
              label: item.authorityName,
              value: item.authorityId,
            }));
            resolve();
          })
          .catch((err) => reject(err));
      });
    },
  },
};
</script>

<style lang="less" scoped>
.user-form {
  &__upload {
    display: block;
  }
}
</style>
