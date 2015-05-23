Squares = new Mongo.Collection("squares");
Turn = new Mongo.Collection("turn");
//Questions = new Mongo.Collection("questions");

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

  Template.duel.events({
    "click .correct": function () {
       t = Turn.find({}).fetch({})[0];
       s = Squares.findOne({color: "gray"}, {sort: {id: 1}});
       Squares.update(s._id, {$set: {color: t.color}});
    }
  });

  Template.duel.events({
    "click": function () {
       t = Turn.find({}).fetch({})[0];
       if (t.color == "black") {
           Turn.update(t._id, {$set: {color: "red"}});
       } else {
           Turn.update(t._id, {$set: {color: "black"}});
       }
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
  });
}
