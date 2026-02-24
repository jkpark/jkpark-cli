import path from 'path';
import os from 'os';
import fs from 'fs';

export class PathManager {
  static getOpenClawWorkspaceRoot(): string {
    return path.join(os.homedir(), '.openclaw', 'workspace', 'skills');
  }

  static getAntigravityRoot(cwd: string): string {
    return path.join(cwd, '.agent', 'skills');
  }

  static getJkparkSkillsRoot(): string {
    return path.join(os.homedir(), '.jkpark', 'skills');
  }

  static resolveFinalPath(baseDir: string, relativeOrAbsolute: string): string {
    return path.isAbsolute(relativeOrAbsolute)
      ? relativeOrAbsolute
      : path.resolve(baseDir, relativeOrAbsolute);
  }
}
