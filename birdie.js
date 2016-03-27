

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

//       console.log("OK");
//      console.log(this.currentUser);
//      console.log(this.currentUser.services.facebook);


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

      if (Meteor.user())
      {
        console.log(Meteor.user().services.facebook);
        /*
            accessToken: "CAAN5yekOwm8BAHIxriGhiLxLBqXZAKZAoH…", expiresAt: 1464289709783, id: "10156830831440151", #
            email: "sohale@gmail.com", name: "Sohail Si", first_name: "Sohail", last_name: "Si",
            link: "https://www.facebook.com/app_scoped…", gender: "male", locale: "en_GB", 1 more… }
        */
        var fbid = Meteor.user().services.facebook.id;
      }
      else
      {
        var fbid = null;
      }
      var text = event.target.text.value;
      Tasks.insert({
        text: text,
        createdAt: new Date(), // current time
        fbid: fbid,
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



