import path from 'path';
import os from 'os';
import fs from 'fs';

export class PathManager {
  static getOpenClawRoot(): string {
    return path.join(os.homedir(), '.openclaw');
  }

  static getClaudeRoot(): string {
    return path.join(os.homedir(), '.claude');
  }

  static getGitHubRoot(): string {
    return path.join(os.homedir(), '.config', 'gh');
  }

  static getWorkspaces(root: string): string[] {
    if (!fs.existsSync(root)) return [];

    return fs.readdirSync(root).filter(f => {
      const fullPath = path.join(root, f);
      return (f.startsWith('workspace-') || f.startsWith('project-')) && fs.statSync(fullPath).isDirectory();
    });
  }

  static resolveFinalPath(baseDir: string, relativeOrAbsolute: string): string {
    return path.isAbsolute(relativeOrAbsolute) 
      ? relativeOrAbsolute 
      : path.resolve(baseDir, relativeOrAbsolute);
  }
}
