const { getRepoList, getTagList, getOauthToken  } = require('./https')
const ora = require('ora')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs');
const chalk = require('chalk');

const util = require('util')
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
const download = require('download');
const clone = require('git-clone');
const config = require("./config");

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result; 
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('Request failed, refetch ...')
  } 
}

class Generator {
  constructor (name, targetDir){
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取gitee的token
  async getToken() {
      // 用户输入gitee邮箱和密码获取gitee的token
      const { username } = await inquirer.prompt([
        {
          type: 'input', //type： input, number, confirm, list, checkbox ... 
          name: 'username', // key 名
          message: 'Your Gitee email', // 提示信息
          default: '' // 默认值
        }
      ])

      // 用户输入gitee邮箱和密码获取gitee的token
      const { password } = await inquirer.prompt([
        {
          type: 'input', //type： input, number, confirm, list, checkbox ... 
          name: 'password', // key 名
          message: 'Your Gitee password', // 提示信息
          default: '' // 默认值
        }
      ])
      const data = await wrapLoading(getOauthToken,'waiting fetch template', {username ,password});
      return data.access_token
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称

  async getRepo(token) {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, 'waiting fetch template',{token});
    console.log('repoList', repoList);
    if (!repoList) return;

    // 过滤我们需要的模板名称
    const repos = repoList.map(item => item.path);

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'Please choose a template to create project'
    })

    // 3）return 用户选择的名称
    return repo;
  }

   // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）用户选择自己需要下载的 tag
  // 3）return 用户选择的 tag

  async getTag(repo,token) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, 'waiting fetch tag', {repo, token});
    if (!tags) return;
    
    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: 'Place choose a tag to create project'
    })

    // 3）return 用户选择的 tag
    return tag
  }



  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, tag){

    // 1）拼接下载地址
    const requestUrl = `http://192.168.80.246:3000/project-template/${repo}.git`;
    
    // 2）调用下载方法
    // await wrapLoading(
    //   this.downloadGitRepo, // 远程下载方法
    //   'waiting download template', // 加载提示信息
    //   requestUrl, // 参数1: 下载地址
    //   path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置


    let downloadOption = {
      // args:[
      //   "--branch",
      //   `${tag}`
      // ]
      // headers: { 'PRIVATE-TOKEN': config.PRIVATETOKEN }
    }

    clone(requestUrl, this.targetDir, downloadOption, function (err) {
      if (err === undefined) {

      } else {
        console.log(err);
      }
    })
    
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  async create(){

    // const token = await this.getToken()

    // 1）获取模板名称
    const repo = await this.getRepo()

    // 2) 获取 tag 名称
    // const tag = await this.getTag(repo)
    
    // 3）下载模板到模板目录
    await this.download(repo)
    
    // 4）模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
    console.log('  npm install')
    console.log('  npm run dev\r\n')
  }
}

module.exports = Generator;
