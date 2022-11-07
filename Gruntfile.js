module.exports = function (grunt) {
  //load tasks
  grunt.loadTasks("./tasks");

  grunt.registerTask(
    "update",
    "Download content from remote services",
    function (target = stage) {
      grunt.task.run(["sheets", "docs", `sync:${target}`]);
    }
  );
  grunt.registerTask("content", "Load content from data files", [
    "state",
    "json",
    "csv",
    "markdown",
    "archieml"
  ]);
  grunt.registerTask("ap", "Load and generate election data files", [
    "content",
    "elex"
  ]);
  grunt.registerTask("template", "Build HTML from content/templates", [
    "content",
    "build"
  ]);
  grunt.registerTask("static", "Build all files", [
    "copy",
    "bundle",
    "bundle:once",
    "less",
    "template"
  ]);
  grunt.registerTask("startup", "Build all files and data", [
    "copy",
    "bundle",
    "bundle:once",
    "less",
    "ap",
    "build"
  ]);
  grunt.registerTask("quick", "Build without assets", [
    "clean",
    "bundle",
    "less",
    "template"
  ]);
  grunt.registerTask("serve", "Start the dev server", ["connect:dev", "watch"]);
  grunt.registerTask("default", ["clean", "startup", "serve"]);
  // server tasks
  grunt.registerTask("local", "Run the server for testing events", [
    "sheets",
    "static",
    "connect:dev",
    "cron:60:local"
  ]);
  grunt.registerTask("deploy", "Deploy HTML to stage on a timer", [
    "sheets",
    "docs",
    "clean",
    "static",
    "elex",
    "publish",
    "cron:30:publish"
  ]);
  grunt.registerTask("stage-noap", "Push once to stage without AP update. Use after restore.", [
    "sheets",
    "docs",
    "static",
    "publish",
  ]);
  grunt.registerTask("stage-nodocs", "Push to stage without docs update. Use after restore.", [
    "sheets",
    "clean",
    "static",
    "elex",
    "publish",
  ]);
  grunt.registerTask("deploy-live", "Deploy HTML to live on a timer", [
    "sheets",
    "docs",
    "clean",
    "static",
    "elex",
    "publish:live",
    "cron:30:publishLive"
  ]);
  grunt.registerTask("deploy-noap", "Push once to live without AP update. Use after restore.", [
    "sheets",
    "docs",
    "static",
    "publish:live",
  ]);
  grunt.registerTask("deploy-nodocs", "Push to live without docs update. Use after restore.", [
    "sheets",
    "clean",
    "static",
    "elex",
    "publish:live",
  ]);
};
