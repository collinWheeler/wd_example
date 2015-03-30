require('colors');
var util = require('util');
var async = require('async');
var _ = require("underscore");
var Q = require("q");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var config = require(__dirname + '/config.js');
var cp = require('child_process');
chai.use(chaiAsPromised);
chai.should();

module.exports = function () {
  var wd = require('wd');
  var BYU_ORG_NAME = "Brigham Young University Counseling and Career Center";
  // enables chai assertion chaining
  chaiAsPromised.transferPromiseness = wd.transferPromiseness;

  var Asserter = wd.Asserter; // asserter base class

  // tagging chai assertion errors for retry
  var tagChaiAssertionError = function(err) {
    console.log( "tagChai", err );
    // throw error and tag as retriable to poll again
    err.retriable = err instanceof chai.AssertionError;
    throw err;
  };

  // simple asserter, just making sure that the element (or browser)
  // text is non-empty and returning the text.
  // It will be called until the promise is resolved with a defined value.
  var customTextNonEmpty = new Asserter(
    function(target) { // browser or el
      return target
        .text().then(function(text) {
          // condition implemented with chai within a then
          text.should.have.length.above(0);
          return text; // this will be returned by waitFor
                       // and ignored by waitForElement.
        })
        .catch(tagChaiAssertionError); // tag errors for retry in catch.
    }
  );

  // another simple element asserter
  var customIsDisplayed = new Asserter(
    function(el) {
      return el
        .isDisplayed().should.eventually.be.ok
        .catch(tagChaiAssertionError);
    }
  );

  // asserter generator
  var title = function(text) {
    return new Asserter(
      function(target) { // browser or el
        return target
          .title().should.become(text)
          .catch(tagChaiAssertionError); // tag errors for retry in catch.
      }
    );
  };

  function randomString( length )
  {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    length = length ? length : 32;
    var string = '';
    for (var i = 0; i < length; i++) {
          var randomNumber = Math.floor(Math.random() * chars.length);
          string += chars.substring(randomNumber, randomNumber + 1);
        }
    return string;
  }

  function notHidden() {
    return new Asserter(
      function(target) {
        target.getAttribute("class").should.not.include("hidden").catch(tagChaiAssertionError);
      });
  }

  wd.addPromiseChainMethod( 'waitForNotHidden', function( ) {
    return this.waitFor( notHidden() );
  });
  
  wd.addPromiseChainMethod( 'waitForNotHiddenByCssSelector', function( selector ) {
    this.waitForElementByCssSelector( selector ).waitForNotHidden();
  });

  // adding custom promise chain method
  wd.addPromiseChainMethod( 'waitForTitle', function(txt, timeout) { return this .waitFor( title( txt ), timeout ); });
  wd.addPromiseChainMethod( 'logout', function() { return this.waitForElementByXPath('//a[@href="/logout"]').click(); });
  wd.addPromiseChainMethod( 'log', function( msg ) { console.log( msg.red ); return this; });
  wd.addPromiseChainMethod( 'logme', function() { console.log( this ); return this; });
  wd.addPromiseChainMethod( 'finishTest', function( doneA ) {
      console.log( doneA );
      console.log( this );
    return this.done( function ( a, b, c ) {
      console.log( a, b, c  );
      if ( b ) { console.log( b.red ); doneA( b ); }
      else { doneA(); }
    });
  });
  wd.addPromiseChainMethod( 'waitForAnyElementByXPathThenClick', function( xpaths ) {
    return this.waitFor( new Asserter ( function ( target ) {
      var deferred = Q.defer();
      var v = false;
      async.detectSeries(xpaths, function ( x, cb ) {
          console.log("xpath", x );
          target.elementByXPathIfExists( x ).then ( function ( x ) { v = x; cb(x); } );
        },
        function () {
          if ( v )
            deferred.resolve( v );
          else
            deferred.reject( { retriable: true } );
        });
      return deferred.promise;
      //var err = { retriable: true };
      //throw err;
      })).click();
    });
  wd.addPromiseChainMethod( 'typeIfPresentByCssSelector', function( selector, txt) { return this.elementByCssSelectorIfExists( selector ).then( function ( x ) { if (x) return x.clear().type(txt); else return x;} ); });
  wd.addPromiseChainMethod( 'typeIfPresentByName', function( selector, txt) { return this.elementByNameIfExists( selector ).then( function ( x ) { if (x) return x.clear().type(txt); else return x;} ); });

  wd.addPromiseChainMethod( 'showAddTherapist', function( selector, txt) {
    return this.waitFor( new Asserter ( function ( target ) {
      var deferred = Q.defer();
      target.elementByClassNameIfExists('hideAddTherapist').then ( function ( v ) {
        if ( v ) deferred.resolve( v );
        else
          target.elementByClassNameIfExists('showAddTherapist').then ( function ( v ) {
            if ( v ) {
              deferred.resolve( v.click() );
            }
            else
              deferred.reject( { retriable: true } );
          });
      });
      return deferred.promise;
    }));
  });

  wd.addPromiseChainMethod ( 'waitForClientThenClickfromDashboard',       function ( clientname ) { return this.waitForElementByXPath  ( '//a[contains(text(),"' + clientname + '")]' ) .click ( ) ; } ); 
  wd.addPromiseChainMethod ( 'waitForThenClickByXPath',       function ( selector ) { return this.waitForElementByXPath       ( selector ) .click ( ) ; } );
  wd.addPromiseChainMethod ( 'waitForThenClickByClassName',   function ( selector ) { return this.waitForElementByClassName   ( selector ) .click ( ) ; } );
  wd.addPromiseChainMethod ( 'waitForThenClickByCssSelector', function ( selector ) { return this.waitForElementByCssSelector ( selector ) .click ( ) ; } );
  wd.addPromiseChainMethod ( 'clickByXPath',       function ( selector ) { return this.elementByXPath       ( selector ) .click ( ) ; } );
  wd.addPromiseChainMethod ( 'clickByClassName',   function ( selector ) { return this.elementByClassName   ( selector ) .click ( ) ; } );
  wd.addPromiseChainMethod ( 'clickByCssSelector', function ( selector ) { return this.elementByCssSelector ( selector ) .click ( ) ; } );
  wd.addPromiseChainMethod ( 'clickByName',        function ( selector ) { return this.elementByName        ( selector ) .click ( ) ; } );
  wd.addPromiseChainMethod ( 'doubleClickByXPath',       function ( selector ) { return this.elementByXPath       ( selector ) .doubleclick ( ) ; } );
  wd.addPromiseChainMethod ( 'waitForThenFillByXPath',       function ( selector, txt ) { return this.waitForElementByXPath       ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'waitForThenFillByClassName',   function ( selector, txt ) { return this.waitForElementByClassName   ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'waitForThenFillByCssSelector', function ( selector, txt ) { return this.waitForElementByCssSelector ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'waitForThenFillByName', function ( selector, txt ) { return this.waitForElementByName ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'fillByXPath',       function ( selector, txt ) { return this.elementByXPath       ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'fillByClassName',   function ( selector, txt ) { return this.elementByClassName   ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'fillByCssSelector', function ( selector, txt ) { return this.elementByCssSelector ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'isNotVisible', function( selector ) { return this.elementByXPathIfExists (selector).isVisible().then( function ( x ) { if (x) throw x; else return this; } ); });
  wd.addPromiseChainMethod ( 'fillByName',        function ( selector, txt ) { return this.elementByName        ( selector ) .clear().type ( txt ) ; } );
  wd.addPromiseChainMethod ( 'fillByNamePlusRandom', function ( selector, txt ) { return this.elementByName        ( selector ) .clear().type ( txt + randomString(5) ) ; } );
  wd.addPromiseChainMethod ( 'shouldnotfind', function( selector ) { return this.elementByXPathIfExists (selector).then( function ( x ) { if (x) throw x; else return this; } ); });
  wd.addPromiseChainMethod ( 'waitForThenClickElementByXPathIf', function ( val, selector, timeout ) { if ( val ) return this.waitForElementByXPath( selector, timeout ).click(); else return this; });
  wd.addPromiseChainMethod ( 'waitForElementByXPathIf', function ( val, selector, timeout ) { if ( val ) return this.waitForElementByXPath( selector, timeout ); else return this; });

  var clientDefaults = { clientname: "Client1", netid: "netid_Client1", email: "client@therapyally.com", password: "client@therapyally.com" };
  var therapistDefaults = { name: "Thera1", netid: "netid_Thera1", email: "thera1+tewk@tu.therapyally.com", orgname: 'Org1' };
  var fillSignupDefaults = { name: "User1", studentid: "0000", email: "test-kevin+01@therapyally.com", sex: "male", password: "foobar" };
  var dateDefaults = {date: "01/01/2001"};
  var contentNameDefaults = { name: "name1"};
  var tencontentes = {
    content1: { name: "name1"},
    content2: { name: "name2"}
  };
  var client99 = { clientname: "Client99", netid: "netid_Client99", email: "client99@therapyally.com", password: "client99@therapyally.com" };
  var thera1 = { name: "Thera1", email: "testtesttest@tu.therapyally.com", sex: "male"};
  var testy = { name:"testy", netid:"byubyu", email:"testy@therapyally.com", sex: "male"};
  var testy2 = { name:"222testy", netid:"222byubyu", email:"222testy@therapyally.com", sex: "male"};
  var paulsTherapist = {  name: "Paul Test", email: "email_nonbyu@nonbyu.com"};
  var nonbyu = {name: "nonbyu", email: "email_nonbyu@nonbyu.com", password: "nonbyupass", sex: "male"};
  var link = {clientname: client99.clientname, contentType:"link", link: 'http://www.yahoo.com/', name:'content link name'};
  var video_link = {clientname: client99.clientname, contentType:"videolink", link: 'https://www.youtube.com/watch?v=19ca8WMmZn0', name:'video link name'};
  var audio_link = {clientname: client99.clientname, contentType:"audiolink", link: 'http://cdn.franticworld.com/wp-content/uploads/2012/02/Chocolate-Meditation-from-book-Mindfulness-Finding-Peace-in-a-Frantic-World-128k.mp3', name:'audio link name'};
  var clientResponse = {clientResponse: "This is the response of the client"};

  function build_content_defaults( num )
  {
    return { name: "name" + num, description: "boo", instructions: "who" + num };
  }

  wd.addPromiseChainMethod( 'doBYUCASAuth',
    function(name, passwd, timeout) {
      var _params = {};
      if ( name && passwd ) _params = { netid: name, password: passwd };
      var params = _.defaults( _params , { netid: config.byu_cas_username, password: config.byu_cas_password });
      return this
      .waitForTitle('Brigham Young University Sign-in Service')
      /* jshint evil: true */
      .eval("window.location.href").should.eventually.include('cas.byu.edu/cas/login')
      .waitForElementByTagName('title')
      .waitForElementById('BYU')
      .title().should.become('Brigham Young University Sign-in Service')
      .elementById('netid').type( params.netid )
      .elementById('password').type( params.password )
      .clickByClassName('submit');
    });

  wd.addPromiseChainMethod( 'fill_signup_info',
    function( _params ) {
      var params = _.defaults( _params || {}, fillSignupDefaults );
      return this
      .waitForTitle('Therapy Ally')
      .waitForElementByName('email')
      .waitForElementByXPath('//input[@name="name"]')
      .elementByName('name').clear().type( params.name )
      .typeIfPresentByName('studentid', params.studentid )
      .elementByName('email').clear().type( params.email )
      .clickByXPath('//input[@value="' + params.sex + '" and @name="sex"]')
      .typeIfPresentByName('password', params.password )
      .clickByName('submit')
      .waitForElementByXPath('//*[@id="tour-activities" or contains(@class,"showHideAddClient")]');
    });

  wd.addPromiseChainMethod( 'byu_specific_signup_info_page',
    function( _params ) {
      var params = _.defaults( _params || {}, fillSignupDefaults );
      return this
      .waitForElementByName('email')
      .elementByName('nopassword');
    });

  wd.addPromiseChainMethod( 'create_org',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, { orgname: "Org1" });
      return this
      .waitForThenClickByXPath('//a[@href="#organizations"]')
      .waitForThenClickByClassName('showAddOrg')
      .waitForThenFillByCssSelector('input.name', params.orgname )
      .waitForThenClickByClassName('addOrg');
    });

  wd.addPromiseChainMethod( 'create_therapist',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, therapistDefaults );
      return this
      //.waitForAnyElementByXPathThenClick(['//a[@href="#organizations"]', '//a[@href="#therapists"]'])
      .waitForThenClickByXPath('//a[@href="#organizations"]')
      .waitForElementByLinkText( params.orgname ).click()

      .waitForThenClickByClassName('showAddTherapist')
      .waitForThenFillByCssSelector('input.name', params.name )
      .typeIfPresentByCssSelector( 'input.netid', params.netid )
      .fillByCssSelector( 'input.email', params.email )
      .clickByXPath('//form[@id=\'addNewTherapist\']/button')
      .waitForElementByXPath('//td[text()="' + params.name  + '"]');
    });

  wd.addPromiseChainMethod( 'create_therapist_as_org_admin',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, therapistDefaults );
      return this
      //.waitForAnyElementByXPathThenClick(['//a[@href="#organizations"]', '//a[@href="#therapists"]'])
      .waitForThenClickByXPath('//a[@href="#therapists"]')
      .showAddTherapist()
      .waitForThenFillByCssSelector('input.name', params.name )
      .typeIfPresentByCssSelector( 'input.netid', params.netid )
      .fillByCssSelector( 'input.email', params.email )
      .clickByXPath('//form[@id=\'addNewTherapist\']/button')
      .waitForElementByXPath('//td[text()="' + params.name  + '"]');
    });

  wd.addPromiseChainMethod( 'login_as',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, therapistDefaults );
      return this
      .waitForThenClickByXPath('//a[@href="#organizations"]')
      .waitForThenClickByXPath('//td/a[text()="' + params.orgname +'"]')
      .waitForThenClickByXPath('//td[text()="' + params.name +'"]/following-sibling::td[2]/a');
    });

  wd.addPromiseChainMethod( 'login_as_therapist_from_org_admin',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, therapistDefaults );
      return this
      .waitForThenClickByXPath('//a[@href="#therapists"]')
      .waitForThenClickByXPath('//td[text()="' + params.name +'"]/following-sibling::td[2]/a');
    });

  wd.addPromiseChainMethod( 'login_as_client',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, therapistDefaults );
      return this
      .waitForThenClickByXPath('//a[@href="#dashboard"]')
      .waitForThenClickByXPath('//td[a[text()="' + params.name +'"]]/following-sibling::td/a[text()="Login As"]')
      //.acceptAlert()
      //.catch();
    });

  wd.addPromiseChainMethod( 'fill_out_assignment',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, therapistDefaults );
      return this
      .waitForThenClickByXPath('//a[@href="#dashboard"]')
      .waitForThenClickByXPath('//td[text()="' + params.name +'"]/following-sibling::td[2]/a[text()="Login As"]')
    });

  wd.addPromiseChainMethod( 'switch_to_new_user',
    function( app, url, _params ) {
      var params = _.defaults( _params || {}, clientDefaults );
      var target = this;
      var deferred = Q.defer();
      this.waitForElementByXPath('//td/a[text()="' + params.clientname +'"]').getAttribute('href').then( function ( href ){
        app.db.models.User.findById( href.match(/#client\/(.*)/)[1], function ( err, user ){
          deferred.resolve( target.get(url + '/signup/' + user._id + '/' + user.randomToken ) );
        });
      });
      return deferred.promise;
    });

    wd.addPromiseChainMethod( 'create_content',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, contentNameDefaults );
      return this
       .waitForThenClickByXPath('//a[@href="#addcontent"]')
       .waitForThenFillByXPath('//input[@name="name"]', params.name )
       .clickByClassName('createContent')
       .waitForElementByXPath('//h2[contains(text(),' + params.name + ')]');

    });

    wd.addPromiseChainMethod( 'fill_add_client_form',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
      .waitForNotHiddenByCssSelector('#addNewClient')
      .sleep(1000)
      .waitForThenFillByCssSelector('input.name', params.clientname )
      .typeIfPresentByCssSelector( 'input.netid', params.netid )
      .fillByCssSelector( 'input.email', params.email )
      .waitForThenClickElementByXPathIf( params.different_therapist_name, '//select[contains(@class, "therapist")]/option[text()="' + params.different_therapist_name + '"]', 10000)   
      .clickByClassName('addClient')
      .waitForElementByXPathIf( !params.different_therapist_name, '//td/a[text()="' + params.clientname +'"]');
    });

    wd.addPromiseChainMethod( 'verify_client_row',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
        .waitForElementByXPath('//tr[@class="patientRow"]//td//a[text()="' + params.clientname + '"]', 10000)
        .waitForElementByXPath('//tr[@class="patientRow"]//td//a[text()="' + params.email + '"]', 10000);
    });

  wd.addPromiseChainMethod( 'add_client_to_different_therapist',
   function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
      .waitForThenClickByXPath('//a[@href="#dashboard"]')
      .waitForThenClickByClassName('showHideAddClient')
      /* jshint evil: true */
      .eval("$('.therapist option').size()", function(err, value){
        if(value < 2)
            throw "Only saw one therapist";
      })
      .fill_add_client_form( params, 10000 );

    });

   wd.addPromiseChainMethod( 'click_dashboard_add_client',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
      .waitForThenClickByXPath('//a[@href="#dashboard"]')
      .add_client( params );
    });

   wd.addPromiseChainMethod( 'add_client',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
      .waitForThenClickByClassName('showHideAddClient')
      .fill_add_client_form( params, 10000 );
    });

    wd.addPromiseChainMethod( 'add_client_from_minibutton',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
      .waitForElementByXPath('//button[contains(@class, "showAddClientMini")]', 10000).click()
      .fill_add_client_form( params, 10000 );
    });

