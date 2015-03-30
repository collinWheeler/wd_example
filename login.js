module.exports = function ( TAC, app_promise, url ) {
  describe('App Login:', function() {
    it('app login', function (done) {
      TAC.b
        .get( url )
	.elementById('a1').type("tew@byu.edu")
	.elementById('b1').type("foobar")
	.elementById('s1').click()
 	.done( function ( ret, err ) { done( err ); });
    });
  });
};
