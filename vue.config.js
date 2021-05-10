const path = require('path');
const port = 8000;
const isProd = process.env.NODE_ENV === 'production';

const resolve = (dir) => path.join(__dirname, dir);

module.exports = {
  publicPath: process.env.BASE_URL, // 部署基础路径, History路由和多页面时必须使用绝对路径!
  outputDir: 'dist', // 构建文件目录, 添加--no-clean可避免构建时文件被清除!
  assetsDir: 'static', // 静态资源目录
  indexPath: 'index.html', // Html输出路径
  filenameHashing: true, // 是否开启文件名哈希
  lintOnSave: false, // 是否开启编译提示
  runtimeCompiler: false, // 是否使用运行时编译版本, 应用体积会增加10kb左右!
  transpileDependencies: ['swiper', 'vue-echarts', 'resize-detector'], // 添加Babel显式转义
  productionSourceMap: false, // 是否开启生产环境SourceMap
  // crossorigin: undefined,// 设置标签crossorigin属性
  integrity: false, // 是否启用标签Subresource Integrity
  configureWebpack: (config) => {
    config.externals = {
      BMap: 'BMap',
    };
  },
  chainWebpack: (config) => {
    // 修复热更新
    config.resolve.symlinks(true);
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@ast', resolve('src/assets'))
      .set('@cpt', resolve('src/components'));
    // 网站标题
    config.plugin('html').tap((args) => {
      args[0].title = '远程智能巡视集中监控系统';
      return args;
    });
    // 图片压缩
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        disable: true,
        gifsicle: { interlaced: false },
        mozjpeg: { progressive: true, quality: 75 },
        optipng: { enabled: false },
        pngquant: { quality: '75-90', speed: 4 },
        webp: { quality: 75 },
      });
    // 配置SVG
    // config.module
    //   .rule('svg')
    //   .exclude.add(resolve('src/icons'))
    //   .end()
    // config.module
    //   .rule('icons')
    //   .test(/\.svg$/)
    //   .include.add(resolve('src/icons'))
    //   .end()
    //   .use('svg-sprite-loader')
    //   .loader('svg-sprite-loader')
    //   .options({
    //     symbolId: 'icon-[name]'
    //   })
    //   .end()
    if (isProd) {
      // Webpack运行时代码块分割
      config.optimization.runtimeChunk('single');
      config.optimization.splitChunks({
        chunks: 'async', // all/async/initial
        minSize: 30000, // 代码块最小体积
        minChunks: 1, // 代码块最小引用次数
        maxAsyncRequests: 5, // 代码块最大异步请求数
        maxInitialRequests: 3, // 代码块最大初始请求数
        name: true, // 代码块名称
        cacheGroups: {
          element: {
            name: 'chunk-element',
            priority: 10,
            chunks: 'all',
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
          },
          vendors: {
            priority: -10,
            test: /[\\/]node_modules[\\/]/,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      });
      // 移除注释和打印
      config.optimization.minimizer('terser').tap((args) => {
        args[0].terserOptions.output = { comments: false };
        args[0].terserOptions.compress.drop_console = true;
        args[0].terserOptions.compress.drop_debugger = true;
        args[0].terserOptions.compress.pure_funcs = ['console.log'];
        return args;
      });
    }
  },
  css: {
    requireModuleExtension: true, // 是否开启CSS Module后缀
    // extract: true, // 是否提取CSS, 不兼容CSS热重载开发环境下关闭!
    sourceMap: false, // 是否开启CSS SourceMap, 开启后会影响构建性能!
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {
            'theme-color1': '#008c74',
            'theme-color2': '#56cb82',
            'theme-color3': '#ffc357',
            'theme-color4': '#f2764c',
            'theme-color5': '#50529e',
            'theme-color6': '#d4d4d4',
          },
        },
      },
    },
  },
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    proxy: {
      '/base-api': {
        //target: 'https://129.28.103.85:8443',
        target: 'https://100.100.100.102:8443',
        ws: true,
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/base-api': '',
        },
      },
    },
  },
  parallel: require('os').cpus().length > 1, // 多核时自动启用
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        path.resolve(__dirname, './src/styles/theme.less'),
        path.resolve(__dirname, './src/styles/mixin.less'),
      ],
    },
  }, // 第三方插件配置
  pwa: {}, // PWA插件配置
};
