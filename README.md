# FreshRealm OAuth 2.0 Client Plugin

jQuery plugin to easily use the FreshRealm OAuth 2.0 service.

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com//jquery-freshrealm-oauth/master/dist/jquery.freshrealm-oauth.min.js
[max]: https://raw.github.com//jquery-freshrealm-oauth/master/dist/jquery.freshrealm-oauth.js

Contact FreshRealm to receive a clientId and client secret. You will need to provide your redirectUri (or the domain of your redirectUris if you will be using multiple).
The client secret should be used server-side to request an access_token (a code will be passed to the redirectUri as a get parameter) and finish the OAuth login process.
This process has been mocked away in the tests within this project.

In your main web page:

```html
<button id="login">Login</button>
<script src="jquery.js"></script>
<script src="dist/freshrealm-oauth.min.js"></script>
<script>
$(function() {
  // Set the freshRealmOAuth options
  $.freshRealmOAuth.options.clientId = 12345678; // Your OAuth client id as assigned by FreshRealm
  $.freshRealmOAuth.options.redirectUri = 'http://localhost:9000/test/freshrealm-oauth-callback.html'; // The url where the OAuth flow should return
  $.freshRealmOAuth.options.authorizationEndpoint = 'http://localhost:9000/test/freshrealm-oauth-server.html'; // The OAuth server url (will varry for testing vs. production)

  // Set up your login button binding
  $('#login').click(function () {
    $.freshRealmOAuth().getToken({}, function (error, params) {
      // Deal with error or handle params.access_token appropriately
    });
  });
});
</script>
```
Your redirectUri page will need to handle requesting the final OAuth access_token by sending the code, clientID, and client secret to the /oauth/accesstoken endpoint of the FreshRealm OAuth server.
Note that it will also receive a GET query param of `nopopup` if the OAuth flow redirected instead of using a popup.
Also, if the plugin used the popup flow, after receiving the access_token in your redirectUri page you can redirec to another page, passing the access_token to it vai a GET param.
If you then call `$.freshRealmOAuth.popupHandler();` within that page it will subsequently trigger your orignal page's `$.freshRealmOAuth().getToken()` callback function.
