"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const taskLib = __importStar(require("azure-pipelines-task-lib/task"));
const toolLib = __importStar(require("azure-pipelines-tool-lib/tool"));
const axios = __importStar(require("axios"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const osPlat = os.platform();
        const version = taskLib.getInput("version") || (yield getLatestVersion());
        const targets = {
            linux: "x86_64-unknown-linux-musl",
            win32: "x86_64-pc-windows-msvc",
        };
        const target = targets[osPlat];
        try {
            if (!toolLib.findLocalTool("just", version)) {
                installJust(version, target);
            }
        }
        catch (err) {
            taskLib.setResult(taskLib.TaskResult.Failed, taskLib.loc("JustInstallerFailed", err.message));
        }
    });
}
function installJust(version, target) {
    return __awaiter(this, void 0, void 0, function* () {
        // Construct the download URL
        const justUrl = `https://github.com/casey/just/releases/download/${version}/just-${version}-${target}.tar.gz`;
        // Download the .tar.gz and extract it
        const temp = yield toolLib.downloadTool(justUrl);
        const extractRoot = yield toolLib.extractTar(temp);
        // Cache the bin
        const cachePath = yield toolLib.cacheDir(extractRoot, "just", version);
        // Now prepend the tool's bin to the path
        toolLib.prependPath(cachePath);
    });
}
function getLatestVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios.default.get(`https://api.github.com/repos/casey/just/releases/latest`);
        return res.data.data.tag_name;
    });
}
run();
