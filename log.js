var _ = require('underscore');


function SelMochaLogger ( _config ) {
  var config = _.defaults( _config || {} , { sel: { file: 1 }, ws: { file:1 } });
  this.config = config;
}


SelMochaLogger.prototype.ws = function ( msg, meta ) {
  this.logTest( msg );
  if ( this.config.ws.cons ) console.log( msg );
};

SelMochaLogger.prototype.ws_req = function ( msg, meta ) {
  this.logTest( msg );
  if ( this.config.ws.cons ) console.log( msg );
};

SelMochaLogger.prototype.ws_res = function ( msg, meta ) {
  this.logTest( msg );
  if ( this.config.ws.cons ) console.log( msg );
};

SelMochaLogger.prototype.sel = function ( msg, meta ) {
  if ( this.config.sel.cons ) console.log.apply( console, arguments );
};

SelMochaLogger.prototype.sel_status = function ( msg, meta ) {
  this.logTest.apply( this, arguments );
  return this.sel.apply(this, arguments);
};

SelMochaLogger.prototype.sel_command= function ( msg, meta ) {
  this.logTest.apply( this, arguments );
  return this.sel.apply(this, arguments);
};

SelMochaLogger.prototype.sel_http = function ( msg, meta ) {
  this.logTest.apply( this, arguments );
  return this.sel.apply(this, arguments);
}
;
SelMochaLogger.prototype.startTest = function () {
  this.testbuf = "";
};
SelMochaLogger.prototype.logTest = function () {
  var self = this;
  _.each( arguments, function (x) {
    self.testbuf += x + " ";
  });
  this.testbuf += "\n";
};
SelMochaLogger.prototype.dumpLast = function () {
  console.log(this.testbuf);
};



module.exports = SelMochaLogger;
