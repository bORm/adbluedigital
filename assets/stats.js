/**
 * Created by borm on 06.01.16.
 */
import ajax from './util/ajax.js';
import csvToArray from './util/csvToArray.js';
import localStorage from './util/localStorage.js';
import inArray from './util/inArray.js';
import ArrayToObject from './util/ArrayToObject.js';
import Each from './util/Each.js';

class Stats {
  constructor() {
    // 2. Кешируем данные в браузере и дальше работаем с дампом локально,
    // если я правильно понял, работаем с localStorage
    // Проверяем наличие данных
    this.statsHeaders = localStorage.getItem('statsHeaders');
    this.statsData = localStorage.getItem('statsData');
    // Если данных нет, отправяем запрос на получение
    if ( !this.statsHeaders || !this.statsData ) {
      this.getData();
    } else {
      this.renderTable();
    }
  }

  getData(){
    let self = this;
    ajax({
      url: 'http://adbluedigital.borm.webko.net.ua:8001/get/stats',
      success: (data, res)=>{
        self.saveData(data, res)
      },
      error: (e)=>{
        ajax({
          url: '/static/stats.csv',
          success: (data, res)=>{
            self.saveData(data, res)
          },
          error: (e)=>{
            console.log(e);
          }
        })
      }
    });
  }

  saveData(data, res) {
    // Преобразовуем данные в массив
    let statsArray = csvToArray(data);
    this.statsHeaders = JSON.stringify(
      statsArray.shift()
    );
    this.statsData = JSON.stringify(statsArray);
    statsArray = null;
    // И ложим в локальное хранилище
    // Можно было не обрезать 0-вой индекс и не делить на два фрагмента
    // а положить все сразу, да и собсвенно не проеобразовывать в массив
    localStorage.setItem(
      'statsHeaders'
      , this.statsHeaders
    );
    localStorage.setItem(
      'statsData'
      , this.statsData
    );
    this.renderTable();
  }

  hierarchy() {
    // Парсим данные с localStorage
    this.statsHeaders = JSON.parse(this.statsHeaders);
    this.statsData = JSON.parse(this.statsData);

    // В таблице ТЗ и в 6-ом пункте 'spent - суммируется'
    // сервер прислал ключ 'sent'
    // Опечатка или нет, на всяк случай переименуем
    this.statsHeaders.splice(inArray('sent',this.statsHeaders), 1, 'spent');

    // Преобразуем наш массив в обьект с иерархией
    // Это можно было сделать и на начальном этапе
    // , когда ложили данные в localStorage
    // , но тогда бы данные занимали больше мегабайт
    return ArrayToObject(this.statsHeaders, this.statsData);
  }

