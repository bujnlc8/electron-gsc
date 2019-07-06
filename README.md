### i古诗词基于`electron`的mac客户端。

主要提供古诗词查询及朗诵。

另见小程序`i古诗词`：

<img alt="i古诗词小程序码" src="https://i.loli.net/2018/11/11/5be80d00518d4.jpg" width="200">

### 怎么跑

``` bash
# 安装依赖
sudo yarn install

重新编译sqlite3

sudo cnpm install sqlite3 --build-from-source --runtime=electron --target=2.0.4 --dist-url=https://atom.io/download/electron --module_name=node_sqlite3 --module_path=../lib/binding/electron-v2.0-darwin-x64

如果遇到报错，先删除node_modules

# 本地开发
yarn run dev

# 编译
yarn run build
```

### 直接上图

![i古诗词.png](https://s2.ax1x.com/2019/07/06/Z0ZF8x.png)
