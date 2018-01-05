const { resolve, join } = require('path');

const webpack = require('webpack');
const nsWebpack = require('nativescript-dev-webpack');
const nativescriptTarget = require('nativescript-dev-webpack/nativescript-target');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { NativeScriptWorkerPlugin } = require('nativescript-worker-loader/NativeScriptWorkerPlugin');

const os = require('os');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const cacheBusterTimestamp = Date.now().toString(36);

module.exports = env => {
  const platform = env && (env.android && 'android' || env.ios && 'ios');
  if ( !platform ) {
    throw new Error('You need to provide a target platform!');
  }
  const platforms = ['ios', 'android'];
  const ngToolsWebpackOptions = { tsConfigPath: 'tsconfig.aot.json' };
  const { snapshot, uglify, report, aot } = env;

  const config = {
    context: resolve('./app'),
    target: nativescriptTarget,
    entry: {
      bundle: aot ? './main.aot.ts' : './main.ts',
      vendor: './vendor',
    },
    output: {
      pathinfo: true,
      // Default destination inside platforms/<platform>/...
      path: resolve(nsWebpack.getAppPath(platform)),
      libraryTarget: 'commonjs2',
      filename: `[name]_${cacheBusterTimestamp}.js`,
      chunkFilename: '[id].[chunkhash].js',
    },
    resolve: {
      extensions: ['.ts', '.js', '.scss', '.css'],
      // Resolve {N} system modules from tns-core-modules
      modules: [
        'node_modules/tns-core-modules',
        'node_modules',
      ],
      alias: {
        '~': resolve('./app')
      },
      // don't resolve symlinks to symlinked modules
      // symlinks: false
    },
    resolveLoader: {
      // don't resolve symlinks to symlinked loaders
      symlinks: false
    },
    node: {
      // Disable node shims that conflict with NativeScript
      'http': false,
      'timers': false,
      'setImmediate': false,
      'fs': 'empty',
    },
    module: {
      rules: [
        { test: /\.html$|\.xml$/, use: 'raw-loader' },

        // tns-core-modules reads the app.css and its imports using css-loader
        { test: /\/app\.css$/, use: 'css-loader?url=false' },
        { test: /\/app\.scss$/, use: ['css-loader?url=false', 'sass-loader'] },

        // Angular components reference css files and their imports using raw-loader
        { test: /\.css$/, exclude: /\/app\.css$/, use: 'raw-loader' },
        { test: /\.scss$/, exclude: /\/app\.scss$/, use: ['raw-loader', 'resolve-url-loader', 'sass-loader'] },

        // Compile TypeScript files with ahead-of-time compiler.
        {
          test: /.ts$/, use: [
            'nativescript-dev-webpack/moduleid-compat-loader',
            { loader: '@ngtools/webpack', options: ngToolsWebpackOptions },
            { loader: 'angular-router-loader?aot=true' }
          ]
        },
        { test: /\.json$/, use: [{ loader: 'json-loader' }] }
      ],
    },
    plugins: [
      // Vendor libs go to the vendor.js chunk
      new webpack.optimize.CommonsChunkPlugin({
        name: ['vendor'],
        filename: `vendor_${cacheBusterTimestamp}.js`
      }),
      // Define useful constants like TNS_WEBPACK
      new webpack.DefinePlugin({
        'global.TNS_WEBPACK': 'true',
      }),
      // Copy assets to out dir. Add your own globs as needed.
      new CopyWebpackPlugin(
        [
          { from: 'App_Resources/**' },
          { from: 'assets/**' },
          { from: 'fonts/**' },
          { from: '**/*.jpg' },
          { from: '**/*.png' },
          { from: '**/*.xml' }
          ],
        // usually used for local json file 
        // if testing out wip backend apis
        { ignore: ['assets/json/**'] }
      ),

      // Generate a bundle starter script and activate it in package.json
      new nsWebpack.GenerateBundleStarterPlugin([
        `./vendor_${cacheBusterTimestamp}`,
        `./bundle_${cacheBusterTimestamp}`
      ]),
      // Support for web workers since v3.2
      new NativeScriptWorkerPlugin(),
      // AngularCompilerPlugin with augmented NativeScript filesystem to handle platform specific resource resolution.
      new nsWebpack.NativeScriptAngularCompilerPlugin(
        Object.assign({
          entryModule: resolve(__dirname, 'app/app.module#AppModule'),
          skipCodeGeneration: !aot,
          platformOptions: {
            platform,
            platforms,
            // ignore: ['App_Resources']
          },
        }, ngToolsWebpackOptions)
      ),
      // Does IPC communication with the {N} CLI to notify events when running in watch mode.
      new nsWebpack.WatchStateLoggerPlugin(),
    ],
  };
  if ( report ) {
    // Generate report files for bundles content
    config.plugins.push(new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
      reportFilename: join(__dirname, 'report', `report.html`),
      statsFilename: join(__dirname, 'report', `stats.json`),
    }));
  }
  if ( snapshot ) {
    config.plugins.push(new nsWebpack.NativeScriptSnapshotPlugin({
      chunk: 'vendor',
      projectRoot: __dirname,
      webpackConfig: config,
      targetArchs: ['arm', 'arm64', 'ia32'],
      tnsJavaClassesOptions: { packages: ['tns-core-modules'] },
      useLibs: false
    }));
  }
  if ( uglify ) {
    // config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));
    config.plugins.push(new ParallelUglifyPlugin({
      workerCount: os.cpus().length,
      uglifyES: {
        compress: platform !== 'android',
        ecma: 6,
        safari10: platform !== 'android',
        warnings: 'verbose',
      }
    }));
  }
  return config;
};
