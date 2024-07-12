
# [DEPLOY(EN)](#how-to-deploy) | [发布(中文)](#发布规则)


## How to Deploy
### 1. update lvl2-sdk  (patch)
---
please release lvl2-sdk to npm with this script:

```
bash release.sh


#!/bin/bash
npm run publish:public
version=`npm view @aitmed/ecos-lvl2-sdk version`
git add .
git commit -m 'release a new version: $version'
git push 
git tag -a $version -m "release new version"
git push origin $version
```
this script will deploy lvl2 sdk to npm ,and creat a new tag for this version release.

ex:

![](https://aitmed-test-resources.oss-cn-beijing.aliyuncs.com/images/Snipaste_2023-01-10_16-12-58.png)

and be attention: this relase script is relase with `NODE_ENV_LVL2=development ` , under this ENV , we set logLevel as `debug` 

### 2. Release production version  （minor）
---
The production version will set the logLevel to ` warn`

In order to ensure the consistency between the production version and the test version, we can run from the branch of Tags established when distributing the test version

```
npm run publish:public:stable
```
## 发布规则

### 1. 更新 lvl2-sdk  (patch版本  版本自增 0.0.1 ) 

平常发布d 和 d2 使用 patch  ，环境变量是`NODE_ENV_LVL2=development `， 这个环境变量下 的 logLevel 设置是 `debug`,

运行 如下命令 

```
bash release.sh

#!/bin/bash
npm run publish:public
version=`npm view @aitmed/ecos-lvl2-sdk version`
git add .
git commit -m 'release a new version: $version'
git push 
git tag -a $version -m "release new version"
git push origin $version
```
这个命令会首先改变版本号（自增 0.0.1 ），然后把当前这个版本 打一个 标签 ， 标签名就是版本号。 


### 2. 发布 生产版本 （minor 版本 版本自增 0.1）

为了确保生产版本和测试的d版本版本号的一致性， 我们发布生产版本 从 当前d版本打的那个tag 上来发布，环境变量是`NODE_ENV_LVL2=production `， 这个环境变量下 的 logLevel 设置是 `warn`,

切换到指定的tag分支 ，运行如下命令 

```
npm run publish:public:stable
```