wd.addPromiseChainMethod( 'add_content1',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, contentNameDefaults );
      return this

        .waitForElementByXPath('//textarea[@name="instructions"]')
        .waitForElementByXPath('//input[@name="name"]').clear().type(params.name)
        .waitForElementByXPath('//li[text()="CBT"]').click()
        .waitForElementByXPath('//button[text()="Create Content"]').click()
        .waitForElementByXPath('//h4[text()="Instructions:"]')
        .waitForElementByXPath('//span[text()="CBT"]'); 
    });

wd.addPromiseChainMethod( 'add_content_from_minibutton',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
        .waitForElementByXPath('//button[contains(@class, "showAddContentMini")]', 10000).click() 
        .add_content1(params)
    });

wd.addPromiseChainMethod( 'add_content_NOT_from_minibutton',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults );
      return this
        .waitForElementByXPath('//a[@href="#content"]').click()
        .waitForElementByXPath('//button[contains(@class, "addContent")]', 10000).click() 
        .add_content1(params)
    });

  /* assert that page loads and user email matches bottom of nav bar */
   wd.addPromiseChainMethod( 'assert_logged_in_email',
    function( username_email ) {
      var _params = {};
      if ( username_email ) _params.email = username_email;
      var params = _.defaults( _params || {}, clientDefaults );
      return this
      .waitForElementByXPath('//p[@id="inpage_user_email" and text()="' + params.email + '"]', 10000);
    });

   wd.addPromiseChainMethod( 'goto_org',
    function( orgname) {
      var _params = {};
      if ( orgname ) _params.orgname = orgname;
        var params = _.defaults( _params || {}, { orgname: 'Org1' });
      return this
        .waitForThenClickByXPath('//a[@href="#organizations"]')
        .waitForElementByLinkText( params.orgname ).click();
    });

   wd.addPromiseChainMethod( 'goto_byu_org',
    function( ) {
      return this.goto_org('Brigham Young University Counseling and Career Center');
    });

    wd.addPromiseChainMethod( 'creating_content_with_different_content_types',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, dateDefaults );
      return this
    
        .waitForElementByXPath('//button[contains(@class, "showAddContentMini")]', 10000).click() 
        //trying to fix the "Error response status: 11, ElementNotVisible - An element command could not be completed" error
        .waitForElementByXPath('//textarea[@name="instructions"]')
        .waitForElementByXPath('//input[@name="name"]')
        .waitForElementByXPath('//input[@name="name"]').clear().type(params.name)
        .waitForElementByXPath('//li[text()="CBT"]').click()
        .waitForThenClickByXPath( '//select[@id="contentType"]/option[@value="' + params.contentType + '"]', 10000) 
        .waitForElementByXPath('//input[@name="url"]').clear().type(params.link)
        .waitForElementByXPath('//button[text()="Create Content"]').click()
        .waitForElementByXPath('//h4[text()="Instructions:"]')
        .waitForElementByXPath('//span[text()="CBT"]')
    });

    wd.addPromiseChainMethod( 'select_date_and_click_assign_button',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, dateDefaults );
      return this
        .waitForElementById('datepicker').click()
        .elementById('datepicker').type(params.date)
        .clickByClassName('makeAssignment')
    });
 
    wd.addPromiseChainMethod( 'verify_assigned',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, dateDefaults );
      return this
        .waitForElementByXPath('//p[text()="' + dateDefaults.date +'"]')
        .elementByXPath('//a[contains(text(),"' + params.name + '")]').click()
    });

   wd.addPromiseChainMethod( 'click_on_piece_of_content_and_assign_and_verify',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, clientDefaults  );
      return this
      // need to add link that goes to content
        .waitForElementByXPath('//a[@href="#content"]').click()
        .waitForElementByXPath('//a[text()="' + params.name + '"]').click()
        .waitForThenClickByCssSelector('.dropdown-toggle')
        .sleep(1000)
        .waitForThenClickByXPath('//li[contains(@class, "assign")]/a[text()="' + params.clientname + '"]')
        .select_date_and_click_assign_button()
        .verify_assigned(params)
    });

   wd.addPromiseChainMethod( 'login_multi_tenet_admin_from_config',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, contentNameDefaults );
      return this
        .get( params.url )
        .waitForElementByXPath('//a[@href="/login/byu"]', 10000).click()
        .doBYUCASAuth( config.byu_cas_username, config.byu_cas_password )
        .fill_signup_info()
    });

   wd.addPromiseChainMethod( 'BAD_login_verify_email',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, contentNameDefaults );
      if (params.orgname == BYU_ORG_NAME){
        query_string = '?BAD='+ params.netid;
      }
      else
        query_string = '?BADemail='+ params.email;
      return this
        .get( params.url + query_string)
        .fill_signup_info( params )
        .assert_logged_in_email( params.email )
    });

   wd.addPromiseChainMethod( 'change_therapists_function',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, contentNameDefaults );
       
      function enrich_with_org( user ){
        return _.defaults( user, { orgname: params.orgname });
      }
      var ltesty = enrich_with_org( testy );
      ltesty.url = params.url;
      var ltesty2 = enrich_with_org( testy2 );
      ltesty2.url = params.url;
      var lclient99 = enrich_with_org( client99 );
      lclient99.url = params.url;
      var llink = enrich_with_org( link );
      var lvideo_link = enrich_with_org( video_link );
      var laudio_link = enrich_with_org( audio_link );

      return this
       .login_multi_tenet_admin_from_config(params)
        //'org1' is hardcoded so we dont attempt to create a new byu org when testing byu
        .create_org({orgname: 'org1'})
        .create_therapist(ltesty)
        .create_therapist(ltesty2)
        .logout()

        .BAD_login_verify_email( ltesty )
        .add_client_from_minibutton(lclient99)
        .waitForClientThenClickfromDashboard(lclient99.clientname)
        .waitForThenClickByXPath('//button[contains(@class,"showEditClient")]')
        .waitForThenClickByXPath('//select[contains(@class, "therapist")]/option[text()="' + ltesty2.name + '"]', 10000)   
        .waitForThenClickByXPath('//button[text()="Save"]')     
        .logout()

        .BAD_login_verify_email( ltesty2 )        
        .waitForClientThenClickfromDashboard(lclient99.clientname)
        .logout()
    });

  wd.addPromiseChainMethod( 'complete_assignment_rank_and_comment',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, contentNameDefaults );
      return this
        .waitForElementByXPath('//a[text()="' + params.name +'"]').click()
        .waitForElementByXPath('//textarea[contains(@class,"clientResponse")]').clear().type(clientResponse.clientResponse)
        .waitForElementByXPath('//a[@href="' + params.link +'"]')
        .waitForThenClickByXPath('//button[contains(@class,"markComplete")]')
        .acceptAlert()
        .waitForThenClickByXPath('//button[text()="10"]')
        .waitForElementByXPath('//button[text()="Submit Rating"]').click()
        .waitForElementByXPath('//div[text()="Thanks for the feedback!"]')
        .waitForElementByXPath('//a[@href="#dashboard"]').click()
    });

  wd.addPromiseChainMethod( 'add_content_funtion',
    function( _params, timeout) {  
      var params = _.defaults( _params || {}, contentNameDefaults );

      function enrich_with_org( user ){
        return _.defaults( user, { orgname: params.orgname });
      }
      var ltesty = enrich_with_org( testy );
      ltesty.url = params.url;
      var lclient99 = enrich_with_org( client99 );
      lclient99.url = params.url;
      var llink = enrich_with_org( link );
      var lvideo_link = enrich_with_org( video_link );
      var laudio_link = enrich_with_org( audio_link );
      
      return this
        .login_multi_tenet_admin_from_config(params)
        //'org1' is hardcoded so we dont attempt to create a new byu org when testing byu
        .create_org({orgname: 'org1'})
        .create_therapist(testy)
        .logout()

        .BAD_login_verify_email( ltesty )
        .add_content_NOT_from_minibutton({name:"NON-mini button content add"})
        .add_content_from_minibutton({name:"MINI button content add"})
        .add_client_from_minibutton(client99)
        //add/assign contentType link, videolink and audiolink
        //link
        .creating_content_with_different_content_types(llink)
        .click_on_piece_of_content_and_assign_and_verify(llink)
        //video link
        .creating_content_with_different_content_types(lvideo_link)
        .click_on_piece_of_content_and_assign_and_verify(lvideo_link)
        //audiolink
        .creating_content_with_different_content_types(laudio_link)
        .click_on_piece_of_content_and_assign_and_verify(laudio_link)
        .logout()
 
        //complete assignments and rank
        .BAD_login_verify_email(client99)
        .complete_assignment_rank_and_comment(llink)
        // .complete_assignment_rank_and_comment(lvideo_link)
        // .complete_assignment_rank_and_comment(laudio_link)


        //make sure the row has the right completion date,status
        //we should probably run this line at the begning too to make sure the dates and completion status are right
        // .waitForThenClickByXPath('//td/p[text()="' + date + '"]    following-sibling??? td/i[@class="fa-check-square"]
        //   following-sibling???    td/i[@class="fa-link"]    following-sibling???      td/a[@href ="' + link.name + '"]   
        //       ')

        // //check to see if the therapist is getting the right info back
       

    });

 wd.addPromiseChainMethod( 'add_clients_function',
    function( _params, timeout) {
      var params = _.defaults( _params || {}, contentNameDefaults );
      var thera1 = { url: params.url, name: "Thera1", email: "testtesttest@tu.therapyally.com", sex: "male", orgname: params.orgname, netid:"netidexample"};
      var testy = { url: params.url, orgname: params.orgname, name:"testy", netid:"byubyu", email:"testy@therapyally.com", sex: "male"};
      var therapy_client =  { clientname: "Therapy", netid: "therapy", email: "byu_therapy@therapyally.com", different_therapist_name: false };
      var therapy_client2 = { clientname: "111Therapy", netid: "111therapy", email: "111byu_therapy@therapyally.com", different_therapist_name: false };
      var therapy_client3 = { clientname: "2Therapy", netid: "2therapy", email: "2byu_therapy@therapyally.com", different_therapist_name: "testy", password: "therapyally1" };
      
      return this

        .login_multi_tenet_admin_from_config(params)

        .create_org(params)
        .create_therapist( thera1 )
        .create_therapist( testy )
        .logout()

        .BAD_login_verify_email( thera1 )
        
        //create a client (w/o student id)
        .click_dashboard_add_client( therapy_client ) 
        .verify_client_row( therapy_client ) 
        
        //add client from mini button
        .add_client_from_minibutton( therapy_client2 )
        .verify_client_row( therapy_client2 )

        //assign cliet to other therapist
        .click_dashboard_add_client( therapy_client3 )
        .logout()
 
        .BAD_login_verify_email(  testy )
        .verify_client_row( therapy_client3 )
        .logout()
         
    });

   wd.addPromiseChainMethod( 'at_landing_page_signin',
    function( username_email, password ) {
      var _params = {};
      if ( username_email ) _params.email = username_email;
      if ( password ) _params.password = password;
      var params = _.defaults( _params || {}, clientDefaults );
      return this
      .waitForElementByCssSelector('.form-signin input[name="email"]').clear().type(params.email)
      .elementByName('password').clear().type(params.password)
      .elementByName('submit').submit()
      .assert_logged_in_email( params.email );
    });

  function mkBrowser ( logger, browser_type ) {
    var browser = wd.promiseChainRemote();

    // optional extra logging
    browser.on('status', function(info) {
      logger.sel_status(info.cyan);
    });
    browser.on('command', function(eventType, command, response) {
      logger.sel_command(' > ' + eventType.cyan, command, (response || '').grey);
    });
    browser.on('http', function(meth, path, data) {
      logger.sel_http(' > ' + meth.magenta, path, (data || '').grey);
    });
    return  browser.init( { browserName: browser_type || 'firefox' } );
  }

  return {
    wd: wd, 
    tac: function ( url, app_promise, logger, browser_type ) {
      var b = mkBrowser( logger, browser_type );
      this.b = b;
      this.randomString = randomString;
      var TAC = this;
      TAC.BYU_ORG_NAME = BYU_ORG_NAME;
      TAC.byu_therapist1 = { name: "BYU Therapist", netid: "byuthera", email: "byuthera+rks42@rks.therapyally.com", orgname: "Brigham Young University Counseling and Career Center" };
      TAC.byu_client1 = { clientname: "Therapy", netid: "therapy", email: "byu_therapy@therapyally.com", password: "therapyally1" };
      TAC.therapist1 = { name: "Thera1", netid: "netid_Thera1", email: "thera1+tewk@tu.therapyally.com", orgname: 'Org1' };
      TAC.multitenantAdmin = { name: "Multi", netid: "netid_Multi", email: "multitenantAdmin+tewk@tu.therapyally.com", orgname: 'Multi' };
      TAC.clientDefaults = clientDefaults;
      TAC.therapistDefaults = therapistDefaults;
      TAC.fillSignupDefaults = fillSignupDefaults;
      TAC.dateDefaults =  dateDefaults;
      TAC.contentNameDefaults = contentNameDefaults;

     TAC.client99 = client99;  
     TAC.thera1 =  thera1;
     TAC.testy = testy;
     TAC.testy2 = testy2;
     TAC.paulsTherapist = paulsTherapist;  
     TAC.nonbyu = nonbyu;  
     TAC.link = link;  
     TAC.video_link = video_link;  
     TAC.audio_link = audio_link;  
     TAC.clientResponse = clientResponse;  

      return b;
    },
    kill_all_test_browser_sessions: function ( cb ) {
      console.log( "Killing other selenium sessions");
      var request = require('supertest');
      request('http://localhost:4444')
        .get('/wd/hub/sessions')
        .expect( 200 )
        .end( function ( err, res ) {
          if (err) { 
            console.log( "Selenium Server is probably not running!".bold.red );
          }
          //console.log( res.body );
          //if ( err ) return console.log( err );
          async.mapSeries(res.body.value, function ( x, c) {
            request('http://localhost:4444')
              .del('/wd/hub/session/' + x.id )
              .expect( 200 )
              .end( function ( err, res ) {
                //if ( err ) return console.log( err );
                //console.log( res.body );
                console.log( "Killed " + x.id );
                c();
            });
          }, cb);
        });
    },
    droptest: function ( url, done )
    {
      var doagain = 0;
      function dropit() {
        var request = require('supertest');
        request(url)
          .get('/reset_database')
          .expect( 200 )
          .end( function ( err, res ) {
            if ( err ) {
              doagain += 1;
              if ( doagain > 3 )
                console.log( "Failed to reset database" );
              if ( doagain > 5 ){
                process.exit(1);
              }
              setTimeout( dropit, 250);
            }
            else {
              done();
            }
          });
      }
      dropit();
      /*

      var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect('mongodb://127.0.0.1:27017/TA_test', function(err, db) {
        console.log("Dropping");
        db.dropDatabase( done );
      });
      */
    },
    spawn_test_server: function ( port, params, logger ) {
      if ( params.kill_after ) {
        var deferred = Q.defer();
        var killer = cp.spawn("fuser", ["-k", "-n", "tcp", "" + port] );
        killer.on( "exit", function ( a,  b ){
          var app = require("../app").test( { 'local_server_url': 'http://localhost:' + port, logger: logger });
          deferred.resolve( app );
          app.listen( port );
        });
        return deferred.promise;
      }
      else if ( params.leave_running ) {
        describe('start test server', function(){
          it('start test server', function(done) {
            var killer = cp.spawn("fuser", ["-k", "-n", "tcp", "" + port] );
            killer.on( "exit", function ( a,  b ){
              cp.fork( __dirname + "/start_test_server.js");
              done();
            });
          });
        });
      }
      else {
        /* dont_spawn */
      }
    },
    spawn_selenim_server: function ( ){
      var net = require('net');
      var client = net.connect({port: 4444}, function() {
        console.log('client connected');
        client.end();
      });
      client.on("error", function ( err ) {
      });
    }
  };
};
