/**
 * 获取当前所在工程根目录，有3种使用方法：<br>
 * getProjectPath(uri) uri 表示工程内某个文件的路径<br>
 * getProjectPath(document) document 表示当前被打开的文件document对象<br>
 * getProjectPath() 会自动从 activeTextEditor 拿document对象，如果没有拿到则报错
 * @param {*} document 
 * copy from http://blog.haoji.me/vscode-plugin-develop-tips.html
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getProjectPath(document) {
    if (!document) {
        document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
    }
    if (!document) {
        this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
        return '';
    }
    const currentFile = (document.uri ? document.uri : document).fsPath;
    let projectPath = null;

    let workspaceFolders = vscode.workspace.workspaceFolders.map(item => item.uri.path);
    // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
    // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
    if (workspaceFolders.length == 1 && workspaceFolders[0] === vscode.workspace.rootPath) {
        const rootPath = workspaceFolders[0];
        var files = fs.readdirSync(rootPath);
        workspaceFolders = files.filter(name => !/^\./g.test(name)).map(name => path.resolve(rootPath, name));
        // vscode.workspace.rootPath会不准确，且已过时
        // return vscode.workspace.rootPath + '/' + this._getProjectName(vscode, document);
    }
    workspaceFolders.forEach(folder => {
        let folder_path : string  = folder.toLowerCase().replace(/\\/g, "/");
        let file_path : string = currentFile.toLowerCase().replace(/\\/g, "/");
        if (file_path[0] !== "/") {
            file_path = "/" + file_path;
        }

        if (file_path.indexOf(folder_path) === 0) {
            projectPath = folder;
        }
    })
    if (!projectPath) {
        vscode.window.showErrorMessage('获取工程根路径异常！');
        return '';
    }

    // windows平台下需要去掉开头的 "/"
    projectPath =  projectPath.replace(/^[/](\w+:)/, ($0, $1) => { return $1;} );
    return projectPath;
}