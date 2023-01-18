const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: path.resolve(__dirname, 'index.tsx'),
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.css', '.scss'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '..', 'dist', 'public'),
    },
    devtool: 'source-map',
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'index.css',
        }),
        new HTMLWebpackPlugin({
            inject: false,
            template: path.resolve(__dirname, 'index.html'),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: [
                    'ts-loader'
                ]
            },
            {
                test: /\.module\.scss/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            esModule: true,
                            modules: {
                                mode: "local",
                                auto: true,
                                exportGlobals: true,
                                localIdentName: "[path][name]--[hash:base64:5]",
                                localIdentContext: path.resolve(__dirname, 'components'),
                                exportLocalsConvention: "camelCaseOnly",
                            },
                        }
                    },
                    'sass-loader',
                ]
            },
            {
                test: /\.css/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
        ]
    }
}