var Path = require("path");
var webpack = require("webpack");

process.env.NODE_ENV = process.env.NODE_ENV || "dev";
//process.env.NODE_ENV = "production";

var rootDir = Path.join(__dirname, "..", "..");
var appDir = Path.join(rootDir, "plugins/initiatives/app2");
var libDir = Path.join(rootDir, "public/lib");


module.exports = {

    entry: {
        app: Path.join(appDir, "main/main.js"),

        // "explicit vendor chunk (split your code into vendor and application);"
        // we must list here the modules that will be place in _build/temp/lib.js
        // more info at:
        // https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        lib: [
            Path.join(libDir, "jquery/jquery-1.11.2.js"),
            // backbone
            // nunjucks-slim
            // q
        ]

    },

    output: {
        filename: Path.join(appDir, "_build/temp/app.js")
    },

    plugins: [

        new webpack.optimize.CommonsChunkPlugin({
            name: "lib",
            filename: Path.join(appDir, "_build/temp/lib.js")
        })
    ],

    resolve: {
        alias: {
            "jquery": Path.join(libDir, "jquery/jquery-1.11.2.js"),
        }
    },

    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css"
        }]
    },

    //devtool: process.env.NODE_ENV === "dev" ? "inline-source-map" : "",
};