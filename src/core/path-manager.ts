import path from 'path';
import os from 'os';
import fs from 'fs';

export class PathManager {
  static getOpenClawRoot(): string {
    return path.join(os.homedir(), '.openclaw');
  }

  static getWorkspaces(): string[] {
    const root = this.getOpenClawRoot();
    if (!fs.existsSync(root)) return [];

    return fs.readdirSync(root).filter(f => {
      const fullPath = path.join(root, f);
      return f.startsWith('workspace-') && fs.statSync(fullPath).isDirectory();
    });
  }

  static resolveFinalPath(baseDir: string, relativeOrAbsolute: string): string {
    return path.isAbsolute(relativeOrAbsolute) 
      ? relativeOrAbsolute 
      : path.resolve(baseDir, relativeOrAbsolute);
  }
}
