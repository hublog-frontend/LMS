const spawn = require("cross-spawn");
const { tmpName } = require("tmp-promise");
const fs = require("fs-extra");
const path = require("path");

const TIMEOUT = 5000; // 5 seconds limit

const executeCode = async (req, res) => {
  const { language, sourceCode, stdin } = req.body;

  if (!language || !sourceCode) {
    return res.status(400).json({ message: "Language and source code are required" });
  }

  const lang = language.toLowerCase();
  let result = { stdout: "", stderr: "", code: 0 };

  try {
    if (lang === "javascript") {
       result = await runJavascript(sourceCode, stdin);
    } else if (lang === "python") {
       result = await runPython(sourceCode, stdin);
    } else if (lang === "java") {
       result = await runJava(sourceCode, stdin);
    } else if (lang === "cpp" || lang === "c++") {
       result = await runCpp(sourceCode, stdin);
    } else {
       return res.status(400).json({ message: "Unsupported language" });
    }

    return res.status(200).json({
      message: "Execution successful",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Code execution failed",
      details: error.message,
    });
  }
};

const runJavascript = (source, stdin) => {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["-e", source], { timeout: TIMEOUT });
    handleProcess(child, stdin, resolve, reject);
  });
};

const runPython = (source, stdin) => {
  return new Promise((resolve, reject) => {
    const child = spawn("python", ["-c", source], { timeout: TIMEOUT });
    handleProcess(child, stdin, resolve, reject);
  });
};

const runJava = async (source, stdin) => {
  const tmpDir = await fs.mkdtemp(path.join(process.cwd(), "tmp-java-"));
  const javaFile = path.join(tmpDir, "Main.java");
  await fs.writeFile(javaFile, source);

  return new Promise((resolve, reject) => {
    // Compile
    const compile = spawn("javac", [javaFile]);
    let compileErr = "";
    compile.stderr.on("data", (data) => (compileErr += data));

    compile.on("error", (err) => {
      fs.remove(tmpDir);
      if (err.code === "ENOENT") {
        return resolve({ stdout: "", stderr: "Error: 'javac' (Java compiler) not found. Please install JDK.", code: 1 });
      }
      reject(err);
    });

    compile.on("close", (code) => {
      if (code !== 0) {
        fs.remove(tmpDir);
        return resolve({ stdout: "", stderr: "Compilation Error:\n" + compileErr, code });
      }

      // Run
      const run = spawn("java", ["-cp", tmpDir, "Main"], { timeout: TIMEOUT });
      handleProcess(run, stdin, (res) => {
        fs.remove(tmpDir);
        resolve(res);
      }, (err) => {
        fs.remove(tmpDir);
        reject(err);
      });
    });
  });
};

const runCpp = async (source, stdin) => {
  const tmpDir = await fs.mkdtemp(path.join(process.cwd(), "tmp-cpp-"));
  const cppFile = path.join(tmpDir, "main.cpp");
  const exeFile = path.join(tmpDir, "main.out");
  await fs.writeFile(cppFile, source);

  return new Promise((resolve, reject) => {
    // Compile
    const compile = spawn("g++", [cppFile, "-o", exeFile]);
    let compileErr = "";
    compile.stderr.on("data", (data) => (compileErr += data));

    compile.on("error", (err) => {
       fs.remove(tmpDir);
       if (err.code === "ENOENT") {
         return resolve({ stdout: "", stderr: "Error: 'g++' (C++ compiler) not found. Please install GCC.", code: 1 });
       }
       reject(err);
    });

    compile.on("close", (code) => {
      if (code !== 0) {
        fs.remove(tmpDir);
        return resolve({ stdout: "", stderr: "Compilation Error:\n" + compileErr, code });
      }

      // Run
      const run = spawn(exeFile, [], { timeout: TIMEOUT });
      handleProcess(run, stdin, (res) => {
        fs.remove(tmpDir);
        resolve(res);
      }, (err) => {
        fs.remove(tmpDir);
        reject(err);
      });
    });
  });
};

const handleProcess = (child, stdin, resolve, reject) => {
  let stdout = "";
  let stderr = "";

  if (stdin) {
    child.stdin.write(stdin);
    child.stdin.end();
  }

  child.stdout.on("data", (data) => (stdout += data));
  child.stderr.on("data", (data) => (stderr += data));

  child.on("close", (code) => {
    resolve({ stdout, stderr, code });
  });

  child.on("error", (err) => {
    if (err.code === "ENOENT") {
        reject(new Error("Compiler binary not found. Please ensure the language runtime is installed."));
    } else {
        reject(err);
    }
  });
};

module.exports = {
  executeCode,
};
