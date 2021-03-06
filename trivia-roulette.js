Squares = new Mongo.Collection("squares");
Turn = new Mongo.Collection("turn");
Questions = new Mongo.Collection("questions");
RevealAnswer = new Mongo.Collection("revealanswer");
var changingSquare = 0;

if (Meteor.isClient) {
  Template.body.helpers({
    squares: function() {
      return Squares.find({});
    },
    isGray: function() {
      return this.color == "gray";
    },
    isBlack: function() {
      return this.color == "black";
    },
    isRed: function() {
      return this.color == "red";
    },
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
    },
    isGameNotYetOver: function() {
      return Squares.find({color: "gray"}).count() > 0;
    },
    blacktotal: function() {
      return Squares.find({color: "black"}).count();  
    },
    redtotal: function() {
      return Squares.find({color: "red"}).count();
    },
    getQuestion: function() {
      return Questions.findOne({used: 0}, {sort: {id: 1}}).question; 
    },
    getAnswer: function() {
      return Questions.findOne({used: 0}, {sort: {id: 1}}).answer; 
    },
    showAnswer: function() {
      return RevealAnswer.findOne({}).state;
    },
    showFinalSquareId: function() {
      return this.id; 
    },
    showFinalSquareColorIsRed: function() { 
      return this.color == "red";
    },
    finalSquareLoop: function() {
      s = Squares.find({});
      changingSquare = setInterval( function() { 
        n = Math.floor(Math.random() * 12);
        return s[n]; 
      }, 1000);
    }
  });

  Template.duel.events({
    "click .showanswer": function () {
       r = RevealAnswer.findOne({});
       RevealAnswer.update(r._id, {$set: {state: true}});
    },
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
    },
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
    },
    "click .reset": function () {
       r = RevealAnswer.find({}).fetch({})[0];
       RevealAnswer.update(r._id, {$set: {state: false}});
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
    if (Questions.find().count() === 0) {
      var qs = JSON.parse(Assets.getText('questions.json'));
      _.each(qs, function(thisQ) {
        Questions.insert(thisQ);
        console.log(thisQ);
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
