/**
 * Created by borm on 09.01.16.
 */
module.exports = (headers, array)=>{
  let date, country, carrier;

  return array.reduce((obj, item)=>{

    item = item.reduce((o, i, k)=>{
      o[headers[k]] = i;
      return o;
    }, {});

    item.views = parseFloat(item.views);
    item.bcpm = parseFloat(item.bcpm);
    item.spent = parseFloat(item.spent);
    item.earned = parseFloat(item.earned);
    item.leads = parseFloat(item.leads);

    date = obj[item.date];
    if ( !date ) {
      date = obj[item.date] = {
        date: item.date
        , countries: {}
        , views: 0
        , bcpm: []
        , spent: 0
        , earned: 0
        , leads: 0
      };
    }
    date.views += item.views;
    date.bcpm.push(item.bcpm);
    date.spent += item.spent;
    date.earned += item.earned;
    date.leads += item.leads;

    country = date['countries'][item.country];
    if ( !country ) {
      country = date['countries'][item.country] = {
          carriers: {}
        , views: 0
        , bcpm: []
        , spent: 0
        , earned: 0
        , leads: 0
      };
    }
    country.views += item.views;
    country.bcpm.push(item.bcpm);
    country.spent += item.spent;
    country.earned += item.earned;
    country.leads += item.leads;

    carrier = country['carriers'][item.carrier];
    if ( !carrier ) {
      carrier = country['carriers'][item.carrier] = {
          date: item.date
        , country: item.country
        , carrier: item.carrier
        , views: item.views
        , bcpm: item.bcpm
        , spent: item.spent
        , earned: item.earned
        , leads: item.leads
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