Tasks = new Mongo.Collection("tasks");

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("tasks", function () {
    // return Tasks.find({
    //   $or: [
    //     { private: {$ne: true} },
    //     { owner: this.userId }
    //   ]
    // });
    return Tasks.find({});
  });
}



if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tasks");

  var MAP_ZOOM = 15;

  Meteor.startup(function() {
    GoogleMaps.load({ key: "AIzaSyAnIl72FwOWrtgcOeFCvuOf7AvRAmxRYXA" });
  });

  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    },
    exampleMapOptions: function() {
    // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {
        // Map initialization options
        return {
          center: new google.maps.LatLng(-37.8136, 144.9631),
          zoom: 8
        };
      }
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      //console.log(event);
      // Get value from form element
      var text = event.target.text.value;
      var address = event.target.address.value;
      var type = event.target.type.value;
      // Insert a task into the collection
      Meteor.call("addTask", text, address, type);

      // Clear form
      event.target.text.value = "";
      event.target.address.value = "";
      event.target.type.value = "";
    },
  "change .hide-completed input": function (event) {
    Session.set("hideCompleted", event.target.checked);
    }
  });



  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
<<<<<<< Updated upstream
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
=======
       Meteor.call("deleteTask", this._id);
     },
     "click .reject": function () {
        Meteor.call("deleteTask", this._id);
      },
     "click .toggle-private": function () {
       Meteor.call("setPrivate", this._id, ! this.private);
    },
    "click .accept": function(){
      $(".map-container").show();
>>>>>>> Stashed changes
    }
  });



  Template.body.onCreated(function() {
    var self = this;

    GoogleMaps.ready('map', function(map) {
      var marker;

      // Create and move the marker when latLng changes.
      self.autorun(function() {
        var latLng = Geolocation.latLng();
        if (! latLng)
          return;

        // If the marker doesn't yet exist, create it.
        if (! marker) {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(latLng.lat, latLng.lng),
            map: map.instance
          });
        }
        // The marker already exists, so we'll just change its position.
        else {
          marker.setPosition(latLng);
        }

        // Center and zoom the map view onto the current position.
        map.instance.setCenter(marker.getPosition());
        map.instance.setZoom(MAP_ZOOM);
      });
    });
  });

  Template.map.helpers({
    geolocationError: function() {
      var error = Geolocation.error();
      console.log(error);
      return error && error.message;
    },
    mapOptions: function() {
      var latLng = Geolocation.latLng();
      // Initialize the map once we have the latLng.
      if (GoogleMaps.loaded() && latLng) {
        return {
          center: new google.maps.LatLng(latLng.lat, latLng.lng),
          zoom: MAP_ZOOM
        };
      }
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}



Meteor.methods({
  addTask: function (text,address,type) {
    // Make sure the user is logged in before inserting a task

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      address: address,
      type: type,
      // private : false,
      // username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate) {
  var task = Tasks.findOne(taskId);

  // Make sure only the task owner can make a task private
  if (task.owner !== Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }

  Tasks.update(taskId, { $set: { private: setToPrivate } });
},
  setAccepted: function(taskId){
    var task = Tasks.findOne(taskId);
    Tasks.update(taskId, { $set: { accepted : true } });
  }
});
