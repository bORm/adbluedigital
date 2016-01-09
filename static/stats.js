(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Volumes/www/adbluedigital/assets/stats.js":[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by borm on 06.01.16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _ajax = require('./util/ajax.js');

var _ajax2 = _interopRequireDefault(_ajax);

var _csvToArray = require('./util/csvToArray.js');

var _csvToArray2 = _interopRequireDefault(_csvToArray);

var _localStorage = require('./util/localStorage.js');

var _localStorage2 = _interopRequireDefault(_localStorage);

var _inArray = require('./util/inArray.js');

var _inArray2 = _interopRequireDefault(_inArray);

var _ArrayToObject = require('./util/ArrayToObject.js');

var _ArrayToObject2 = _interopRequireDefault(_ArrayToObject);

var _Each = require('./util/Each.js');

var _Each2 = _interopRequireDefault(_Each);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stats = function () {
  function Stats() {
    _classCallCheck(this, Stats);

    // 2. Кешируем данные в браузере и дальше работаем с дампом локально,
    // если я правильно понял, работаем с localStorage
    // Проверяем наличие данных
    this.statsHeaders = _localStorage2.default.getItem('statsHeaders');
    this.statsData = _localStorage2.default.getItem('statsData');
    // Если данных нет, отправяем запрос на получение
    if (!this.statsHeaders || !this.statsData) {
      this.getData();
    } else {
      this.renderTable();
    }
  }

  _createClass(Stats, [{
    key: 'getData',
    value: function getData() {
      var self = this;
      (0, _ajax2.default)({
        url: 'http://adbluedigital.borm.webko.net.ua:8001/get/stats',
        success: function success(data, res) {
          self.saveData(data, res);
        },
        error: function error(e) {
          (0, _ajax2.default)({
            url: '/static/stats.csv',
            success: function success(data, res) {
              self.saveData(data, res);
            },
            error: function error(e) {
              console.log(e);
            }
          });
        }
      });
    }
  }, {
    key: 'saveData',
    value: function saveData(data, res) {
      // Преобразовуем данные в массив
      var statsArray = (0, _csvToArray2.default)(data);
      this.statsHeaders = JSON.stringify(statsArray.shift());
      this.statsData = JSON.stringify(statsArray);
      statsArray = null;
      // И ложим в локальное хранилище
      // Можно было не обрезать 0-вой индекс и не делить на два фрагмента
      // а положить все сразу, да и собсвенно не проеобразовывать в массив
      _localStorage2.default.setItem('statsHeaders', this.statsHeaders);
      _localStorage2.default.setItem('statsData', this.statsData);
      this.renderTable();
    }
  }, {
    key: 'hierarchy',
    value: function hierarchy() {
      // Парсим данные с localStorage
      this.statsHeaders = JSON.parse(this.statsHeaders);
      this.statsData = JSON.parse(this.statsData);

      // В таблице ТЗ и в 6-ом пункте 'spent - суммируется'
      // сервер прислал ключ 'sent'
      // Опечатка или нет, на всяк случай переименуем
      this.statsHeaders.splice((0, _inArray2.default)('sent', this.statsHeaders), 1, 'spent');

      // Преобразуем наш массив в обьект с иерархией
      // Это можно было сделать и на начальном этапе
      // , когда ложили данные в localStorage
      // , но тогда бы данные занимали больше мегабайт
      return (0, _ArrayToObject2.default)(this.statsHeaders, this.statsData);
    }
  }, {
    key: 'renderTable',
    value: function renderTable() {
      var _this = this;

      this.statsObj = this.hierarchy();
      var blackList = ['adserver_id', 'offers_id', 'partners_id', 'status', 'device', 'cpm', 'conversion', 'roi'];

      var table = '';

      table += '<table>';
      table += '<thead>';
      table += '<tr>';
      table += this.statsHeaders.map(function (column) {
        return (0, _inArray2.default)(column, blackList) === -1 ? '<th>' + column + '</th>' : '';
      }).join('');
      table += '</tr>';
      table += '</thead>';

      // Почистим не нужные данные
      delete this.statsHeaders;
      delete this.statsData;

      table += '<tbody id="tbody">';
      table += '</tbody>';

      table += '</table>';

      document.getElementById('table').innerHTML = table;

      var timestamp = undefined,
          filter = {
        country: [],
        carrier: []
      },
          select = {
        country: document.createElement('select'),
        carrier: document.createElement('select'),
        reset: document.createElement('button')
      };

      var toggleChilds = function toggleChilds(selector, cb) {
        var childs = document.getElementsByClassName(selector),
            len = childs !== null ? childs.length : 0,
            i = 0;
        for (i; i < len; i++) {
          childs[i].classList.toggle('hidden');
          if (cb) {
            cb(childs[i].classList.contains('hidden'), childs[i]);
          }
        }
        return false;
      };

      (0, _Each2.default)(this.statsObj, function (date, dateInfo) {
        timestamp = new Date(date).getTime() / 1000;
        _this.renderTd(Object.assign(dateInfo, {
          date: date,
          country: '',
          carrier: ''
        }), true, function (tr) {
          tr.className = 'j-tr date';
          tr.setAttribute('data-target', timestamp);
          tr.onclick = function () {
            toggleChilds(tr.dataset.target, function (hidden, child) {
              // Если закрываем парент, а чайлды не закрыты то закрываем их тоже
              if (hidden) {
                var childs = document.getElementsByClassName(child.dataset.target),
                    len = childs !== null ? childs.length : 0,
                    i = 0;
                for (i; i < len; i++) {
                  // Можно было б и через свойтво display
                  // , для того что бы при повторном открытии их было видно
                  childs[i].classList.add('hidden');
                }
              }
            });
          };
        });

        (0, _Each2.default)(dateInfo.countries, function (country, countryInfo) {

          if ((0, _inArray2.default)(country, filter.country) === -1) {
            filter.country.push(country);
          }

          _this.renderTd(Object.assign(countryInfo, {
            date: '',
            country: country,
            carrier: ''
          }), true, function (tr) {
            tr.className = 'j-tr hidden country ' + timestamp + ' ' + country.toLowerCase();
            tr.setAttribute('data-target', timestamp + '-' + country.toLowerCase());
            tr.onclick = function () {
              toggleChilds(tr.dataset.target);
            };
          });

          (0, _Each2.default)(countryInfo.carriers, function (carrier, carrierInfo) {
            if ((0, _inArray2.default)(carrier, filter.carrier) === -1) {
              filter.carrier.push(carrier);
            }
            _this.renderTd(Object.assign(carrierInfo, {
              date: '',
              country: '',
              carrier: carrier
            }), false, function (tr) {
              tr.className = 'j-tr hidden carrier ' + timestamp + '-' + country.toLowerCase() + ' ' + carrier.toLowerCase().replace(/ /g, '_');
            });
          });
        });
      });

      filter.country.map(function (country) {
        select.country.innerHTML += '<option value="' + country.toLowerCase() + '">' + country + '</option>';
      });
      filter.carrier.map(function (carrier) {
        select.carrier.innerHTML += '<option value="' + carrier.toLowerCase().replace(/ /g, '_') + '">' + carrier + '</option>';
      });

      select.reset.type = 'button';
      select.reset.innerHTML = 'Reset';

      var onChange = function onChange(e) {
        var childs = document.getElementsByClassName('j-tr'),
            len = childs !== null ? childs.length : 0,
            i = 0;
        for (i; i < len; i++) {
          if (childs[i].classList.contains(e.target.value)) {
            childs[i].style.display = 'table-row';
          } else {
            childs[i].style.display = 'none';
          }
        }
        return false;
      };

      select.country.onchange = onChange;
      select.carrier.onchange = onChange;

      select.reset.onclick = function () {
        var childs = document.getElementsByClassName('j-tr'),
            len = childs !== null ? childs.length : 0,
            i = 0;
        for (i; i < len; i++) {
          childs[i].style.display = null;
        }
        return false;
      };

      document.getElementById('filter').appendChild(select.country);
      document.getElementById('filter').appendChild(select.carrier);
      document.getElementById('filter').appendChild(select.reset);
    }
  }, {
    key: 'renderTd',
    value: function renderTd(data, average, callback) {

      var tr = document.createElement('tr');

      var date = data.date;
      var country = data.country;
      var carrier = data.carrier;
      var views = data.views;
      var bcpm = data.bcpm;
      var spent = data.spent;
      var earned = data.earned;
      var leads = data.leads;

      if (average) {
        var count = bcpm.length,
            sum = 0;
        // вычисляем среднее
        bcpm.map(function (n) {
          sum += n;
        });
        bcpm = Math.round(sum / count * 100) / 100;
      } else {
        bcpm = Math.round(bcpm * 100) / 100;
      }

      spent = Math.round(spent * 100) / 100;
      earned = Math.round(earned * 100) / 100;

      tr.innerHTML += '<td class="date">' + date + '</td>';
      tr.innerHTML += '<td class="country">' + country + '</td>';
      tr.innerHTML += '<td class="carrier">' + carrier + '</td>';
      tr.innerHTML += '<td class="views">' + views + '</td>';
      tr.innerHTML += '<td class="bcpm">' + bcpm + '</td>';
      tr.innerHTML += '<td class="spent">' + spent + '</td>';
      tr.innerHTML += '<td class="earned">' + earned + '</td>';
      tr.innerHTML += '<td class="leads">' + leads + '</td>';

      if (callback) {
        callback(tr);
      }

      //return tr.outerHTML;
      document.getElementById('tbody').appendChild(tr);
    }
  }]);

  return Stats;
}();

new Stats();

},{"./util/ArrayToObject.js":"/Volumes/www/adbluedigital/assets/util/ArrayToObject.js","./util/Each.js":"/Volumes/www/adbluedigital/assets/util/Each.js","./util/ajax.js":"/Volumes/www/adbluedigital/assets/util/ajax.js","./util/csvToArray.js":"/Volumes/www/adbluedigital/assets/util/csvToArray.js","./util/inArray.js":"/Volumes/www/adbluedigital/assets/util/inArray.js","./util/localStorage.js":"/Volumes/www/adbluedigital/assets/util/localStorage.js"}],"/Volumes/www/adbluedigital/assets/util/ArrayToObject.js":[function(require,module,exports){
'use strict';

/**
 * Created by borm on 09.01.16.
 */
module.exports = function (headers, array) {
  var date = undefined,
      country = undefined,
      carrier = undefined;

  return array.reduce(function (obj, item) {

    item = item.reduce(function (o, i, k) {
      o[headers[k]] = i;
      return o;
    }, {});

    item.views = parseFloat(item.views);
    item.bcpm = parseFloat(item.bcpm);
    item.spent = parseFloat(item.spent);
    item.earned = parseFloat(item.earned);
    item.leads = parseFloat(item.leads);

    date = obj[item.date];
    if (!date) {
      date = obj[item.date] = {
        date: item.date,
        countries: {},
        views: 0,
        bcpm: [],
        spent: 0,
        earned: 0,
        leads: 0
      };
    }
    date.views += item.views;
    date.bcpm.push(item.bcpm);
    date.spent += item.spent;
    date.earned += item.earned;
    date.leads += item.leads;

    country = date['countries'][item.country];
    if (!country) {
      country = date['countries'][item.country] = {
        carriers: {},
        views: 0,
        bcpm: [],
        spent: 0,
        earned: 0,
        leads: 0
      };
    }
    country.views += item.views;
    country.bcpm.push(item.bcpm);
    country.spent += item.spent;
    country.earned += item.earned;
    country.leads += item.leads;

    carrier = country['carriers'][item.carrier];
    if (!carrier) {
      carrier = country['carriers'][item.carrier] = {
        date: item.date,
        country: item.country,
        carrier: item.carrier,
        views: item.views,
        bcpm: item.bcpm,
        spent: item.spent,
        earned: item.earned,
        leads: item.leads
      };
    } else {
      carrier.views += item.views;
      //carrier.bcpm += item.bcpm
      carrier.spent += item.spent;
      carrier.earned += item.earned;
      carrier.leads += item.leads;
    }
    return obj;
  }, {});
};

},{}],"/Volumes/www/adbluedigital/assets/util/Each.js":[function(require,module,exports){
"use strict";

/**
 * Created by borm on 09.01.16.
 */
module.exports = function (obj, callback) {
  for (var i in obj) {
    if (callback.call(obj[i], i, obj[i]) === false) {
      break;
    }
  }
};

},{}],"/Volumes/www/adbluedigital/assets/util/ajax.js":[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Created by borm on 07.01.16.
 */
var isObject = function isObject(o) {
  return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) !== 'object' || o instanceof Array;
};

