/*

Build HTML files using any data loaded onto the shared state. See also loadCSV
and loadSheets, which import data in a compatible way.

*/

var path = require("path");
var typogr = require("typogr");
var template = require("./lib/template");

module.exports = function(grunt) {

  var process = function(source, data, filename) {
    var fn = template(source, { imports: { grunt: grunt, require: require }, sourceURL: filename });
    var input = Object.create(data || grunt.data);
    input.t = grunt.template
    return fn(input);
  };

  //expose this for other tasks to use
  grunt.template.process = process;

  grunt.template.formatNumber = function(s) {
    s = s + "";
    var start = s.indexOf(".");
    if (start == -1) start = s.length;
    for (var i = start - 3; i > 0; i -= 3) {
      s = s.slice(0, i) + "," + s.slice(i);
    }
    return s;
  };

  grunt.template.formatMoney = function(s) {
    s = grunt.template.formatNumber(s);
    return s.replace(/^(-)?/, function(_, captured) { return (captured || "") + "$" });
  };

  grunt.template.smarty = function(text) {
    var filters = ["amp", "widont", "smartypants", "ord"];
    filters = filters.map(k => typogr[k]);
    var filtered = filters.reduce((t, f) => f(t), text);
    return filtered;
  };

  grunt.template.include = function(where, data) {
    grunt.verbose.writeln(" - Including file: " +  where);
    var file = grunt.file.read(path.resolve("src/", where));
    var templateData = Object.create(data || grunt.data);
    templateData.t = grunt.template;
    return process(file, templateData, where);
  };

  grunt.registerTask("build", "Processes index.html using shared data (if available)", function() {
    var files = grunt.file.expandMapping(["**/*.html", "!**/_*.html", "!js/**/*.html"], "build", { cwd: "src" });
    var data = Object.create(grunt.data || {});
    data.t = grunt.template;
    files.forEach(function(file) {
      var src = file.src.shift();
      grunt.verbose.writeln("Processing file: " +  src);
      var input = grunt.file.read(src);
      var output = process(input, data, src);
      grunt.file.write(file.dest, output);
    });

    // generate office share pages
    var officeTemplate = grunt.file.read("src/_office_social.html");
    for (var office of ["governor", "house", "senate"]) {
      var output = process(officeTemplate, { office });
      grunt.file.write(`build/share/${office}.html`, output);
    }

    // generate state share pages
    var stateTemplate = grunt.file.read("src/_state_social.html");
    for (var state in grunt.data.json.states) {
      var meta = grunt.data.json.states[state];
      if (meta["district-unused22"]) continue;
      var output = process(stateTemplate, { state });
      grunt.file.write(`build/share/${state}.html`, output);
    }
  });

}
