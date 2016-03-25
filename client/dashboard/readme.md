
### Dashboard client side app

Make sure `webpack` and `webpack-dev-server` are installed globally.

Install the webpack loaders and plugins that will be used:

```sh
npm install exports-loader file-loader nunjucks-loader style-loader url-loader bell-on-bundler-error-plugin --save-dev
```

In dev mode we use `webpack-dev-server` instead of `webpack --watch`. The advantage is that the dev-server offers a live-reload functionality. 

In the root dir of the project:
```bash
export NODE_ENV=dev

# start the hapi server
nodemon  

# start webpack-dev-server in inline mode
webpack-dev-server --config ./client/dashboard/webpack.config.js --inline  --port 8081
```

We can start conding the application. The browser will reload on every change.

The bundle files (`lib.js` and `app.js`) will be exist only in-memory and are served directly. 

Note that the port and path of the bundles are not the ones configured in the Hapi server. The bundles are being served by an Express server created by Webpack. In this case:

http://localhost:8081/WEBPACK_DEV_SERVER/lib.js
http://localhost:8081/WEBPACK_DEV_SERVER/app.js

(see the "publicPath" option in the webpack configuration).

If we want to inspect the contents of the bundles with a text editor, we should execute the normal webpack command:

```bash
webpack --config ./client/dashboard/webpack.config.js --watch
```

If there are any problems check more info here:

"Combining with an existing server."
"You can run two servers side-by-side: The webpack-dev-server and your backend server."
http://webpack.github.io/docs/webpack-dev-server.html


In production mode, just run the normal webpack command (this is actually done when the Hapi server starts). The webpack configuration adds the UglifyJsPlugin.

```bash
export NODE_ENV=production

# start the hapi server
nodemon  

# execute normal webpack
webpack --config ./client/dashboard/webpack.config.js
```

In other terminal run grunt to execute the static_timestamp task
```bash
grunt --base ./ --gruntfile ./client/dashboard/Gruntfile.js
```

READ: http://www.christianalfoni.com/articles/2014_12_13_Webpack-and-react-is-awesome
(setting up a workflow with webpack)