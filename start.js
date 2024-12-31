const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function checkNodeVersion() {
  const version = process.version.match(/^v(\d+)\./)[1];
  if (parseInt(version) < 16) {
    log("This application requires Node.js version 16 or higher.", colors.red);
    process.exit(1);
  }
}

function checkDirectory(dir, name) {
  if (!fs.existsSync(dir)) {
    log(`Error: ${name} directory not found at ${dir}`, colors.red);
    log(
      `Please ensure you're running this script from the project root.`,
      colors.yellow
    );
    process.exit(1);
  }
  return dir;
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`, colors.green);
    } catch (error) {
      log(`Error creating directory ${dir}: ${error.message}`, colors.red);
      throw error;
    }
  }
}

function installDependencies(directory, name) {
  try {
    if (!fs.existsSync(path.join(directory, "package.json"))) {
      log(`Error: package.json not found in ${name} directory`, colors.red);
      process.exit(1);
    }

    log(`Installing dependencies in ${name}...`, colors.blue);
    execSync("npm install", {
      cwd: directory,
      stdio: "inherit",
    });
    log(`Dependencies installed in ${name}`, colors.green);
  } catch (error) {
    log(
      `Error installing dependencies in ${name}: ${error.message}`,
      colors.red
    );
    throw error;
  }
}

function startService(name, command, directory) {
  if (!fs.existsSync(path.join(directory, "package.json"))) {
    log(`Error: package.json not found in ${name} directory`, colors.red);
    process.exit(1);
  }

  log(`Starting ${name}...`, colors.blue);
  const process = spawn("npm", ["run", command], {
    cwd: directory,
    stdio: "inherit",
    shell: true,
  });

  process.on("error", (error) => {
    log(`Error starting ${name}: ${error.message}`, colors.red);
  });

  process.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      log(`${name} exited with code ${code}`, colors.red);
    }
  });

  return process;
}

async function main() {
  try {
    // Check Node.js version
    checkNodeVersion();

    // Setup directories
    const rootDir = __dirname;
    const frontendDir = checkDirectory(
      path.join(rootDir, "frontend"),
      "frontend"
    );
    const backendDir = checkDirectory(path.join(rootDir, "backend"), "backend");
    const databaseDir = path.join(rootDir, "database");

    // Ensure database directory exists
    ensureDirectoryExists(databaseDir);

    // Install dependencies
    log("Installing dependencies...", colors.bright);
    installDependencies(rootDir, "root");
    installDependencies(frontendDir, "frontend");
    installDependencies(backendDir, "backend");

    // Start services
    log("\nStarting services...", colors.bright);
    const backend = startService("backend", "dev", backendDir);
    const frontend = startService("frontend", "dev", frontendDir);

    // Handle process termination
    const cleanup = () => {
      log("\nShutting down services...", colors.yellow);
      backend.kill();
      frontend.kill();
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("uncaughtException", (error) => {
      log(`Uncaught Exception: ${error.message}`, colors.red);
      cleanup();
    });
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the application
main().catch((error) => {
  log(`Fatal error: ${error.message}`, colors.red);
  process.exit(1);
});
