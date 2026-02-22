import fs from 'fs';
import path from 'path';

export interface PluginConfig {
  name: string;
  description: string;
  value: string;
}

export interface SkillInfo {
  name: string;
  value: string;
}

export class PluginManager {
  private pluginsDir: string;

  constructor(baseDir: string) {
    // In production bundle, __dirname might be different, 
    // but for now we assume it's relative to the binary or we pass it in.
    this.pluginsDir = path.join(baseDir, 'plugins');
  }

  async getCategories(): Promise<PluginConfig[]> {
    if (!fs.existsSync(this.pluginsDir)) return [];

    const dirs = fs.readdirSync(this.pluginsDir).filter(f => 
      fs.statSync(path.join(this.pluginsDir, f)).isDirectory()
    );

    return dirs.map(dir => {
      const pluginJsonPath = path.join(this.pluginsDir, dir, 'plugin.json');
      let config = { name: dir, description: 'No description provided' };
      
      if (fs.existsSync(pluginJsonPath)) {
        try {
          config = { ...config, ...JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8')) };
        } catch (e) {}
      }
      return { ...config, value: dir };
    });
  }

  async getSkills(category: string): Promise<SkillInfo[]> {
    const skillsDir = path.join(this.pluginsDir, category, 'skills');
    if (!fs.existsSync(skillsDir)) return [];

    const skills = fs.readdirSync(skillsDir).filter(f => 
      fs.statSync(path.join(skillsDir, f)).isDirectory()
    );

    return skills.map(skill => ({ name: skill, value: skill }));
  }

  getSkillSourcePath(category: string, skill: string): string {
    return path.join(this.pluginsDir, category, 'skills', skill);
  }
}
