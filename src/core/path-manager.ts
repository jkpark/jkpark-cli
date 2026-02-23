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

    let entries: string[];
    try {
      entries = fs.readdirSync(root);
    } catch (e) {
      return [];
    }

    return entries.filter(f => {
      if (f.startsWith('.')) return false;
      const fullPath = path.join(root, f);
      try {
        return fs.statSync(fullPath).isDirectory();
      } catch {
        // Skip entries that cannot be stat'ed (e.g., broken symlinks, permission issues)
        return false;
      }
    });
  }

  static resolveFinalPath(baseDir: string, relativeOrAbsolute: string): string {
    return path.isAbsolute(relativeOrAbsolute) 
      ? relativeOrAbsolute 
      : path.resolve(baseDir, relativeOrAbsolute);
  }
}