  renderTable(){
    this.statsObj = this.hierarchy();
    let blackList = [
      'adserver_id', 'offers_id', 'partners_id', 'status', 'device', 'cpm', 'conversion', 'roi'
    ];

    let table = '';

    table += '<table>';
    table += '<thead>';
    table += '<tr>';
    table += this.statsHeaders.map((column)=>{
      return inArray(column, blackList) === -1 ? '<th>' + column + '</th>' : '';
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

    let timestamp
      , filter = {
        country: [],
        carrier: []
      }
      , select = {
        country: document.createElement('select'),
        carrier: document.createElement('select'),
        reset: document.createElement('button')
      };

    let toggleChilds = (selector, cb)=>{
      let childs = document.getElementsByClassName(selector)
        , len = childs !== null ? childs.length : 0, i = 0;
      for(i; i < len; i++) {
        childs[i].classList.toggle('hidden');
        if ( cb ) {
          cb(childs[i].classList.contains('hidden'), childs[i]);
        }
      }
      return false;
    };

    Each(this.statsObj, (date, dateInfo)=>{
      timestamp = (new Date(date).getTime()/1000);
      this.renderTd(Object.assign(dateInfo, {
        date: date,
        country: '',
        carrier: ''
      }), true, (tr)=>{
        tr.className = 'j-tr date';
        tr.setAttribute('data-target', timestamp);
        tr.onclick = ()=>{
          toggleChilds(
            tr.dataset.target
            , (hidden, child)=>{ // Если закрываем парент, а чайлды не закрыты то закрываем их тоже
            if ( hidden ) {
              let childs = document.getElementsByClassName(child.dataset.target)
                , len = childs !== null ? childs.length : 0, i = 0;
              for(i; i < len; i++) {
                // Можно было б и через свойтво display
                // , для того что бы при повторном открытии их было видно
                childs[i].classList.add('hidden');
              }
            }
          });
        }
      });

      Each(dateInfo.countries, (country, countryInfo)=>{

        if ( inArray(country, filter.country) === -1 ) {
          filter.country.push(country);
        }

        this.renderTd(Object.assign(countryInfo, {
          date: '',
          country: country,
          carrier: ''
        }), true, (tr)=>{
          tr.className = 'j-tr hidden country ' + timestamp + ' ' + country.toLowerCase();
          tr.setAttribute('data-target', timestamp + '-' + country.toLowerCase());
          tr.onclick = ()=>{
            toggleChilds(tr.dataset.target);
          }
        });

        Each(countryInfo.carriers, (carrier, carrierInfo)=>{
          if ( inArray(carrier, filter.carrier) === -1 ) {
            filter.carrier.push(carrier);
          }
          this.renderTd(Object.assign(carrierInfo, {
            date: '',
            country: '',
            carrier: carrier
          }), false, (tr)=>{
            tr.className = 'j-tr hidden carrier ' + timestamp + '-' + country.toLowerCase() + ' ' + carrier.toLowerCase().replace(/ /g, '_');
          });
        });

      });
    });

    filter.country.map((country)=>{
      select.country.innerHTML +=
        '<option value="'+ country.toLowerCase() +'">'+ country +'</option>'
    });
    filter.carrier.map((carrier)=>{
      select.carrier.innerHTML +=
        '<option value="'+ carrier.toLowerCase().replace(/ /g, '_') +'">'+ carrier +'</option>'
    });

    select.reset.type = 'button';
    select.reset.innerHTML = 'Reset';

    let onChange = (e)=>{
      let childs = document.getElementsByClassName('j-tr')
        , len = childs !== null ? childs.length : 0, i = 0;
      for(i; i < len; i++) {
        if ( childs[i].classList.contains(e.target.value) ) {
          childs[i].style.display = 'table-row';
        } else {
          childs[i].style.display = 'none';
        }
      }
      return false;
    };

    select.country.onchange = onChange;
    select.carrier.onchange = onChange;

    select.reset.onclick = ()=>{
      let childs = document.getElementsByClassName('j-tr')
        , len = childs !== null ? childs.length : 0, i = 0;
      for(i; i < len; i++) {
        childs[i].style.display = null;
      }
      return false;
    };

    document.getElementById('filter').appendChild(select.country);
    document.getElementById('filter').appendChild(select.carrier);
    document.getElementById('filter').appendChild(select.reset);

  }

  renderTd(data, average, callback) {

    let tr = document.createElement('tr');

    let {
        date
      , country
      , carrier
      , views
      , bcpm
      , spent
      , earned
      , leads
      } = data;

    if ( average ) {
      let count = bcpm.length
        , sum = 0;
      // вычисляем среднее
      bcpm.map((n)=>{sum += n});
      bcpm = Math.round(sum/count * 100) / 100;
    } else {
      bcpm = Math.round(bcpm * 100) / 100;
    }

    spent = Math.round(spent * 100) / 100;
    earned = Math.round(earned * 100) / 100;

    tr.innerHTML += '<td class="date">'+ date +'</td>';
    tr.innerHTML += '<td class="country">'+ country +'</td>';
    tr.innerHTML += '<td class="carrier">'+ carrier +'</td>';
    tr.innerHTML += '<td class="views">'+ views +'</td>';
    tr.innerHTML += '<td class="bcpm">'+ bcpm +'</td>';
    tr.innerHTML += '<td class="spent">'+ spent +'</td>';
    tr.innerHTML += '<td class="earned">'+ earned +'</td>';
    tr.innerHTML += '<td class="leads">'+ leads +'</td>';

    if ( callback ) {
      callback(tr);
    }

    //return tr.outerHTML;
    document.getElementById('tbody').appendChild(tr);
  }
}

new Stats();