/*
**  GemstoneJS -- Gemstone JavaScript Technology Stack
**  Copyright (c) 2016-2018 Gemstone Project <http://gemstonejs.com>
**  Licensed under Apache License 2.0 <https://spdx.org/licenses/Apache-2.0>
*/

const path              = require("path")
const webpack           = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = function (mode) {
    let config = {
        mode: mode,
        plugins: [
            new ExtractTextPlugin({
                filename:    "[name].css",
                allChunks:   true
            }),
            new webpack.ProvidePlugin({
                $:           "jquery",
                jQuery:      "jquery",
                ComponentJS: "componentjs",
                Vue:         "vue"
            })
        ],
        context: process.cwd(),
        entry: {
            "gemstone": "./src/gemstone.js"
        },
        resolve: {
            modules:          [ "node_modules", "bower_components" ],
            descriptionFiles: [ "package.json", "bower.json" ],
            mainFields:       [ "browser", "main" ]
        },
        externals: {
            "navigator": "navigator",
            "window":    "window",
            "document":  "document"
        },
        module: {
            rules: [
                {   test: /\.js$/,
                    enforce: "pre",
                    use: {
                        loader: require.resolve("./webpack.loader-nostrict")
                    }
                },
                {   test: /\.js$/,
                    enforce: "post",
                    use: {
                        loader: require.resolve("./webpack.loader-nostrict")
                    }
                },
                {
                    test: (path) => {
                        return path.match(/\/(?:node_modules|bower_components)\//)
                    },
                    rules: [
                        {   test: /\.js$/,
                            rules: [ { parser: { amd: false, commonjs: true } } ]
                        },
                        {   test: /\.css$/,
                            use: ExtractTextPlugin.extract({
                                fallback: require.resolve("style-loader"),
                                use: require.resolve("css-loader")
                            })
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /\/(?:node_modules|bower_components)\//,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [ "es2015", "es2016", "es2017", "stage-3", "stage-2" ],
                            plugins: [ "transform-runtime" ]
                        }
                    }
                },
                {
                    test: require.resolve("jquery"),
                    use: [{ loader: "expose-loader", options: "jQuery" }]
                },
                {
                    test: require.resolve("componentjs"),
                    use: [{ loader: "expose-loader", options: "ComponentJS" }]
                },
                {
                    test: require.resolve("componentjs/component.plugin.testdrive.js"),
                    use: mode === "production" ? "null-loader" : "noop-loader"
                },
                {
                    test: require.resolve("componentjs/component.plugin.debugger.js"),
                    use: mode === "production" ? "null-loader" : "noop-loader"
                },
                {
                    test: require.resolve("vue"),
                    use: [{ loader: "expose-loader", options: "Vue" }]
                },
                {
                    test: require.resolve("i18next"),
                    use: [{ loader: "expose-loader", options: "i18next" }]
                }
            ]
        },
        target: "web",
        output: {
            path:          path.resolve("dst"),
            filename:      mode === "production" ? "[name].js" : "[name].dev.js",
            libraryTarget: "commonjs2"
        },
        performance: {
            hints: false
        }
    }
    return config
}

