
// we're not actually in a typescript environment, this is just a config file,
// so safe to disable the warnings about require statements
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const main = [
    './src/code/bwmain.ts'
];

module.exports = {
    /* automatically find tsconfig.json */
    context: process.cwd(),
    entry: {
        main
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        publicPath: '/'
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
        }),
        /* turn off pop-up notifications */
        /* new ForkTsCheckerNotifierWebpackPlugin(
            { title: 'TypeScript', excludeWarnings: false }), */
        new HtmlWebpackPlugin({
            inject: true,
            template: 'src/index.html'
        }),
        new webpack.DefinePlugin({
            /*  note that the plugin does a direct text replacement. */
            WEBPACK_PRODUCTION: false,
            DBGPLACEHOLDER: 'debugger'
        }),
    ],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: [
                    { loader: 'ts-loader', options: { transpileOnly: true } }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devtool: 'inline-source-map',
    devServer: {
        open: true,
        historyApiFallback: true,
        /* turn off auto-refresh browser on changes */
        liveReload: false,
        client: {
            logging: 'warn'
        },
        static: { 
            directory: path.resolve(__dirname, './src/static'), 
            publicPath: '/static'
        }
    },
    stats: 'errors-only',
};
