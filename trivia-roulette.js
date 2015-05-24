Squares = new Mongo.Collection("squares");
Turn = new Mongo.Collection("turn");
Questions = new Mongo.Collection("questions");
RevealAnswer = new Mongo.Collection("revealanswer");

if (Meteor.isClient) {
  Template.body.helpers({
    squares: function() {
      return Squares.find({});
    }
  });

  Template.body.helpers({
    isGray: function() {
      return this.color == "gray";
    }
  });

  Template.body.helpers({
    isBlack: function() {
      return this.color == "black";
    }
  });

  Template.body.helpers({
    isRed: function() {
      return this.color == "red";
    }
  });

  Template.body.helpers({
    getId: function() {
      return this.id;
    }
  });

  Template.duel.helpers({
     isCurrentTurnBlack: function() {
       t = Turn.find({});
       if (t.fetch({})[0].color == "black") {
            return true;
       } else {
            return false;
       }
     }
  });

  Template.duel.helpers({
    blacktotal: function() {
      return Squares.find({color: "black"}).count();  
    }
  });

  Template.duel.helpers({
    redtotal: function() {
      return Squares.find({color: "red"}).count();
    }
  });

  Template.duel.helpers({
    getQuestion: function() {
      return Questions.findOne({used: 0}, {sort: {id: 1}}).question; 
    }
  });

  Template.duel.helpers({
    getAnswer: function() {
      return Questions.findOne({used: 0}, {sort: {id: 1}}).answer; 
    }
  });

  Template.duel.events({
    "click .showanswer": function () {
       r = RevealAnswer.findOne({});
       RevealAnswer.update(r._id, {$set: {state: true}});
    }
  });

  Template.duel.helpers({
    showAnswer: function() {
       return RevealAnswer.findOne({}).state;
    }
  });

  Template.duel.events({
    "click .correct": function () {
       t = Turn.find({}).fetch({})[0];
       s = Squares.findOne({color: "gray"}, {sort: {id: 1}});
       q = Questions.findOne({used: 0}, {sort: {id: 1}}); 
       r = RevealAnswer.find({}).fetch({})[0];
       Squares.update(s._id, {$set: {color: t.color}});
       Questions.update(q._id, {$set: {used: 1}});
       RevealAnswer.update(r._id, {$set: {state: false}});
       if (t.color == "black") {
           Turn.update(t._id, {$set: {color: "red"}});
       } else {
           Turn.update(t._id, {$set: {color: "black"}});
       }
    }
  });

  Template.duel.events({
    "click .incorrect": function () {
       t = Turn.find({}).fetch({})[0];
       q = Questions.findOne({used: 0}, {sort: {id: 1}}); 
       r = RevealAnswer.find({}).fetch({})[0];
       Questions.update(q._id, {$set: {used: 1}});
       RevealAnswer.update(r._id, {$set: {state: false}});
       if (t.color == "black") {
           Turn.update(t._id, {$set: {color: "red"}});
       } else {
           Turn.update(t._id, {$set: {color: "black"}});
       }
    }
  });

  Template.duel.events({
    "click .reset": function () {
       a = Squares.find({});
       a.forEach(function(e) {
          Squares.update(e._id, {$set: {color: "gray"}});
       });
     }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Squares.find().count() === 0) {
      var square_data = Array.apply(null, {length: 12}).map(Number.call, Number);
      _.each(square_data, function (square_datum) {
        Squares.insert({
          id: square_datum + 1,
          color: "gray"
        });
      });
    }
    if (Turn.find().count() === 0) {
      if (Math.floor(Math.random() * 2) === 0) {
        Turn.insert({color: "black"});
      } else {
        Turn.insert({color: "red"});
      }
    }
    if (RevealAnswer.find().count() === 0) {
      RevealAnswer.insert({state: false});
    }
  });
}
