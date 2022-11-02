module.exports = function(grunt) {
  var os = require("os");
  var path = require("path");

  grunt.registerTask("systemd", "Generate a valid systemd service file", function() {

    var template = grunt.file.read("tasks/lib/service.template");
    var env = {
      GOOGLE_OAUTH_CLIENT_ID: null,
      GOOGLE_OAUTH_CONSUMER_SECRET: null,
      AP_API_KEY: null,
      NODE_VERSION: 12
    }
    for (var v in env) {
      if (env[v] === null) {
        env[v] = process.env[v];
      }
    }

    var home = os.homedir();
    var here = path.resolve(".");

    template = template.replace(/%HOME%/g, home);
    template = template.replace(/%HERE%/g, here);
    var envString = Object.keys(env).map(k => `Environment=${k}="${env[k]}"`).join("\n");
    template = template.replace("%ENV%", envString);

    grunt.file.write("elections.service", template);
    grunt.log.writeln("Wrote service file output to ./elections.service\n");
    grunt.log.writeln("Run the command '$ sudo cp ./elections.service /etc/systemd/system/' to move this file into place\n");
    grunt.log.writeln("** The service is configured to deploy the app live, please edit the file by hand if you want to deploy to staging.\n");
    grunt.log.writeln("After editing the service file, reload the changes with `sudo systemctl daemon-reload` and the restart with 'sudo systemctl restart service_name'\n\n");

  });
};