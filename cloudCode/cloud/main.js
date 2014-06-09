
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
*/


Parse.Cloud.afterSave("ip", function(request) {
  var IPLogger_config = require('cloud/mandrillapp_config.js');
  var Mandrill = require('mandrill');
  Mandrill.initialize(IPLogger_config.mandrillAppKey);

  console.log('within afterSave for ip');
  console.log(request.object.id);


  var ip = Parse.Object.extend("ip");
  var query = new Parse.Query(ip);
  query.descending("createdAt");
  query.limit(2); // limit to at most 2 results
  query.find({
    success: function(results){
      console.log('success query');
      console.log('got ' + results.length + ' results');
      var newestIp = results[0];
      var olderIp = results[1];
      if (newestIp.get('ip') == olderIp.get('ip') ) {
        // the newest ip and the older one are equal, do nothing.
        console.log('No ip change');
      } else
      {
        console.log('ip change!');
        console.log(Mandrill.initialize);
        console.log(Mandrill.sendEmail);

        Mandrill.sendEmail({
        message: {
          text: "The IP of your server has changed! The new ip is: " + newestIp.get('ip') ,
          subject: "The IP of your server has changed!",
          from_email: "parse@cloudcode.com",
          from_name: "IPLogger",
          to: [
            {
              email: IPLogger_config.your_email,
              name: IPLogger_config.your_name
            }
          ]
        },
        async: true
      },{
        success: function(httpResponse) {
          console.log(httpResponse);
          response.success("Email sent!");
        },
        error: function(httpResponse) {
          console.error(httpResponse);
          response.error("Uh oh, something went wrong");
        }
      });




      }
    },
    error: function (error){
      console.log('no success for query');
      console.error("Got an error " + error.code + " : " + error.message);
    }

  });
  /*
  query.get(request.object.id, {
    // get the newest entry
    success: function(result) {
      console.log('success query');
      console.log(result);
    },
    error: function(error) {
      console.log('no success for query');
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });*/
});
