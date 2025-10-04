import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SignupTemplate, PLATFORM_SIGNUP_REQUIREMENTS } from './signup-templates';

export interface PersistedSignupData {
  version: string;
  templates: Record<string, SignupTemplate>;
  completedAccounts: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Default template configuration - loaded from config.json (or .hyperpost-config.json for backward compatibility)
const DEFAULT_CONFIG_FILE = 'config.json';
const LEGACY_CONFIG_FILE = '.hyperpost-config.json';

interface HyperPostConfig {
  defaultTemplate: SignupTemplate;
}

// Fallback default template if config file doesn't exist
const FALLBACK_DEFAULT_TEMPLATE: SignupTemplate = {
  username: 'hyperdrift',
  displayName: 'HyperDrift',
  email: 'yann@hyperdrift.io',
  bio: 'Building the future of software development. Open-source tools for independent developers and communities. #Web3 #OpenSource #DeveloperTools',
  description: 'HyperDrift is an ecosystem of small but focused apps, tools, and thoughts. We build software that solves real problems, shares ideas openly, and puts developers first.',
  website: 'https://hyperdrift.io',
  location: 'Digital Nomad',
  accountType: 'project',
  primaryTopics: ['web3', 'opensource', 'developer-tools', 'productivity', 'community'],
  targetAudience: 'Independent developers, open-source contributors, and communities building the future of software'
};

export class SignupManager {
  private dataPath: string;
  private data: PersistedSignupData;
  private configPath: string;
  private config: HyperPostConfig;
  private configDir: string;

  constructor() {
    this.configDir = this.getConfigDirectory();
    this.dataPath = path.join(this.configDir, 'signup-data.json');
    this.configPath = this.getConfigFilePath();
    this.loadData();
    this.loadConfig();
  }

  private getConfigFilePath(): string {
    const newConfigPath = path.join(this.configDir, DEFAULT_CONFIG_FILE);
    const legacyConfigPath = path.join(this.configDir, LEGACY_CONFIG_FILE);

    // Use new config file if it exists, otherwise legacy, otherwise new
    if (fs.existsSync(newConfigPath)) {
      return newConfigPath;
    } else if (fs.existsSync(legacyConfigPath)) {
      return legacyConfigPath;
    } else {
      return newConfigPath;
    }
  }

  /**
   * Determine the appropriate config directory based on installation type
   */
  private getConfigDirectory(): string {
    // Check if we're in a project directory (has package.json or node_modules)
    const cwd = process.cwd();
    const hasPackageJson = fs.existsSync(path.join(cwd, 'package.json'));
    const hasNodeModules = fs.existsSync(path.join(cwd, 'node_modules'));

    // If we're in a project directory, use current working directory for project-specific config
    if (hasPackageJson || hasNodeModules) {
      return cwd;
    }

    // For global CLI usage, use user config directory
    const userConfigDir = path.join(os.homedir(), '.config', 'hyper-post');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(userConfigDir)) {
      fs.mkdirSync(userConfigDir, { recursive: true });
    }

    return userConfigDir;
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const content = fs.readFileSync(this.dataPath, 'utf8');
        this.data = JSON.parse(content);
        // Validate version compatibility
        if (this.data.version !== '1.0') {
          console.warn('Signup data version mismatch, resetting...');
          this.initializeData();
        }
      } else {
        this.initializeData();
      }
    } catch (error) {
      console.warn('Failed to load signup data, initializing new data...');
      this.initializeData();
    }
  }

  private initializeData(): void {
    this.data = {
      version: '1.0',
      templates: {},
      completedAccounts: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(content);
      } else {
        // Create default config file
        this.config = { defaultTemplate: FALLBACK_DEFAULT_TEMPLATE };
        this.saveConfig();
      }
    } catch (error) {
      console.error('Error loading config:', error);
      this.config = { defaultTemplate: FALLBACK_DEFAULT_TEMPLATE };
    }
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  private saveData(): void {
    this.data.updatedAt = new Date().toISOString();
    fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
  }

  // Template management
  hasTemplate(platform?: string): boolean {
    if (platform) {
      return !!this.data.templates[platform];
    }
    return Object.keys(this.data.templates).length > 0;
  }

  getTemplate(platform: string): SignupTemplate | null {
    return this.data.templates[platform] || null;
  }

  getAllTemplates(): Record<string, SignupTemplate> {
    return { ...this.data.templates };
  }

  saveTemplate(platform: string, template: SignupTemplate): void {
    this.data.templates[platform] = { ...template };
    this.saveData();
  }

  // Account management
  hasCompletedAccount(platform: string): boolean {
    return !!this.data.completedAccounts[platform];
  }

  getCompletedAccount(platform: string): any {
    return this.data.completedAccounts[platform] || null;
  }

  saveCompletedAccount(platform: string, credentials: any): void {
    this.data.completedAccounts[platform] = {
      ...credentials,
      createdAt: new Date().toISOString()
    };
    this.saveData();
  }

  getAllCompletedAccounts(): Record<string, any> {
    return { ...this.data.completedAccounts };
  }

  // Utility methods
  getConfiguredPlatforms(): string[] {
    return Object.keys(this.data.completedAccounts);
  }

  getAvailablePlatforms(): string[] {
    return Object.keys(PLATFORM_SIGNUP_REQUIREMENTS);
  }

  resetPlatform(platform: string): void {
    delete this.data.templates[platform];
    delete this.data.completedAccounts[platform];
    this.saveData();
  }

  // Get default template for examples
  getDefaultTemplate(): SignupTemplate {
    return { ...this.config.defaultTemplate };
  }

  // Initialize with default template if no templates exist
  ensureDefaultTemplate(): void {
    if (!this.hasTemplate()) {
      console.log('💡 No templates found. Using default template as example...');
      // Don't save it automatically, just use as reference
    }
  }

  // Update the default template configuration
  updateDefaultTemplate(template: SignupTemplate): void {
    this.config.defaultTemplate = { ...template };
    this.saveConfig();
  }

  exportToEnv(): string {
    let envContent = '# HyperPost Configuration\n';
    envContent += `# Generated from signup templates on ${new Date().toISOString()}\n\n`;

    for (const [platform, credentials] of Object.entries(this.data.completedAccounts)) {
      const requirements = PLATFORM_SIGNUP_REQUIREMENTS[platform];
      if (!requirements) continue;

      envContent += `# ========================================\n`;
      envContent += `# ${requirements.displayName}\n`;
      envContent += `# ========================================\n`;

      const template = this.data.templates[platform];
      if (template) {
        envContent += `# Account: ${template.displayName} (${template.username})\n`;
        envContent += `# Email: ${template.email}\n`;
        if (template.bio) envContent += `# Bio: ${template.bio}\n`;
        if (template.website) envContent += `# Website: ${template.website}\n`;
        if (template.location) envContent += `# Location: ${template.location}\n`;
      }

      // Add API credentials
      for (const [key, value] of Object.entries(credentials)) {
        if (key !== 'createdAt') {
          const envKey = `${platform.toUpperCase()}_${key.toUpperCase()}`;
          envContent += `${envKey}=${value}\n`;
        }
      }

      envContent += '\n';
    }

    return envContent;
  }
}
