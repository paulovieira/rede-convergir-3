var Path = require("path");
var webpack = require("webpack");

process.env.NODE_ENV = process.env.NODE_ENV || "dev";
//process.env.NODE_ENV = "production";

module.exports = {

    entry: {
        app: Path.join(__dirname, "./app2/main/main.js"),

        // explicit vendor chunk (split your code into vendor and application);
        // we must list here the modules that will be in ./_build/webpack_lib.js
        // https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        lib: [
            Path.join(__dirname, "./app2/_libs/jquery/jquery.js"),
            //"./app2/_libs/backbone",
            //"./app2/_libs/nunjucks-slim",
            //"./app2/_libs/q"
        ]

    },

    output: {
        filename: Path.join(__dirname, "./app2/_build/webpack_main.js")
    },

    plugins: [

        new webpack.optimize.CommonsChunkPlugin({
            name: "lib",
            filename: Path.join(__dirname, "./app2/_build/webpack_lib.js")
        })
    ],

    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css"
        }]
    },

    //devtool: process.env.NODE_ENV === "dev" ? "inline-source-map" : "",
};