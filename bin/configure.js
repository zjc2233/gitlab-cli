// 配置信息
const config = require("./config");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

function writeFile(data) {
  // 创建一个可以写入的流，写入到文件output.txt中
  // console.log(__dirname);
  let writeStream = fs.createWriteStream(`${__dirname}/\config.js`);

  writeStream.write(data, "utf-8");

  // 标记写入完成
  writeStream.end();

  writeStream.on("finish", function () {
    // console.log("写入完成");
  });

  // 失败
  writeStream.on("error", function (e) {
    console.log("写入失败", e);
  });
}

// 设置配置信息
async function initConfigure() {
  if (["", null, undefined].includes(config.cloneUrl)) {
    // 如果配置信息为空，则需要键入配置信息
    const { cloneUrl } = await inquirer.prompt([
      {
        type: "input", //type： input, number, confirm, list, checkbox ...
        name: "cloneUrl", // key 名
        message: "Your Gitlab Group Url", // 提示信息
        default: "", // 默认值
      },
    ]);
    console.log(path.resolve("./bin"));
    config.cloneUrl = cloneUrl;
    let data = `module.exports=${JSON.stringify(config)}`
    console.log('data', data);
    writeFile(data)
    return { cloneUrl };
  }
  console.log(config);
  return config;
}

module.exports = initConfigure;
