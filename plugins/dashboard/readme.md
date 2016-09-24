
## Dashboard client app

Make sure `webpack` and `webpack-dev-server` are installed **locally**, as well as the webpack loaders and plugins that will be used (no need to do a  manual install because these modules are already in package.json `dependencies`):

```sh
npm install \
    webpack  \
    webpack-dev-server  \
    css-loader \
    exports-loader \
    imports-loader \
    file-loader \
    nunjucks-loader \
    style-loader \
    url-loader \
    bell-on-bundler-error-plugin \
    compression-webpack-plugin
```


#### Dev mode

In dev mode we use `webpack-dev-server` instead of the regular `webpack --watch`. The advantage is that the dev-server offers a live-reload functionality. 

In the root dir of the project:
```bash

# start the hapi server
export NODE_ENV=dev; 
nodemon index.js --dev;

# in second terminal start webpack-dev-server (in "inline mode")
export NODE_ENV=dev;
webpack-dev-server --inline  --port 8081 --config ./plugins/dashboard/webpack.config.js 
```

We can open the "dashboard" page being served by hapi (in dev mode authentication has been disabled): http://redeconvergir.dev/dashboard
The browser will reload on every change.

The bundle/chunks (`manifest.js`, `lib.js` and `app.js`) will be created in-memory only and are served directly to the browser.

Note that the port and path of the bundles are not the same as the ones configured in the Hapi server. The bundles are being served by an Express server created by Webpack. In this case we have:

```
http://localhost:8081/WEBPACK_DEV_SERVER/manifest.js
http://localhost:8081/WEBPACK_DEV_SERVER/lib.js
http://localhost:8081/WEBPACK_DEV_SERVER/app.js
```

 - the `/WEBPACK_DEV_SERVER` path is defined in the `output.publicPath` option in the webpack configuration;
 - the port is defined as a command line argument (`--port 8081`)

If we want to actually open a bundle with a text editor, we should execute the regular `webpack` command (instead of `webpack-dev-server`)

```bash
export NODE_ENV=dev;
webpack --watch --display-chunks --display-modules --config ./plugins/dashboard/webpack.config.js 
```

In this case the bundle files will be created in the path given in the `output.path`  option. This is actually the command used in production mode (except for the `--watch` option)

If there are any problems with `webpack-dev-server`, see more info here:

"Combining with an existing server."
"You can run two servers side-by-side: The webpack-dev-server and your backend server."
http://webpack.github.io/docs/webpack-dev-server.html

#### Production mode 

In production mode, just run the regular webpack command above. This command is run by `child_process` everytime the server restarts in production mode.

The webpack configuration adds a couple more plugins in production mode:
- UglifyJsPlugin
- CompressionPlugin
- 

```bash
# start the hapi server
export NODE_ENV=production; node index.js;

# in another terminal execute regular webpack
export NODE_ENV=production; 
webpack --display-chunks --display-modules --config ./plugins/dashboard/webpack.config.js 
```

More details: http://www.christianalfoni.com/articles/2014_12_13_Webpack-and-react-is-awesome
(setting up a workflow with webpack)
