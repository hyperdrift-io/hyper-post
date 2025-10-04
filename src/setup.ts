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

    // Set up database first
    const dbChoice = await this.selectDatabase();

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

  private async selectDatabase(): Promise<'sqlite' | 'postgresql'> {
    console.log(`${colors.bright}${colors.blue}🗄️  DATABASE SETUP${colors.reset}`);
    console.log(`${colors.dim}═══════════════${colors.reset}`);

    console.log(`${colors.cyan}Choose your database:${colors.reset}`);
    console.log(`${colors.green}1.${colors.reset} SQLite (Recommended) - Simple, no setup required`);
    console.log(`${colors.yellow}2.${colors.reset} PostgreSQL - Advanced, requires PostgreSQL server`);
    console.log('');

    // Check if we already have a database configured
    const hasExistingSchema = fs.existsSync(path.join(process.cwd(), 'schema.prisma'));
    if (hasExistingSchema) {
      console.log(`${colors.blue}📁 Existing database schema found. We'll update it with your choice.${colors.reset}`);
      console.log('');
    }

    while (true) {
      const choice = await this.askField({
        key: 'database',
        label: 'Database Choice (1-2)',
        description: 'Choose database type',
        type: 'text',
        required: true
      });

      switch (choice) {
        case '1':
          await this.setupSQLite();
          return 'sqlite';
        case '2':
          await this.setupPostgreSQL();
          return 'postgresql';
        default:
          console.log(`${colors.red}❌ Please choose 1 or 2.${colors.reset}`);
      }
    }
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

  private async setupSQLite(): Promise<void> {
    console.log(`${colors.green}📦 Setting up SQLite database...${colors.reset}`);

    try {
      // Update schema.prisma for SQLite
      const schemaPath = path.join(process.cwd(), 'schema.prisma');
      let schemaContent = fs.readFileSync(schemaPath, 'utf8');

      // Replace PostgreSQL with SQLite
      schemaContent = schemaContent.replace(
        /datasource db \{\s*provider = "postgresql"/,
        'datasource db {\n  provider = "sqlite"'
      );

      // Update the URL for SQLite
      schemaContent = schemaContent.replace(
        /url\s*=\s*env\("DATABASE_URL"\)/,
        'url = "file:./hyperpost.db"'
      );

      fs.writeFileSync(schemaPath, schemaContent, 'utf8');
      console.log(`${colors.green}✅ Updated schema.prisma for SQLite${colors.reset}`);

      // Generate Prisma client and create database
      await this.runPrismaCommands();

    } catch (error) {
      console.log(`${colors.yellow}⚠️  SQLite setup completed with warnings. You may need to run 'pnpm db:generate && pnpm db:push' manually.${colors.reset}`);
    }
  }

  private async setupPostgreSQL(): Promise<void> {
    console.log(`${colors.yellow}🐘 Setting up PostgreSQL database...${colors.reset}`);

    // Check for existing DATABASE_URL
    const existingDbUrl = process.env.DATABASE_URL;
    if (existingDbUrl) {
      console.log(`${colors.blue}📋 Found existing DATABASE_URL environment variable${colors.reset}`);
      const useExisting = await this.askYesNo('Use existing DATABASE_URL?');
      if (useExisting) {
        await this.setupPostgreSQLWithUrl(existingDbUrl);
        return;
      }
    }

    // Ask for PostgreSQL connection details
    console.log(`${colors.cyan}PostgreSQL connection details:${colors.reset}`);

    const host = await this.askFieldWithDefault({
      key: 'host',
      label: 'Host',
      description: 'PostgreSQL server host (e.g., localhost, db.example.com)',
      type: 'text',
      required: true,
      defaultValue: 'localhost'
    });

    const port = await this.askFieldWithDefault({
      key: 'port',
      label: 'Port',
      description: 'PostgreSQL server port',
      type: 'text',
      required: true,
      defaultValue: '5432'
    });

    const database = await this.askFieldWithDefault({
      key: 'database',
      label: 'Database Name',
      description: 'PostgreSQL database name',
      type: 'text',
      required: true,
      defaultValue: 'hyperpost'
    });

    const username = await this.askFieldWithDefault({
      key: 'username',
      label: 'Username',
      description: 'PostgreSQL username',
      type: 'text',
      required: true,
      defaultValue: process.env.USER || 'postgres'
    });

    const password = await this.askField({
      key: 'password',
      label: 'Password',
      description: 'PostgreSQL password',
      type: 'password',
      required: true
    });

    const dbUrl = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    await this.setupPostgreSQLWithUrl(dbUrl);
  }

  private async setupPostgreSQLWithUrl(dbUrl: string): Promise<void> {
    try {
      // Update schema.prisma for PostgreSQL
      const schemaPath = path.join(process.cwd(), 'schema.prisma');
      let schemaContent = fs.readFileSync(schemaPath, 'utf8');

      // Ensure it's set to PostgreSQL
      schemaContent = schemaContent.replace(
        /datasource db \{\s*provider = "[^"]*"/,
        'datasource db {\n  provider = "postgresql"'
      );

      // Update the URL
      schemaContent = schemaContent.replace(
        /url\s*=\s*"[^"]*"/,
        `url = env("DATABASE_URL")`
      );

      fs.writeFileSync(schemaPath, schemaContent, 'utf8');
      console.log(`${colors.green}✅ Updated schema.prisma for PostgreSQL${colors.reset}`);

      // Set DATABASE_URL environment variable for this session
      process.env.DATABASE_URL = dbUrl;

      // Generate Prisma client and create database
      await this.runPrismaCommands();

      // Save DATABASE_URL to .env if we're in project mode
      const signupManager = new SignupManager();
      const configDir = signupManager['configDir'];
      if (configDir === process.cwd()) {
        // Project mode - save to .env
        this.saveEnvVariable('DATABASE_URL', dbUrl);
      }

    } catch (error) {
      console.log(`${colors.yellow}⚠️  PostgreSQL setup completed with warnings. You may need to run 'pnpm db:generate && pnpm db:push' manually.${colors.reset}`);
      console.log(`${colors.dim}Make sure your PostgreSQL server is running and accessible.${colors.reset}`);
    }
  }

  private async runPrismaCommands(): Promise<void> {
    const { execSync } = require('child_process');

    try {
      console.log(`${colors.blue}🔄 Generating Prisma client...${colors.reset}`);
      execSync('npx prisma generate', { stdio: 'inherit' });

      console.log(`${colors.blue}📦 Setting up database schema...${colors.reset}`);
      execSync('npx prisma db push', { stdio: 'inherit' });

      console.log(`${colors.green}✅ Database setup complete!${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠️  Prisma commands failed. You may need to run them manually:${colors.reset}`);
      console.log(`${colors.dim}  pnpm db:generate && pnpm db:push${colors.reset}`);
      throw error;
    }
  }

  private saveEnvVariable(key: string, value: string): void {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    // Read existing .env if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Add or update the variable
    const lines = envContent.split('\n').filter(line => line.trim());
    const existingIndex = lines.findIndex(line => line.startsWith(`${key}=`));

    if (existingIndex >= 0) {
      lines[existingIndex] = `${key}=${value}`;
    } else {
      lines.push(`${key}=${value}`);
    }

    fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
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
        const prompt = (field.sensitive || field.type === 'password') ? '(hidden) ' : '';
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

      // For password fields, hide input
      if (field.type === 'password' && !isPiped) {
        // Use a different readline interface for password input
        const { createInterface } = require('readline');
        const passwordRl = createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: true
        });

        passwordRl.question('> ', (answer) => {
          passwordRl.close();
          resolve(answer);
        });

        // Hide password input by intercepting stdout
        const stdout = process.stdout;
        let muted = false;
        const oldWrite = stdout.write;
        stdout.write = function(chunk: any, encoding?: any, callback?: any) {
          if (!muted && chunk === '> ') {
            muted = true;
            oldWrite.call(this, chunk, encoding, callback);
          } else if (muted && chunk === '\n') {
            muted = false;
            oldWrite.call(this, chunk, encoding, callback);
          } else if (muted) {
            // Don't show the actual password characters
            oldWrite.call(this, '*', encoding, callback);
          } else {
            oldWrite.call(this, chunk, encoding, callback);
          }
          return true;
        };

        passwordRl.on('close', () => {
          stdout.write = oldWrite;
        });
      } else {
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
      }
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