var isFunction = function isFunction(f) {
  return f && typeof f === 'function';
};

var Ajax = function Ajax(ops) {
  if (typeof ops === 'undefined') {
    console.error('Please pass options!');
    return;
  }

  if (isObject(ops)) {
    console.error('Options in not the object!');
    return;
  }
  if (typeof ops == 'string') ops = { url: ops };
  ops.url = ops.url || '';
  ops.method = ops.method || 'get';
  ops.data = ops.data || {};
  var getParams = function getParams(data, url) {
    var arr = [],
        str;
    for (var name in data) {
      arr.push(name + '=' + encodeURIComponent(data[name]));
    }
    str = arr.join('&');
    if (str != '') {
      return url ? url.indexOf('?') < 0 ? '?' + str : '&' + str : str;
    }
    return '';
  };
  var api = {
    host: {},
    process: function process(ops) {
      var self = this;
      this.xhr = null;
      if (window.ActiveXObject) {
        this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
      } else if (window.XMLHttpRequest) {
        this.xhr = new XMLHttpRequest();
      }
      if (this.xhr) {
        this.xhr.onreadystatechange = function () {
          if (self.xhr.readyState == 4 && self.xhr.status == 200) {
            var result = self.xhr.responseText;
            if (ops.json === true && typeof JSON != 'undefined') {
              result = JSON.parse(result);
            }
            ops.success && ops.success.apply(self.host, [result, self.xhr]);
          } else if (self.xhr.readyState == 4) {
            ops.error && ops.error.apply(self.host, [self.xhr]);
          }
          ops.always && ops.always.apply(self.host, [self.xhr]);
        };
      }
      if (ops.method == 'get') {
        this.xhr.open("GET", ops.url + getParams(ops.data, ops.url), true);
      } else {
        this.xhr.open(ops.method, ops.url, true);
        this.setHeaders({
          'X-Requested-With': 'XMLHttpRequest',
          'Content-type': 'application/x-www-form-urlencoded'
        });
      }
      if (ops.headers && _typeof(ops.headers) == 'object') {
        this.setHeaders(ops.headers);
      }
      setTimeout(function () {
        ops.method == 'get' ? self.xhr.send() : self.xhr.send(getParams(ops.data));
      }, 20);
      return this;
    },
    setHeaders: function setHeaders(headers) {
      for (var name in headers) {
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

},{}],"/Volumes/www/adbluedigital/assets/util/csvToArray.js":[function(require,module,exports){
"use strict";

/**
 * Created by borm on 08.01.16.
 */
module.exports = function (strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ",";
  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
  // Delimiters.
  "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
  // Quoted fields.
  "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
  // Standard fields.
  "([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");
  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];
  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec(strData)) {
    // фикс, если пустая строка
    if (!arrMatches[2] && !arrMatches[3]) {
      break;
    }
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      var strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
    } else {
      // We found a non-quoted value.
      var strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  // Return the parsed data.
  return arrData;
};

},{}],"/Volumes/www/adbluedigital/assets/util/inArray.js":[function(require,module,exports){
"use strict";

/**
 * Created by borm on 08.01.16.
 */
module.exports = function (elem, array) {
  if (array.indexOf) {
    return array.indexOf(elem);
  }

  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i] === elem) {
      return i;
    }
  }

  return -1;
};

},{}],"/Volumes/www/adbluedigital/assets/util/localStorage.js":[function(require,module,exports){
'use strict';

/**
 * Created by borm on 08.01.16.
 */
module.exports = function () {
  try {
    if ('localStorage' in window && window['localStorage'] !== null) return localStorage;
  } catch (e) {
    return false;
  }
}();

},{}]},{},["/Volumes/www/adbluedigital/assets/stats.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc3RhdHMuanMiLCJhc3NldHMvdXRpbC9BcnJheVRvT2JqZWN0LmpzIiwiYXNzZXRzL3V0aWwvRWFjaC5qcyIsImFzc2V0cy91dGlsL2FqYXguanMiLCJhc3NldHMvdXRpbC9jc3ZUb0FycmF5LmpzIiwiYXNzZXRzL3V0aWwvaW5BcnJheS5qcyIsImFzc2V0cy91dGlsL2xvY2FsU3RvcmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNVTSxLQUFLO0FBQ1QsV0FESSxLQUFLLEdBQ0s7MEJBRFYsS0FBSzs7Ozs7QUFLUCxRQUFJLENBQUMsWUFBWSxHQUFHLHVCQUFhLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN6RCxRQUFJLENBQUMsU0FBUyxHQUFHLHVCQUFhLE9BQU8sQ0FBQyxXQUFXLENBQUM7O0FBQUMsQUFFbkQsUUFBSyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFHO0FBQzNDLFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQixNQUFNO0FBQ0wsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCO0dBQ0Y7O2VBYkcsS0FBSzs7OEJBZUE7QUFDUCxVQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsMEJBQUs7QUFDSCxXQUFHLEVBQUUsdURBQXVEO0FBQzVELGVBQU8sRUFBRSxpQkFBQyxJQUFJLEVBQUUsR0FBRyxFQUFHO0FBQ3BCLGNBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1NBQ3pCO0FBQ0QsYUFBSyxFQUFFLGVBQUMsQ0FBQyxFQUFHO0FBQ1YsOEJBQUs7QUFDSCxlQUFHLEVBQUUsbUJBQW1CO0FBQ3hCLG1CQUFPLEVBQUUsaUJBQUMsSUFB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RUFBRSxLQUFLLEVBQUc7QUFDOUIsTUFBSyxLQUFLLENBQUMsT0FBTyxFQUFHO0FBQ25CLFdBQU8sS0FBSyxDQUFDLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztHQUM5Qjs7QUFFRCxPQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFHO0FBQ3hELFFBQUssS0FBSyxDQUFFLENBQUMsQ0FBRSxLQUFLLElBQUksRUFBRztBQUN6QixhQUFPLENBQUMsQ0FBQztLQUNWO0dBQ0Y7O0FBRUQsU0FBTyxDQUFDLENBQUMsQ0FBQztDQUNYLENBQUM7Ozs7Ozs7O0FDWkYsTUFBTSxDQUFDLE9BQU8sR0FBRyxBQUFDLFlBQUk7QUFDcEIsTUFBSTtBQUNGLFFBQUksY0FBYyxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSSxFQUFFLE9BQU8sWUFBWSxDQUFDO0dBQ3RGLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0YsRUFBRyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ3JlYXRlZCBieSBib3JtIG9uIDA2LjAxLjE2LlxuICovXG5pbXBvcnQgYWpheCBmcm9tICcuL3V0aWwvYWpheC5qcyc7XG5pbXBvcnQgY3N2VG9BcnJheSBmcm9tICcuL3V0aWwvY3N2VG9BcnJheS5qcyc7XG5pbXBvcnQgbG9jYWxTdG9yYWdlIGZyb20gJy4vdXRpbC9sb2NhbFN0b3JhZ2UuanMnO1xuaW1wb3J0IGluQXJyYXkgZnJvbSAnLi91dGlsL2luQXJyYXkuanMnO1xuaW1wb3J0IEFycmF5VG9PYmplY3QgZnJvbSAnLi91dGlsL0FycmF5VG9PYmplY3QuanMnO1xuaW1wb3J0IEVhY2ggZnJvbSAnLi91dGlsL0VhY2guanMnO1xuXG5jbGFzcyBTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIDIuINCa0LXRiNC40YDRg9C10Lwg0LTQsNC90L3Ri9C1INCyINCx0YDQsNGD0LfQtdGA0LUg0Lgg0LTQsNC70YzRiNC1INGA0LDQsdC+0YLQsNC10Lwg0YEg0LTQsNC80L/QvtC8INC70L7QutCw0LvRjNC90L4sXG4gICAgLy8g0LXRgdC70Lgg0Y8g0L/RgNCw0LLQuNC70YzQvdC+INC/0L7QvdGP0LssINGA0LDQsdC+0YLQsNC10Lwg0YEgbG9jYWxTdG9yYWdlXG4gICAgLy8g0J/RgNC+0LLQtdGA0Y/QtdC8INC90LDQu9C40YfQuNC1INC00LDQvdC90YvRhVxuICAgIHRoaXMuc3RhdHNIZWFkZXJzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YXRzSGVhZGVycycpO1xuICAgIHRoaXMuc3RhdHNEYXRhID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YXRzRGF0YScpO1xuICAgIC8vINCV0YHQu9C4INC00LDQvdC90YvRhSDQvdC10YIsINC+0YLQv9GA0LDQstGP0LXQvCDQt9Cw0L/RgNC+0YEg0L3QsCDQv9C+0LvRg9GH0LXQvdC40LVcbiAgICBpZiAoICF0aGlzLnN0YXRzSGVhZGVycyB8fCAhdGhpcy5zdGF0c0RhdGEgKSB7XG4gICAgICB0aGlzLmdldERhdGEoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJUYWJsZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldERhdGEoKXtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgYWpheCh7XG4gICAgICB1cmw6ICdodHRwOi8vYWRibHVlZGlnaXRhbC5ib3JtLndlYmtvLm5ldC51YTo4MDAxL2dldC9zdGF0cycsXG4gICAgICBzdWNjZXNzOiAoZGF0YSwgcmVzKT0+e1xuICAgICAgICBzZWxmLnNhdmVEYXRhKGRhdGEsIHJlcylcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKGUpPT57XG4gICAgICAgIGFqYXgoe1xuICAgICAgICAgIHVybDogJy9zdGF0aWMvc3RhdHMuY3N2JyxcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSwgcmVzKT0+e1xuICAgICAgICAgICAgc2VsZi5zYXZlRGF0YShkYXRhLCByZXMpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogKGUpPT57XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzYXZlRGF0YShkYXRhLCByZXMpIHtcbiAgICAvLyDQn9GA0LXQvtCx0YDQsNC30L7QstGD0LXQvCDQtNCw0L3QvdGL0LUg0LIg0LzQsNGB0YHQuNCyXG4gICAgbGV0IHN0YXRzQXJyYXkgPSBjc3ZUb0FycmF5KGRhdGEpO1xuICAgIHRoaXMuc3RhdHNIZWFkZXJzID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICBzdGF0c0FycmF5LnNoaWZ0KClcbiAgICApO1xuICAgIHRoaXMuc3RhdHNEYXRhID0gSlNPTi5zdHJpbmdpZnkoc3RhdHNBcnJheSk7XG4gICAgc3RhdHNBcnJheSA9IG51bGw7XG4gICAgLy8g0Jgg0LvQvtC20LjQvCDQsiDQu9C+0LrQsNC70YzQvdC+0LUg0YXRgNCw0L3QuNC70LjRidC1XG4gICAgLy8g0JzQvtC20L3QviDQsdGL0LvQviDQvdC1INC+0LHRgNC10LfQsNGC0YwgMC3QstC+0Lkg0LjQvdC00LXQutGBINC4INC90LUg0LTQtdC70LjRgtGMINC90LAg0LTQstCwINGE0YDQsNCz0LzQtdC90YLQsFxuICAgIC8vINCwINC/0L7Qu9C+0LbQuNGC0Ywg0LLRgdC1INGB0YDQsNC30YMsINC00LAg0Lgg0YHQvtCx0YHQstC10L3QvdC+INC90LUg0L/RgNC+0LXQvtCx0YDQsNC30L7QstGL0LLQsNGC0Ywg0LIg0LzQsNGB0YHQuNCyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAnc3RhdHNIZWFkZXJzJ1xuICAgICAgLCB0aGlzLnN0YXRzSGVhZGVyc1xuICAgICk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAnc3RhdHNEYXRhJ1xuICAgICAgLCB0aGlzLnN0YXRzRGF0YVxuICAgICk7XG4gICAgdGhpcy5yZW5kZXJUYWJsZSgpO1xuICB9XG5cbiAgaGllcmFyY2h5KCkge1xuICAgIC8vINCf0LDRgNGB0LjQvCDQtNCw0L3QvdGL0LUg0YEgbG9jYWxTdG9yYWdlXG4gICAgdGhpcy5zdGF0c0hlYWRlcnMgPSBKU09OLnBhcnNlKHRoaXMuc3RhdHNIZWFkZXJzKTtcbiAgICB0aGlzLnN0YXRzRGF0YSA9IEpTT04ucGFyc2UodGhpcy5zdGF0c0RhdGEpO1xuXG4gICAgLy8g0JIg0YLQsNCx0LvQuNGG0LUg0KLQlyDQuCDQsiA2LdC+0Lwg0L/Rg9C90LrRgtC1ICdzcGVudCAtINGB0YPQvNC80LjRgNGD0LXRgtGB0Y8nXG4gICAgLy8g0YHQtdGA0LLQtdGAINC/0YDQuNGB0LvQsNC7INC60LvRjtGHICdzZW50J1xuICAgIC8vINCe0L/QtdGH0LDRgtC60LAg0LjQu9C4INC90LXRgiwg0L3QsCDQstGB0Y/QuiDRgdC70YPRh9Cw0Lkg0L/QtdGA0LXQuNC80LXQvdGD0LXQvFxuICAgIHRoaXMuc3RhdHNIZWFkZXJzLnNwbGljZShpbkFycmF5KCdzZW50Jyx0aGlzLnN0YXRzSGVhZGVycyksIDEsICdzcGVudCcpO1xuXG4gICAgLy8g0J/RgNC10L7QsdGA0LDQt9GD0LXQvCDQvdCw0Ygg0LzQsNGB0YHQuNCyINCyINC+0LHRjNC10LrRgiDRgSDQuNC10YDQsNGA0YXQuNC10LlcbiAgICAvLyDQrdGC0L4g0LzQvtC20L3QviDQsdGL0LvQviDRgdC00LXQu9Cw0YLRjCDQuCDQvdCwINC90LDRh9Cw0LvRjNC90L7QvCDRjdGC0LDQv9C1XG4gICAgLy8gLCDQutC+0LPQtNCwINC70L7QttC40LvQuCDQtNCw0L3QvdGL0LUg0LIgbG9jYWxTdG9yYWdlXG4gICAgLy8gLCDQvdC+INGC0L7Qs9C00LAg0LHRiyDQtNCw0L3QvdGL0LUg0LfQsNC90LjQvNCw0LvQuCDQsdC+0LvRjNGI0LUg0LzQtdCz0LDQsdCw0LnRglxuICAgIHJldHVybiBBcnJheVRvT2JqZWN0KHRoaXMuc3RhdHNIZWFkZXJzLCB0aGlzLnN0YXRzRGF0YSk7XG4gIH1cblxuICByZW5kZXJUYWJsZSgpe1xuICAgIHRoaXMuc3RhdHNPYmogPSB0aGlzLmhpZXJhcmNoeSgpO1xuICAgIGxldCBibGFja0xpc3QgPSBbXG4gICAgICAnYWRzZXJ2ZXJfaWQnLCAnb2ZmZXJzX2lkJywgJ3BhcnRuZXJzX2lkJywgJ3N0YXR1cycsICdkZXZpY2UnLCAnY3BtJywgJ2NvbnZlcnNpb24nLCAncm9pJ1xuICAgIF07XG5cbiAgICBsZXQgdGFibGUgPSAnJztcblxuICAgIHRhYmxlICs9ICc8dGFibGU+JztcbiAgICB0YWJsZSArPSAnPHRoZWFkPic7XG4gICAgdGFibGUgKz0gJzx0cj4nO1xuICAgIHRhYmxlICs9IHRoaXMuc3RhdHNIZWFkZXJzLm1hcCgoY29sdW1uKT0+e1xuICAgICAgcmV0dXJuIGluQXJyYXkoY29sdW1uLCBibGFja0xpc3QpID09PSAtMSA/ICc8dGg+JyArIGNvbHVtbiArICc8L3RoPicgOiAnJztcbiAgICB9KS5qb2luKCcnKTtcbiAgICB0YWJsZSArPSAnPC90cj4nO1xuICAgIHRhYmxlICs9ICc8L3RoZWFkPic7XG5cbiAgICAvLyDQn9C+0YfQuNGB0YLQuNC8INC90LUg0L3Rg9C20L3Ri9C1INC00LDQvdC90YvQtVxuICAgIGRlbGV0ZSB0aGlzLnN0YXRzSGVhZGVycztcbiAgICBkZWxldGUgdGhpcy5zdGF0c0RhdGE7XG5cbiAgICB0YWJsZSArPSAnPHRib2R5IGlkPVwidGJvZHlcIj4nO1xuICAgIHRhYmxlICs9ICc8L3Rib2R5Pic7XG5cbiAgICB0YWJsZSArPSAnPC90YWJsZT4nO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYmxlJykuaW5uZXJIVE1MID0gdGFibGU7XG5cbiAgICBsZXQgdGltZXN0YW1wXG4gICAgICAsIGZpbHRlciA9IHtcbiAgICAgICAgY291bnRyeTogW10sXG4gICAgICAgIGNhcnJpZXI6IFtdXG4gICAgICB9XG4gICAgICAsIHNlbGVjdCA9IHtcbiAgICAgICAgY291bnRyeTogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0JyksXG4gICAgICAgIGNhcnJpZXI6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpLFxuICAgICAgICByZXNldDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgICAgIH07XG5cbiAgICBsZXQgdG9nZ2xlQ2hpbGRzID0gKHNlbGVjdG9yLCBjYik9PntcbiAgICAgIGxldCBjaGlsZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNlbGVjdG9yKVxuICAgICAgICAsIGxlbiA9IGNoaWxkcyAhPT0gbnVsbCA/IGNoaWxkcy5sZW5ndGggOiAwLCBpID0gMDtcbiAgICAgIGZvcihpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2hpbGRzW2ldLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICAgICAgICBpZiAoIGNiICkge1xuICAgICAgICAgIGNiKGNoaWxkc1tpXS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpLCBjaGlsZHNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEVhY2godGhpcy5zdGF0c09iaiwgKGRhdGUsIGRhdGVJbmZvKT0+e1xuICAgICAgdGltZXN0YW1wID0gKG5ldyBEYXRlKGRhdGUpLmdldFRpbWUoKS8xMDAwKTtcbiAgICAgIHRoaXMucmVuZGVyVGQoT2JqZWN0LmFzc2lnbihkYXRlSW5mbywge1xuICAgICAgICBkYXRlOiBkYXRlLFxuICAgICAgICBjb3VudHJ5OiAnJyxcbiAgICAgICAgY2FycmllcjogJydcbiAgICAgIH0pLCB0cnVlLCAodHIpPT57XG4gICAgICAgIHRyLmNsYXNzTmFtZSA9ICdqLXRyIGRhdGUnO1xuICAgICAgICB0ci5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0JywgdGltZXN0YW1wKTtcbiAgICAgICAgdHIub25jbGljayA9ICgpPT57XG4gICAgICAgICAgdG9nZ2xlQ2hpbGRzKFxuICAgICAgICAgICAgdHIuZGF0YXNldC50YXJnZXRcbiAgICAgICAgICAgICwgKGhpZGRlbiwgY2hpbGQpPT57IC8vINCV0YHQu9C4INC30LDQutGA0YvQstCw0LXQvCDQv9Cw0YDQtdC90YIsINCwINGH0LDQudC70LTRiyDQvdC1INC30LDQutGA0YvRgtGLINGC0L4g0LfQsNC60YDRi9Cy0LDQtdC8INC40YUg0YLQvtC20LVcbiAgICAgICAgICAgIGlmICggaGlkZGVuICkge1xuICAgICAgICAgICAgICBsZXQgY2hpbGRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjaGlsZC5kYXRhc2V0LnRhcmdldClcbiAgICAgICAgICAgICAgICAsIGxlbiA9IGNoaWxkcyAhPT0gbnVsbCA/IGNoaWxkcy5sZW5ndGggOiAwLCBpID0gMDtcbiAgICAgICAgICAgICAgZm9yKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIC8vINCc0L7QttC90L4g0LHRi9C70L4g0LEg0Lgg0YfQtdGA0LXQtyDRgdCy0L7QudGC0LLQviBkaXNwbGF5XG4gICAgICAgICAgICAgICAgLy8gLCDQtNC70Y8g0YLQvtCz0L4g0YfRgtC+INCx0Ysg0L/RgNC4INC/0L7QstGC0L7RgNC90L7QvCDQvtGC0LrRgNGL0YLQuNC4INC40YUg0LHRi9C70L4g0LLQuNC00L3QvlxuICAgICAgICAgICAgICAgIGNoaWxkc1tpXS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgRWFjaChkYXRlSW5mby5jb3VudHJpZXMsIChjb3VudHJ5LCBjb3VudHJ5SW5mbyk9PntcblxuICAgICAgICBpZiAoIGluQXJyYXkoY291bnRyeSwgZmlsdGVyLmNvdW50cnkpID09PSAtMSApIHtcbiAgICAgICAgICBmaWx0ZXIuY291bnRyeS5wdXNoKGNvdW50cnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW5kZXJUZChPYmplY3QuYXNzaWduKGNvdW50cnlJbmZvLCB7XG4gICAgICAgICAgZGF0ZTogJycsXG4gICAgICAgICAgY291bnRyeTogY291bnRyeSxcbiAgICAgICAgICBjYXJyaWVyOiAnJ1xuICAgICAgICB9KSwgdHJ1ZSwgKHRyKT0+e1xuICAgICAgICAgIHRyLmNsYXNzTmFtZSA9ICdqLXRyIGhpZGRlbiBjb3VudHJ5ICcgKyB0aW1lc3RhbXAgKyAnICcgKyBjb3VudHJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgdHIuc2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcsIHRpbWVzdGFtcCArICctJyArIGNvdW50cnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgdHIub25jbGljayA9ICgpPT57XG4gICAgICAgICAgICB0b2dnbGVDaGlsZHModHIuZGF0YXNldC50YXJnZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgRWFjaChjb3VudHJ5SW5mby5jYXJyaWVycywgKGNhcnJpZXIsIGNhcnJpZXJJbmZvKT0+e1xuICAgICAgICAgIGlmICggaW5BcnJheShjYXJyaWVyLCBmaWx0ZXIuY2FycmllcikgPT09IC0xICkge1xuICAgICAgICAgICAgZmlsdGVyLmNhcnJpZXIucHVzaChjYXJyaWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5yZW5kZXJUZChPYmplY3QuYXNzaWduKGNhcnJpZXJJbmZvLCB7XG4gICAgICAgICAgICBkYXRlOiAnJyxcbiAgICAgICAgICAgIGNvdW50cnk6ICcnLFxuICAgICAgICAgICAgY2FycmllcjogY2FycmllclxuICAgICAgICAgIH0pLCBmYWxzZSwgKHRyKT0+e1xuICAgICAgICAgICAgdHIuY2xhc3NOYW1lID0gJ2otdHIgaGlkZGVuIGNhcnJpZXIgJyArIHRpbWVzdGFtcCArICctJyArIGNvdW50cnkudG9Mb3dlckNhc2UoKSArICcgJyArIGNhcnJpZXIudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8gL2csICdfJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZpbHRlci5jb3VudHJ5Lm1hcCgoY291bnRyeSk9PntcbiAgICAgIHNlbGVjdC5jb3VudHJ5LmlubmVySFRNTCArPVxuICAgICAgICAnPG9wdGlvbiB2YWx1ZT1cIicrIGNvdW50cnkudG9Mb3dlckNhc2UoKSArJ1wiPicrIGNvdW50cnkgKyc8L29wdGlvbj4nXG4gICAgfSk7XG4gICAgZmlsdGVyLmNhcnJpZXIubWFwKChjYXJyaWVyKT0+e1xuICAgICAgc2VsZWN0LmNhcnJpZXIuaW5uZXJIVE1MICs9XG4gICAgICAgICc8b3B0aW9uIHZhbHVlPVwiJysgY2Fycmllci50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyAvZywgJ18nKSArJ1wiPicrIGNhcnJpZXIgKyc8L29wdGlvbj4nXG4gICAgfSk7XG5cbiAgICBzZWxlY3QucmVzZXQudHlwZSA9ICdidXR0b24nO1xuICAgIHNlbGVjdC5yZXNldC5pbm5lckhUTUwgPSAnUmVzZXQnO1xuXG4gICAgbGV0IG9uQ2hhbmdlID0gKGUpPT57XG4gICAgICBsZXQgY2hpbGRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnai10cicpXG4gICAgICAgICwgbGVuID0gY2hpbGRzICE9PSBudWxsID8gY2hpbGRzLmxlbmd0aCA6IDAsIGkgPSAwO1xuICAgICAgZm9yKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoIGNoaWxkc1tpXS5jbGFzc0xpc3QuY29udGFpbnMoZS50YXJnZXQudmFsdWUpICkge1xuICAgICAgICAgIGNoaWxkc1tpXS5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlLXJvdyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hpbGRzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgc2VsZWN0LmNvdW50cnkub25jaGFuZ2UgPSBvbkNoYW5nZTtcbiAgICBzZWxlY3QuY2Fycmllci5vbmNoYW5nZSA9IG9uQ2hhbmdlO1xuXG4gICAgc2VsZWN0LnJlc2V0Lm9uY2xpY2sgPSAoKT0+e1xuICAgICAgbGV0IGNoaWxkcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2otdHInKVxuICAgICAgICAsIGxlbiA9IGNoaWxkcyAhPT0gbnVsbCA/IGNoaWxkcy5sZW5ndGggOiAwLCBpID0gMDtcbiAgICAgIGZvcihpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2hpbGRzW2ldLnN0eWxlLmRpc3BsYXkgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsdGVyJykuYXBwZW5kQ2hpbGQoc2VsZWN0LmNvdW50cnkpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWx0ZXInKS5hcHBlbmRDaGlsZChzZWxlY3QuY2Fycmllcik7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcicpLmFwcGVuZENoaWxkKHNlbGVjdC5yZXNldCk7XG5cbiAgfVxuXG4gIHJlbmRlclRkKGRhdGEsIGF2ZXJhZ2UsIGNhbGxiYWNrKSB7XG5cbiAgICBsZXQgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuXG4gICAgbGV0IHtcbiAgICAgICAgZGF0ZVxuICAgICAgLCBjb3VudHJ5XG4gICAgICAsIGNhcnJpZXJcbiAgICAgICwgdmlld3NcbiAgICAgICwgYmNwbVxuICAgICAgLCBzcGVudFxuICAgICAgLCBlYXJuZWRcbiAgICAgICwgbGVhZHNcbiAgICAgIH0gPSBkYXRhO1xuXG4gICAgaWYgKCBhdmVyYWdlICkge1xuICAgICAgbGV0IGNvdW50ID0gYmNwbS5sZW5ndGhcbiAgICAgICAgLCBzdW0gPSAwO1xuICAgICAgLy8g0LLRi9GH0LjRgdC70Y/QtdC8INGB0YDQtdC00L3QtdC1XG4gICAgICBiY3BtLm1hcCgobik9PntzdW0gKz0gbn0pO1xuICAgICAgYmNwbSA9IE1hdGgucm91bmQoc3VtL2NvdW50ICogMTAwKSAvIDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgYmNwbSA9IE1hdGgucm91bmQoYmNwbSAqIDEwMCkgLyAxMDA7XG4gICAgfVxuXG4gICAgc3BlbnQgPSBNYXRoLnJvdW5kKHNwZW50ICogMTAwKSAvIDEwMDtcbiAgICBlYXJuZWQgPSBNYXRoLnJvdW5kKGVhcm5lZCAqIDEwMCkgLyAxMDA7XG5cbiAgICB0ci5pbm5lckhUTUwgKz0gJzx0ZCBjbGFzcz1cImRhdGVcIj4nKyBkYXRlICsnPC90ZD4nO1xuICAgIHRyLmlubmVySFRNTCArPSAnPHRkIGNsYXNzPVwiY291bnRyeVwiPicrIGNvdW50cnkgKyc8L3RkPic7XG4gICAgdHIuaW5uZXJIVE1MICs9ICc8dGQgY2xhc3M9XCJjYXJyaWVyXCI+JysgY2FycmllciArJzwvdGQ+JztcbiAgICB0ci5pbm5lckhUTUwgKz0gJzx0ZCBjbGFzcz1cInZpZXdzXCI+Jysgdmlld3MgKyc8L3RkPic7XG4gICAgdHIuaW5uZXJIVE1MICs9ICc8dGQgY2xhc3M9XCJiY3BtXCI+JysgYmNwbSArJzwvdGQ+JztcbiAgICB0ci5pbm5lckhUTUwgKz0gJzx0ZCBjbGFzcz1cInNwZW50XCI+Jysgc3BlbnQgKyc8L3RkPic7XG4gICAgdHIuaW5uZXJIVE1MICs9ICc8dGQgY2xhc3M9XCJlYXJuZWRcIj4nKyBlYXJuZWQgKyc8L3RkPic7XG4gICAgdHIuaW5uZXJIVE1MICs9ICc8dGQgY2xhc3M9XCJsZWFkc1wiPicrIGxlYWRzICsnPC90ZD4nO1xuXG4gICAgaWYgKCBjYWxsYmFjayApIHtcbiAgICAgIGNhbGxiYWNrKHRyKTtcbiAgICB9XG5cbiAgICAvL3JldHVybiB0ci5vdXRlckhUTUw7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rib2R5JykuYXBwZW5kQ2hpbGQodHIpO1xuICB9XG59XG5cbm5ldyBTdGF0cygpOyIsIi8qKlxuICogQ3JlYXRlZCBieSBib3JtIG9uIDA5LjAxLjE2LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChoZWFkZXJzLCBhcnJheSk9PntcbiAgbGV0IGRhdGUsIGNvdW50cnksIGNhcnJpZXI7XG5cbiAgcmV0dXJuIGFycmF5LnJlZHVjZSgob2JqLCBpdGVtKT0+e1xuXG4gICAgaXRlbSA9IGl0ZW0ucmVkdWNlKChvLCBpLCBrKT0+e1xuICAgICAgb1toZWFkZXJzW2tdXSA9IGk7XG4gICAgICByZXR1cm4gbztcbiAgICB9LCB7fSk7XG5cbiAgICBpdGVtLnZpZXdzID0gcGFyc2VGbG9hdChpdGVtLnZpZXdzKTtcbiAgICBpdGVtLmJjcG0gPSBwYXJzZUZsb2F0KGl0ZW0uYmNwbSk7XG4gICAgaXRlbS5zcGVudCA9IHBhcnNlRmxvYXQoaXRlbS5zcGVudCk7XG4gICAgaXRlbS5lYXJuZWQgPSBwYXJzZUZsb2F0KGl0ZW0uZWFybmVkKTtcbiAgICBpdGVtLmxlYWRzID0gcGFyc2VGbG9hdChpdGVtLmxlYWRzKTtcblxuICAgIGRhdGUgPSBvYmpbaXRlbS5kYXRlXTtcbiAgICBpZiAoICFkYXRlICkge1xuICAgICAgZGF0ZSA9IG9ialtpdGVtLmRhdGVdID0ge1xuICAgICAgICBkYXRlOiBpdGVtLmRhdGVcbiAgICAgICAgLCBjb3VudHJpZXM6IHt9XG4gICAgICAgICwgdmlld3M6IDBcbiAgICAgICAgLCBiY3BtOiBbXVxuICAgICAgICAsIHNwZW50OiAwXG4gICAgICAgICwgZWFybmVkOiAwXG4gICAgICAgICwgbGVhZHM6IDBcbiAgICAgIH07XG4gICAgfVxuICAgIGRhdGUudmlld3MgKz0gaXRlbS52aWV3cztcbiAgICBkYXRlLmJjcG0ucHVzaChpdGVtLmJjcG0pO1xuICAgIGRhdGUuc3BlbnQgKz0gaXRlbS5zcGVudDtcbiAgICBkYXRlLmVhcm5lZCArPSBpdGVtLmVhcm5lZDtcbiAgICBkYXRlLmxlYWRzICs9IGl0ZW0ubGVhZHM7XG5cbiAgICBjb3VudHJ5ID0gZGF0ZVsnY291bnRyaWVzJ11baXRlbS5jb3VudHJ5XTtcbiAgICBpZiAoICFjb3VudHJ5ICkge1xuICAgICAgY291bnRyeSA9IGRhdGVbJ2NvdW50cmllcyddW2l0ZW0uY291bnRyeV0gPSB7XG4gICAgICAgICAgY2FycmllcnM6IHt9XG4gICAgICAgICwgdmlld3M6IDBcbiAgICAgICAgLCBiY3BtOiBbXVxuICAgICAgICAsIHNwZW50OiAwXG4gICAgICAgICwgZWFybmVkOiAwXG4gICAgICAgICwgbGVhZHM6IDBcbiAgICAgIH07XG4gICAgfVxuICAgIGNvdW50cnkudmlld3MgKz0gaXRlbS52aWV3cztcbiAgICBjb3VudHJ5LmJjcG0ucHVzaChpdGVtLmJjcG0pO1xuICAgIGNvdW50cnkuc3BlbnQgKz0gaXRlbS5zcGVudDtcbiAgICBjb3VudHJ5LmVhcm5lZCArPSBpdGVtLmVhcm5lZDtcbiAgICBjb3VudHJ5LmxlYWRzICs9IGl0ZW0ubGVhZHM7XG5cbiAgICBjYXJyaWVyID0gY291bnRyeVsnY2FycmllcnMnXVtpdGVtLmNhcnJpZXJdO1xuICAgIGlmICggIWNhcnJpZXIgKSB7XG4gICAgICBjYXJyaWVyID0gY291bnRyeVsnY2FycmllcnMnXVtpdGVtLmNhcnJpZXJdID0ge1xuICAgICAgICAgIGRhdGU6IGl0ZW0uZGF0ZVxuICAgICAgICAsIGNvdW50cnk6IGl0ZW0uY291bnRyeVxuICAgICAgICAsIGNhcnJpZXI6IGl0ZW0uY2FycmllclxuICAgICAgICAsIHZpZXdzOiBpdGVtLnZpZXdzXG4gICAgICAgICwgYmNwbTogaXRlbS5iY3BtXG4gICAgICAgICwgc3BlbnQ6IGl0ZW0uc3BlbnRcbiAgICAgICAgLCBlYXJuZWQ6IGl0ZW0uZWFybmVkXG4gICAgICAgICwgbGVhZHM6IGl0ZW0ubGVhZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhcnJpZXIudmlld3MgKz0gaXRlbS52aWV3cztcbiAgICAgIC8vY2Fycmllci5iY3BtICs9IGl0ZW0uYmNwbVxuICAgICAgY2Fycmllci5zcGVudCArPSBpdGVtLnNwZW50O1xuICAgICAgY2Fycmllci5lYXJuZWQgKz0gaXRlbS5lYXJuZWQ7XG4gICAgICBjYXJyaWVyLmxlYWRzICs9IGl0ZW0ubGVhZHM7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGJvcm0gb24gMDkuMDEuMTYuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKG9iaiwgY2FsbGJhY2spPT57XG4gIGZvciAoIGxldCBpIGluIG9iaiApIHtcbiAgICBpZiAoIGNhbGxiYWNrLmNhbGwoIG9ialsgaSBdLCBpLCBvYmpbIGkgXSApID09PSBmYWxzZSApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgYm9ybSBvbiAwNy4wMS4xNi5cbiAqL1xuY29uc3QgaXNPYmplY3QgPSAobyk9PntcbiAgcmV0dXJuICh0eXBlb2YgbyAhPT0gJ29iamVjdCcgfHwgbyBpbnN0YW5jZW9mIEFycmF5KVxufTtcblxuY29uc3QgaXNGdW5jdGlvbiA9IChmKT0+e1xuICByZXR1cm4gKCBmICYmIHR5cGVvZiBmID09PSAnZnVuY3Rpb24nICk7XG59O1xuXG52YXIgQWpheCA9IChvcHMpPT4ge1xuICBpZiAoIHR5cGVvZiBvcHMgPT09ICd1bmRlZmluZWQnICkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1BsZWFzZSBwYXNzIG9wdGlvbnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCBpc09iamVjdChvcHMpICkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ09wdGlvbnMgaW4gbm90IHRoZSBvYmplY3QhJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmKHR5cGVvZiBvcHMgPT0gJ3N0cmluZycpIG9wcyA9IHsgdXJsOiBvcHMgfTtcbiAgb3BzLnVybCA9IG9wcy51cmwgfHwgJyc7XG4gIG9wcy5tZXRob2QgPSBvcHMubWV0aG9kIHx8ICdnZXQnO1xuICBvcHMuZGF0YSA9IG9wcy5kYXRhIHx8IHt9O1xuICB2YXIgZ2V0UGFyYW1zID0gZnVuY3Rpb24oZGF0YSwgdXJsKSB7XG4gICAgdmFyIGFyciA9IFtdLCBzdHI7XG4gICAgZm9yKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICAgIGFyci5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQoZGF0YVtuYW1lXSkpO1xuICAgIH1cbiAgICBzdHIgPSBhcnIuam9pbignJicpO1xuICAgIGlmKHN0ciAhPSAnJykge1xuICAgICAgcmV0dXJuIHVybCA/ICh1cmwuaW5kZXhPZignPycpIDwgMCA/ICc/JyArIHN0ciA6ICcmJyArIHN0cikgOiBzdHI7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfTtcbiAgdmFyIGFwaSA9IHtcbiAgICBob3N0OiB7fSxcbiAgICBwcm9jZXNzOiBmdW5jdGlvbihvcHMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMueGhyID0gbnVsbDtcbiAgICAgIGlmKHdpbmRvdy5BY3RpdmVYT2JqZWN0KSB7IHRoaXMueGhyID0gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH1cbiAgICAgIGVsc2UgaWYod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7IHRoaXMueGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7IH1cbiAgICAgIGlmKHRoaXMueGhyKSB7XG4gICAgICAgIHRoaXMueGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmKHNlbGYueGhyLnJlYWR5U3RhdGUgPT0gNCAmJiBzZWxmLnhoci5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gc2VsZi54aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgaWYob3BzLmpzb24gPT09IHRydWUgJiYgdHlwZW9mIEpTT04gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3BzLnN1Y2Nlc3MgJiYgb3BzLnN1Y2Nlc3MuYXBwbHkoc2VsZi5ob3N0LCBbcmVzdWx0LCBzZWxmLnhocl0pO1xuICAgICAgICAgIH0gZWxzZSBpZihzZWxmLnhoci5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgICAgIG9wcy5lcnJvciAmJiBvcHMuZXJyb3IuYXBwbHkoc2VsZi5ob3N0LCBbc2VsZi54aHJdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3BzLmFsd2F5cyAmJiBvcHMuYWx3YXlzLmFwcGx5KHNlbGYuaG9zdCwgW3NlbGYueGhyXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKG9wcy5tZXRob2QgPT0gJ2dldCcpIHtcbiAgICAgICAgdGhpcy54aHIub3BlbihcIkdFVFwiLCBvcHMudXJsICsgZ2V0UGFyYW1zKG9wcy5kYXRhLCBvcHMudXJsKSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnhoci5vcGVuKG9wcy5tZXRob2QsIG9wcy51cmwsIHRydWUpO1xuICAgICAgICB0aGlzLnNldEhlYWRlcnMoe1xuICAgICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICAgICAnQ29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZihvcHMuaGVhZGVycyAmJiB0eXBlb2Ygb3BzLmhlYWRlcnMgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhpcy5zZXRIZWFkZXJzKG9wcy5oZWFkZXJzKTtcbiAgICAgIH1cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIG9wcy5tZXRob2QgPT0gJ2dldCcgPyBzZWxmLnhoci5zZW5kKCkgOiBzZWxmLnhoci5zZW5kKGdldFBhcmFtcyhvcHMuZGF0YSkpO1xuICAgICAgfSwgMjApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBzZXRIZWFkZXJzOiBmdW5jdGlvbihoZWFkZXJzKSB7XG4gICAgICBmb3IodmFyIG5hbWUgaW4gaGVhZGVycykge1xuICAgICAgICB0aGlzLnhociAmJiB0aGlzLnhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGFwaS5wcm9jZXNzKG9wcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFqYXg7XG5cbi8qXG5tb2R1bGUuZXhwb3J0cyA9IChvKT0+e1xuXG4gIGlmICggdHlwZW9mIG8gPT09ICd1bmRlZmluZWQnICkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1BsZWFzZSBwYXNzIG9wdGlvbnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCBpc09iamVjdChvKSApIHtcbiAgICBjb25zb2xlLmVycm9yKCdPcHRpb25zIGluIG5vdCB0aGUgb2JqZWN0IScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCB7IHVybCwgZGF0YSwgc3VjY2VzcywgZXJyb3IgfSA9IG87XG4gIGxldCB4aHI7XG5cbiAgdHJ5IHtcbiAgICB4aHIgPSBuZXcoWE1MSHR0cFJlcXVlc3QgfHwgQWN0aXZlWE9iamVjdCkoJ01TWE1MMi5YTUxIVFRQLjMuMCcpO1xuICAgIHhoci5vcGVuKGRhdGEgPyAnUE9TVCcgOiAnR0VUJywgdXJsLCAxKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICggeGhyLnJlYWR5U3RhdGUgPiAzICYmIHhoci5zdGF0dXMgPT09IDIwMFxuICAgICAgICAmJiBzdWNjZXNzICYmIHR5cGVvZiBpc0Z1bmN0aW9uKHN1Y2Nlc3MpICkge1xuICAgICAgICBzdWNjZXNzKHhoci5yZXNwb25zZVRleHQsIHhocik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZXJyID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dFxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmVycm9yKGVyciwgeGhyKTtcbiAgICAgICAgaWYgKCBlcnJvciAmJiB0eXBlb2YgaXNGdW5jdGlvbihlcnJvcikgKSB7XG4gICAgICAgICAgZXJyb3IoZXJyLCB4aHIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB4aHIuc2VuZChkYXRhKVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKCBlcnJvciAmJiBpc0Z1bmN0aW9uKGVycm9yKSApIHtcbiAgICAgIGVycm9yKGUsIHhocik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICB9XG5cbn07Ki9cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBib3JtIG9uIDA4LjAxLjE2LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9ICggc3RyRGF0YSwgc3RyRGVsaW1pdGVyICk9PntcbiAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBkZWxpbWl0ZXIgaXMgZGVmaW5lZC4gSWYgbm90LFxuICAvLyB0aGVuIGRlZmF1bHQgdG8gY29tbWEuXG4gIHN0ckRlbGltaXRlciA9IChzdHJEZWxpbWl0ZXIgfHwgXCIsXCIpO1xuICAvLyBDcmVhdGUgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gcGFyc2UgdGhlIENTViB2YWx1ZXMuXG4gIHZhciBvYmpQYXR0ZXJuID0gbmV3IFJlZ0V4cChcbiAgICAoXG4gICAgICAvLyBEZWxpbWl0ZXJzLlxuICAgICAgXCIoXFxcXFwiICsgc3RyRGVsaW1pdGVyICsgXCJ8XFxcXHI/XFxcXG58XFxcXHJ8XilcIiArXG4gICAgICAgIC8vIFF1b3RlZCBmaWVsZHMuXG4gICAgICBcIig/OlxcXCIoW15cXFwiXSooPzpcXFwiXFxcIlteXFxcIl0qKSopXFxcInxcIiArXG4gICAgICAgIC8vIFN0YW5kYXJkIGZpZWxkcy5cbiAgICAgIFwiKFteXFxcIlxcXFxcIiArIHN0ckRlbGltaXRlciArIFwiXFxcXHJcXFxcbl0qKSlcIlxuICAgICksXG4gICAgXCJnaVwiXG4gICk7XG4gIC8vIENyZWF0ZSBhbiBhcnJheSB0byBob2xkIG91ciBkYXRhLiBHaXZlIHRoZSBhcnJheVxuICAvLyBhIGRlZmF1bHQgZW1wdHkgZmlyc3Qgcm93LlxuICB2YXIgYXJyRGF0YSA9IFtbXV07XG4gIC8vIENyZWF0ZSBhbiBhcnJheSB0byBob2xkIG91ciBpbmRpdmlkdWFsIHBhdHRlcm5cbiAgLy8gbWF0Y2hpbmcgZ3JvdXBzLlxuICB2YXIgYXJyTWF0Y2hlcyA9IG51bGw7XG4gIC8vIEtlZXAgbG9vcGluZyBvdmVyIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gbWF0Y2hlc1xuICAvLyB1bnRpbCB3ZSBjYW4gbm8gbG9uZ2VyIGZpbmQgYSBtYXRjaC5cbiAgd2hpbGUgKGFyck1hdGNoZXMgPSBvYmpQYXR0ZXJuLmV4ZWMoIHN0ckRhdGEgKSl7XG4gICAgLy8g0YTQuNC60YEsINC10YHQu9C4INC/0YPRgdGC0LDRjyDRgdGC0YDQvtC60LBcbiAgICBpZighYXJyTWF0Y2hlc1sgMiBdICYmICFhcnJNYXRjaGVzWyAzIF0pIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBHZXQgdGhlIGRlbGltaXRlciB0aGF0IHdhcyBmb3VuZC5cbiAgICB2YXIgc3RyTWF0Y2hlZERlbGltaXRlciA9IGFyck1hdGNoZXNbIDEgXTtcbiAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGdpdmVuIGRlbGltaXRlciBoYXMgYSBsZW5ndGhcbiAgICAvLyAoaXMgbm90IHRoZSBzdGFydCBvZiBzdHJpbmcpIGFuZCBpZiBpdCBtYXRjaGVzXG4gICAgLy8gZmllbGQgZGVsaW1pdGVyLiBJZiBpZCBkb2VzIG5vdCwgdGhlbiB3ZSBrbm93XG4gICAgLy8gdGhhdCB0aGlzIGRlbGltaXRlciBpcyBhIHJvdyBkZWxpbWl0ZXIuXG4gICAgaWYgKFxuICAgICAgc3RyTWF0Y2hlZERlbGltaXRlci5sZW5ndGggJiZcbiAgICAgIChzdHJNYXRjaGVkRGVsaW1pdGVyICE9IHN0ckRlbGltaXRlcilcbiAgICApe1xuICAgICAgLy8gU2luY2Ugd2UgaGF2ZSByZWFjaGVkIGEgbmV3IHJvdyBvZiBkYXRhLFxuICAgICAgLy8gYWRkIGFuIGVtcHR5IHJvdyB0byBvdXIgZGF0YSBhcnJheS5cbiAgICAgIGFyckRhdGEucHVzaCggW10gKTtcbiAgICB9XG4gICAgLy8gTm93IHRoYXQgd2UgaGF2ZSBvdXIgZGVsaW1pdGVyIG91dCBvZiB0aGUgd2F5LFxuICAgIC8vIGxldCdzIGNoZWNrIHRvIHNlZSB3aGljaCBraW5kIG9mIHZhbHVlIHdlXG4gICAgLy8gY2FwdHVyZWQgKHF1b3RlZCBvciB1bnF1b3RlZCkuXG4gICAgaWYgKGFyck1hdGNoZXNbIDIgXSl7XG4gICAgICAvLyBXZSBmb3VuZCBhIHF1b3RlZCB2YWx1ZS4gV2hlbiB3ZSBjYXB0dXJlXG4gICAgICAvLyB0aGlzIHZhbHVlLCB1bmVzY2FwZSBhbnkgZG91YmxlIHF1b3Rlcy5cbiAgICAgIHZhciBzdHJNYXRjaGVkVmFsdWUgPSBhcnJNYXRjaGVzWyAyIF0ucmVwbGFjZShcbiAgICAgICAgbmV3IFJlZ0V4cCggXCJcXFwiXFxcIlwiLCBcImdcIiApLFxuICAgICAgICBcIlxcXCJcIlxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2UgZm91bmQgYSBub24tcXVvdGVkIHZhbHVlLlxuICAgICAgdmFyIHN0ck1hdGNoZWRWYWx1ZSA9IGFyck1hdGNoZXNbIDMgXTtcbiAgICB9XG4gICAgLy8gTm93IHRoYXQgd2UgaGF2ZSBvdXIgdmFsdWUgc3RyaW5nLCBsZXQncyBhZGRcbiAgICAvLyBpdCB0byB0aGUgZGF0YSBhcnJheS5cbiAgICBhcnJEYXRhWyBhcnJEYXRhLmxlbmd0aCAtIDEgXS5wdXNoKCBzdHJNYXRjaGVkVmFsdWUgKTtcbiAgfVxuICAvLyBSZXR1cm4gdGhlIHBhcnNlZCBkYXRhLlxuICByZXR1cm4oIGFyckRhdGEgKTtcbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGJvcm0gb24gMDguMDEuMTYuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGVsZW0sIGFycmF5KT0+e1xuICBpZiAoIGFycmF5LmluZGV4T2YgKSB7XG4gICAgcmV0dXJuIGFycmF5LmluZGV4T2YoIGVsZW0gKTtcbiAgfVxuXG4gIGZvciAoIHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgaWYgKCBhcnJheVsgaSBdID09PSBlbGVtICkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgYm9ybSBvbiAwOC4wMS4xNi5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoKCk9PntcbiAgdHJ5IHtcbiAgICBpZiAoJ2xvY2FsU3RvcmFnZScgaW4gd2luZG93ICYmIHdpbmRvd1snbG9jYWxTdG9yYWdlJ10gIT09IG51bGwpIHJldHVybiBsb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn0pKCk7Il19
