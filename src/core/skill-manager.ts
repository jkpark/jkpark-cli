import fs from 'fs';
import path from 'path';

export interface SkillInfo {
    name: string;
    description: string;
    value: string;
    sourcePath?: string;
}

export class SkillManager {
    private skillsDir: string;

    constructor(baseDir: string) {
        this.skillsDir = path.join(baseDir, 'skills');
    }

    async getAllSkills(): Promise<SkillInfo[]> {
        if (!fs.existsSync(this.skillsDir)) return [];

        const skills = fs
            .readdirSync(this.skillsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        return skills.map(skill => {
            const skillPath = path.join(this.skillsDir, skill, 'SKILL.md');
            let description = 'No description provided';

            if (fs.existsSync(skillPath)) {
                const content = fs.readFileSync(skillPath, 'utf8');
                // Simple regex to extract description from frontmatter
                const match = content.match(/^description:\s*(.*)$/m);
                if (match && match[1]) {
                    description = match[1].replace(/^["']|["']$/g, '').trim();
                }
            }

            return {
                name: skill,
                description,
                value: skill,
                sourcePath: path.join(this.skillsDir, skill)
            };
        });
    }
}
