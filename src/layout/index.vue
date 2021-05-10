<template>
  <a-layout id="layout">
    <a-layout-header class="header">
      <div class="header-left">
        <img src="../assets/svg/logo.svg" alt="#" />
        <span>远程智能巡视集中监控系统</span>
      </div>
      <div class="header-right">
        <a-menu class="header-menu" mode="horizontal" :default-selected-keys="activeMenu">
          <template v-for="route in routes">
            <a-menu-item v-if="route.meta.single" :key="route.path">
              <router-link :to="`${route.path}?authority=${authId}`">{{ route.meta.title }}</router-link>
            </a-menu-item>
            <a-sub-menu
              v-else
              :key="route.path"
              :title="route.meta.title"
              popupClassName="sg-submenu"
            >
              <template v-for="subRoute in route.children">
                <a-menu-item v-if="!subRoute.meta.hidden" :key="`${route.path}/${subRoute.path}`">
                  <router-link :to="`${route.path}/${subRoute.path}?authority=${authId}`">
                    {{ subRoute.meta.title }}
                  </router-link>
                </a-menu-item>
              </template>
            </a-sub-menu>
          </template>
        </a-menu>
        <a-divider type="vertical" />
        <a-dropdown placement="bottomCenter">
          <span class="header-user">
            <!--a-avatar class="header-user__avatar" :src="avatar" alt="#" /-->
            <span class="header-user__name">{{ nickName }}</span>
          </span>
          <a-menu slot="overlay" @click="onUserMenuClick">
            <a-menu-item key="changepwd">修改密码</a-menu-item>
            <a-menu-item key="logout">退出登录</a-menu-item>
          </a-menu>
        </a-dropdown>
        <!-- <a-divider type="vertical" />
        <sg-icon name="logout" :style="{ color: '#fff' }" @click="handleLogout" /> -->
      </div>
    </a-layout-header>
    <a-layout-content class="content">
      <div class="content-header">
        <a-breadcrumb separator=">">
          <template v-for="route in routeMatched">
            <a-breadcrumb-item v-if="route.meta.title" :key="route.path" :href="route.path">
              {{ route.meta.title }}
            </a-breadcrumb-item>
          </template>
        </a-breadcrumb>
        <router-view name="header"></router-view>
      </div>
      <div class="content-view">
        <router-view></router-view>
      </div>
    </a-layout-content>

    <a-modal
      v-model="identityModal"
      dialog-class="sg-modal"
      title="用户身份鉴别"
      centered
      @cancel="onModalConfirm('cancel')"
      @ok="onModalConfirm('identify')"
    >
      <a-form-model
        class="sg-form"
        ref="identifyForm"
        :model="identifyForm"
        :rules="identifyRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        hideRequiredMark
      >
        <a-form-model-item prop="password" label="用户密码" required>
          <a-input-password
            v-model="identifyForm.password"
            placeholder="请输入用户密码"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-modal
      v-model="passwordModal"
      dialog-class="sg-modal"
      title="用户密码修改"
      centered
      @ok="onModalConfirm('password')"
    >
      <a-form-model
        class="sg-form"
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        hideRequiredMark
      >
        <a-form-model-item prop="password" label="旧密码" required>
          <a-input-password
            v-model="passwordForm.password"
            placeholder="请输入旧密码"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="newPassword" label="新密码" required>
          <a-input-password
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
    <a-modal
      v-model="alarmModal"
      width="75vw"
      dialog-class="sg-modal alarm-modal"
      :title="alarmTitle"
      :footer="false"
      centered
    >
      <a-tabs
        v-if="alarmType === 'linkage'"
        v-model="alarmKey"
        class="alarm-modal__tabs"
        type="line"
      >
        <template #tabBarExtraContent v-if="alarmVideos.length > 0">
          <a-radio-group
            v-show="alarmKey === 'video'"
            class="alarm-modal__group"
            button-style="solid"
            :default-value="0"
            @change="onVideoRadioChange"
          >
            <a-radio-button v-for="(item, index) in alarmVideos" :key="index" :value="index">
              {{ item.detector.name }}
            </a-radio-button>
          </a-radio-group>
        </template>

        <a-tab-pane v-if="alarmImages.length > 0" key="image" tab="抓图">
          <a-carousel
            class="sg-carousel alarm-modal__swiper"
            :infinite="false"
            effect="fade"
            arrows
          >
            <a-icon slot="prevArrow" type="left-circle" />
            <a-icon slot="nextArrow" type="right-circle" />
            <img
              class="alarm-modal__image"
              v-for="(item, index) in alarmImages"
              :key="index"
              :src="item"
              alt="#"
            />
          </a-carousel>
          <!-- <swiper class="alarm-modal__swiper" ref="imageSwiper" :options="imageOptions">
            <swiper-slide v-for="(item, index) in alarmImages" :key="index">
              <img class="alarm-modal__image" :src="item" alt="#" />
            </swiper-slide>
            <div
              v-show="alarmImages.length > 1"
              class="swiper-pagination image"
              slot="pagination"
            ></div>
            <span
              v-show="alarmImages.length > 1"
              class="swiper-button-prev image"
              slot="button-prev"
            ></span>
            <span
              v-show="alarmImages.length > 1"
              class="swiper-button-next image"
              slot="button-next"
            ></span>
          </swiper> -->
        </a-tab-pane>
        <a-tab-pane v-if="alarmVideos.length > 0" key="video" tab="视频">
          <a-carousel
            class="sg-carousel alarm-modal__swiper"
            ref="videoSwiper"
            :before-change="onVideoCarouselChange"
            :infinite="false"
            arrows
          >
            <a-icon slot="prevArrow" type="left-circle" />
            <a-icon slot="nextArrow" type="right-circle" />
            <sg-camera
              class="alarm-modal__player"
              v-for="(item, index) in alarmVideos"
              :key="index"
              v-bind="{
                url: item.url,
                did: item.did,
                cno: item.cno,
                preset: item.preset,
                detector: item.detector,
                autoplay: true,
              }"
            />
          </a-carousel>
        </a-tab-pane>
      </a-tabs>
      <a-table
        v-else-if="alarmType === 'history'"
        class="alarm-modal__table"
        row-key="id"
        :scroll="{ y: '70vh' }"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="false"
        bordered
      >
        <template v-slot:sound="data"><a-icon v-if="data" type="check" /></template>
        <template v-slot:video="data"> <a-icon v-if="data" type="check" /></template>
        <template v-slot:snapshot="data"> <a-icon v-if="data" type="check" /></template>
      </a-table>
    </a-modal>
    <a-drawer
      width="20vw"
      title="系统基础设置"
      placement="left"
      wrap-class-name="config"
      :z-index="2000"
      :visible="drawerVisible"
      @close="drawerVisible = false"
    >
      <a-form-model
        class="config-form"
        label-align="left"
        :model="configForm"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
      <div>告警确认后相同告警再次提示时间：</div>
        <a-form-model-item prop="alarmInterval" label="告警提示间隔">
          <a-input-number
            v-model="configForm.alarmInterval"
            placeholder="配置相同告警提示间隔时间"
            style="width: 100%"
            :min="0"
            :step="10"
            :formatter="(val) => `${val}秒`"
            :parser="(val) => Number(val.replace('秒', ''))"
          />
        </a-form-model-item>
      </a-form-model>
    </a-drawer>
    <a-popover
      v-if="alarmVisible"
      v-model="alarmPopup"
      trigger="click"
      placement="bottomLeft"
      overlay-class-name="sg-popover alarm"
    >
      <!-- @visibleChange="onPopoverToggle" -->
      <template #title>
        <div class="alarm-title">
          <span>告警信息列表</span>

          <a-button type="link" size="large" @click="drawerVisible = true">告警确认配置</a-button>
        </div>
      </template>
      <template #content>
        <div class="alarm-scroll" ref="scroll">
          <a-list
            class="alarm-scroll__list"
            ref="list"
            row-key="action_id"
            :data-source="alarmList"
            :loading="scrollOptions.pullUp"
          >
            <a-list-item class="alarm-scroll__item" slot="renderItem" slot-scope="item">
              <a-list-item-meta :title="item.time">
                <template #avatar>
                  <a-icon
                    v-if="item.video"
                    type="video-camera"
                    :class="[{ flash: !item.checked }]"
                  />
                  <a-icon
                    v-else-if="item.snapshot"
                    type="picture"
                    :class="[{ flash: !item.checked }]"
                  />
                  <a-icon v-else-if="item.sound" type="sound" :class="[{ flash: !item.checked }]" />
                  <a-icon v-else type="alert" :class="[{ flash: !item.checked }]" />
                </template>
                <ul slot="description">
                  <li>告警点位：{{ item.patrolpoint_name || '-' }}</li>
                  <li v-if="item.detector_name">告警设备：{{ item.detector_name }}</li>
                  <li v-if="item.action_name">告警信息：{{ item.action_name }}</li>
                </ul>
              </a-list-item-meta>
              <template #actions>
                <a-button v-if="item.checked" size="small" type="link" disabled>已确认</a-button>
                <a-popconfirm
                  v-else
                  title="是否确认该联动告警信息?"
                  @confirm="handleAlarmInfo(item, 'confirm')"
                >
                  <a-button size="small" type="link">确认</a-button>
                </a-popconfirm>
                <a-button size="small" type="link" @click="handleAlarmInfo(item, 'check')">
                  查看
                </a-button>
                <a-button size="small" type="link" @click="handleAlarmInfo(item, 'history')">
                  历史告警
                </a-button>
              </template>
            </a-list-item>
            <a-button
              v-show="!scrollOptions.noMore && !scrollOptions.pullUp"
              class="alarm-scroll__loadmore"
              slot="loadMore"
              type="primary"
              block
              @click="handleLoadMore"
            >
              加载更多
            </a-button>
            <div v-if="scrollOptions.noMore" class="alarm-scroll__nomore">~已经到底了~</div>
          </a-list>
        </div>
      </template>

      <a-badge id="alarm" :count="alarmCount">
        <a-button type="primary" shape="circle" size="large" icon="notification"></a-button>
      </a-badge>
    </a-popover>
  </a-layout>
