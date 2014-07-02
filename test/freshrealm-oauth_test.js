(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery.freshRealmOAuth without setup', {
    // This will run before each test in this module.

  });

  test('requires setup', function() {
    expect(1);
    strictEqual($.freshRealmOAuth(), false, 'should return false when no options setup');
  });

  module('jQuery.freshRealmOAuth with setup', {
    setup: function () {
      $.freshRealmOAuth.options.clientId = 12345678;
      $.freshRealmOAuth.options.redirectUri = 'http://localhost:9000/test/freshrealm-oauth-callback.html';
      $.freshRealmOAuth.options.authorizationEndpoint = 'http://localhost:9000/test/freshrealm-oauth-server.html';
    }
  });

  test('exists after setup', function () {
    expect(4);
    notStrictEqual($.freshRealmOAuth(), false, 'should not return false when options setup');
    stop();
    $('#login').click(function () {
      $.freshRealmOAuth().getToken({}, function (error, params) {
        ok(!error, 'should not have an error');
        ok(!!params, 'should return params');
        equal(params.access_token, 'abcd1234', 'should have the correct access token');
        start();
      });
    });
    $('#login').click();
  });

}(jQuery));
