export default {
  watch: {
    tableReset(bool) {
      if (bool) this.pagination.current = 1;
    },
  },
  data() {
    return {
      keyword: '',
      treeData: [],
      checkedKeys: [],
      expandKeys: [],
      expandedKeys: [],
      expandParent: true,
      tableReset: false,
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
                  isLeaf: true,
                  checkable: true,
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
