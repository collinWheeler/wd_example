var port = 8088;
var config = require( __dirname + '/config');
var util = require('util');
var SMWSLogger = require(__dirname + '/log');

var log = new SMWSLogger();
//var log = new SMWSLogger({ sel: { cons: 1 }, ws: { cons:1 } });
var TAC = require(__dirname + '/TAC.js')();
//var app_promise = TAC.spawn_test_server( port, { kill_after: 1 , leave_running: 0, dont_spawn: 0 }, log );
var app_promise = function () {};

//var URL = 'https://changeally.com';
var URL = 'http://localhost:' + port + "/form2";


describe('Acceptance:', function() {
  this.timeout(60000);
  before(function(done){
    TAC.kill_all_test_browser_sessions( function () { TAC.tac( URL, app_promise, log ); done(); });
  });
  beforeEach(function(done) {
    log.startTest();
    done();
    /*
    app_promise.then( function( app ) {
      TAC.droptest( URL , done );
    });
    */
  });
  afterEach(function(){
    if (this.currentTest.state != 'passed' ) {
      log.dumpLast();
    }
  });

  require(__dirname + '/login')( TAC, app_promise, URL );
  require(__dirname + '/quit')( TAC, app_promise, URL );

});
