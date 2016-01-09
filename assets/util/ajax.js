/**
 * Created by borm on 07.01.16.
 */
const isObject = (o)=>{
  return (typeof o !== 'object' || o instanceof Array)
};

const isFunction = (f)=>{
  return ( f && typeof f === 'function' );
};

var Ajax = (ops)=> {
  if ( typeof ops === 'undefined' ) {
    console.error('Please pass options!');
    return;
  }

  if ( isObject(ops) ) {
    console.error('Options in not the object!');
    return;
  }
  if(typeof ops == 'string') ops = { url: ops };
  ops.url = ops.url || '';
  ops.method = ops.method || 'get';
  ops.data = ops.data || {};
  var getParams = function(data, url) {
    var arr = [], str;
    for(var name in data) {
      arr.push(name + '=' + encodeURIComponent(data[name]));
    }
    str = arr.join('&');
    if(str != '') {
      return url ? (url.indexOf('?') < 0 ? '?' + str : '&' + str) : str;
    }
    return '';
  };
  var api = {
    host: {},
    process: function(ops) {
      var self = this;
      this.xhr = null;
      if(window.ActiveXObject) { this.xhr = new ActiveXObject('Microsoft.XMLHTTP'); }
      else if(window.XMLHttpRequest) { this.xhr = new XMLHttpRequest(); }
      if(this.xhr) {
        this.xhr.onreadystatechange = function() {
          if(self.xhr.readyState == 4 && self.xhr.status == 200) {
            var result = self.xhr.responseText;
            if(ops.json === true && typeof JSON != 'undefined') {
              result = JSON.parse(result);
            }
            ops.success && ops.success.apply(self.host, [result, self.xhr]);
          } else if(self.xhr.readyState == 4) {
            ops.error && ops.error.apply(self.host, [self.xhr]);
          }
          ops.always && ops.always.apply(self.host, [self.xhr]);
        }
      }
      if(ops.method == 'get') {
        this.xhr.open("GET", ops.url + getParams(ops.data, ops.url), true);
      } else {
        this.xhr.open(ops.method, ops.url, true);
        this.setHeaders({
          'X-Requested-With': 'XMLHttpRequest',
          'Content-type': 'application/x-www-form-urlencoded'
        });
      }
      if(ops.headers && typeof ops.headers == 'object') {
        this.setHeaders(ops.headers);
      }
      setTimeout(function() {
        ops.method == 'get' ? self.xhr.send() : self.xhr.send(getParams(ops.data));
      }, 20);
      return this;
    },
    setHeaders: function(headers) {
      for(var name in headers) {
        this.xhr && this.xhr.setRequestHeader(name, headers[name]);
      }
    }
  };
  return api.process(ops);
};

module.exports = Ajax;

/*
module.exports = (o)=>{

  if ( typeof o === 'undefined' ) {
    console.error('Please pass options!');
    return;
  }

  if ( isObject(o) ) {
    console.error('Options in not the object!');
    return;
  }

  let { url, data, success, error } = o;
  let xhr;

  try {
    xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
    xhr.open(data ? 'POST' : 'GET', url, 1);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
      if ( xhr.readyState > 3 && xhr.status === 200
        && success && typeof isFunction(success) ) {
        success(xhr.responseText, xhr);
      } else {
        let err = {
          status: xhr.status,
          statusText: xhr.statusText
        };
        console.error(err, xhr);
        if ( error && typeof isFunction(error) ) {
          error(err, xhr);
        }
      }
    };
    xhr.send(data)
  } catch (e) {
    if ( error && isFunction(error) ) {
      error(e, xhr);
    } else {
      window.console && console.error(e);
    }
  }

};*/
