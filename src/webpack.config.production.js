const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const main = ['./src/code/bwmain.ts'];

module.exports = {
    /* automatically find tsconfig.json */
    context: process.cwd(),
    entry: {
        main: main
    },
    output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name].[hash].min.js',
        chunkFilename: '[name].[chunkhash].bundle.js'
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            async: false
        }),
        new HtmlWebpackPlugin({
            hash: true,
            inject: true,
            template: 'src/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: false,
                minifyCSS: true,
                minifyURLs: true
            }
        }),
        new webpack.DefinePlugin({
            /*  note that the plugin does a direct text replacement. */
            WEBPACK_PRODUCTION: true
        })
    ],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    performance: {
        /* suppress warning about large asset size */
        hints: false
    },
    optimization: {
        /* set this to false if you'd rather not minimize code */
        minimize: true,
        /* into vendors.js */
        splitChunks: { chunks: 'all' }
    }
};
