
### Dashboard client side app

Make sure `webpack` and `webpack-dev-server` are installed globally.

Make sure the the webpack loaders and plugins that will be used are installed locally.

```sh
npm install exports-loader imports-loader file-loader nunjucks-loader style-loader url-loader bell-on-bundler-error-plugin --save-dev
```

#### Dev mode

In dev mode we use `webpack-dev-server` instead of the regular `webpack --watch`. The advantage is that the dev-server offers a live-reload functionality. 

In the root dir of the project:
```bash

# start the hapi server
export NODE_ENV=dev; nodemon;

# in another terminal start webpack-dev-server (in "inline mode")
export NODE_ENV=dev; webpack-dev-server --config ./client/dashboard/webpack.config.js --inline  --port 8081
```

We can open the "dashboard" board being served by hapi: http://redeconvergir.dev/dashboard

The browser will reload on every change.

wThe bundle files (`lib.js` and `app.js`) will be created in-memory only and are served directly to the browser.

Note that the port and path of the bundles are not the same as the ones configured in the Hapi server. The bundles are being served by an Express server created by Webpack. In this case we have:

http://localhost:8081/WEBPACK_DEV_SERVER/lib.js
http://localhost:8081/WEBPACK_DEV_SERVER/app.js

 - "WEBPACK_DEV_SERVER" is defined in the "publicPath" option in the webpack configuration;
 - the port is defined as a command line argument ("--port 8081")

If we want to actually inspect the contents of the bundles with a text editor, we should execute the normal webpack command:

```bash
webpack --config ./client/dashboard/webpack.config.js --watch
```

In this case the bundle files will be created in the path given in the "output" section of the webpack config

If there are any problems with webpack-dev-server, check more info here:

"Combining with an existing server."
"You can run two servers side-by-side: The webpack-dev-server and your backend server."
http://webpack.github.io/docs/webpack-dev-server.html

#### Production mode 

In production mode, just run the normal webpack command (this is actually done when the Hapi server starts). The webpack configuration adds the UglifyJsPlugin in production mode.

We also need to run grunt to have the static_timestamp task executed.

```bash
# start the hapi server
export NODE_ENV=production; node index.js;

# in another terminal execute normal webpack
export NODE_ENV=production; webpack --config ./client/dashboard/webpack.config.js

# in a 3rd terminal run grunt to execute the static_timestamp task
grunt --base ./ --gruntfile ./client/dashboard/Gruntfile.js
```


READ: http://www.christianalfoni.com/articles/2014_12_13_Webpack-and-react-is-awesome
(setting up a workflow with webpack)