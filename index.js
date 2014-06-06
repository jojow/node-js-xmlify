var _ = require('lodash');
_.str = require('underscore.string');



var localname = function(qName) {
  return qName.split(':').slice(-1)[0];
};



var prerender = function(data, config) {
  var c = config || {};

  c.replaceSpecialChars = c.replaceSpecialChars || true;

  _.each(data, function(value, key, list) {
    // value modifications
    if (!_.isString(value)) prerender(value);

    // key modifications
    if (!_.isNumber(key)) {
      // replace special characters
      if (c.replaceSpecialChars) {
        var newKey = key.replace(/[^a-zA-Z0-9]/g, '_');

        if (_.str.startsWith(newKey, '_')) newKey = 'e' + newKey;

        if (key !== newKey) {
          list[newKey] = list[key];
          delete list[key];
        }
      }
    }
  });
};



var postparse = function(data, config) {
  var c = config || {};

  c.removeNamespaceMeta = c.removeNamespaceMeta || true;
  c.removeSchemaLocation = c.removeSchemaLocation || true;
  c.preferLocalName = c.preferLocalName || true;

  _.each(data, function(value, key, list) {
    // value modifications
    if (!_.isString(value)) postparse(value);

    // key modifications
    if (!_.isNumber(key)) {
      if (c.removeNamespaceMeta &&
           (_.str.startsWith(key, 'xmlns') ||
            _.str.endsWith(key, 'targetNamespace'))) {
        delete list[key];
        return;
      }

      if (c.removeSchemaLocation && _.str.endsWith(key, 'schemaLocation')) {
        delete list[key];
        return;
      }

      if (c.preferLocalName) {
        var newKey = localname(key);

        if (newKey !== key) {
          list[newKey] = list[key];
          delete list[key];
        }
      }
    }
  });
};



module.exports = {
  localname: localname,
  prerender: prerender,
  postparse: postparse
};
