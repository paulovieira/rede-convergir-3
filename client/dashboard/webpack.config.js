var Path = require("path");
var webpack = require("webpack");
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

// we assume webpack will be executed from the rootDir
var rootDir = Path.resolve(__dirname, "../..");

var appDir = Path.resolve(rootDir, "client/dashboard/app");
var libDir = Path.resolve(rootDir, "public/lib");

process.env.NODE_ENV = process.env.NODE_ENV || "production";

var config = {
    entry: {
        app: Path.resolve(appDir, "index.js"),

        // "explicit vendor chunk (split your code into vendor and application);"
        // we must list here the modules that will be place in _build/temp/lib.js
        // more info at:
        // https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        lib: [
            Path.resolve(libDir, "jquery/jquery-1.11.2.js"),
            Path.resolve(libDir, "underscore/underscore-1.8.3"),
            Path.resolve(libDir, "backbone/backbone-1.2.3.js"),
            Path.resolve(libDir, "backbone/backbone.marionette-2.4.4.js"),
            Path.resolve(libDir, "backbone/marionette.state-1.0.1.js"),
            Path.resolve(libDir, "backbone/backbone.radio-1.0.2.js"),
            Path.resolve(libDir, "backbone/backbone.base-router-1.3.0.js"),
            Path.resolve(libDir, "backbone/backbone.syphon-0.6.3.js"),
            Path.resolve(libDir, "q/q-1.4.1.js"),
            Path.resolve(libDir, "jquery/formstone-1.0.0/js/background.js"),
            Path.resolve(libDir, "jquery/formstone-1.0.0/js/checkbox.js"),
            Path.resolve(libDir, "jquery/formstone-1.0.0/js/dropdown.js"),
            Path.resolve(libDir, "fecha-2.1.0.js"),
            
        ]
    },

    output: {

        // path and name of the bundle; note that if the webpack server is running,
        // the bundle file won't actually be
        // created; instead, the bundle will be created in-memory only and served
        // directly to the browser (available at /public/app.js in this case)
        path: Path.resolve(appDir, "_build/temp"),
        filename: "app.js",
    },

    plugins: [

        new webpack.optimize.CommonsChunkPlugin({
            name: "lib",
            filename: "lib.js"
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'dev')
        }),
        // new webpack.ProvidePlugin({
        //     "window.xyzw": "jquery"
        // }),
        new BellOnBundlerErrorPlugin()
    ],


    resolve: {
        alias: {
            "jquery": Path.resolve(libDir, "jquery/jquery-1.11.2.js"),
            "underscore": Path.resolve(libDir, "underscore/underscore-1.8.3"),

            // bootstrap has to imported using the "imports-loader", passing a reference
            // to jquery; see ./config/config.js
            "bootstrap": Path.resolve(libDir, "bootstrap/3.3.5/js/bootstrap.js"),
            
            "backbone": Path.resolve(libDir, "backbone/backbone-1.2.3.js"),
            "backbone.marionette": Path.resolve(libDir, "backbone/backbone.marionette-2.4.4.js"),
            "marionette.state": Path.resolve(libDir, "backbone/marionette.state-1.0.1.js"),
            "backbone.radio": Path.resolve(libDir, "backbone/backbone.radio-1.0.2.js"),
            "backbone.base-router": Path.resolve(libDir, "backbone/backbone.base-router-1.3.0.js"),
            "backbone.syphon": Path.resolve(libDir, "backbone/backbone.syphon-0.6.3.js"),
            "q": Path.resolve(libDir, "q/q-1.4.1.js"),
            "stacktrace": Path.resolve(rootDir, "node_modules/stacktrace-js"),
            "fecha": Path.resolve(libDir, "fecha-2.1.0.js"),
            
            
            "fs.background": Path.resolve(libDir, "jquery/formstone-1.0.0/js/background.js"),
            "fs.checkbox": Path.resolve(libDir, "jquery/formstone-1.0.0/js/checkbox.js"),
            "fs.dropdown": Path.resolve(libDir, "jquery/formstone-1.0.0/js/dropdown.js"),

            "fs.light-theme.css": Path.resolve(libDir, "jquery/formstone-1.0.0/css/themes/light.css"),
            "fs.background.css": Path.resolve(libDir, "jquery/formstone-1.0.0/css/background.css"),
            "fs.checkbox.css": Path.resolve(libDir, "jquery/formstone-1.0.0/css/checkbox.css"),
            "fs.dropdown.css": Path.resolve(libDir, "jquery/formstone-1.0.0/css/dropdown.css"),
            "bootflat.css": Path.resolve(libDir, "bootstrap/bootflat-2.0.4/bootflat.css"),
            "bootstrap.css": Path.resolve(libDir, "bootstrap/3.3.5/css/bootstrap.css"),

            // NOTE: we have manually edit font-awesome.css and remove the query string
            // in the lines with "url('...')". Example: 
            // url('../fonts/fontawesome-webfont.woff2?v=4.5.0')
            "font-awesome.css": Path.resolve(libDir, "font-awesome/4.5.0/css/font-awesome.css"),
            
        }
    },


    module: {
        loaders: [
        {
            test: /\.css$/,
            loader: "style!css"
        },
        { 
            // inline base64 URLs for images that are <= 1k; direct URLs for the others 
            // (the files will be copied to the output dir: _build/temp)
            test: /\.(png|jpg)$/, 
            loader: 'url-loader?limit=1024' 
        },
        {
            // fonts loaded in stylesheets (via "src: url('...')" ); 
            test: /\.(woff|woff2|ttf|eot|svg)$/,
            loader: 'url-loader?limit=1'
        },
        {
            test: /\.(html|nunjucks)$/,
            loader: 'nunjucks-loader',
            query: {
                config: Path.resolve(__dirname, 'nunjucks.config.js')
            }
        }

        ]
    },

    // proxy: {
    //     '/api/users': {
    //         target: 'http://localhost:8000/api/users',
    //         secure: false,
    //     },
    // }
};


if (process.env.NODE_ENV === "dev") {

    // the stacktrace library is heavy in the dependencies; use it only
    // in development
    config.entry.lib.push(Path.resolve(rootDir, "node_modules/stacktrace-js"))

    // Webpack Dev Server also uses publicPath to determine the path where the 
    // output files are expected to be served from
    // to make requests to the webpack-dev-server you need to provide a full URL in the 
    // output.publicPath
    config.output.publicPath = "http://localhost:8081/WEBPACK_DEV_SERVER";

    config.plugins.push(
        new webpack.SourceMapDevToolPlugin({

            // output filename of the SourceMap; if no value is provided the SourceMap 
            //is inlined            
            filename: undefined,
        })
    );
}
else if (process.env.NODE_ENV === "production") {

    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
}


module.exports = config;

