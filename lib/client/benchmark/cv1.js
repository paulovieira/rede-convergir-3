var data = [];

var l=5000;
for(var i=0; i<l; i++){
    data.push({
        id: i,
        name: "paulo" + i 
    });
}

var userM = new Backbone.Model(data[0]);
var usersC = new Backbone.Collection(data);



var UserIV = Mn.ItemView.extend({
    template: _.template("id: <%= id %> <br> <span class='xyz'>name: <%= name %> </span>"),
    attributes: {
        style: "border: 1px solid;"
    },
    ui: {
        nameField: "span.xyz"
    },
    events: {
        "click @ui.nameField": "showName"
    },
    showName: function(e){

        console.log(this.model.get("name"));
    }
});

var userIV = new UserIV({

    model: userM
});

var UsersCV = Mn.CollectionView.extend({
    childView: UserIV
});

var usersCV = new UsersCV({
    collection: usersC,
});

var App = new Mn.Application();

App.addRegions({
    mainRegion: "#mn-r-main",
});

var t1 = Date.now();
App.mainRegion.show(usersCV);
console.log(Date.now() - t1);