</template>
<script>
import _ from 'lodash';
import { Howl } from 'howler';
import { mapState } from 'vuex';
import { sm4Encrypt } from '@/utils';
import { Modal } from 'ant-design-vue';
import { LINKAGE_SOURCE } from '@/enum';
import stompInit from '@/utils/stomp';
import BScroll from '@/utils/better-scroll';
import SgCamera from '@/components/Monitor/CameraPlayer';
import { SM3 } from 'gm-crypto';

export default {
  name: 'Layout',
  components: {
    SgCamera,
  },
  computed: {
    ...mapState({
      routes: (state) => state.routes,
      password: (state) => state.password,
      avatar: (state) => state.userData.headerImg || require('@/assets/images/icon_avatar.png'),
      authId: (state) => state.userData.authorityId,
      userName: (state) => state.userData.userName,
      nickName: (state) => state.userData.nickName || 'Admin',
    }),
    activeMenu() {
      return [this.$route.path];
    },
    routeMatched() {
      // console.log(this.$route.matched);
      return this.$route.matched || [];
    },
    alarmVisible() {
      return this.authId === '333';
    },
    alarmCount() {
      return this.alarmList.filter((item) => !item.ckecked).length;
    },
    identifyRules() {
      return {
        password: [
          { required: true, message: '请输入用户密码!' },
          {
            trigger: 'change',
            validator: (_, value, callback) => {
              const sm4Pwd = sm4Encrypt(value);
              const sm3Pwd = SM3.digest(sm4Pwd, 'utf8', 'hex');
              if (value !== this.password) {
              //if (sm4Encrypt(value) !== this.password) {
                callback(new Error('请确认用户密码！'));
              } else {
                callback();
              }
            },
          },
        ],
      };
    },
    passwordRules() {
      return {
        password: [
          { required: true, message: '请输入旧密码!' },
          {
            trigger: 'change',
            validator: (_, value, callback) => {
              console.log(this.password);
              console.log(value);
              const sm4Pwd = sm4Encrypt(value);
              const sm3Pwd = SM3.digest(sm4Pwd, 'utf8', 'hex');
              if (value !== this.password) {
              //if (sm4Encrypt(value) !== this.password) {
                callback(new Error('请确认旧密码！'));
              } else {
                callback();
              }
            },
          },
        ],
        newPassword: [{ required: true, message: '请输入新密码!' }],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '告警名称', dataIndex: 'action_name', align: 'center', width: 150 },
        // { title: '告警设备', dataIndex: 'detector_name', align: 'center', width: 150 },
        { title: '告警点位', dataIndex: 'patrolpoint_name', align: 'center', width: 150 },
        { title: '告警时间', dataIndex: 'time', align: 'center', width: 150 },
        { title: '联动类型', dataIndex: 'linkageType', align: 'center', width: 150 },
        {
          title: '音频联动',
          dataIndex: 'sound',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'sound' },
        },
        {
          title: '视频联动',
          dataIndex: 'video',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'video' },
        },
        {
          title: '抓图联动',
          dataIndex: 'snapshot',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'snapshot' },
        },
        { title: '是否确认', dataIndex: 'checkState', align: 'center', width: 100 },
      ];
    },
  },
  data() {
    const $vm = this;
    return {
      drawerVisible: false,
      configForm: {
        alarmInterval: 60,
      },
      identityPwd: '',
      identityModal: false,
      identifyForm: { password: '' },
      passwordModal: false,
      passwordForm: { password: '', newPassword: '' },
      alarmId: '',
      alarmKey: 'image',
      alarmHowl: null,
      alarmPrev: null,
      alarmType: 'linkage',
      alarmModal: false,
      alarmPopup: false,
      alarmTitle: '告警提示信息',
      alarmList: [],
      alarmImages: [],
      // Array(3).fill(require('@/assets/images/img_substation.jpg')),
      alarmVideos: [],
      // Array.from({ length: 3 }, (_, index) => ({
      //   url: '',
      //   did: '100110000000000000',
      //   cno: '100110000003030002',
      //   detector: { id: '100110000000000000', name: `摄像头${index + 1}` },
      //   preset: {
      //     preset_type: 1,
      //     preset_no: 1,
      //     ptz_h: 0,
      //     ptz_v: 0,
      //     ipc_z: 0,
      //   },
      // })),
      alarmChecked: new Map(),
      tableLoad: false,
      tableData: [],
      bscroll: null,
      stompSub: null,
      stompClient: null,
      scrollOptions: { page: 1, size: 10, pullUp: false, pullDown: false, noMore: false },
      imageOptions: {
        observer: true,
        observeParents: true,
        pagination: { el: '.swiper-pagination' },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      },
      videoOptions: {
        observer: true,
        observeParents: true,
        pagination: { el: '.swiper-pagination' },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        on: {
          slideChange: () => {
            const prevPlayer = $vm.$refs[`player-${this.previousIndex}`][0];
            prevPlayer && prevPlayer.pauseVideo();
            const nextPlayer = $vm.$refs[`player-${this.activeIndex}`][0];
            nextPlayer && nextPlayer.playVideo();
          },
        },
      },
    };
  },
  created() {
    if (this.alarmVisible) {
      this.initStompClient();
      this.getAlarmInfoData();
    }
  },
  mounted() {
    this.$bus.$on('identify', () => {
      this.identityModal = true;
    });
  },
  beforeDestroy() {
    this.$bus && this.$bus.$off();
    if (this.bscroll) {
      this.bscroll.destroy();
      this.bscroll = null;
    }
    if (this.alarmHowl) {
      this.alarmHowl.unload();
      this.alarmHowl = null;
    }
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
    async handleLoadMore() {
      this.scrollOptions.pullUp = true;
      await this.getAlarmInfoData();
      this.scrollOptions.pullUp = false;
    },
    handleAlarmInfo(item, action) {
      switch (action) {
        case 'confirm':
          //if (!item.id) return;
          this.$api
            .postHistoryApi('linkageitems', `_update/${item.uuid}?refresh=wait_for`, {
              doc: { status: 1 },
            })
            .then(() => {
              item.status = 1;
              item.checked = true;
              // 确认后添加告警到白名单
              if (item.action_name)
                this.alarmChecked.set(
                  item.action_name,
                  setTimeout(() => {
                    this.alarmChecked.delete(item.action_name);
                  }, this.configForm.alarmInterval * 1000)
                );
              // 确认音频告警后关闭音频
              //if (this.alarmHowl && this.alarmId === item.action_id) {
              if (this.alarmHowl) {
                this.alarmHowl.unload();
                this.alarmHowl = null;
              }
            });
          break;
        case 'check':
          {
            const { video, presets, snapshot, action_name, patrolpoint_name } = item;
            console.log(presets);
            if ((video || snapshot) && presets) {
              let images = [],
                videos = [];
              presets.forEach((item) => {
                if (item.image) {
                  images.push(`data:image/png;base64,${item.image}`);
                }
                if (item.out_code) {
                  const [did, cno] = item.out_code.split('_');
                  const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
                  videos.push({
                    did,
                    cno,
                    url,
                    type: 'camera',
                    preset: _.omit(item, [
                      'image',
                      'detector_id',
                      'detector_name',
                      'detector_address',
                    ]),
                    detector: { id: item.detector_id, name: item.detector_name },
                  });
                }
              });
              this.alarmImages = images;
              this.alarmVideos = videos;
              this.alarmType = 'linkage';
              this.alarmTitle = action_name || patrolpoint_name;
              if (!this.alarmModal) this.alarmModal = true;
            } else {
              this.$message.warn('暂无告警联动信息！');
            }
          }
          break;
        case 'history':
          this.tableLoad = true;
          this.$api
            .postHistoryApi('linkageitems', '_search', {
              query: {
                bool: { must: [{ match: { patrolpoint_id: item.patrolpoint_id } }] },
              },
              sort: [{ time: { order: 'desc' } }],
              track_total_hits: true,
            })
            .then((res) => {
              if (!res || !res.hits.total.value) {
                this.tableData = [];
                return;
              }
              this.tableData = res.hits.hits.map((item, index) => {
                const { _id, _source } = item;
                return {
                  ..._source,
                  id: _id,
                  index: index + 1,
                  linkageType: LINKAGE_SOURCE[_source.linkage_type] || '-',
                  checkState: _source.status ? '已确认' : '未确认',
                };
              });
              this.alarmType = 'history';
              this.alarmTitle = item.patrolpoint_name;
              if (!this.alarmModal) this.alarmModal = true;
            })
            .finally(() => {
              this.tableLoad = false;
            });
          break;
        default:
          break;
      }
    },
    onWebsocketPush() {
      this.$bus.$on('stomp', (msg) => {
        const { action, item } = msg;
        if (action === 'linkageaction_station_result') {
          // 将告警插到列表最前面
          this.alarmList.unshift({ ...item, checked: false });
          this.$nextTick(() => {
            this.$refs.list.scrollTop = 0;
          });
          const {
            sound,
            video,
            presets,
            snapshot,
            action_id,
            action_name,
            routing_key,
            patrolpoint_name,
          } = item;
          // 判断告警是否重复,重复告警仅执行一次联动动作
          if (this.alarmPrev === action_name) return;
          this.alarmPrev = action_name;
          // 判断告警是否在白名单中,确认后指定时间内不再执行联动动作
          if (action_name && this.alarmChecked.has(action_name)) return;
          // 用户身份鉴别,非当前用户不执行联动动作
          if (routing_key && routing_key != this.userName) return;
          // 音频告警且当前未播放声音时播放音频
          if (sound && !this.alarmHowl) {
            this.alarmId = action_id;
            this.alarmHowl = new Howl({
              src: [require('@/assets/audio/alarm.wav')],
              loop: true,
              html5: false,
              preload: true,
              autoplay: true,
              onend: () => {
                this.alarmHowl.unload();
                this.alarmHowl = null;
              },
              onplayerror: () => {
                this.alarmHowl.unload();
                this.alarmHowl = null;
              },
            });
          }
          // 视频和抓图告警时弹窗展示
          if ((video || snapshot) && presets) {
            let images = [],
              videos = [];
            presets.forEach((item) => {
              if (item.image) {
                images.push(`data:image/png;base64,${item.image}`);
              }
              if (item.out_code) {
                const [did, cno] = item.out_code.split('_');
                const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
                videos.push({
                  did,
                  cno,
                  url,
                  type: 'camera',
                  preset: _.omit(item, [
                    'image',
                    'detector_id',
                    'detector_name',
                    'detector_address',
                  ]),
                  detector: { id: item.detector_id, name: item.detector_name },
                });
              }
            });

            if (!this.alarmModal) {
              this.alarmImages = images;
              this.alarmVideos = videos;
              this.alarmType = 'linkage';
              this.alarmTitle = action_name || patrolpoint_name;
              this.alarmModal = true;
            }
          }
        }
      });
    },
    onUserMenuClick({ key }) {
      switch (key) {
        case 'changepwd':
          this.passwordModal = true;
          break;
        case 'logout':
          Modal.confirm({
            centered: true,
            content: '请确认是否退出系统？',
            onOk: () => {
              this.$store.dispatch('userLogout');
            },
          });
          break;
        default:
          break;
      }
    },
    onModalConfirm(action) {
      switch (action) {
        case 'cancel':
          this.$bus.$emit('cancelled');
          break;
        case 'identify':
          this.$refs.identifyForm.validate((valid) => {
            if (valid) {
              this.$message.success('用户身份鉴别成功！');
              this.$bus.$emit('identified');
              this.identityModal = false;
              this.identifyForm = { password: '' };
            } else {
              return false;
            }
          });
          break;
        case 'password':
          this.$refs.passwordForm.validate((valid) => {
            if (valid) {
              this.$store
                .dispatch('changePwd', this.passwordForm)
                .then(() => {
                  this.$message.success('密码修改成功,请重新登陆！');
                  this.$refs.passwordForm.resetFields();
                  this.passwordModal = false;
                  this.passwordForm = { password: '', newPassword: '' };
                  setTimeout(() => {
                    this.$store.dispatch('userLogout');
                  }, 2000);
                })
                .catch((err) => {
                  this.$message.error('密码修改失败！');
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
    onPopoverToggle(visible) {
      if (visible) {
        this.$nextTick(() => {
          if (!this.bscroll) {
            this.initBScroll();
          }
          // const node = this.$refs.list.$el.querySelector('.ant-list-items');
          // if (node && node.lastElementChild) {
          //   node.lastElementChild.scrollIntoView({ behavior: 'auto' });
          // }
        });
      }
    },
    onVideoRadioChange(e) {
      this.$refs.videoSwiper && this.$refs.videoSwiper.goTo(e.target.value);
    },
    onVideoCarouselChange(from, to) {
      console.log(from, to);
    },
    initBScroll() {
      this.bscroll = new BScroll(this.$refs.scroll, {
        click: true,
        bounce: { top: false },
        scrollY: true,
        scrollbar: true,
        observeDOM: true,
        mouseWheel: { dampingFactor: 0.01 },
        pullUpLoad: { threshold: -10 },
        pullDownRefresh: false,
      });
      this.bscroll.on('pullingUp', async () => {
        this.scrollOptions.pullUp = true;
        await this.getAlarmInfoData();
        this.bscroll.finishPullUp();
        this.bscroll.refresh();
        this.scrollOptions.pullUp = false;
      });
      // this.bscroll.on('pullingDown', async () => {
      //   this.scrollOptions.page = 1;
      //   this.scrollOptions.pullDown = true;
      //   await this.getAlarmInfoData();
      //   this.bscroll.finishPullDown();
      //   this.scrollOptions.pullDown = false;
      // });
    },
    initStompClient() {
      stompInit().then((client) => {
        this.stompClient = client;
        this.stompSub = client.subscribe('/exchange/nik_base/patrol', (msg) => {
          if (!msg) return;
          const body = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body;
          this.$bus.$emit('stomp', body);
        });
        this.onWebsocketPush();
      });
    },
    getAlarmInfoData() {
      return new Promise((resolve, reject) => {
        this.$api
          .postHistoryApi('linkageitems', '_search', {
            from: this.scrollOptions.size * (this.scrollOptions.page - 1),
            size: this.scrollOptions.size,
            sort: [{ time: { order: 'desc' } }],
            track_total_hits: true,
          })
          .then((res) => {
            if (!res || !res.hits.hits || !res.hits.hits.length) {
              this.scrollOptions.noMore = true;
              return resolve();
            }
            const data = res.hits.hits;
            if (data.length < this.scrollOptions.size) {
              this.scrollOptions.noMore = true;
            }
            const dataList = data.map((item) => {
              const { _id, _source } = item;
              return { ..._source, id: _id, checked: _source.status === 1 };
            });
            if (this.scrollOptions.page === 1) {
              this.alarmList = dataList;
            } else {
              this.alarmList = [...this.alarmList, ...dataList];
            }
            this.scrollOptions.page++;
            resolve();
          })
          .catch((err) => reject(err));
      });
    },
  },
};
</script>

<style lang="less">
#layout {
  position: relative;
  width: 100%;
  height: 100%;

  .header {
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    width: 100%;
    height: 6vh;
    padding: 0 20px;
    background-color: @theme-color1;

    &-left {
      display: inline-flex;
      align-items: center;
      height: 100%;

      img {
        width: 120px;
        // height: 100%;
      }
      span {
        margin-left: 20px;
        color: #fff;
        font-size: 24px;
        font-weight: bold;
      }
    }
    &-right {
      display: inline-flex;
      align-items: center;
      height: 100%;
    }
    &-user {
      display: inline-flex;
      align-items: center;
      height: 100%;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;

      .anticon {
        font-size: 20px;
        margin-right: 5px;
      }
      &__avatar {
        margin-right: 10px;
      }
      &__name {
        max-width: 100px;
        line-height: normal;
        .text-ellipsis();
      }
    }
    .ant-menu {
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      border-bottom: none;
      background-color: transparent;

      &-item {
        border-bottom: none;

        > a {
          color: #fff;
        }
        &:hover,
        &-active,
        &-selected {
          font-weight: 600;

          > a {
            color: @theme-color3;
          }
        }
      }
      &-submenu {
        border-bottom: none;

        &:hover,
        &-active,
        &-selected,
        &-title:hover {
          color: @theme-color3;
          font-weight: 600;
        }
      }
    }
    .ant-divider {
      height: 20px;
      margin: 0 20px;
    }
  }
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 10vh 10px 1vh;
    background-color: #eee;

    &-header {
      z-index: 90;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: absolute;
      top: 6vh;
      left: 20px;
      right: 20px;
      height: 4vh;
    }
    &-view {
      width: 100%;
      height: 100%;
    }
  }
}
#alarm {
  z-index: 100;
  display: block;
  position: fixed;
  right: 20px;
  bottom: 50px;
}
</style>
