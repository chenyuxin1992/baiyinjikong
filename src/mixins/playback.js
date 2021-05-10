// import { ROBOT_TYPE } from '@/enum';

export default {
  data() {
    return {
      keyword: '',
      treeData: [],
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
    onTreeCheck(_, { node, checked }) {
      const { dataRef } = node;
      console.log('check: ', dataRef);
      if (checked) {
        const { id, out_code } = dataRef;
        if (!out_code) return this.$message.warn('暂无监控视频流数据！');
        this.checkedKeys = [id];
        if (out_code.includes('_')) {
          const [did, cno] = out_code.split('_');
          this.deviceId = did;
          this.channelNo = cno;
          this.videoUrl = `wss://${location.hostname}:8443/media/${did}/${cno}.flv`;
          // this.getVideoStreamList();
        }
      } else {
        this.checkedKeys = [];
        this.streamId = '';
        this.deviceId = '';
        this.channelNo = '';
        this.videoUrl = '';
        this.videoPlay = false;
        this.videoStreamIndex = 0;
        this.videoStreamList = [];
      }
    },
    onTreeSelect(keys, { node }) {
      const { dataRef } = node;
      console.log('select: ', dataRef);
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
                this.treeData = [...this.treeData];
              })
              .finally(() => resolve());
            break;
          case 2:
            Promise.all([
              this.$api.getBaseApi('area_depth', { substation: dataRef.id, parent__isnull: true }),
              this.$api.getBaseApi('detector', {
                substation: dataRef.id,
                area__isnull: true,
                //dec_type__in: '0,2',
              }),
            ])
              .then(([res1, res2]) => {
                const arr1 = res1.results.map((item) => ({
                  ...item,
                  tier: 3, // 树节点层级
                  key: item.id,
                  checkable: false,
                }));
                const arr2 = res2.results.map((item) => ({
                  ...item,
                  tier: 3, // 树节点层级
                  key: item.id,
                  isLeaf: true,
                  checkable: true,
                  slots: { icon: 'camera' },
                }));
                dataRef.children = [...arr1, ...arr2];
                this.treeData = [...this.treeData];
              })
              .finally(() => resolve());
            break;
          case 3:
            Promise.all([
              this.$api.getBaseApi('area_depth', { parent: dataRef.id }),
              this.$api.getBaseApi('detector', { area: dataRef.id }),
            ])
              .then(([res1, res2]) => {
                const arr1 = res1.results.map((item) => ({
                  ...item,
                  tier: 4, // 树节点层级
                  key: item.id,
                  checkable: false,
                }));
                const arr2 = res2.results.map((item) => ({
                  ...item,
                  tier: 4, // 树节点层级
                  key: item.id,
                  isLeaf: true,
                  checkable: true,
                  slots: { icon: 'camera' },
                }));
                dataRef.children = [...arr1, ...arr2];
                this.treeData = [...this.treeData];
              })
              .finally(() => resolve());
            break;
          case 4:
            this.$api
              .getBaseApi('detector', { area: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 5, // 树节点层级
                  key: item.id,
                  isLeaf: true,
                  checkable: true,
                  slots: { icon: 'camera' },
                }));
                this.treeData = [...this.treeData];
              })
              .finally(() => resolve());
            break;
          default:
            return resolve();
        }
      });
    },
    expandTreeNode(tree, text) {
      if (tree.length === 0) return;
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
          this.expandTreeNode(node.children, text);
          if (node.children.some((item) => item.name.indexOf(text) > -1)) {
            this.expandKeys.push(node.key);
            continue;
          }
        } else {
          continue;
        }
      }
    },
    filterTreeNode(node) {
      if (!this.keyword) return;
      // return this.filterTreeNodes(node);
      return node.dataRef.name.indexOf(this.keyword) > -1;
    },
    filterTreeNodes(node) {
      const title = node.dataRef ? node.dataRef.name : node.name;
      const children = node.dataRef ? node.dataRef.children : node.children;
      if (title && title.indexOf(this.keyword) > -1) {
        return true;
      } else if (children) {
        return children.some(this.filterTreeNodes);
      } else {
        return false;
      }
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
