# API

## coolie.config
配置构建参数
```
// coolie 配置
coolie.config({
    // 是否在构建之前清空目标目录
    clean: true,

    // js 构建
    js: {
        // 入口模块
        main: [
            './static/js/app/**'
        ],
        // coolie-config.js 路径
        'coolie-config.js': './static/js/coolie-config.js',
        // js 文件保存目录
        dest: './static/js/',
        // 分块配置
        chunk: []
    },

    // html 构建
    html: {
        // html 文件
        src: [
            './views/html/**'
        ],
        // 是否压缩
        minify: true
    },

    // css 构建
    css: {
        // css 文件保存目录
        dest: './static/css/',
        // css 压缩配置
        minify: {
            compatibility: 'ie7'
        }
    },

    // 资源
    resource: {
        // 资源保存目录
        dest: './static/res/',
        // 是否压缩
        minify: true
    },

    // 原样复制文件
    copy: [],

    // 目标配置
    dest: {
        // 目标目录
        dirname: '../dest/',
        // 目标根域
        host: '',
        // 版本号长度
        versionLength: 32
    }
});
```


## coolie.use
使用 coolie 中间件。
```
coolie.use(require("coolie-*"));
```


## coolie.utils
### coolie.utils.getAbsolutePath
获取绝对路径。
```
var absolutePath = coolie.utils.getAbsolutePath(name, parentFile);
```

### coolie.utils.getHTMLTagAttr
获取 html 标签属性。
```
var htmlTagAttrValue = coolie.utils.getHTMLTagAttr(htmlTag, attrName);
```

### coolie.utils.setHTMLTagAttr
设置 html 标签属性。
```
var newHTMLTag = coolie.utils.setHTMLTagAttr(htmlTag, attrName, attrValue);
```


### coolie.utils.copyResourceFile
复制资源文件。
```
var resourceURI = coolie.utils.copyResourceFile(file);
```

