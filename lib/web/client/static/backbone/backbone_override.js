

Backbone.Collection.prototype.save = function(options) {
debugger;
  var promises = [], newModels = [], newModelsAttrs = [], changedModels = [], changedModelsAttrs = [];
  options = options || {};

  this.each(function(model){
  	if(model.isNew()){ 
  		newModels.push(model);
  		newModelsAttrs.push(model.toJSON());
  	}
  	else if(model.hasChanged()){  
  		changedModels.push(model);
  		changedModelsAttrs.push(model.toJSON());
  	}
  });

  // After a successful server-side save, the collection will be
  // updated with the server-side state (using .set())
  if (options.parse === void 0) options.parse = true;
  if (options.remove === void 0) options.remove = false;

  var optionsNew     = _.clone(options) || {};
  var optionsChanged = _.clone(options) || {};

  optionsNew.url     = this.url;
  optionsChanged.url = this.url + "/" + _.pluck(changedModelsAttrs, "id").join(",");

  var collection = this;

  // make sure the promises array always has 2 promises (even if one of them is a "dummy promise")

  promises.push(newModels.length > 0 ?
				this.sync("create", this, _.extend(optionsNew, {attrs: newModelsAttrs})) : 
				Q(undefined));

  promises.push(changedModels.length > 0 ?
				this.sync("update", this, _.extend(optionsChanged, {attrs: changedModelsAttrs})) :
				Q(undefined));


  // TODO: is there are no new or changed models, what should we do? return a fulfilled promise? or return false?

  var promise = Q.all(promises)
  				.then(
  					function(resp){
  						debugger;

  						// NOTE: if there are no new models, the corresponding promise in the "promises"
  						// array will already be resolved (with undefined)

  						// the first entry in the resp array is the fulfillment value of the promise
  						// relative to the new models
						if(resp[0]){

							// we have to update the models' attributes directly (instead of using collection's 
							// set); otherwise we end up having duplicate models in the collection (because the
							// models that are currently present don't have yet an id, so the set() method
							// will create new ones)
  							var model;
							for(var i=0, l=resp[0].length; i<l; i++){
								model = newModels[i];
								model.set(model.parse(resp[0][i]), options);
							}

					        if (options.success){ options.success(collection, resp[0], options); }
					        collection.trigger('sync', collection, resp[0], options);
						}

  						// the second entry is the fulfillment value relative to the existing models 
  						// (models that have been updated); here we can use collection's set()
						if(resp[1]){
							collection.set(resp[1], options);

					        if (options.success){ options.success(collection, resp[1], options); }
					        collection.trigger('sync', collection, resp[1], options);
						}
  					},
  					function(err){
  						debugger;
					    if (options.error) options.error(collection, resp, options);
					    collection.trigger('error', collection, resp, options);
  					}
  				)

	return promise;
};



// Backbone.Attributes.js 0.7.1
// ---------------

//     (c) 2014 Adam Krebs
//     Backbone.Attributes may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/akre54/Backbone.Attributes

(function (factory) {
  if (typeof define === 'function' && define.amd) { define(['underscore', 'backbone', 'exports'], factory);
  } else if (typeof exports === 'object') { factory(require('underscore'), require('backbone'), exports);
  } else { factory(_, Backbone, (Backbone.Attributes = {})); }
}(function (_, Backbone, Attributes) {
  _.extend(Attributes, Backbone.Events);

  var modelMethods = ['get', 'set', 'unset', 'clear', '_validate', 'validate', 'isValid', 'has', 'changed', 'hasChanged', 'changedAttributes', 'previous', 'previousAttributes'];
  var wrappedMethods = ['get', 'set', 'clear', 'changedAttributes'];

  var Model = Backbone.Model.prototype;

  _.each(modelMethods, function(method) {
    var fn = Model[method];
    var wrapper = function() {
      _.defaults(this.attributes || (this.attributes = {}), _.result(this, 'defaults'));
      _.each(wrappedMethods, function(m) { if (this[m]._wrapped) this[m] = Model[m]; }, this);
      this.setAttribute = this.setAttributes = Model.set;
      this.getAttribute = Model.get;
      return fn.apply(this, arguments);
    };
    wrapper._wrapped = true;
    Attributes[method] = _.contains(wrappedMethods, method) ? wrapper : fn;
  });

  Attributes.setAttribute = Attributes.setAttributes = Attributes.set;
  Attributes.getAttribute = Attributes.get;
}));
