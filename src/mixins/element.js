import { ROBOT_TYPE } from '@/enum';

export default {
  data() {
    return {
      keyword: '',
      treeNode: null,
      treeResolve: null,
      treeRadio: 'device',
      treeData: [],
      treeProps: {
        label: 'name',
        children: 'children',
        isLeaf: (data) => data.isLeaf,
      },
    };
  },
  methods: {
    onNodeCheck(data, res) {
      console.log('nodecheck: ', data, res);
    },
    onNodeClick(data, node) {
      console.log('nodeclick: ', data, node);
    },
    onNodeCheckChange(data, checked) {
      console.log('nodecheckchange: ', data, checked);
      if (checked) {
        this.$refs.tree.setCheckedKeys([data.id]);
        const { id, out_code, video_address1 } = data;
        this.checkedKeys = [id];
        if (out_code.includes('_')) {
          this.videoUrl = `wss://${location.hostname}:8443/${video_address1}`;
          const [did, cno] = out_code.split('_');
          this.deviceId = did;
          this.channelNo = cno;
          this.getVideoList();
        } else {
          this.videoUrl = video_address1;
        }
      }
    },
    onNodeCurrentChange(data, node) {
      console.log('nodecurrentchange: ', data, node);
    },
    onTreeSearch(val) {
      // const val = e.target.value;
      this.$refs.tree.filter(val);
    },
    loadTreeData(node, resolve) {
      console.log(node);
      const { data, level } = node;
      switch (level) {
        case 0:
          this.treeNode = node;
          this.treeResolve = resolve;
          this.$api.getBaseApi('maintenanceunit').then((res) => {
            if (!res || !res.results) return resolve([]);
            const data = res.results.map((item) => ({
              ...item,
              isLeaf: false,
              checkable: false,
            }));
            return resolve(data);
          });
          break;
        case 1:
          this.$api
            .getBaseApi('maintenanceteam', { maintenanceunit: data.id })
            .then((res) => {
              if (!res || !res.results) return resolve([]);
              const data = res.results.map((item) => ({
                ...item,
                isLeaf: false,
                checkable: false,
              }));
              resolve(data);
            })
            .catch(() => resolve([]));
          break;
        case 2:
          this.$api
            .getBaseApi('substation', { maintenanceteam: data.id })
            .then((res) => {
              if (!res || !res.results) return resolve([]);
              const data = res.results.map((item) => ({
                ...item,
                isLeaf: false,
                checkable: false,
              }));
              resolve(data);
            })
            .catch(() => resolve([]));
          break;
        case 3:
          if (this.treeRadio === 'device') {
            if (this.deviceTree === 1) {
              // 设备部件
              this.$api
                .getBaseApi('device', { substation: data.id })
                .then((res) => {
                  if (!res || !res.results) return resolve([]);
                  const data = res.results.map((item) => ({
                    ...item,
                    isLeaf: false,
                    checkable: false,
                  }));
                  resolve(data);
                })
                .catch(() => resolve([]));
            } else {
              // 摄像机
              this.$api
                .getBaseApi('detector', { substation: data.id, dec_type__in: '0,2' })
                .then((res) => {
                  if (!res || !res.results) return resolve([]);
                  const data = res.results.map((item) => ({
                    ...item,
                    isLeaf: false,
                    checkable: false,
                    disabled: item.status !== 1,
                    class: `sg-state__detector-${item.status}`,
                    slots: { icon: 'camera' },
                  }));
                  resolve(data);
                })
                .catch(() => resolve([]));
            }
          } else {
            // 间隔+探测器
            Promise.all([
              this.$api.getBaseApi('area_depth', {
                substation: data.id,
                parent__isnull: true,
              }),
              this.$api.getBaseApi('detector', {
                substation: data.id,
                area__isnull: true,
              }),
            ])
              .then(([res1, res2]) => {
                const arr1 = res1.results.map((item) => ({
                  ...item,
                  isLeaf: false,
                  checkable: false,
                }));
                const arr2 = res2.results.map((item) => ({
                  ...item,
                  isLeaf: true,
                  checkable: true,
                  disabled: item.status !== 1,
                  class: `sg-state__detector-${item.status}`,
                  slots: { icon: ROBOT_TYPE[item.dec_type] ? 'robot' : 'camera' },
                }));
                resolve([...arr1, ...arr2]);
              })
              .catch(() => resolve([]));
          }
          break;
        case 4:
          if (this.treeRadio === 'device') {
            if (this.deviceTree === 1) {
              // 巡视点位
              this.$api
                .getBaseApi('patrolpoint_depth', {
                  device: data.id,
                  fields: 'id,name,dec_type,detector,device,preset',
                })
                .then((res) => {
                  if (!res || !res.results) return resolve([]);
                  const data = res.results.map((item) => ({
                    ...item,
                    isLeaf: false,
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
                  }));
                  resolve(data);
                })
                .catch(() => resolve([]));
            } else {
              // 预置位
              this.$api
                .getBaseApi('preset_depth', { detector: data.id })
                .then((res) => {
                  if (!res || !res.results) return resolve([]);
                  const data = res.results.map((item) => {
                    const { detector } = item;
                    return {
                      ...item,
                      isLeaf: true,
                      checkable: true,
                      slots: { icon: 'preset' },
                    };
                  });
                  resolve(data);
                })
                .catch(() => resolve([]));
            }
          } else {
            // 设备+探测器
            Promise.all([
              this.$api.getBaseApi('area_depth', { parent: data.id }),
              this.$api.getBaseApi('detector', { area: data.id }),
            ])
              .then(([res1, res2]) => {
                const arr1 = res1.results.map((item) => ({
                  ...item,
                  isLeaf: false,
                  checkable: false,
                }));
                const arr2 = res2.results.map((item) => ({
                  ...item,
                  isLeaf: true,
                  checkable: true,
                  disabled: item.status !== 1,
                  class: `sg-state__detector-${item.status}`,
                  slots: { icon: ROBOT_TYPE[item.dec_type] ? 'robot' : 'camera' },
                }));
                resolve([...arr1, ...arr2]);
              })
              .catch(() => resolve([]));
          }
          break;
        case 5:
          if (this.treeRadio === 'device') {
            if (this.deviceTree === 1) {
              // 预置位
              this.$api
                .getBaseApi('preset_depth', { patrolpoint: data.id })
                .then((res) => {
                  if (!res || !res.results) return resolve([]);
                  const data = res.results.map((item) => {
                    const { detector } = item;
                    return {
                      ...item,
                      isLeaf: true,
                      checkable: true,
                      slots: { icon: 'preset' },
                    };
                  });
                  resolve(data);
                })
                .catch(() => resolve([]));
            }
          } else {
            // 探测器
            this.$api
              .getBaseApi('detector', { area: data.id })
              .then((res) => {
                if (!res || !res.results) return resolve([]);
                const data = res.results.map((item) => ({
                  ...item,
                  isLeaf: true,
                  checkable: true,
                  disabled: item.status !== 1,
                  class: `sg-state__detector-${item.status}`,
                  slots: { icon: ROBOT_TYPE[item.dec_type] ? 'robot' : 'camera' },
                }));
                resolve(data);
              })
              .catch(() => resolve([]));
          }
          break;
        default:
          return resolve([]);
      }
    },
    filterTreeNode(val, data) {
      if (!val) return true;
      return data.name.indexOf(val) > -1;
    },
  },
};
