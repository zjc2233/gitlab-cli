// lib/http.js
const config = require("./config");

// 通过 axios 处理请求
const axios = require('axios')

axios.interceptors.response.use(res => {
  return res.data;
})


/**
 * 获取个人giteetoken
 * @returns Promise
 */
async function getOauthToken(data) {
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
  data={
    ...data,
    grant_type: 'password',
    scope: 'user_info',
    client_id: 'bdace29e731fedc8b3b2824e7ee42c4752fe8a854dff6e7f4110a48f557e18cb',
    client_secret: 'e16e026ea8d6b55876d3ddc09f1d89c190a06fc9508089319af66109aa55ccad',
  }
  console.log(data);
  return axios.post('https://gitee.com/oauth/token',data,{
    // headers:{
    //   'Content-Type':'application/x-www-form-urlencoded'
    // }
  })
}

/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList(data) {
  // return axios.get('https://api.github.com/orgs/zjc-cli/repos')
  return axios.get(config.cloneUrl,{
    method: 'get',
    headers: {
      'PRIVATE-TOKEN': config.PRIVATETOKEN
    }
  })
}

/**
 * 获取版本信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function  getTagList(data) {
  console.log(123,data);
  // return axios.get(`https://api.github.com/repos/zjc-cli/${repo}/tags`)
  return axios.get(`https://gitee.com/api/v5/repos/zjc-cli/${data.repo}/tags?access_token=${data.token}`)
}

module.exports = {
  getRepoList,
  getTagList,
  getOauthToken
}
