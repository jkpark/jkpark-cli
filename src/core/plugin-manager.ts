import fs from 'fs';
import path from 'path';

export interface PluginConfig {
  name: string;
  description: string;
  value: string;
}

export interface SkillInfo {
  name: string;
  description: string;
  value: string;
}

export class PluginManager {
  private pluginsDir: string;

  constructor(baseDir: string) {
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
        } catch (e) {
          console.warn(`Failed to parse plugin config at ${pluginJsonPath}:`, e);
        }
      }
      return { ...config, value: dir };
    });
  }

  async getSkills(category: string): Promise<SkillInfo[]> {
    const skillsDir = path.join(this.pluginsDir, category, 'skills');
    if (!fs.existsSync(skillsDir)) return [];

    const skills = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return skills.map(skill => {
      const skillPath = path.join(skillsDir, skill, 'SKILL.md');
      let description = 'No description provided';
      
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, 'utf8');
        // Simple regex to extract description from frontmatter
        const match = content.match(/^description:\s*(.*)$/m);
        if (match && match[1]) {
          description = match[1].trim();
        }
      }
      
      return { 
        name: skill, 
        description,
        value: skill 
      };
    });
  }

  getSkillSourcePath(category: string, skill: string): string {
    return path.join(this.pluginsDir, category, 'skills', skill);
  }
}
