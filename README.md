# FreshRealm OAuth 2.0 Client Plugin

jQuery plugin to easily use the FreshRealm OAuth 2.0 service.

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com//jquery-freshrealm-oauth/master/dist/jquery.freshrealm-oauth.min.js
[max]: https://raw.github.com//jquery-freshrealm-oauth/master/dist/jquery.freshrealm-oauth.js

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

  $('#login').click(function () {
    $.freshRealmOAuth().getToken({}, function (error, params) {
      // Deal with error or handle params.access_token appropriately
    });
  });
});
</script>
```
Your redirectUri page will need to handle validating the OAuth access_token.
Note that it will receive a GET query param of nopopup if the OAuth flow redirected instead of using a popup.
Also, if the plugin used the popup flow, after validating the access_token in your redirectUri page you can redirecto to another page which then calls 
`$.freshRealmOAuth.popupHandler();`, which will then trigger your orignal page's `$.freshRealmOAuth().getToken()` callback function.
