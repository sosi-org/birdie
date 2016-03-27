

Tasks = new Mongo.Collection("tasks");

 

if (Meteor.isClient) {
 Template.body.helpers({
    tasks: function () {
      // return Tasks.find({});
      return Tasks.find({}, {sort: {createdAt: -1}});
      //return Tasks.find({});
    },
    count: function (){
      return Tasks.find().count();
    }
  });
}



if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}


if (Meteor.isClient) {

  Template.body.events({

    "submit .new-task": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      Tasks.insert({
        text: text,
        createdAt: new Date() // current time
      });
      event.target.text.value = "";
    }
  });




Template.login.events({
    'click #facebook-login': function(event) {
        Meteor.loginWithFacebook({}, function(err){
            if (err) {
                throw new Meteor.Error("Facebook login failed");
            }
        });
    },
 
    'click #logout': function(event) {
        Meteor.logout(function(err){
            if (err) {
                throw new Meteor.Error("Logout failed");
            }
        })
    }
});


}



