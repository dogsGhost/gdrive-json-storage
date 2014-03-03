Read/Write JSON via Google Drive API
---

A reusable script leveraging the Google Drive API.

This script:

- Checks if the user has authorized your app to use their drive, if not it prompts the user to do so.
- Checks if there are any files stored in the AppData folder yet, if not it creates an empty JSON file.
- (NYI) *If there is a file in AppData, it is assumed to be the JSON file and its contents are returned as a JSON object.*
- (NYI) *There is a method that accepts a JSON object and will overwrite the stored JSON file with that object via JSON.stringify.*

Currently the script assumes all you're using the GD API for is to store a JSON file in the App Data folder, reading the file and rewriting to it as necessary.

Browser support is untested but should cover all modern browsers.