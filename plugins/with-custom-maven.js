const { withProjectBuildGradle } = require("@expo/config-plugins");

/**
 * Add a custom Maven repository to the build.gradle
 */
function addCustomMavenRepository(buildGradle) {
  const mavenBlock = `
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/Hagleitner-HsM/hsm-basetypes-kmm-distribution")
            credentials {
                username = System.getenv("GITHUB_USERNAME") ?: ""
                password = System.getenv("GITHUB_PAT") ?: ""
            }
        }
    `;

  // Find the 'repositories {' block and inject the maven block correctly
  const repositoriesStartRegex = /(allprojects\s*\{\s*repositories\s*\{)/;

  if (buildGradle.includes('name = "GitHubPackages"')) {
    // If the maven block already exists, don't add it again
    return buildGradle;
  }

  return buildGradle.replace(repositoriesStartRegex, `$1\n${mavenBlock}`);
}

const withCustomMaven = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addCustomMavenRepository(
        config.modResults.contents
      );
    } else {
      throw new Error(
        "Cannot modify build.gradle because it is not a groovy file."
      );
    }
    return config;
  });
};

module.exports = withCustomMaven;
