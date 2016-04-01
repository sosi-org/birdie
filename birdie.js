

Tasks = new Mongo.Collection("tasks");

Candidates = new Mongo.Collection("candidates");

UsersVotes = new Mongo.Collection("user_votes");

CountsHistory = new Mongo.Collection("counts_history"); //FineGrained
//BinsHistoryDaily = 

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
    },
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

function trigger2(){
    var now = new Date();
    interval = [now, now-5.0];

    //UsersVotes.find({createdAt});
    //***

    last_ = now;
}

var lastTime = null;
function trigger(){
    if(Meteor.isServer)
        console.log("s");
    if(Meteor.isClient)
        console.log("c");

    var now = new Date();

    var delta_sec = -1;
    if(lastTime){
        delta_sec = (now - lastTime)/1000.;
        console.log(delta_sec);
    }
    if(delta_sec < 0. || delta_sec >= 1.)
    {
        trigger2();
    }

    lastTime = now;
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    console.log("startup");

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


    //CountsHistory 

  });
}



if (Meteor.isClient) {


  Template.frm.events({

    "submit .new-task": function (event) {
      event.preventDefault();

      if (Meteor.user())
      {
        //console.log(Meteor.user().services.facebook);
        var fbid = Meteor.user().services.facebook.id;
      }
      else
      {
        var fbid = null;
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

          setdict =
          {
              //text: text,
              createdAt: new Date(), // current time
              fbid: fbid,
              myvote: global_my_current_vote,
          };

          user_record = UsersVotes.findOne({"fbid": fbid});
          if(!user_record)
          {
             //first time
             UsersVotes.insert(setdict);
          }
          else
          {
              var uid = user_record._id;
              UsersVotes.update(
                 {"_id": uid},
                 {$set:setdict});
          }
          event.target.text.value = "";
          global_status = "OK.";

          trigger(setdict);
      }
      else{
          alert("vote not registered. "+!!(fbid)+" "+(global_my_current_vote>0))
          global_status = "vote not registered.";
      }
      console.log(global_status);

    },

    "change #mycand": function (event, template) {
        var cand = $(event.currentTarget).val();
        //console.log("cand : " + cand);
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
            {cand_id:1, cand: "sanders", fullname: "Bernie Sanders"},
            {cand_id:2, cand: "trump", fullname: "Donald Trump"},
            {cand_id:3, cand: "clinton", fullname: "Hillary Clinton"}
        ];
      },
      myvote: function () {
        //console.log('myvOte');
        if (Meteor.user())
        {
          var fbid = Meteor.user().services.facebook.id;
          var current_user_vote_record = UsersVotes.findOne({"fbid": fbid});
          var myvote = current_user_vote_record.myvote;
          return myvote;
        }
        else
        {
          return "null";
        }
      },
      selectVoter: function(optionVal){
        //https://forums.meteor.com/t/how-to-set-default-value-for-html-select-element-with-meteor/1859
        //'this' is each item in candidates_h:
        if(optionVal == this.cand_id){
          //console.log("selected");
          //console.log(this);
          return 'selected';
        }
        //return 'q';
      }
  });

}

if (Meteor.isClient) {
    //console.log("is client");
    var Observe;
    var chart_counter;
    Template.body.onCreated = function(){
    }

    //Why body
    Template.body.onRendered = function(){
        //console.log("rendered" );
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
                 //console.log("added");
                 d3
                 .select("#livechart")
                 .append("text")
                 .datum(doc)
                 .text( d => {
                      //console.log("datum");
                      //console.log(d);
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
