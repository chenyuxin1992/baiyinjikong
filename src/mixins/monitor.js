import _ from 'lodash';
import { DisplayMode, ROBOT_TYPE } from '@/enum';
import store from '@/store'

export default {
  data() {
    return {
      keyword: '',
      treeRadio: 'device',
      treeTier: 0,
      treeData: [],
      treeLoaded: [],
      loadedKeys: [],
      checkedKeys: [],
      expandKeys: [],
      expandedKeys: [],
      expandParent: true,
    };
  },
  created() {
    this.getTreeData();
  },
  methods: {
    onTreeSearch(val) {
      if (!val) {
        this.expandedKeys = [];
        return;
      }
      this.expandKeys = [];
      this.expandParent = true;
      this.expandTreeNode(this.treeData, val);
      this.expandedKeys = [...this.expandKeys];
    },
    onTreeLoad(keys, { node }) {
      this.loadedKeys = keys;
      const { children } = node.dataRef;
      if (children && children.length > 0) {
        this.treeLoaded = [...this.treeLoaded, ...children];
      }
    },
    onTreeCheck(keys, { node, checked }) {
      const { dataRef } = node;
      console.log('check: ', dataRef);
      if (checked) {
        let monitor;
        switch (this.treeRadio) {
          case 'device':
            {
              // 设备模式下数据源为preset
              const { id, detector } = dataRef;
              console.log(detector);
              if (!detector) return this.$message.warn('该预置位暂未绑定监控设备！');
              // 根据显示模式进行操作
              if (this.displayMode === DisplayMode.SINGLE) {
                this.checkedKeys = [id];
              } else {
                if (this.monitorList.length >= this.displayMode) {
                  return this.$message.warn('已达到当前可播放数量上限！');
                } else {
                  this.checkedKeys.push(id);
                }
              }
              // 根据探测器类型添加监控
              if (ROBOT_TYPE[detector.dec_type]) {
                monitor = {
                  id,
                  detector,
                  type: 'robot',
                  lightUrl: detector.video_address1,
                  infraredUrl: detector.video_address2,
                };
                if (this.displayMode === DisplayMode.SINGLE) {
                  this.monitorList = [monitor];
                } else if (this.monitorList.length < this.displayMode) {
                  this.monitorList.push(monitor);
                }
              } else {
                if (!detector.out_code) return this.$message.warn('暂无监控视频流数据！');
                const [did, cno] = detector.out_code.split('_');
                const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
                monitor = {
                  id,
                  did,
                  cno,
                  url,
                  detector,
                  type: 'camera',
                  preset: _.omitBy(dataRef, _.isObject),
                };
                if (this.displayMode === DisplayMode.SINGLE) {
                  this.monitorList = [monitor];
                } else if (this.monitorList.length < this.displayMode) {
                  this.monitorList.push(monitor);
                }
              }
            }
            break;
          case 'area':
            {
              // 防区模式下数据源为detector
              const { id, dec_type, out_code, video_address1, video_address2 } = dataRef;
              // 根据显示模式进行操作
              if (this.displayMode === DisplayMode.SINGLE) {
                this.checkedKeys = [id];
              } else {
                if (this.monitorList.length >= this.displayMode) {
                  return this.$message.warn('已达到当前可播放数量上限！');
                } else {
                  this.checkedKeys.push(id);
                }
              }
              // 根据探测器类型添加监控
              if (ROBOT_TYPE[dec_type]) {
                monitor = {
                  id,
                  type: 'robot',
                  lightUrl: video_address1,
                  infraredUrl: video_address2,
                  detector: _.omitBy(dataRef, _.isObject),
                };
              } else {
                if (!out_code) return this.$message.warn('暂无监控视频流数据！');
                const [did, cno] = out_code.split('_');
                const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
                monitor = {
                  id,
                  did,
                  cno,
                  url,
                  preset: null,
                  type: 'camera',
                  detector: _.omitBy(dataRef, _.isObject),
                };
              }
              if (this.displayMode === DisplayMode.SINGLE) {
                this.monitorList = [monitor];
              } else if (this.monitorList.length < this.displayMode) {
                this.monitorList.push(monitor);
              }
            }
            break;
          case 'patrol':
            {
              // 轮询模式下数据源为detector
              const { id, dec_type, out_code, video_address1, video_address2 } = dataRef;
              this.checkedKeys.push(id);
              // 根据探测器类型添加监控
              if (ROBOT_TYPE[dec_type]) {
                monitor = {
                  id,
                  type: 'robot',
                  lightUrl: video_address1,
                  infraredUrl: video_address2,
                  detector: _.omitBy(dataRef, _.isObject),
                };
              } else {
                if (!out_code) return this.$message.warn('暂无监控视频流数据！');
                const [did, cno] = out_code.split('_');
                const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
                monitor = {
                  id,
                  did,
                  cno,
                  url,
                  preset: null,
                  type: 'camera',
                  detector: _.omitBy(dataRef, _.isObject),
                };
              }
              if (this.monitorList.length === 0) {
                this.monitorList.push(monitor);
              }
              // 添加探测器到列表进行轮播
              this.detectorList.push(monitor);
            }
            break;
          default:
            // this.$api
            //   .getBaseApi('detector', { area: dataRef.id, dec_type__in: '0,2' })
            //   .then((res) => {
            //     if (!res || !res.results) return;
            //     const monitors = res.results.map((item) => {
            //       const { id, out_code } = item;
            //       const [did, cno] = out_code.split('_');
            //       const url = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
            //       return {
            //         id,
            //         did,
            //         cno,
            //         url,
            //         preset: null,
            //         type: 'camera',
            //         detector: _.omitBy(item, _.isObject),
            //       };
            //     });
            //     this.monitorList.push(monitors);
            //   });
            break;
        }
      } else {
        const checkedIndex = this.checkedKeys.findIndex((key) => key === dataRef.key);
        if (checkedIndex > -1) this.checkedKeys.splice(checkedIndex, 1);
        const monitorIndex = this.monitorList.findIndex((item) => item.id === dataRef.key);
        if (monitorIndex > -1) this.monitorList.splice(monitorIndex, 1);
        if (this.treeRadio === 'patrol') {
          const detectorIndex = this.detectorList.findIndex((item) => item.id === dataRef.key);
          if (detectorIndex > -1) this.detectorList.splice(detectorIndex, 1);
        }
      }
    },
    onTreeSelect(_, { node }) {
      console.log('select: ', node.dataRef);
    },
    onTreeExpand(keys, { node, expanded }) {
      const { dataRef } = node;
      this.expandParent = false;
      // 同时只允许展开单个一级树节点
      if (expanded && dataRef.tier === 0) {
        this.expandedKeys = [dataRef.key];
      } else {
        this.expandedKeys = keys;
      }
    },
    loadTreeData(node) {
      const { dataRef } = node;
      console.log(dataRef, dataRef.tier);
      return new Promise((resolve) => {
        if (dataRef.children) return resolve();
        switch (dataRef.tier) {
          case 0:
            this.$api
              .getBaseApi('maintenanceteam', { maintenanceunit: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 1, // 树节点层级
                  key: item.id,
                  checkable: false,
                }));
                this.treeData = [...this.treeData];
              })
              .finally(() => resolve());
            break;
          case 1:
            this.$api
              .getBaseApi('substation', { maintenanceteam: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 2, // 树节点层级
                  key: item.id,
                  checkable: false,
                }));
                if (store.state.userData.userName === "client1") {
                  //console.log(store.state.userData.userName)
                  dataRef.children = dataRef.children.filter((_,index) => {
                    console.log(index%2)
                    return index%2 == 0
                  })
                } 
                if (store.state.userData.userName === "client2") {
                  //console.log(store.state.userData.userName)
                  dataRef.children = dataRef.children.filter((_,index) => {
                    console.log(index%2)
                    return index%2 == 1
                  })
                }  
                this.treeData = [...this.treeData];
              })
              .finally(() => resolve());
            break;
          case 2:
            if (this.treeRadio === 'device') {
              if (this.deviceTree === 1) {
                // 设备部件
                this.$api
                  .getBaseApi('area_depth', {
                    substation: dataRef.id,
                    parent__isnull: true,
                  })
                  .then((res) => {
                    if (!res || !res.results) return resolve();
                    dataRef.children = res.results.map((item) => ({
                      ...item,
                      tier: 3, // 树节点层级
                      key: item.id,
                      checkable: false,
                    }));
                    this.treeData = [...this.treeData];
                  })
                  .finally(() => resolve());
              } else {
                // 摄像机
                this.$api
                  .getBaseApi('detector', { substation: dataRef.id, dec_type__in: '10' })
                  .then((res) => {
                    if (!res || !res.results) return resolve();
                    dataRef.children = res.results.map((item) => ({
                      ...item,
                      tier: 3, // 树节点层级
                      key: item.id,
                      focused: false,
                      checkable: false,
                      disabled: item.status !== 1,
                      class: `sg-state__detector-${item.status}`,
                      slots: { icon: 'camera' },
                      scopedSlots: { title: 'title' },
                    }));
                    this.treeData = [...this.treeData];
                  })
                  .finally(() => resolve());
              }
            } else {
              // 间隔+探测器              
              Promise.all([
                this.$api.getBaseApi('detector', {
                  substation: dataRef.id,
                  dec_type__in: '1,2,3'
                }),
                this.$api.getBaseApi('detector', {
                  substation: dataRef.id,
                  //ordering: 'name',
                  dec_type__in: '10'
                }),
              ])
                .then(([res1, res2]) => {
                  const arr1 = res1.results.map((item) => ({
                    ...item,
                    tier: 3, // 树节点层级
                    key: item.id,
                    isLeaf: true,
                    focused: false,
                    checkable: true,
                    disabled: item.status == 0,
                    class: `sg-state__detector-${item.status}`,
                    slots: { icon: ROBOT_TYPE[item.dec_type] ? 'robot' : 'camera' },
                    scopedSlots: { title: 'title' },
                  }));
                  const arr2 = res2.results.map((item) => ({
                    ...item,
                    tier: 3, // 树节点层级
                    key: item.id,
                    isLeaf: true,
                    focused: false,
                    checkable: true,
                    disabled: item.status !== 1,
                    class: `sg-state__detector-${item.status}`,
                    slots: { icon: ROBOT_TYPE[item.dec_type] ? 'robot' : 'camera' },
                    scopedSlots: { title: 'title' },
                  }));
                  dataRef.children = [...arr1, ...arr2];
                  this.treeData = [...this.treeData];
                })
                .finally(() => resolve());
            }
            break;
          case 3:
            if (this.treeRadio === 'device') {
              if (this.deviceTree === 1) {
                // 设备部件
                this.$api
                  .getBaseApi('area_depth', {
                    parent: dataRef.id
                  })
                  .then((res) => {
                    if (!res || !res.results) return resolve();
                    dataRef.children = res.results.map((item) => ({
                      ...item,
                      tier: 4, // 树节点层级
                      key: item.id,
                      checkable: false,
                    }));
                    this.treeData = [...this.treeData];
                  })
                  .finally(() => resolve());
              } else {
                // 预置位
                this.$api
                  .getBaseApi('preset_depth', { detector: dataRef.id })
                  .then((res) => {
                    if (!res || !res.results) return resolve();
                    dataRef.children = res.results.map((item) => {
                      const { detector } = item;
                      return {
                        ...item,
                        tier: 4, // 树节点层级
                        key: item.id,
                        isLeaf: true,
                        checkable: true,
                        slots: { icon: 'preset' },
                      };
                    });
                    this.treeData = [...this.treeData];
                  })
                  .finally(() => resolve());
              }
            } 
            break;
          case 4:
            if (this.treeRadio === 'device') {
              if (this.deviceTree === 1) {
                // 巡视点位
                this.$api
                  .getBaseApi('device_depth', {
                    area: dataRef.id,
                    fields: 'id,name,dec_type,detector,device,preset',
                  })
                  .then((res) => {
                    if (!res || !res.results) return resolve();
                    dataRef.children = res.results.map((item) => ({
                      ...item,
                      tier: 5, // 树节点层级
                      key: item.id,
                      focused: false,
                      checkable: false,
                      slots: {
                        icon: item.detector
                          ? ROBOT_TYPE[item.detector]
                            ? 'robot'
                            : item.detector.dec_type === 0 || item.detector.dec_type === 2
                            ? 'camera'
                            : 'videorobot'
                          : 'none',
                      },
                      scopedSlots: { title: 'title' },
                    }));
                    this.treeData = [...this.treeData];
                  })
                  .finally(() => resolve());
              }              
            }
            break;
          case 5:
            if(this.treeRadio === 'device'){
              if (this.deviceTree === 1) {
                // 巡视点位
                this.$api
                  .getBaseApi('patrolpoint_depth', {
                    device: dataRef.id,
                    fields: 'id,name,dec_type,detector,device,preset',
                  })
                  .then((res) => {
                    if (!res || !res.results) return resolve();
                    dataRef.children = res.results.map((item) => ({
                      ...item,
                      tier: 6, // 树节点层级
                      key: item.id,
                      focused: false,
                      checkable: false,
                      slots: {
                        icon: item.detector
                          ? ROBOT_TYPE[item.detector]
                            ? 'robot'
                            : item.detector.dec_type === 0 || item.detector.dec_type === 2
                            ? 'camera'
                            : 'videorobot'
                          : 'none',
                      },
                      scopedSlots: { title: 'title' },
                    }));
                    this.treeData = [...this.treeData];
                  })
                  .finally(() => resolve());
              }              
            }
            break;
            case 6:
              if(this.treeRadio === 'device'){
                if (this.deviceTree === 1) {
                  // 预置位
                  this.$api
                    .getBaseApi('preset_depth', { patrolpoint: dataRef.id })
                    .then((res) => {
                      if (!res || !res.results) return resolve();
                      dataRef.children = res.results.map((item) => {
                        const { detector } = item;
                        return {
                          ...item,
                          tier: 7, // 树节点层级
                          key: item.id,
                          isLeaf: true,
                          checkable: true,
                          slots: { icon: 'preset' },
                        };
                      });
                      this.treeData = [...this.treeData];
                    })
                    .finally(() => resolve());
                }
              }
              break;
              
          default:
            return resolve();
        }
        // 保存当前树展开最大层级
        if (this.treeTier === dataRef.tier) {
          this.treeTier = dataRef.tier + 1;
        }
      });
    },
    expandTreeNode(tree, text) {
      if (tree.length === 0) return;
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (!node.children) continue;
        this.expandTreeNode(node.children, text);
        if (node.children.some((item) => item.name.indexOf(text) > -1)) {
          this.expandKeys.push(node.key);
          continue;
        }
      }
    },
    filterTreeNode(node) {
      if (!this.keyword) return;
      // return this.filterTreeNodes(node);
      return node.dataRef.name.indexOf(this.keyword) > -1;
    },
    filterTreeNodes(nodes, filter) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!filter || filter(node)) {
          node.style = '';
        } else {
          node.style = 'display: none';
        }
        if (node.children && node.children.length > 0) {
          // node.children = node.children.filter(filter);
          this.filterTreeNodes(node.children, filter);
        }
      }
      return nodes;
    },
    getTreeData() {
      this.$api.getBaseApi('maintenanceunit').then((res) => {
        if (!res || !res.results) return;
        this.treeData = res.results.map((item) => ({
          ...item,
          tier: 0, // 树节点层级
          key: item.id,
          checkable: false,
        }));
      });
    },
  },
};
