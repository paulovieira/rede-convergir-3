### 16.03.09: the user code places new properties in the Mn object

It's done in the configuration file (config.js)

```js
var State = require("marionette.state");
Mn.State = State;

Mn.Plugin = ...
```



### 16.03.10: add a custom renderer (pr #2911)

This is the same as the pull request.#2911:
https://github.com/marionettejs/backbone.marionette/pull/2911

It allows to add a custom renderer function by attaching it directly to the view prototype (so we can have a specific renderer for each view). 

If we attach it to Mn.View.prototype, then it becomes the new default renderer.

Example:

```js
var MyView = Mn.View.extend({

    template: "something/templates/hello-world.html",

    renderer: function(template, data) {

        if (!template) {
            throw new Marionette.Error({
                name: 'TemplateNotFoundError',
                message: 'Cannot render the template since its false, null or undefined.'
            });
        }

        var output = "";
        try {
            // nunjucks will look for the pre-compiled template at window.nunjucksPrecompiled;
            // more details here: https://mozilla.github.io/nunjucks/api.html#browser-usage
            output = nunjucks.render(template, data);
            return output;
        } catch (err) {
            throw new Marionette.Error({
                name: 'NunjucksError',
                message: err.message
            });
        }
    }
});
```

This is done in the the configuration file.