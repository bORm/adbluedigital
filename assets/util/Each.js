/**
 * Created by borm on 09.01.16.
 */
module.exports = (obj, callback)=>{
  for ( let i in obj ) {
    if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
      break;
    }
  }
};