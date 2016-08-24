The "initiatives" client-side application is bundled with webpack. We also need grunt to pre-compile the templates (with nunjucks): 

IMPORTANT: at the moment this app is still bundled with the old method (grunt only via static_extract -> concat -> uglify -> compress). The migration to webpack will be done in the "app2" directory.

In dev mode run (in the root dir of the project):
```bash
webpack --config ./plugins/initiatives/webpack.config.js --watch
```

In other terminal run grunt's watch task for the client-side templates
```bash
grunt --base ./ --gruntfile ./plugins/initiatives/Gruntfile.js watch
```


In production mode the commands are the same:

```bash
webpack --config ./plugins/initiatives/webpack.config.js
```

In other terminal run grunt's watch task for all targets:
```bash
grunt --base ./ --gruntfile ./plugins/initiatives/Gruntfile.js
```

The workflow is this:

1) if a template file (client side) is changed: grunt watch will detect and execute the "templates" task (compile templates -> uglify -> compress -> add timestamp)

2) if a js file from the client side app is changed, webpack will detect and create a new bundle in "_build/temp/app.js"; if in production mode, grunt watch will detect the change and run the "app" task (uglify the app bundle -> compress -> add timestamp)

3) if a lib file is changed, webpack will detect and create a new bundle in "_build/temp/lib.js"; the grunt watch task will detect the change and run the "lib" task (uglify the lib bundle -> compress -> add timestamp)


Note: when the server is started, it will execute the above tasks:
```bash
webpack --config ./plugins/initiatives/webpack.config.js
grunt --base ./ --gruntfile ./plugins/initiatives/Gruntfile.js
```
