import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { PLATFORM_SIGNUP_REQUIREMENTS, ALL_PLATFORM_SIGNUP_REQUIREMENTS, SignupTemplate, getSignupTemplate, validateSignupTemplate } from './signup-templates';
import { SignupManager } from './signup-manager';

// ANSI color codes for shiny prompts
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

class HyperPostSetup {
  private rl: readline.Interface;
  private envPath: string;
  private signupManager: SignupManager;
  private isRunning: boolean = false;

  constructor() {
    // Create readline interface with proper configuration for both interactive and piped input
    const isPiped = !process.stdin.isTTY || process.env.CI;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: isPiped ? null : process.stdout,
      terminal: !isPiped
    });
    this.envPath = path.join(process.cwd(), '.env');
    this.signupManager = new SignupManager();
  }

  private isPipedInput(): boolean {
    return !process.stdin.isTTY || process.env.CI;
  }

  private printHeader(): void {
    console.log(`${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║${colors.reset}${colors.bright}${colors.white}                 🚀 HYPERPOST SETUP WIZARD${colors.reset}${colors.bright}${colors.cyan}                 ║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╚══════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}Create genuine social media accounts with complete profiles${colors.reset}`);
    console.log(`${colors.yellow}for professional, trustworthy presence across platforms.${colors.reset}\n`);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      console.log(`${colors.yellow}Setup is already running...${colors.reset}`);
      return;
    }
    this.isRunning = true;

    this.printHeader();

    // Check if .env already exists and show current status
    if (fs.existsSync(this.envPath)) {
      console.log(`${colors.blue}📁 Existing Configuration Found:${colors.reset}`);
      const existingPlatforms = this.signupManager.getConfiguredPlatforms();
      if (existingPlatforms.length > 0) {
        console.log(`${colors.green}Currently configured platforms:${colors.reset}`, existingPlatforms.join(', '));
      } else {
        console.log(`${colors.yellow}No platforms currently configured.${colors.reset}`);
      }
      console.log(`${colors.dim}New platform credentials will be added to existing configuration.${colors.reset}\n`);
    }

    // Check for quick setup mode
    const quickSetup = process.argv.includes('--quick') || process.argv.includes('-q');
    if (quickSetup) {
      await this.quickSetup();
      return;
    }

    // Create signup templates
    await this.createSignupTemplates();

    const platforms = await this.selectPlatforms();

    for (const platform of platforms) {
      await this.createPlatformAccount(platform);
    }

    // Generate final .env file
    await this.generateEnvFile();

    console.log(`\n${colors.bright}${colors.green}🎉 ALL ACCOUNTS CREATED AND CONFIGURED!${colors.reset}`);
    console.log(`${colors.cyan}You can now post to all platforms with:${colors.reset}`);
    console.log(`${colors.yellow}hyper-post post -c "Your message" -t "Title" -u "https://link.com"${colors.reset}`);

    this.rl.close();
    this.isRunning = false;
  }

  private async createSignupTemplates(): Promise<void> {
    console.log(`${colors.bright}${colors.magenta}📝 SIGNUP TEMPLATES${colors.reset}`);
    console.log(`${colors.dim}════════════════════${colors.reset}`);

    const existingTemplates = this.signupManager.getAllTemplates();
    const defaultTemplate = this.signupManager.getDefaultTemplate();

    if (Object.keys(existingTemplates).length > 0) {
      console.log(`${colors.blue}Found existing signup templates:${colors.reset}`);
      Object.entries(existingTemplates).forEach(([platform, template]) => {
        console.log(`  ${colors.green}•${colors.reset} ${platform}: ${template.displayName} (${template.email})`);
      });

      const reuse = await this.askYesNo('\nReuse existing template for new platforms?');
      if (reuse) {
        console.log(`${colors.green}✅ Using existing template.${colors.reset}\n`);
        return;
      }
      console.log(`${colors.yellow}📝 Creating new template.${colors.reset}\n`);
    }

    console.log(`${colors.cyan}Let's create consistent branding across all platforms.${colors.reset}`);
    console.log(`${colors.dim}Using HyperDrift as example template...${colors.reset}\n`);

    // Get account type
    const accountType = await this.selectAccountType();

    // Basic account info with default values
    const username = await this.askFieldWithDefault({
      key: 'username',
      label: 'Base Username',
      description: 'Base username (will be adapted per platform)',
      type: 'text',
      required: true,
      defaultValue: defaultTemplate.username,
      validation: (value: string) => {
        if (value.length < 2) return 'Username must be at least 2 characters';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Only letters, numbers, hyphens, underscores';
        return true;
      }
    });

    const displayName = await this.askFieldWithDefault({
      key: 'displayName',
      label: 'Display Name',
      description: 'Full name or project name shown publicly',
      type: 'text',
      required: true,
      defaultValue: defaultTemplate.displayName
    });

    const email = await this.askFieldWithDefault({
      key: 'email',
      label: 'Email Address',
      description: 'Primary email for accounts (can vary per platform)',
      type: 'email',
      required: true,
      defaultValue: defaultTemplate.email
    });

    // Profile information
    console.log(`\n${colors.cyan}📋 Profile Information (consistent across platforms):${colors.reset}`);

    const bio = await this.askFieldWithDefault({
      key: 'bio',
      label: 'Bio/Description',
      description: 'Short description of your project/persona',
      type: 'textarea',
      required: true,
      maxLength: 200,
      defaultValue: defaultTemplate.bio
    });

    const website = await this.askFieldWithDefault({
      key: 'website',
      label: 'Website URL',
      description: 'Your main website or project URL',
      type: 'url',
      required: true,
      defaultValue: defaultTemplate.website
    });

    const location = await this.askFieldWithDefault({
      key: 'location',
      label: 'Location',
      description: 'Location (city, country, or "Digital Nomad")',
      type: 'text',
      required: false,
      defaultValue: defaultTemplate.location
    });

    // Create base template
    const baseTemplate: SignupTemplate = {
      username,
      displayName,
      email,
      bio,
      website,
      location,
      accountType,
      primaryTopics: defaultTemplate.primaryTopics,
      targetAudience: defaultTemplate.targetAudience
    };

    // Store template for all platforms (main + difficult)
    Object.keys(ALL_PLATFORM_SIGNUP_REQUIREMENTS).forEach(platform => {
      this.signupManager.saveTemplate(platform, baseTemplate);
    });

    console.log(`${colors.green}✅ Signup templates created and saved!${colors.reset}\n`);
  }

  private async selectAccountType(): Promise<'personal' | 'business' | 'community' | 'project'> {
    console.log(`${colors.cyan}What type of account is this?${colors.reset}`);
    console.log(`${colors.yellow}1.${colors.reset} Personal - Individual developer/streamer`);
    console.log(`${colors.yellow}2.${colors.reset} Business - Company or startup`);
    console.log(`${colors.yellow}3.${colors.reset} Community - Group or organization`);
    console.log(`${colors.yellow}4.${colors.reset} Project - Open source project or tool`);

    while (true) {
      const choice = await this.askField({
        key: 'choice',
        label: 'Account Type (1-4)',
        description: 'Choose account type',
        type: 'text',
        required: true
      });

      switch (choice) {
        case '1': return 'personal';
        case '2': return 'business';
        case '3': return 'community';
        case '4': return 'project';
        default:
          console.log(`${colors.red}❌ Please choose 1, 2, 3, or 4.${colors.reset}`);
      }
    }
  }

  private async selectPlatforms(): Promise<string[]> {
    console.log(`${colors.bright}${colors.blue}🎯 SELECT PLATFORMS TO SET UP${colors.reset}`);
    console.log(`${colors.dim}════════════════════════════${colors.reset}`);

    const configuredPlatforms = this.signupManager.getConfiguredPlatforms();
    const availablePlatforms = Object.entries(PLATFORM_SIGNUP_REQUIREMENTS);

    console.log(`\n${colors.cyan}Available platforms:${colors.reset}`);
    availablePlatforms.forEach(([key, req], index) => {
      const isConfigured = configuredPlatforms.includes(key);
      const status = isConfigured ? `${colors.green}[CONFIGURED]${colors.reset}` : `${colors.yellow}[NOT SET UP]${colors.reset}`;
      console.log(`   ${colors.yellow}${index + 1}.${colors.reset} ${key}: ${req.displayName} ${status}`);
    });

    if (configuredPlatforms.length > 0) {
      console.log(`\n${colors.blue}💡 You can reconfigure existing platforms or add new ones.${colors.reset}`);
      console.log(`   ${colors.dim}Existing credentials will be updated with new values.${colors.reset}`);
    }

    console.log(`\n${colors.cyan}Select platforms by number (comma-separated, e.g., "1,3,4"):${colors.reset}`);

    const selection = await this.askField({
      key: 'platforms',
      label: 'Platform Numbers',
      description: 'Comma-separated list of platform numbers',
      type: 'text',
      required: true
    });

    const selectedIndices = selection.split(',').map(s => parseInt(s.trim()) - 1);
    const selectedPlatforms: string[] = [];

    for (const index of selectedIndices) {
      if (index >= 0 && index < availablePlatforms.length) {
        const platformKey = availablePlatforms[index][0];
        selectedPlatforms.push(platformKey);
      }
    }

    if (selectedPlatforms.length === 0) {
      console.log(`${colors.red}❌ No valid platforms selected. Exiting.${colors.reset}`);
      process.exit(1);
    }

    console.log(`\n${colors.green}✅ Selected platforms: ${selectedPlatforms.join(', ')}${colors.reset}\n`);
    return selectedPlatforms;
  }

  private async createPlatformAccount(platform: string): Promise<void> {
    const requirements = PLATFORM_SIGNUP_REQUIREMENTS[platform];
    let template = this.signupManager.getTemplate(platform);

    if (!template) {
      console.log(`❌ No signup template found for ${requirements.displayName}. Please create templates first.`);
      return;
    }

    console.log(`\n🏗️  Creating ${requirements.displayName} Account`);
    console.log('='.repeat(50));

    console.log(`\n📋 ${requirements.displayName} Account Creation Guide:`);
    console.log('='.repeat(50));

    // Show signup steps
    console.log('\n📝 ACCOUNT CREATION STEPS:');
    requirements.signupSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });

    // Fill required fields
    console.log(`\n🔑 REQUIRED ACCOUNT INFORMATION:`);
    for (const field of requirements.requiredFields) {
      const value = await this.askField(field);
      template.customFields = template.customFields || {};
      template.customFields[field.key] = value;
    }


    // Show setup steps
    console.log(`\n🔧 POST-CREATION SETUP STEPS:`);
    requirements.setupSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });

    if (requirements.verificationNotes) {
      console.log(`\n⚠️  VERIFICATION NOTES:`);
      console.log(`   ${requirements.verificationNotes}`);
    }

    console.log(`\n⏳ Complete the account creation steps above, then:`);

    // Get API credentials
    console.log(`\n🔐 API CREDENTIALS (after account setup):`);
    for (const field of requirements.requiredFields) {
      if (field.key.includes('Token') || field.key.includes('Secret') || field.key.includes('Password')) {
        const value = await this.askField({
          ...field,
          description: field.description + ' (from account settings after setup)'
        });
        template.customFields = template.customFields || {};
        template.customFields[field.key] = value;
      }
    }

    // Save completed account
    this.signupManager.saveCompletedAccount(platform, template.customFields || {});

    console.log(`✅ ${requirements.displayName} account configured and saved!`);
  }

  private async askField(field: any): Promise<string> {
    return new Promise((resolve) => {
      const isPiped = this.isPipedInput();

      if (!isPiped) {
        const prompt = field.sensitive ? '(hidden) ' : '';
        const maxNote = field.maxLength ? ` (max ${field.maxLength} chars)` : '';
        const requiredNote = field.required ? ' *' : '';

        console.log(`\n${field.label}${requiredNote}${maxNote}`);
        if (field.description) {
          console.log(`   ${field.description}`);
        }
        if (field.type === 'select' && field.options) {
          console.log(`   Options: ${field.options.join(', ')}`);
        }
      }

      this.rl.question(isPiped ? '' : '> ', (answer) => {
        // Validate answer
        if (!answer && field.required) {
          if (!isPiped) console.log(`❌ ${field.label} is required.`);
          resolve(this.askField(field));
          return;
        }

        if (answer && field.validation) {
          const validationResult = field.validation(answer);
          if (validationResult !== true) {
            if (!isPiped) console.log(`❌ ${validationResult}`);
            resolve(this.askField(field));
            return;
          }
        }

        if (answer && field.maxLength && answer.length > field.maxLength) {
          if (!isPiped) console.log(`❌ Too long! Maximum ${field.maxLength} characters.`);
          resolve(this.askField(field));
          return;
        }

        resolve(answer);
      });
    });
  }

  private async askFieldWithDefault(field: any & { defaultValue?: string }): Promise<string> {
    return new Promise((resolve) => {
      const isPiped = this.isPipedInput();

      if (!isPiped) {
        const prompt = field.sensitive ? '(hidden) ' : '';
        const maxNote = field.maxLength ? ` (max ${field.maxLength} chars)` : '';
        const requiredNote = field.required ? ' *' : '';
        const defaultNote = field.defaultValue ? ` [${colors.green}${field.defaultValue}${colors.reset}]` : '';

        console.log(`\n${colors.bright}${field.label}${colors.reset}${defaultNote}${requiredNote}${maxNote}`);
        if (field.description) {
          console.log(`   ${colors.dim}${field.description}${colors.reset}`);
        }
        if (field.type === 'select' && field.options) {
          console.log(`   Options: ${field.options.join(', ')}`);
        }
      }

      this.rl.question(isPiped ? '' : '> ', (answer) => {
        const finalAnswer = answer.trim() || field.defaultValue || '';

        // Validate answer
        if (!finalAnswer && field.required) {
          if (!isPiped) console.log(`${colors.red}❌ ${field.label} is required.${colors.reset}`);
          resolve(this.askFieldWithDefault(field));
          return;
        }

        if (finalAnswer && field.validation) {
          const validationResult = field.validation(finalAnswer);
          if (validationResult !== true) {
            if (!isPiped) console.log(`${colors.red}❌ ${validationResult}${colors.reset}`);
            resolve(this.askFieldWithDefault(field));
            return;
          }
        }

        if (finalAnswer && field.maxLength && finalAnswer.length > field.maxLength) {
          if (!isPiped) console.log(`${colors.red}❌ Too long! Maximum ${field.maxLength} characters.${colors.reset}`);
          resolve(this.askFieldWithDefault(field));
          return;
        }

        resolve(finalAnswer);
      });
    });
  }

  private async askYesNo(question: string): Promise<boolean> {
    return new Promise((resolve) => {
      const isPiped = this.isPipedInput();
      this.rl.question(isPiped ? '' : `${question} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  private async generateEnvFile(): Promise<void> {
    const newEnvContent = this.signupManager.exportToEnv();

    // Read existing .env content if it exists
    let existingContent = '';
    if (fs.existsSync(this.envPath)) {
      existingContent = fs.readFileSync(this.envPath, 'utf8');
    }

    // Merge new content with existing content
    const mergedContent = this.mergeEnvContent(existingContent, newEnvContent);

    fs.writeFileSync(this.envPath, mergedContent);
    console.log(`📄 Updated .env file at ${this.envPath} (added new platform credentials)`);
  }

  private mergeEnvContent(existing: string, newContent: string): string {
    const existingLines = existing.split('\n').filter(line => line.trim());
    const newLines = newContent.split('\n').filter(line => line.trim());

    // Create a map of existing environment variables
    const existingVars = new Map<string, string>();
    const existingComments: string[] = [];

    for (const line of existingLines) {
      if (line.startsWith('#')) {
        existingComments.push(line);
      } else if (line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        existingVars.set(key.trim(), valueParts.join('=').trim());
      }
    }

    // Merge new variables (new ones override existing ones for the same platform)
    for (const line of newLines) {
      if (!line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        existingVars.set(key.trim(), valueParts.join('=').trim());
      }
    }

    // Reconstruct the file with comments at the top, then all variables
    const result: string[] = [];

    // Add header comment
    result.push('# HyperPost Configuration');
    result.push('# Generated and updated by setup wizard');
    result.push('# Genuine accounts with complete profiles');
    result.push('');

    // Group variables by platform
    const platformGroups: Record<string, string[]> = {};
    const otherVars: string[] = [];

    for (const [key, value] of existingVars) {
      const platformMatch = key.match(/^([A-Z]+)_/);
      if (platformMatch) {
        const platform = platformMatch[1].toLowerCase();
        if (!platformGroups[platform]) {
          platformGroups[platform] = [];
        }
        platformGroups[platform].push(`${key}=${value}`);
      } else {
        otherVars.push(`${key}=${value}`);
      }
    }

    // Add platform sections
    const platformOrder = ['mastodon', 'bluesky', 'reddit', 'discord'];
    for (const platform of platformOrder) {
      if (platformGroups[platform]) {
        result.push(`# ========================================`);
        result.push(`# ${platform.toUpperCase()}`);
        result.push(`# ========================================`);
        result.push(...platformGroups[platform]);
        result.push('');
      }
    }

    // Add any remaining variables
    if (otherVars.length > 0) {
      result.push('# ========================================');
      result.push('# OTHER SETTINGS');
      result.push('# ========================================');
      result.push(...otherVars);
      result.push('');
    }

    return result.join('\n');
  }
}

export { HyperPostSetup };
