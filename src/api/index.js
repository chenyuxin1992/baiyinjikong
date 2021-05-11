import axios from './axios';

// 验证码 /base_cas/captcha
// 用户登录 /base_cas/login
// 用户列表 /user/getUserList
// 用户角色 /user/setUserAuthority
// 修改密码 /user/changePassword
// 更新权限 /casbin/updateCasbin
// 权限列表 /casbin/getPolicyPathByAuthorityId
// 角色列表 /authority/getAuthorityList
const postUserApi = (url, data) => axios.post(`/authority/api${url}`, data);

// 基础数据ROOT
const getRootApi = (action, params = {}) => axios.get(`/base/${action}/`, { params });
// 基础数据
const getBaseApi = (action, params = {}) =>
  axios.get(`/base/modelquery/`, { params: { __: action, ...params } });
// 基础数据排序
const getBaseOrding = (action, ordering, params = {}) =>
  axios.get(`/base/modelquery/`, { params: { __: action,ordering: ordering, ...params } });  
// 本地联动配置查询
const getlocalApi = (params = {}) => axios.get(`/base/linkageaction/`, { params: { ...params } });
// 本地联动配置新增
const postLocalConfig = (params = {}) => axios.post(`/base/linkageaction/`, params);
// 本地联动配置修改
const putLocalConfig = (params) =>
  axios.put(`/base/linkageaction/` + params.id + '/', { ...params });
//远程联动配置新增
const postBaseApi = (action, data = {}, config = {}) =>
  axios.post(`/base/modelquery/`, { __: action, ...data }, config);
const getStatusApi = () => axios.get(`/status`);

// 任务数据
const getTaskApi = (action, params = {}) =>
  axios.get(`/base/task/`, { params: { __: action, ...params } });
const postTaskApi = (action, data = {}, config = {}) =>
  axios.post(`/base/task/`, { __: action, ...data }, config);
// 视频数据
const getMediaApi = (action, params = {}) => axios.get(`/media/index/api/${action}`, { params });
// 设备数据
const postDeviceApi = (data, config = {}) => axios.post(`/base/device/`, data, config);
// 机器人控制
const postRobotApi = (data, config = {}) => axios.post(`/base/robotcontrol`, data, config);
// 指纹控制API(控制类型:2000=指纹录入,2001=指纹识别)
const postFingerApi = (data, config = {}) => axios.post(`/base/fingleprint/`, data, config);
// 巡视主机控制
const postControlApi = (data, config = {}) => axios.post(`/base/stationcontrol/`, data, config);

// 历史记录查询
const getHistoryApi = (table, action, params = {}) =>
  axios.get(`/his/${table}/${action}`, { params });
const postHistoryApi = (table, action, data = {}, config = {}) =>
  axios.post(`/his/${table}/${action}`, data, config);

// 主辅设备信息
const postDeviceInfo = (data, token, config = {}) =>
  axios.post(`/centralize/v1/deviceinfo`, data, {
    ...config,
    headers: { token, 'Content--Type': 'application/json;charset=UTF-8' },
  });
// 缺陷记录维护查询
const postDefectRecord = (action, data, config = {}) => {
  axios.post(`/midplatform/jobmanage-center/defect/record/${action}`, data, {
    ...config,
    headers: { 'Content--Type': 'application/json;charset=UTF-8' },
  });
};
// 变电专业资源查询
const postCommonQuery = (data, config = {}) => {
  axios.post(`/midplatform/psr-center/psrTFService/commonQuery`, data, {
    ...config,
    headers: { 'Content--Type': 'application/json;charset=UTF-8' },
  });
};
// 标准数据代码查询
const postCommonCode = (data, config = {}) => {
  axios.post(`/midplatform/psr-criterion-manage/commonCode/getCommonCodeByTypeCode`, data, {
    ...config,
    headers: { 'Content--Type': 'application/json;charset=UTF-8' },
  });
};
// 按设备类型数据字典查询
const postModelSemantics = (data, config = {}) => {
  axios.post(`/midplatform/psr-criterion-manage/criterion/model/getModelSemantics`, data, {
    ...config,
    headers: { 'Content--Type': 'application/json;charset=UTF-8' },
  });
};

export {
  putLocalConfig, //修改本地联动
  postLocalConfig, //新增本地联动
  getlocalApi, // 查询本地联动
  postUserApi,
  getRootApi,
  getBaseApi,
  getBaseOrding,
  postBaseApi,
  getTaskApi,
  postTaskApi,
  getMediaApi,
  postDeviceApi,
  postRobotApi,
  postFingerApi,
  postControlApi,
  getHistoryApi,
  postHistoryApi,
  postDeviceInfo,
  postDefectRecord,
  postCommonQuery,
  postCommonCode,
  postModelSemantics,
  getStatusApi,
};
