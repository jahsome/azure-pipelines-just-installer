import * as os from "os";
import * as taskLib from "azure-pipelines-task-lib/task";
import * as toolLib from "azure-pipelines-tool-lib/tool";
import * as axios from "axios"

async function run() {
  const osPlat = os.platform();
  const version = taskLib.getInput("version") || await getLatestVersion();

  const targets: {
    [key: string]: string;
  } = {
    linux: "x86_64-unknown-linux-musl",
    win32: "x86_64-pc-windows-msvc",
  };

  const target = targets[osPlat];

  try {
    if (!toolLib.findLocalTool("just", version)) {
      installJust(version, target);
    }
  } catch (err: any) {
    taskLib.setResult(
      taskLib.TaskResult.Failed,
      taskLib.loc("JustInstallerFailed", err.message)
    );
  }
}

async function installJust(version: string, target: string) {
  // Construct the download URL
  const justUrl = `https://github.com/casey/just/releases/download/${version}/just-${version}-${target}.tar.gz`;

  // Download the .tar.gz and extract it
  const temp = await toolLib.downloadTool(justUrl);
  const extractRoot = await toolLib.extractTar(temp);

  // Cache the bin
  const cachePath = await toolLib.cacheDir(extractRoot, "just", version);

  // Now prepend the tool's bin to the path
  toolLib.prependPath(cachePath);
}

interface GitHubApiResponse extends axios.AxiosResponse {
  tag_name: string
}

async function getLatestVersion() {
  const res = await axios.default.get<GitHubApiResponse>(
    `https://api.github.com/repos/casey/just/releases/latest`
  );

  return res.data.tag_name;
}

run()
