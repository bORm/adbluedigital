/**
 * Created by borm on 08.01.16.
 */
module.exports = (elem, array)=>{
  if ( array.indexOf ) {
    return array.indexOf( elem );
  }

  for ( var i = 0, length = array.length; i < length; i++ ) {
    if ( array[ i ] === elem ) {
      return i;
    }
  }

  return -1;
};