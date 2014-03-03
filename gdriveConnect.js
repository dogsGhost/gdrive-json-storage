// This is your specific developer ID // console.developers.google.com 
var CLIENT_ID = '334352170524-u7nhfr6ujtkisvfrd0eku5omduh621e5.apps.googleusercontent.com';
// This sets the scope for where on the drive we're working. This script is configured to use the
// Application Data folder // developers.google.com/drive/web/appdata
var SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

// This will store the ID of the user's appData Folder, as its faster to reference by ID than by alias `appdata`.
var APP_ID;
// Store the ID of the primary file we'll use to store data for our app.
var APPDATA_ID;

// Privatize those methods, son.
var gdriveConnect = function () {
  var gdrive = {
    // Confirms if we have pre-existing data.
    haveFile: false,

    // Check if the current user has authorized our app.
    checkAuth: function () {
      gapi.auth.authorize({
       'client_id': CLIENT_ID,
       'scope': SCOPES,
       'immediate': true
      }, gdrive.handleAuthResult);
    },

    // Handle results.
    handleAuthResult: function (authResult) {
      var authButton = document.getElementById('authorizeButton');

      if (authResult && !authResult.error) {
        // Access token has been successfully retrieved, requests can be sent to the api.
console.log('success');
        authButton.style.display = 'none';
        gdrive.checkAppData();
      } else {
console.log('auth failed');        
        // No access token could be retrieved, show the button to start the authorization flow.
        authButton.style.display = 'block';
        authButton.onclick = function () {
            gapi.auth.authorize({
              'client_id': CLIENT_ID,
              'scope': SCOPES,
              'immediate': false
            }, gdrive.handleAuthResult);
        };
      }
    },

    checkAppData: function (argument) {
      // Get information on the appData Folder.
      var request = gapi.client.request({
            'path': '/drive/v2/files/appdata',
            'method': 'GET'
          });

      request.execute(function (response) {
        // Store the appdata ID for later requests.
        APP_ID = response.id;
        // Check if the folder has data in it yet.
        gdrive.checkAppDataFile();
      });
    },

    checkAppDataFile: function () {
      var items;
      // Query for appData Folder contents.
      var request = gapi.client.request({
            'path': '/drive/v2/files/' + APP_ID + '/children',
            'method': 'GET'
          });

      request.execute(function (response) {
        items = response.items;

        if (items.length) {
          // If they have pre-existing data, there should only be 1 item.
          // Set global flag that we're all set here so we don't have to do this again.
          gdrive.haveFile = true;
          // Set ID for our data file.
          APPDATA_ID = items[0].id;

          // Retrieve content from our data file.
          gdrive.getFileContents();

        } else {
console.log('got to make the file');          
          // Otherwise create our app file.
          gdrive.createDataFile(false);
        }
      });
    },

    getFileContents: function () {
console.log(APPDATA_ID, ', we have a file');
    },

    createDataFile: function (callback) {
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      // Info on file we're creating.
      var fileName = 'myAppData.json';
      var contentType = 'application/json';
      var metadata = {
        'title': fileName,
        'mimeType': contentType,
        'parents': [{ 'id': APP_ID }]
      };
      // Initial content is an empty object.
      var initContent = {};
      // base 64 encode our content.
      var base64Data = btoa(JSON.stringify(initContent));

      var multipartRequestBody =
            delimiter + 'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) + delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n\r\n' +
            base64Data + close_delim;

      // Upload the file to the user's gdrive.
      var request = gapi.client.request({
          'path': '/upload/drive/v2/files/',
          'method': 'POST',
          'params': {
            'uploadType': 'multipart'
          },
          'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
          },
          'body': multipartRequestBody
        });
      
      // If callback is false just log the file data.
      if (!callback) {
        callback = function(file) {
          console.log(file);
        };
      }

      // Execute the callback.
      request.execute(callback);
    } // end createDataFile
  };

  return gdrive;
};

 // Called when the client library is loaded to start the auth flow.
function handleClientLoad() {
  window.setTimeout(gdriveConnect().checkAuth, 1);
}