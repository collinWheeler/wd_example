module.exports = { 
  //'autologin': 'username',
  //'paramlogin': true,
  'byu_cas_username': 'kbt2',
  'local_server_url': 'http://localhost:1337',
  'multiTenantAdmin': [ 'kbt2', 'kt85', 'rks42'],
  'byuAdmin' : [ 'trp22' ],
  'uploads_dir': '/Users/tewk/srcs/therapy-ally-files',
  'therapists': [ 'jdeere', 'mricks2', 'kflatman' ],
  formbuilder: true,
  gmail_outbound_email_config: {
       user:    "therapyallytest",
       password:"testallytherapy",
       host:    "smtp.gmail.com",
       ssl:     true
    },
  outbound_email_config: {
       host:    "localhost",
    }
};
