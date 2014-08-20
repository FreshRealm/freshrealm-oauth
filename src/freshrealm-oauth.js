/*
 * freshrealm-oauth
 *
 *
 * Copyright (c) 2014 John Grogg
 * Licensed under the MIT license.
 */

(function ($) {
  var REQUIRED_AND_MISSING = false;

  // Main OAuth class
  $.freshRealmOAuth = function (options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.freshRealmOAuth.options, options);

    for (var key in options) {
      var value = options[key];
      if (value === REQUIRED_AND_MISSING) {
        return false;
      }
    }

    var getParams = function() {
        return {
            response_type: options.responseType,
            client_id: options.clientId,
            redirect_uri: options.redirectUri,
            mode: 'signup',
            scope: options.scopes.join(" ")
        };
    };

    // Return OAuth object
    return {
      /**
       * Verifies an access token, picking the appropriate method based on mobile/iOS
       */
      getToken: function (extraParams, popupCallback) {
        if (!$.freshRealmOAuth.mobileDetection().isMobile() && !$.freshRealmOAuth.mobileDetection().isIOS()) {
          this.getTokenByPopup(extraParams).done(function(params) {
            popupCallback(null, params);
          }).fail(function() {
            // Failure getting token from popup.
            popupCallback(new Error("Failed to get token from popup."));
          });
        } else {
          this.getTokenByRedirect(extraParams);
        }
      },

      /**
       * Verifies an access token via redirect flow
       */
      getTokenByRedirect: function (extraParams) {
        // Redirect to oauth server login
        var params = $.extend({}, getParams(), extraParams);
        $.extend(params, { redirect_uri: options.redirectUri + '?nopopup' });
        var url = options.authorizationEndpoint + '?' + $.param(params);

        window.location.href = url;
      },

      /**
       * Verifies an access token asynchronously.
       */
      getTokenByPopup: function(extraParams, popupOptions) {
        var popupWidth = 360;
        var popupHeight = 825; // 750 in signup mode, 600 in login mode
        popupOptions = $.extend({}, {
          name: 'AuthPopup',
          openParams: {
            width: popupWidth,
            height: popupHeight,
            resizable: true,
            scrollbars: true,
            status: true
          }
        }, popupOptions);

        var deferred = $.Deferred();
        var params = $.extend({}, getParams(), extraParams);
        var url = options.authorizationEndpoint + '?' + $.param(params);

        var formatPopupOptions = function(options) {
          var pairs = [];
          for (var key in options) {
            var value = options[key];
            if (value || value === 0) {
              value = value === true ? 'yes' : value;
              pairs.push(key + '=' + value);
            }
          }
          return pairs.join(',');
        };

        // login opens in smaller screen
        if (params.mode === 'login'){
          popupHeight = 550;
        }

        var popup = window.open(url, popupOptions.name, formatPopupOptions(popupOptions.openParams));
        popup.focus();
        // TODO: binding occurs for each reauthentication, leading to leaks for long-running apps.

        // window method used to handle popup return if possible (some browsers don't give visibility)
        window.frOauthListener = function (data) {
          if (data.access_token) {
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }
        };

        // fallback event listener in case window.frOauthListener isn't available within the popup
        $(window).on('message', function(event) {
          if ((event.source === null || event.source === popup) && event.origin === window.location.origin) {
            if (event.data.access_token) {
              deferred.resolve(event.data);
            } else {
              deferred.reject(event.data);
            }
          }
        });

        // TODO: reject deferred if the popup was closed without a message being delivered + maybe offer a timeout

        return deferred.promise();
      }
    };
  };

  /**
   * Oauth Popup Handler
   */
  $.freshRealmOAuth.popupHandler = function () {
    var parseKeyValue = function(/**string*/keyValue) {
        var obj = {}, key_value, key;
        var array = (keyValue || "").split('&');
        for (var i = 0; i < array.length; i++) {
          keyValue = array[i];
          if (keyValue) {
              key_value = keyValue.split('=');
              key = decodeURIComponent(key_value[0]);
              obj[key] = (typeof key_value[1] !== 'undefined') ? decodeURIComponent(key_value[1]) : true;
          }
        }
        return obj;
    };

    var queryString = window.location.search.substring(1);  // preceding ? omitted
    var params = parseKeyValue(queryString);

    // Call window.opener.frOauthListener if possible, otherwise fallback to sending a 'message' event to the opener
    if (typeof window.opener.frOauthListener !== 'undefined') {
      try {
        window.opener.frOauthListener(params);
      } catch (e) {
        window.opener.postMessage(params, "*");
      }
    } else {
      window.opener.postMessage(params, "*");
    }

    window.close();
  };

  $.freshRealmOAuth.mobileDetection = function () {
    var mobile = false;

    (function (a) {
      if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
        mobile = true;
      }
    })(navigator.userAgent||navigator.vendor||window.opera);

    var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );

    return {
      isMobile: function () {
        return mobile;
      },
      isIOS: function () {
        return iOS;
      }
    };
  };

  // Static method default options.
  $.freshRealmOAuth.options = {
    responseType: 'code',
    clientId: REQUIRED_AND_MISSING,
    redirectUri: REQUIRED_AND_MISSING,
    authorizationEndpoint: REQUIRED_AND_MISSING,
    scopes: []
  };

}(jQuery));
