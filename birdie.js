

Tasks = new Mongo.Collection("tasks");

Candidates = new Mongo.Collection("candidates");

UsersVotes = new Mongo.Collection("user_votes");

var global_my_current_vote = -1;
var global_status = 0;

if (Meteor.isClient) {
 Template.body.helpers({
    tasks: function () {
      console.log("TASKS CALLED");
      // return Tasks.find({});
      return Tasks.find({}, {sort: {createdAt: -1}});
      //return Tasks.find({});
    },
    count: function (){
      console.log("COUNT CALLED");
      return Tasks.find().count();
    },

    user_votes_report: function(){
      return UsersVotes.find();
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

    Candidates.remove({});
    var c = Candidates.find({cand: "sanders"}).count();
    if(c<1)
    {
      console.log("Adding candidates");
      Candidates.insert({cand_id:1, cand: "sanders", fullname: "Bernie Sanders"});
      Candidates.insert({cand_id:2, cand: "trump", fullname: "Donald Trump"});
      Candidates.insert({cand_id:3, cand: "clinton", fullname: "Hillary Clinton"});
    }
    else{
        console.log("Already "+c+" Candidates.");
    }
  });
}


if (Meteor.isClient) {


  Template.frm.events({

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

        //var my_current_vote = 1;
        }
      else
      {
        var fbid = null;
        //var my_current_vote = 0;
      }

      if(global_my_current_vote>0)
      {
          ;
      }

      if(fbid && global_my_current_vote>0){
          var text = event.target.text.value;
          Tasks.insert({
            text: text,
            createdAt: new Date(), // current time
            fbid: fbid,
            myvote: global_my_current_vote,
          });

          setdict = {
                  //text: text,
                  createdAt: new Date(), // current time
                  fbid: fbid,
                  myvote: global_my_current_vote,
                };

          //uid = UsersVotes.findOne({"fbid": fbid}).fetch();
          user_record = UsersVotes.findOne({"fbid": fbid});
          //console.log("user_record = "+user_record);
          //console.log(user_record);
          //uid = user_record.fbid;
          //uid = user_record._id;
          if(!user_record)
            //first time
          {
             uid2 = UsersVotes.insert(setdict);
             console.log("INSERT: setdict=");
             console.log(setdict);
          }
          else
          {
              var uid = user_record._id;
              UsersVotes.update(
                 //{"user": fbid},
                 {"_id": uid},
                 {$set:setdict});
              console.log("UPDATE: setdict:");
              console.log(setdict);
          }
          event.target.text.value = "";
          global_status = "OK.";
      }
      else{
          alert("vote not registered. "+!!(fbid)+" "+(global_my_current_vote>0))
          global_status = "vote not registered.";
      }
      console.log(global_status);

    },

    "change #mycand": function (event, template) {
        var cand = $(event.currentTarget).val();
        console.log("cand : " + cand);
        // additional code to do what you want with the cand
        global_my_current_vote = cand;
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




  Template.frm.helpers({
      candidates_h: function (){
        //return Candidates.find();
        return [
            {cand_id:1, cand: "sanders", fullname: "*Bernie Sanders"},
            {cand_id:2, cand: "trump", fullname: "Donald Trump"},
            {cand_id:3, cand: "clinton", fullname: "Hillary Clinton"}
        ];
      },
  });

}

if (Meteor.isClient) {
    console.log("is client");
    var Observe;
    var chart_counter;
    Template.body.onCreated = function(){
    }

    //Why body
    Template.body.onRendered = function(){
        console.log("rendered" );
        chart_counter = 0;


        d3
        .select("#livechart")
        .append("text")
        .text( (d) => {
            return "count: ";
        })
        .attr("y",20) //doesnt work
        .attr("x",10)
        ;


        Observe = Tasks.find({},{fields:{}} ).observe({
              added: (doc) => {
                  chart_counter++;
                 console.log("added");
                 d3
                 .select("#livechart")
                 .append("text")
                 .datum(doc)
                 .text( d => {
                      console.log("datum");
                      console.log(d);
                      //d: fbid, text, createAt
                      return ""+d.text+"";
                    })
                 .attr("y",100+chart_counter*2)
                 .attr("x",100)
                 ;

                 d3
                 .select("#livechart")
                 .select("text")
                 .text( chart_counter )
                 .attr("y",20)
                 .attr("x",10)
                 ;

              },
               chnaged: () => {console.log("changed");},
               removed: () => {console.log("removed");}
          });

          /*
          Observe2 = Tasks.find({},{fields:{}} ).count().observe({
              added: (doc) => {
                 console.log("count: added");
              },
               chnaged: () => {console.log("count: changed");},
               removed: () => {console.log("count:removed");}
          })
          */

    }

    Template.body.onDestroyed = function(){
        if(Observe){
          console.log("Observe.stop");
            Observe.stop();
          }
    }
}
