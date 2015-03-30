var config = require( __dirname + '/config');

module.exports = function ( TAC, app_promise, url ) {
  describe('QUITTING', function(){
    it('quit', function(done) {
      TAC.b.quit();
      done();
    });
  });
};
