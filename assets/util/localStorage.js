/**
 * Created by borm on 08.01.16.
 */
module.exports = (()=>{
  try {
    if ('localStorage' in window && window['localStorage'] !== null) return localStorage;
  } catch (e) {
    return false;
  }
})();