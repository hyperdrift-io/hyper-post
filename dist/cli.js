#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/database.ts
var database_exports = {};
__export(database_exports, {
  prisma: () => prisma
});
var import_client, globalForPrisma, prisma;
var init_database = __esm({
  "src/database.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    globalForPrisma = globalThis;
    prisma = globalForPrisma.prisma ?? new import_client.PrismaClient({
      log: ["error", "warn"]
    });
    if (process.env.NODE_ENV !== "production")
      globalForPrisma.prisma = prisma;
  }
});

// src/signup-templates.ts
var PLATFORM_SIGNUP_REQUIREMENTS, DIFFICULT_PLATFORM_SIGNUP_REQUIREMENTS, ALL_PLATFORM_SIGNUP_REQUIREMENTS;
var init_signup_templates = __esm({
  "src/signup-templates.ts"() {
    "use strict";
    PLATFORM_SIGNUP_REQUIREMENTS = {
      mastodon: {
        platform: "mastodon",
        displayName: "Mastodon",
        requiredFields: [
          {
            key: "instance",
            label: "Mastodon Instance",
            type: "url",
            description: "Your Mastodon server (e.g., mastodon.social, fosstodon.org)",
            validation: (value) => {
              if (!value.includes("."))
                return "Must be a valid domain";
              if (!value.startsWith("http"))
                value = "https://" + value;
              return true;
            }
          },
          {
            key: "username",
            label: "Username",
            type: "text",
            description: "Choose a unique username for this instance",
            validation: (value) => {
              if (value.length < 1)
                return "Username is required";
              if (value.length > 30)
                return "Username must be 30 characters or less";
              if (!/^[a-zA-Z0-9_]+$/.test(value))
                return "Only letters, numbers, and underscores allowed";
              return true;
            }
          },
          {
            key: "email",
            label: "Email Address",
            type: "email",
            description: "Email for account verification and recovery",
            validation: (value) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(value) || "Must be a valid email address";
            }
          },
          {
            key: "password",
            label: "Password",
            type: "password",
            description: "Strong password for your account",
            validation: (value) => {
              if (value.length < 8)
                return "Password must be at least 8 characters";
              return true;
            }
          }
        ],
        profileFields: [
          {
            key: "displayName",
            label: "Display Name",
            type: "text",
            description: "How others will see you (can include spaces and special characters)",
            maxLength: 30,
            recommended: true
          },
          {
            key: "bio",
            label: "Bio",
            type: "textarea",
            description: "Short description of yourself or your project",
            maxLength: 500,
            recommended: true
          },
          {
            key: "website",
            label: "Website",
            type: "url",
            description: "Link to your website or project",
            recommended: true
          },
          {
            key: "location",
            label: "Location",
            type: "text",
            description: `Where you're based (city, country, or "Digital Nomad")`,
            maxLength: 30,
            recommended: false
          },
          {
            key: "avatar",
            label: "Profile Picture",
            type: "file",
            description: "Square image, minimum 400x400px",
            recommended: true
          },
          {
            key: "header",
            label: "Header Image",
            type: "file",
            description: "Banner image, 1500x500px recommended",
            recommended: false
          }
        ],
        signupSteps: [
          "1. Choose a Mastodon instance (server) - we recommend mastodon.social for beginners",
          '2. Visit the instance website and click "Create account"',
          "3. Accept the server rules",
          "4. Fill in your chosen username, email, and password",
          "5. Complete any CAPTCHA if required",
          "6. Check your email and click the verification link"
        ],
        setupSteps: [
          "1. Complete your profile with bio, website, and images",
          "2. Go to Preferences \u2192 Development \u2192 New application",
          '3. Name: "HyperPost", Scopes: read + write',
          "4. Copy the access token to your .env file"
        ],
        verificationNotes: "Mastodon accounts are verified through email confirmation. Some instances may require additional verification."
      },
      bluesky: {
        platform: "bluesky",
        displayName: "Bluesky",
        requiredFields: [
          {
            key: "email",
            label: "Email Address",
            type: "email",
            description: "Email for account creation and verification",
            validation: (value) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(value) || "Must be a valid email address";
            }
          },
          {
            key: "password",
            label: "Password",
            type: "password",
            description: "Strong password for your account",
            validation: (value) => {
              if (value.length < 8)
                return "Password must be at least 8 characters";
              return true;
            }
          },
          {
            key: "username",
            label: "Username/Handle",
            type: "text",
            description: "Choose a unique handle (will become @handle.bsky.social)",
            validation: (value) => {
              if (value.length < 3)
                return "Handle must be at least 3 characters";
              if (value.length > 18)
                return "Handle must be 18 characters or less";
              if (!/^[a-zA-Z0-9_-]+$/.test(value))
                return "Only letters, numbers, hyphens, and underscores allowed";
              return true;
            }
          }
        ],
        profileFields: [
          {
            key: "displayName",
            label: "Display Name",
            type: "text",
            description: "Your full name or project name",
            maxLength: 64,
            recommended: true
          },
          {
            key: "description",
            label: "Bio/Description",
            type: "textarea",
            description: "Tell people about yourself or your project",
            maxLength: 256,
            recommended: true
          },
          {
            key: "website",
            label: "Website",
            type: "url",
            description: "Link to your website or project",
            recommended: true
          },
          {
            key: "avatar",
            label: "Profile Picture",
            type: "file",
            description: "Square image, will be cropped to circle",
            recommended: true
          },
          {
            key: "banner",
            label: "Banner Image",
            type: "file",
            description: "Header image for your profile",
            recommended: false
          }
        ],
        signupSteps: [
          '1. Go to https://bsky.app and click "Create account"',
          "2. Enter your email address",
          "3. Create a strong password",
          "4. Choose your birth date (must be 16+ to use Bluesky)",
          "5. Choose your unique handle/username",
          "6. Complete the CAPTCHA challenge",
          "7. Check your email and click the verification link"
        ],
        setupSteps: [
          "1. Complete your profile with bio, website, and images",
          "2. Go to Settings \u2192 Privacy and security \u2192 App passwords",
          '3. Click "Add App Password"',
          '4. Name: "HyperPost"',
          "5. Copy the generated app password to your .env file"
        ],
        verificationNotes: "Bluesky requires email verification. Accounts must be 16+ years old. App passwords are required for API access (not your main password)."
      },
      devto: {
        platform: "devto",
        displayName: "Dev.to",
        requiredFields: [
          {
            key: "apiKey",
            label: "API Key",
            type: "password",
            description: "API key from Dev.to settings",
            validation: (value) => {
              if (value.length < 10)
                return "API key appears too short";
              return true;
            }
          }
        ],
        profileFields: [
          {
            key: "username",
            label: "Username",
            type: "text",
            description: "Your Dev.to username",
            required: true
          },
          {
            key: "name",
            label: "Display Name",
            type: "text",
            description: "Your full name",
            required: true
          },
          {
            key: "summary",
            label: "Bio/Summary",
            type: "textarea",
            description: "Short bio (160 characters max)",
            required: false
          },
          {
            key: "location",
            label: "Location",
            type: "text",
            description: "Your location",
            required: false
          },
          {
            key: "website_url",
            label: "Website",
            type: "url",
            description: "Your website URL",
            required: false
          }
        ],
        signupSteps: [
          "1. Go to https://dev.to/settings",
          '2. Look for "Account", "Extensions", or "Integrations" tab',
          '3. Find the "DEV Community API Keys" section',
          '4. Click the "Generate API Key" button',
          '5. Enter a name like "HyperPost" and click generate',
          "6. Copy the generated API key immediately (it won't be shown again)",
          "7. Add DEVTO_API_KEY=your_key_here to your .env file"
        ],
        verificationNotes: "Dev.to API keys are available to all verified accounts. If you don't see the API Keys section, try refreshing the page or check if your account needs additional verification. API keys are generated instantly once the section is visible."
      },
      medium: {
        platform: "medium",
        displayName: "Medium",
        requiredFields: [
          {
            key: "integrationToken",
            label: "Integration Token",
            type: "password",
            description: "Integration token from Medium settings",
            validation: (value) => {
              if (value.length < 20)
                return "Integration token appears too short";
              return true;
            }
          }
        ],
        profileFields: [
          {
            key: "name",
            label: "Display Name",
            type: "text",
            description: "Your display name on Medium",
            required: true
          },
          {
            key: "bio",
            label: "Bio",
            type: "textarea",
            description: "Short bio/about section",
            required: false
          },
          {
            key: "url",
            label: "Website URL",
            type: "url",
            description: "Your personal website",
            required: false
          }
        ],
        signupSteps: [
          "1. Go to https://medium.com/me/settings",
          '2. Scroll down to "Integration tokens"',
          '3. Click "Get integration token"',
          '4. Name it "HyperPost" and create',
          "5. Copy the token to your .env file as MEDIUM_TOKEN"
        ],
        verificationNotes: "Medium integration tokens are created instantly. Requires a Medium account."
      }
    };
    DIFFICULT_PLATFORM_SIGNUP_REQUIREMENTS = {
      discord: {
        platform: "discord",
        displayName: "Discord",
        requiredFields: [
          {
            key: "email",
            label: "Email Address",
            type: "email",
            description: "Email for account creation",
            validation: (value) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(value) || "Must be a valid email address";
            }
          },
          {
            key: "username",
            label: "Username",
            type: "text",
            description: "Choose a unique username",
            validation: (value) => {
              if (value.length < 2)
                return "Username must be at least 2 characters";
              if (value.length > 32)
                return "Username must be 32 characters or less";
              if (!/^[a-zA-Z0-9_-]+$/.test(value))
                return "Only letters, numbers, hyphens, and underscores allowed";
              return true;
            }
          },
          {
            key: "password",
            label: "Password",
            type: "password",
            description: "Strong password for your account",
            validation: (value) => {
              if (value.length < 8)
                return "Password must be at least 8 characters";
              return true;
            }
          }
        ],
        profileFields: [
          {
            key: "displayName",
            label: "Display Name",
            type: "text",
            description: "Your display name (can include spaces and special characters)",
            maxLength: 32,
            recommended: true
          },
          {
            key: "bio",
            label: "About Me/Bio",
            type: "textarea",
            description: "Tell people about yourself or your project",
            maxLength: 190,
            recommended: true
          },
          {
            key: "avatar",
            label: "Profile Picture",
            type: "file",
            description: "Profile picture (will be cropped to circle)",
            recommended: true
          },
          {
            key: "banner",
            label: "Profile Banner",
            type: "file",
            description: "Banner image for your profile",
            recommended: false
          }
        ],
        signupSteps: [
          "1. Go to https://discord.com/register",
          "2. Enter your email address",
          "3. Choose a unique username",
          "4. Create a strong password",
          "5. Enter your date of birth (must be 13+ to use Discord)",
          "6. Complete any CAPTCHA if required",
          "7. Check your email and verify your account"
        ],
        setupSteps: [
          "1. Complete your profile with bio and images",
          "2. Go to https://discord.com/developers/applications",
          '3. Click "New Application"',
          '4. Name: "HyperPost Bot"',
          '5. Go to "Bot" section and click "Add Bot"',
          "6. Copy the bot token to your .env file",
          "7. Get a channel ID from your server (right-click channel \u2192 Copy ID)"
        ],
        verificationNotes: "Discord requires email verification and accounts must be 13+. Bot tokens are separate from user accounts and require a bot application. You need a server and channel to post to. Discord has rate limits on bot posting."
      },
      reddit: {
        platform: "reddit",
        displayName: "Reddit",
        requiredFields: [
          {
            key: "username",
            label: "Username",
            type: "text",
            description: "Choose a unique Reddit username",
            validation: (value) => {
              if (value.length < 3)
                return "Username must be at least 3 characters";
              if (value.length > 20)
                return "Username must be 20 characters or less";
              if (!/^[a-zA-Z0-9_-]+$/.test(value))
                return "Only letters, numbers, hyphens, and underscores allowed";
              return true;
            }
          },
          {
            key: "email",
            label: "Email Address",
            type: "email",
            description: "Email for account verification",
            validation: (value) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(value) || "Must be a valid email address";
            }
          },
          {
            key: "password",
            label: "Password",
            type: "password",
            description: "Strong password for your account",
            validation: (value) => {
              if (value.length < 8)
                return "Password must be at least 8 characters";
              return true;
            }
          }
        ],
        profileFields: [
          {
            key: "displayName",
            label: "Display Name",
            type: "text",
            description: "Your display name (optional, can be changed later)",
            maxLength: 30,
            recommended: false
          },
          {
            key: "bio",
            label: "About/Description",
            type: "textarea",
            description: "Tell the Reddit community about yourself",
            maxLength: 200,
            recommended: true
          },
          {
            key: "website",
            label: "Website",
            type: "url",
            description: "Link to your website or project",
            recommended: true
          },
          {
            key: "avatar",
            label: "Profile Picture",
            type: "file",
            description: "Square image, will be displayed on your profile",
            recommended: true
          },
          {
            key: "banner",
            label: "Profile Banner",
            type: "file",
            description: "Banner image for your profile",
            recommended: false
          },
          {
            key: "location",
            label: "Location",
            type: "text",
            description: "Where you're from or based",
            maxLength: 100,
            recommended: false
          }
        ],
        signupSteps: [
          "1. Go to https://www.reddit.com/register/",
          "2. Choose a unique username",
          "3. Enter your email address",
          "4. Create a strong password",
          "5. Complete any CAPTCHA if required",
          "6. Check your email and verify your account"
        ],
        setupSteps: [
          "1. Complete your profile with bio, website, and images",
          "2. Go to https://www.reddit.com/prefs/apps/",
          '3. Click "Create App" or "Create Another App"',
          '4. Type: "script", Name: "HyperPost", Description: "Multi-platform posting"',
          '5. Redirect URI: "http://localhost:8080"',
          "6. Copy the client_id and secret to your .env file"
        ],
        verificationNotes: "Reddit requires email verification. You must create an app in preferences to get API credentials. Reddit has strict API rate limits and requires OAuth for posting. Network connectivity issues may prevent API access."
      },
      twitter: {
        platform: "twitter",
        displayName: "Twitter/X",
        requiredFields: [
          {
            key: "apiKey",
            label: "API Key",
            type: "password",
            description: "Twitter API Key from developer portal",
            validation: (value) => {
              if (value.length < 20)
                return "API Key should be longer";
              return true;
            }
          },
          {
            key: "apiSecret",
            label: "API Secret",
            type: "password",
            description: "Twitter API Secret from developer portal",
            validation: (value) => {
              if (value.length < 40)
                return "API Secret should be longer";
              return true;
            }
          },
          {
            key: "accessToken",
            label: "Access Token",
            type: "password",
            description: "Twitter Access Token from developer portal",
            validation: (value) => {
              if (value.length < 40)
                return "Access Token should be longer";
              return true;
            }
          },
          {
            key: "accessTokenSecret",
            label: "Access Token Secret",
            type: "password",
            description: "Twitter Access Token Secret from developer portal",
            validation: (value) => {
              if (value.length < 40)
                return "Access Token Secret should be longer";
              return true;
            }
          }
        ],
        profileFields: [
          {
            key: "displayName",
            label: "Display Name",
            type: "text",
            description: "Your display name on Twitter",
            maxLength: 50,
            recommended: true
          },
          {
            key: "bio",
            label: "Bio",
            type: "textarea",
            description: "Your Twitter bio",
            maxLength: 160,
            recommended: true
          },
          {
            key: "website",
            label: "Website",
            type: "url",
            description: "Link to your website",
            recommended: true
          },
          {
            key: "location",
            label: "Location",
            type: "text",
            description: "Your location",
            maxLength: 30,
            recommended: false
          },
          {
            key: "avatar",
            label: "Profile Picture",
            type: "file",
            description: "Profile picture (will be cropped to circle)",
            recommended: true
          },
          {
            key: "banner",
            label: "Header Image",
            type: "file",
            description: "Header/banner image for your profile",
            recommended: false
          }
        ],
        signupSteps: [
          "1. Apply for Twitter Developer Account at https://developer.twitter.com/",
          "2. Wait for approval (can take days/weeks)",
          "3. Create a new app in the developer portal",
          "4. Generate API keys and access tokens",
          "5. Set up OAuth 1.0a authentication"
        ],
        setupSteps: [
          "1. Complete your Twitter profile with bio, website, and images",
          "2. In developer portal, go to your app settings",
          "3. Generate API Key, API Secret, Access Token, and Access Token Secret",
          "4. Ensure your app has write permissions",
          "5. Test API connectivity before using"
        ],
        verificationNotes: "Twitter/X requires developer account approval which can take significant time. API access is restricted and requires OAuth 1.0a. Twitter has strict rate limits and API changes frequently. Not recommended for casual use."
      }
    };
    ALL_PLATFORM_SIGNUP_REQUIREMENTS = {
      ...PLATFORM_SIGNUP_REQUIREMENTS,
      ...DIFFICULT_PLATFORM_SIGNUP_REQUIREMENTS
    };
  }
});

// src/signup-manager.ts
var fs, path, os, DEFAULT_CONFIG_FILE, LEGACY_CONFIG_FILE, FALLBACK_DEFAULT_TEMPLATE, SignupManager;
var init_signup_manager = __esm({
  "src/signup-manager.ts"() {
    "use strict";
    fs = __toESM(require("fs"));
    path = __toESM(require("path"));
    os = __toESM(require("os"));
    init_signup_templates();
    DEFAULT_CONFIG_FILE = "config.json";
    LEGACY_CONFIG_FILE = ".hyperpost-config.json";
    FALLBACK_DEFAULT_TEMPLATE = {
      username: "hyperdrift",
      displayName: "HyperDrift",
      email: "yann@hyperdrift.io",
      bio: "Building the future of software development. Open-source tools for independent developers and communities. #Web3 #OpenSource #DeveloperTools",
      description: "HyperDrift is an ecosystem of small but focused apps, tools, and thoughts. We build software that solves real problems, shares ideas openly, and puts developers first.",
      website: "https://hyperdrift.io",
      location: "Digital Nomad",
      accountType: "project",
      primaryTopics: ["web3", "opensource", "developer-tools", "productivity", "community"],
      targetAudience: "Independent developers, open-source contributors, and communities building the future of software"
    };
    SignupManager = class {
      dataPath;
      data;
      configPath;
      config;
      configDir;
      constructor() {
        this.configDir = this.getConfigDirectory();
        this.dataPath = path.join(this.configDir, "signup-data.json");
        this.configPath = this.getConfigFilePath();
        this.loadData();
        this.loadConfig();
      }
      getConfigFilePath() {
        const newConfigPath = path.join(this.configDir, DEFAULT_CONFIG_FILE);
        const legacyConfigPath = path.join(this.configDir, LEGACY_CONFIG_FILE);
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
      getConfigDirectory() {
        const cwd = process.cwd();
        const hasPackageJson = fs.existsSync(path.join(cwd, "package.json"));
        const hasNodeModules = fs.existsSync(path.join(cwd, "node_modules"));
        if (hasPackageJson || hasNodeModules) {
          return cwd;
        }
        const userConfigDir = path.join(os.homedir(), ".config", "hyper-post");
        if (!fs.existsSync(userConfigDir)) {
          fs.mkdirSync(userConfigDir, { recursive: true });
        }
        return userConfigDir;
      }
      loadData() {
        try {
          if (fs.existsSync(this.dataPath)) {
            const content = fs.readFileSync(this.dataPath, "utf8");
            this.data = JSON.parse(content);
            if (this.data.version !== "1.0") {
              console.warn("Signup data version mismatch, resetting...");
              this.initializeData();
            }
          } else {
            this.initializeData();
          }
        } catch (error) {
          console.warn("Failed to load signup data, initializing new data...");
          this.initializeData();
        }
      }
      initializeData() {
        this.data = {
          version: "1.0",
          templates: {},
          completedAccounts: {},
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      loadConfig() {
        try {
          if (fs.existsSync(this.configPath)) {
            const content = fs.readFileSync(this.configPath, "utf8");
            this.config = JSON.parse(content);
          } else {
            this.config = { defaultTemplate: FALLBACK_DEFAULT_TEMPLATE };
            this.saveConfig();
          }
        } catch (error) {
          console.error("Error loading config:", error);
          this.config = { defaultTemplate: FALLBACK_DEFAULT_TEMPLATE };
        }
      }
      saveConfig() {
        try {
          fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), "utf8");
        } catch (error) {
          console.error("Error saving config:", error);
        }
      }
      saveData() {
        this.data.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
      }
      // Template management
      hasTemplate(platform) {
        if (platform) {
          return !!this.data.templates[platform];
        }
        return Object.keys(this.data.templates).length > 0;
      }
      getTemplate(platform) {
        return this.data.templates[platform] || null;
      }
      getAllTemplates() {
        return { ...this.data.templates };
      }
      saveTemplate(platform, template) {
        this.data.templates[platform] = { ...template };
        this.saveData();
      }
      // Account management
      hasCompletedAccount(platform) {
        return !!this.data.completedAccounts[platform];
      }
      getCompletedAccount(platform) {
        return this.data.completedAccounts[platform] || null;
      }
      saveCompletedAccount(platform, credentials) {
        this.data.completedAccounts[platform] = {
          ...credentials,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.saveData();
      }
      getAllCompletedAccounts() {
        return { ...this.data.completedAccounts };
      }
      // Utility methods
      getConfiguredPlatforms() {
        return Object.keys(this.data.completedAccounts);
      }
      getAvailablePlatforms() {
        return Object.keys(PLATFORM_SIGNUP_REQUIREMENTS);
      }
      resetPlatform(platform) {
        delete this.data.templates[platform];
        delete this.data.completedAccounts[platform];
        this.saveData();
      }
      // Get default template for examples
      getDefaultTemplate() {
        return { ...this.config.defaultTemplate };
      }
      // Initialize with default template if no templates exist
      ensureDefaultTemplate() {
        if (!this.hasTemplate()) {
          console.log("\u{1F4A1} No templates found. Using default template as example...");
        }
      }
      // Update the default template configuration
      updateDefaultTemplate(template) {
        this.config.defaultTemplate = { ...template };
        this.saveConfig();
      }
      exportToEnv() {
        let envContent = "# HyperPost Configuration\n";
        envContent += `# Generated from signup templates on ${(/* @__PURE__ */ new Date()).toISOString()}

`;
        for (const [platform, credentials] of Object.entries(this.data.completedAccounts)) {
          const requirements = PLATFORM_SIGNUP_REQUIREMENTS[platform];
          if (!requirements)
            continue;
          envContent += `# ========================================
`;
          envContent += `# ${requirements.displayName}
`;
          envContent += `# ========================================
`;
          const template = this.data.templates[platform];
          if (template) {
            envContent += `# Account: ${template.displayName} (${template.username})
`;
            envContent += `# Email: ${template.email}
`;
            if (template.bio)
              envContent += `# Bio: ${template.bio}
`;
            if (template.website)
              envContent += `# Website: ${template.website}
`;
            if (template.location)
              envContent += `# Location: ${template.location}
`;
          }
          for (const [key, value] of Object.entries(credentials)) {
            if (key !== "createdAt") {
              const envKey = `${platform.toUpperCase()}_${key.toUpperCase()}`;
              envContent += `${envKey}=${value}
`;
            }
          }
          envContent += "\n";
        }
        return envContent;
      }
    };
  }
});

// src/setup.ts
var setup_exports = {};
__export(setup_exports, {
  HyperPostSetup: () => HyperPostSetup
});
var readline, fs2, path2, colors, HyperPostSetup;
var init_setup = __esm({
  "src/setup.ts"() {
    "use strict";
    readline = __toESM(require("readline"));
    fs2 = __toESM(require("fs"));
    path2 = __toESM(require("path"));
    init_signup_templates();
    init_signup_manager();
    colors = {
      reset: "\x1B[0m",
      bright: "\x1B[1m",
      dim: "\x1B[2m",
      // Foreground colors
      red: "\x1B[31m",
      green: "\x1B[32m",
      yellow: "\x1B[33m",
      blue: "\x1B[34m",
      magenta: "\x1B[35m",
      cyan: "\x1B[36m",
      white: "\x1B[37m",
      // Background colors
      bgRed: "\x1B[41m",
      bgGreen: "\x1B[42m",
      bgYellow: "\x1B[43m",
      bgBlue: "\x1B[44m",
      bgMagenta: "\x1B[45m",
      bgCyan: "\x1B[46m"
    };
    HyperPostSetup = class {
      rl;
      envPath;
      signupManager;
      isRunning = false;
      constructor() {
        const isPiped = !process.stdin.isTTY || process.env.CI;
        this.rl = readline.createInterface({
          input: process.stdin,
          output: isPiped ? null : process.stdout,
          terminal: !isPiped
        });
        this.envPath = path2.join(process.cwd(), ".env");
        this.signupManager = new SignupManager();
      }
      isPipedInput() {
        return !process.stdin.isTTY || process.env.CI;
      }
      printHeader() {
        console.log(`${colors.bright}${colors.cyan}\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}\u2551${colors.reset}${colors.bright}${colors.white}                 \u{1F680} HYPERPOST SETUP WIZARD${colors.reset}${colors.bright}${colors.cyan}                 \u2551${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D${colors.reset}`);
        console.log("");
        console.log(`${colors.yellow}Create genuine social media accounts with complete profiles${colors.reset}`);
        console.log(`${colors.yellow}for professional, trustworthy presence across platforms.${colors.reset}
`);
      }
      async run() {
        if (this.isRunning) {
          console.log(`${colors.yellow}Setup is already running...${colors.reset}`);
          return;
        }
        this.isRunning = true;
        this.printHeader();
        if (fs2.existsSync(this.envPath)) {
          console.log(`${colors.blue}\u{1F4C1} Existing Configuration Found:${colors.reset}`);
          const existingPlatforms = this.signupManager.getConfiguredPlatforms();
          if (existingPlatforms.length > 0) {
            console.log(`${colors.green}Currently configured platforms:${colors.reset}`, existingPlatforms.join(", "));
          } else {
            console.log(`${colors.yellow}No platforms currently configured.${colors.reset}`);
          }
          console.log(`${colors.dim}New platform credentials will be added to existing configuration.${colors.reset}
`);
        }
        const quickSetup = process.argv.includes("--quick") || process.argv.includes("-q");
        if (quickSetup) {
          await this.quickSetup();
          return;
        }
        const dbChoice = await this.selectDatabase();
        await this.createSignupTemplates();
        const platforms = await this.selectPlatforms();
        for (const platform of platforms) {
          await this.createPlatformAccount(platform);
        }
        await this.generateEnvFile();
        console.log(`
${colors.bright}${colors.green}\u{1F389} ALL ACCOUNTS CREATED AND CONFIGURED!${colors.reset}`);
        console.log(`${colors.cyan}You can now post to all platforms with:${colors.reset}`);
        console.log(`${colors.yellow}hyper-post post -c "Your message" -t "Title" -u "https://link.com"${colors.reset}`);
        this.rl.close();
        this.isRunning = false;
      }
      async createSignupTemplates() {
        console.log(`${colors.bright}${colors.magenta}\u{1F4DD} SIGNUP TEMPLATES${colors.reset}`);
        console.log(`${colors.dim}\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550${colors.reset}`);
        const existingTemplates = this.signupManager.getAllTemplates();
        const defaultTemplate = this.signupManager.getDefaultTemplate();
        if (Object.keys(existingTemplates).length > 0) {
          console.log(`${colors.blue}Found existing signup templates:${colors.reset}`);
          Object.entries(existingTemplates).forEach(([platform, template]) => {
            console.log(`  ${colors.green}\u2022${colors.reset} ${platform}: ${template.displayName} (${template.email})`);
          });
          const reuse = await this.askYesNo("\nReuse existing template for new platforms?");
          if (reuse) {
            console.log(`${colors.green}\u2705 Using existing template.${colors.reset}
`);
            return;
          }
          console.log(`${colors.yellow}\u{1F4DD} Creating new template.${colors.reset}
`);
        }
        console.log(`${colors.cyan}Let's create consistent branding across all platforms.${colors.reset}`);
        console.log(`${colors.dim}Using HyperDrift as example template...${colors.reset}
`);
        const accountType = await this.selectAccountType();
        const username = await this.askFieldWithDefault({
          key: "username",
          label: "Base Username",
          description: "Base username (will be adapted per platform)",
          type: "text",
          required: true,
          defaultValue: defaultTemplate.username,
          validation: (value) => {
            if (value.length < 2)
              return "Username must be at least 2 characters";
            if (!/^[a-zA-Z0-9_-]+$/.test(value))
              return "Only letters, numbers, hyphens, underscores";
            return true;
          }
        });
        const displayName = await this.askFieldWithDefault({
          key: "displayName",
          label: "Display Name",
          description: "Full name or project name shown publicly",
          type: "text",
          required: true,
          defaultValue: defaultTemplate.displayName
        });
        const email = await this.askFieldWithDefault({
          key: "email",
          label: "Email Address",
          description: "Primary email for accounts (can vary per platform)",
          type: "email",
          required: true,
          defaultValue: defaultTemplate.email
        });
        console.log(`
${colors.cyan}\u{1F4CB} Profile Information (consistent across platforms):${colors.reset}`);
        const bio = await this.askFieldWithDefault({
          key: "bio",
          label: "Bio/Description",
          description: "Short description of your project/persona",
          type: "textarea",
          required: true,
          maxLength: 200,
          defaultValue: defaultTemplate.bio
        });
        const website = await this.askFieldWithDefault({
          key: "website",
          label: "Website URL",
          description: "Your main website or project URL",
          type: "url",
          required: true,
          defaultValue: defaultTemplate.website
        });
        const location = await this.askFieldWithDefault({
          key: "location",
          label: "Location",
          description: 'Location (city, country, or "Digital Nomad")',
          type: "text",
          required: false,
          defaultValue: defaultTemplate.location
        });
        const baseTemplate = {
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
        Object.keys(ALL_PLATFORM_SIGNUP_REQUIREMENTS).forEach((platform) => {
          this.signupManager.saveTemplate(platform, baseTemplate);
        });
        console.log(`${colors.green}\u2705 Signup templates created and saved!${colors.reset}
`);
      }
      async selectDatabase() {
        console.log(`${colors.bright}${colors.blue}\u{1F5C4}\uFE0F  DATABASE SETUP${colors.reset}`);
        console.log(`${colors.dim}\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550${colors.reset}`);
        console.log(`${colors.cyan}Choose your database:${colors.reset}`);
        console.log(`${colors.green}1.${colors.reset} SQLite (Recommended) - Simple, no setup required`);
        console.log(`${colors.yellow}2.${colors.reset} PostgreSQL - Advanced, requires PostgreSQL server`);
        console.log("");
        const hasExistingSchema = fs2.existsSync(path2.join(process.cwd(), "schema.prisma"));
        if (hasExistingSchema) {
          console.log(`${colors.blue}\u{1F4C1} Existing database schema found. We'll update it with your choice.${colors.reset}`);
          console.log("");
        }
        while (true) {
          const choice = await this.askField({
            key: "database",
            label: "Database Choice (1-2)",
            description: "Choose database type",
            type: "text",
            required: true
          });
          switch (choice) {
            case "1":
              await this.setupSQLite();
              return "sqlite";
            case "2":
              await this.setupPostgreSQL();
              return "postgresql";
            default:
              console.log(`${colors.red}\u274C Please choose 1 or 2.${colors.reset}`);
          }
        }
      }
      async selectAccountType() {
        console.log(`${colors.cyan}What type of account is this?${colors.reset}`);
        console.log(`${colors.yellow}1.${colors.reset} Personal - Individual developer/streamer`);
        console.log(`${colors.yellow}2.${colors.reset} Business - Company or startup`);
        console.log(`${colors.yellow}3.${colors.reset} Community - Group or organization`);
        console.log(`${colors.yellow}4.${colors.reset} Project - Open source project or tool`);
        while (true) {
          const choice = await this.askField({
            key: "choice",
            label: "Account Type (1-4)",
            description: "Choose account type",
            type: "text",
            required: true
          });
          switch (choice) {
            case "1":
              return "personal";
            case "2":
              return "business";
            case "3":
              return "community";
            case "4":
              return "project";
            default:
              console.log(`${colors.red}\u274C Please choose 1, 2, 3, or 4.${colors.reset}`);
          }
        }
      }
      async setupSQLite() {
        console.log(`${colors.green}\u{1F4E6} Setting up SQLite database...${colors.reset}`);
        try {
          const schemaPath = path2.join(process.cwd(), "schema.prisma");
          let schemaContent = fs2.readFileSync(schemaPath, "utf8");
          schemaContent = schemaContent.replace(
            /datasource db \{\s*provider = "postgresql"/,
            'datasource db {\n  provider = "sqlite"'
          );
          schemaContent = schemaContent.replace(
            /url\s*=\s*env\("DATABASE_URL"\)/,
            'url = "file:./hyperpost.db"'
          );
          fs2.writeFileSync(schemaPath, schemaContent, "utf8");
          console.log(`${colors.green}\u2705 Updated schema.prisma for SQLite${colors.reset}`);
          await this.runPrismaCommands();
        } catch (error) {
          console.log(`${colors.yellow}\u26A0\uFE0F  SQLite setup completed with warnings. You may need to run 'pnpm db:generate && pnpm db:push' manually.${colors.reset}`);
        }
      }
      async setupPostgreSQL() {
        console.log(`${colors.yellow}\u{1F418} Setting up PostgreSQL database...${colors.reset}`);
        const existingDbUrl = process.env.DATABASE_URL;
        if (existingDbUrl) {
          console.log(`${colors.blue}\u{1F4CB} Found existing DATABASE_URL environment variable${colors.reset}`);
          const useExisting = await this.askYesNo("Use existing DATABASE_URL?");
          if (useExisting) {
            await this.setupPostgreSQLWithUrl(existingDbUrl);
            return;
          }
        }
        console.log(`${colors.cyan}PostgreSQL connection details:${colors.reset}`);
        const host = await this.askFieldWithDefault({
          key: "host",
          label: "Host",
          description: "PostgreSQL server host (e.g., localhost, db.example.com)",
          type: "text",
          required: true,
          defaultValue: "localhost"
        });
        const port = await this.askFieldWithDefault({
          key: "port",
          label: "Port",
          description: "PostgreSQL server port",
          type: "text",
          required: true,
          defaultValue: "5432"
        });
        const database = await this.askFieldWithDefault({
          key: "database",
          label: "Database Name",
          description: "PostgreSQL database name",
          type: "text",
          required: true,
          defaultValue: "hyperpost"
        });
        const username = await this.askFieldWithDefault({
          key: "username",
          label: "Username",
          description: "PostgreSQL username",
          type: "text",
          required: true,
          defaultValue: process.env.USER || "postgres"
        });
        const password = await this.askField({
          key: "password",
          label: "Password",
          description: "PostgreSQL password",
          type: "password",
          required: true
        });
        const dbUrl = `postgresql://${username}:${password}@${host}:${port}/${database}`;
        await this.setupPostgreSQLWithUrl(dbUrl);
      }
      async setupPostgreSQLWithUrl(dbUrl) {
        try {
          const schemaPath = path2.join(process.cwd(), "schema.prisma");
          let schemaContent = fs2.readFileSync(schemaPath, "utf8");
          schemaContent = schemaContent.replace(
            /datasource db \{\s*provider = "[^"]*"/,
            'datasource db {\n  provider = "postgresql"'
          );
          schemaContent = schemaContent.replace(
            /url\s*=\s*"[^"]*"/,
            `url = env("DATABASE_URL")`
          );
          fs2.writeFileSync(schemaPath, schemaContent, "utf8");
          console.log(`${colors.green}\u2705 Updated schema.prisma for PostgreSQL${colors.reset}`);
          process.env.DATABASE_URL = dbUrl;
          await this.runPrismaCommands();
          const signupManager = new SignupManager();
          const configDir = signupManager["configDir"];
          if (configDir === process.cwd()) {
            this.saveEnvVariable("DATABASE_URL", dbUrl);
          }
        } catch (error) {
          console.log(`${colors.yellow}\u26A0\uFE0F  PostgreSQL setup completed with warnings. You may need to run 'pnpm db:generate && pnpm db:push' manually.${colors.reset}`);
          console.log(`${colors.dim}Make sure your PostgreSQL server is running and accessible.${colors.reset}`);
        }
      }
      async runPrismaCommands() {
        const { execSync } = require("child_process");
        try {
          console.log(`${colors.blue}\u{1F504} Generating Prisma client...${colors.reset}`);
          execSync("npx prisma generate", { stdio: "inherit" });
          console.log(`${colors.blue}\u{1F4E6} Setting up database schema...${colors.reset}`);
          execSync("npx prisma db push", { stdio: "inherit" });
          console.log(`${colors.green}\u2705 Database setup complete!${colors.reset}`);
        } catch (error) {
          console.log(`${colors.yellow}\u26A0\uFE0F  Prisma commands failed. You may need to run them manually:${colors.reset}`);
          console.log(`${colors.dim}  pnpm db:generate && pnpm db:push${colors.reset}`);
          throw error;
        }
      }
      saveEnvVariable(key, value) {
        const envPath = path2.join(process.cwd(), ".env");
        let envContent = "";
        if (fs2.existsSync(envPath)) {
          envContent = fs2.readFileSync(envPath, "utf8");
        }
        const lines = envContent.split("\n").filter((line) => line.trim());
        const existingIndex = lines.findIndex((line) => line.startsWith(`${key}=`));
        if (existingIndex >= 0) {
          lines[existingIndex] = `${key}=${value}`;
        } else {
          lines.push(`${key}=${value}`);
        }
        fs2.writeFileSync(envPath, lines.join("\n") + "\n", "utf8");
      }
      async selectPlatforms() {
        console.log(`${colors.bright}${colors.blue}\u{1F3AF} SELECT PLATFORMS TO SET UP${colors.reset}`);
        console.log(`${colors.dim}\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550${colors.reset}`);
        const configuredPlatforms = this.signupManager.getConfiguredPlatforms();
        const availablePlatforms = Object.entries(PLATFORM_SIGNUP_REQUIREMENTS);
        console.log(`
${colors.cyan}Available platforms:${colors.reset}`);
        availablePlatforms.forEach(([key, req], index) => {
          const isConfigured = configuredPlatforms.includes(key);
          const status = isConfigured ? `${colors.green}[CONFIGURED]${colors.reset}` : `${colors.yellow}[NOT SET UP]${colors.reset}`;
          console.log(`   ${colors.yellow}${index + 1}.${colors.reset} ${key}: ${req.displayName} ${status}`);
        });
        if (configuredPlatforms.length > 0) {
          console.log(`
${colors.blue}\u{1F4A1} You can reconfigure existing platforms or add new ones.${colors.reset}`);
          console.log(`   ${colors.dim}Existing credentials will be updated with new values.${colors.reset}`);
        }
        console.log(`
${colors.cyan}Select platforms by number (comma-separated, e.g., "1,3,4"):${colors.reset}`);
        const selection = await this.askField({
          key: "platforms",
          label: "Platform Numbers",
          description: "Comma-separated list of platform numbers",
          type: "text",
          required: true
        });
        const selectedIndices = selection.split(",").map((s) => parseInt(s.trim()) - 1);
        const selectedPlatforms = [];
        for (const index of selectedIndices) {
          if (index >= 0 && index < availablePlatforms.length) {
            const platformKey = availablePlatforms[index][0];
            selectedPlatforms.push(platformKey);
          }
        }
        if (selectedPlatforms.length === 0) {
          console.log(`${colors.red}\u274C No valid platforms selected. Exiting.${colors.reset}`);
          process.exit(1);
        }
        console.log(`
${colors.green}\u2705 Selected platforms: ${selectedPlatforms.join(", ")}${colors.reset}
`);
        return selectedPlatforms;
      }
      async createPlatformAccount(platform) {
        const requirements = PLATFORM_SIGNUP_REQUIREMENTS[platform];
        let template = this.signupManager.getTemplate(platform);
        if (!template) {
          console.log(`\u274C No signup template found for ${requirements.displayName}. Please create templates first.`);
          return;
        }
        console.log(`
\u{1F3D7}\uFE0F  Creating ${requirements.displayName} Account`);
        console.log("=".repeat(50));
        console.log(`
\u{1F4CB} ${requirements.displayName} Account Creation Guide:`);
        console.log("=".repeat(50));
        console.log("\n\u{1F4DD} ACCOUNT CREATION STEPS:");
        requirements.signupSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
        console.log(`
\u{1F511} REQUIRED ACCOUNT INFORMATION:`);
        for (const field of requirements.requiredFields) {
          const value = await this.askField(field);
          template.customFields = template.customFields || {};
          template.customFields[field.key] = value;
        }
        console.log(`
\u{1F527} POST-CREATION SETUP STEPS:`);
        requirements.setupSteps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
        if (requirements.verificationNotes) {
          console.log(`
\u26A0\uFE0F  VERIFICATION NOTES:`);
          console.log(`   ${requirements.verificationNotes}`);
        }
        console.log(`
\u23F3 Complete the account creation steps above, then:`);
        console.log(`
\u{1F510} API CREDENTIALS (after account setup):`);
        for (const field of requirements.requiredFields) {
          if (field.key.includes("Token") || field.key.includes("Secret") || field.key.includes("Password")) {
            const value = await this.askField({
              ...field,
              description: field.description + " (from account settings after setup)"
            });
            template.customFields = template.customFields || {};
            template.customFields[field.key] = value;
          }
        }
        this.signupManager.saveCompletedAccount(platform, template.customFields || {});
        console.log(`\u2705 ${requirements.displayName} account configured and saved!`);
      }
      async askField(field) {
        return new Promise((resolve) => {
          const isPiped = this.isPipedInput();
          if (!isPiped) {
            const prompt = field.sensitive || field.type === "password" ? "(hidden) " : "";
            const maxNote = field.maxLength ? ` (max ${field.maxLength} chars)` : "";
            const requiredNote = field.required ? " *" : "";
            console.log(`
${field.label}${requiredNote}${maxNote}`);
            if (field.description) {
              console.log(`   ${field.description}`);
            }
            if (field.type === "select" && field.options) {
              console.log(`   Options: ${field.options.join(", ")}`);
            }
          }
          if (field.type === "password" && !isPiped) {
            const { createInterface: createInterface2 } = require("readline");
            const passwordRl = createInterface2({
              input: process.stdin,
              output: process.stdout,
              terminal: true
            });
            passwordRl.question("> ", (answer) => {
              passwordRl.close();
              resolve(answer);
            });
            const stdout = process.stdout;
            let muted = false;
            const oldWrite = stdout.write;
            stdout.write = function(chunk, encoding, callback) {
              if (!muted && chunk === "> ") {
                muted = true;
                oldWrite.call(this, chunk, encoding, callback);
              } else if (muted && chunk === "\n") {
                muted = false;
                oldWrite.call(this, chunk, encoding, callback);
              } else if (muted) {
                oldWrite.call(this, "*", encoding, callback);
              } else {
                oldWrite.call(this, chunk, encoding, callback);
              }
              return true;
            };
            passwordRl.on("close", () => {
              stdout.write = oldWrite;
            });
          } else {
            this.rl.question(isPiped ? "" : "> ", (answer) => {
              if (!answer && field.required) {
                if (!isPiped)
                  console.log(`\u274C ${field.label} is required.`);
                resolve(this.askField(field));
                return;
              }
              if (answer && field.validation) {
                const validationResult = field.validation(answer);
                if (validationResult !== true) {
                  if (!isPiped)
                    console.log(`\u274C ${validationResult}`);
                  resolve(this.askField(field));
                  return;
                }
              }
              if (answer && field.maxLength && answer.length > field.maxLength) {
                if (!isPiped)
                  console.log(`\u274C Too long! Maximum ${field.maxLength} characters.`);
                resolve(this.askField(field));
                return;
              }
              resolve(answer);
            });
          }
        });
      }
      async askFieldWithDefault(field) {
        return new Promise((resolve) => {
          const isPiped = this.isPipedInput();
          if (!isPiped) {
            const prompt = field.sensitive ? "(hidden) " : "";
            const maxNote = field.maxLength ? ` (max ${field.maxLength} chars)` : "";
            const requiredNote = field.required ? " *" : "";
            const defaultNote = field.defaultValue ? ` [${colors.green}${field.defaultValue}${colors.reset}]` : "";
            console.log(`
${colors.bright}${field.label}${colors.reset}${defaultNote}${requiredNote}${maxNote}`);
            if (field.description) {
              console.log(`   ${colors.dim}${field.description}${colors.reset}`);
            }
            if (field.type === "select" && field.options) {
              console.log(`   Options: ${field.options.join(", ")}`);
            }
          }
          this.rl.question(isPiped ? "" : "> ", (answer) => {
            const finalAnswer = answer.trim() || field.defaultValue || "";
            if (!finalAnswer && field.required) {
              if (!isPiped)
                console.log(`${colors.red}\u274C ${field.label} is required.${colors.reset}`);
              resolve(this.askFieldWithDefault(field));
              return;
            }
            if (finalAnswer && field.validation) {
              const validationResult = field.validation(finalAnswer);
              if (validationResult !== true) {
                if (!isPiped)
                  console.log(`${colors.red}\u274C ${validationResult}${colors.reset}`);
                resolve(this.askFieldWithDefault(field));
                return;
              }
            }
            if (finalAnswer && field.maxLength && finalAnswer.length > field.maxLength) {
              if (!isPiped)
                console.log(`${colors.red}\u274C Too long! Maximum ${field.maxLength} characters.${colors.reset}`);
              resolve(this.askFieldWithDefault(field));
              return;
            }
            resolve(finalAnswer);
          });
        });
      }
      async askYesNo(question) {
        return new Promise((resolve) => {
          const isPiped = this.isPipedInput();
          this.rl.question(isPiped ? "" : `${question} (y/N): `, (answer) => {
            resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
          });
        });
      }
      async generateEnvFile() {
        const newEnvContent = this.signupManager.exportToEnv();
        let existingContent = "";
        if (fs2.existsSync(this.envPath)) {
          existingContent = fs2.readFileSync(this.envPath, "utf8");
        }
        const mergedContent = this.mergeEnvContent(existingContent, newEnvContent);
        fs2.writeFileSync(this.envPath, mergedContent);
        console.log(`\u{1F4C4} Updated .env file at ${this.envPath} (added new platform credentials)`);
      }
      mergeEnvContent(existing, newContent) {
        const existingLines = existing.split("\n").filter((line) => line.trim());
        const newLines = newContent.split("\n").filter((line) => line.trim());
        const existingVars = /* @__PURE__ */ new Map();
        const existingComments = [];
        for (const line of existingLines) {
          if (line.startsWith("#")) {
            existingComments.push(line);
          } else if (line.includes("=")) {
            const [key, ...valueParts] = line.split("=");
            existingVars.set(key.trim(), valueParts.join("=").trim());
          }
        }
        for (const line of newLines) {
          if (!line.startsWith("#") && line.includes("=")) {
            const [key, ...valueParts] = line.split("=");
            existingVars.set(key.trim(), valueParts.join("=").trim());
          }
        }
        const result = [];
        result.push("# HyperPost Configuration");
        result.push("# Generated and updated by setup wizard");
        result.push("# Genuine accounts with complete profiles");
        result.push("");
        const platformGroups = {};
        const otherVars = [];
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
        const platformOrder = ["mastodon", "bluesky", "reddit", "discord"];
        for (const platform of platformOrder) {
          if (platformGroups[platform]) {
            result.push(`# ========================================`);
            result.push(`# ${platform.toUpperCase()}`);
            result.push(`# ========================================`);
            result.push(...platformGroups[platform]);
            result.push("");
          }
        }
        if (otherVars.length > 0) {
          result.push("# ========================================");
          result.push("# OTHER SETTINGS");
          result.push("# ========================================");
          result.push(...otherVars);
          result.push("");
        }
        return result.join("\n");
      }
    };
  }
});

// src/cli.ts
var import_commander = require("commander");

// src/platforms/BasePlatform.ts
var BasePlatform = class {
  credentials;
  constructor(credentials) {
    this.credentials = credentials;
  }
  validateCredentials() {
    const requiredFields = this.getRequiredCredentials();
    const missing = requiredFields.filter((field) => !this.credentials[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required credentials for ${this.displayName}: ${missing.join(", ")}`);
    }
  }
  createResult(success, postId, url, error) {
    return {
      platform: this.name,
      success,
      postId,
      url,
      error
    };
  }
};

// src/platforms/MastodonPlatform.ts
var Mastodon = require("mastodon-api");
var MastodonPlatform = class extends BasePlatform {
  get name() {
    return "mastodon";
  }
  get displayName() {
    return "Mastodon";
  }
  getRequiredCredentials() {
    return ["instance", "accessToken"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { instance, accessToken } = this.credentials;
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });
      let status = content.content;
      if (content.title) {
        status = `${content.title}

${content.content}`;
      }
      if (content.url) {
        status += `

${content.url}`;
      }
      if (content.tags && content.tags.length > 0) {
        const tagString = content.tags.map((tag) => `#${tag}`).join(" ");
        status += `

${tagString}`;
      }
      const response = await client.post("statuses", {
        status,
        visibility: "public"
      });
      return this.createResult(
        true,
        response.data.id,
        response.data.url
      );
    } catch (error) {
      return this.createResult(
        false,
        void 0,
        void 0,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const { instance, accessToken } = this.credentials;
      const urlMatch = postUrl.match(/\/@[^\/]+\/(\d+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Mastodon URL format: ${postUrl}`);
      }
      const statusId = urlMatch[1];
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });
      const response = await client.get(`statuses/${statusId}`);
      const status = response.data;
      return {
        likes: status.favourites_count || 0,
        reposts: status.reblogs_count || 0,
        replies: status.replies_count || 0,
        bookmarks: status.bookmarks_count || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Mastodon analytics for ${postUrl}:`, error);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { instance, accessToken } = this.credentials;
      const client = new Mastodon({
        access_token: accessToken,
        api_url: `https://${instance}/api/v1/`
      });
      const accountResponse = await client.get("accounts/verify_credentials");
      const account = accountResponse.data;
      const statusesResponse = await client.get(`accounts/${account.id}/statuses`, {
        limit
      });
      const posts = statusesResponse.data.map((status) => ({
        url: status.url,
        content: status.content.replace(/<[^>]*>/g, ""),
        // Remove HTML tags
        createdAt: new Date(status.created_at),
        analytics: {
          likes: status.favourites_count || 0,
          reposts: status.reblogs_count || 0,
          replies: status.replies_count || 0,
          bookmarks: status.bookmarks_count || 0
        }
      }));
      return posts;
    } catch (error) {
      console.warn(`Failed to discover Mastodon posts:`, error);
      return [];
    }
  }
};

// src/platforms/BlueskyPlatform.ts
var import_api = require("@atproto/api");
var BlueskyPlatform = class extends BasePlatform {
  agent;
  constructor(credentials) {
    super(credentials);
    this.agent = new import_api.BskyAgent({ service: "https://bsky.social" });
  }
  get name() {
    return "bluesky";
  }
  get displayName() {
    return "Bluesky";
  }
  getRequiredCredentials() {
    return ["identifier", "password"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { identifier, password } = this.credentials;
      await this.agent.login({
        identifier,
        password
      });
      let postText = content.content;
      if (content.title) {
        postText = `${content.title}

${content.content}`;
      }
      const rt = new import_api.RichText({ text: postText });
      await rt.detectFacets(this.agent);
      const postData = {
        text: rt.text,
        facets: rt.facets
      };
      if (content.url) {
        postData.embed = {
          $type: "app.bsky.embed.external",
          external: {
            uri: content.url,
            title: content.title || "Link",
            description: content.content.substring(0, 200)
          }
        };
      }
      const response = await this.agent.post(postData);
      return this.createResult(
        true,
        response.uri,
        `https://bsky.app/profile/${identifier}/post/${response.uri.split("/").pop()}`
      );
    } catch (error) {
      return this.createResult(
        false,
        void 0,
        void 0,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const urlMatch = postUrl.match(/\/profile\/([^\/]+)\/post\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Bluesky URL format: ${postUrl}`);
      }
      const username = urlMatch[1];
      const postId = urlMatch[2];
      const { identifier, password } = this.credentials;
      await this.agent.login({
        identifier,
        password
      });
      const threadResponse = await this.agent.getPostThread({
        uri: `at://${username}/app.bsky.feed.post/${postId}`
      });
      const post = threadResponse.data.thread.post;
      return {
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        replies: post.replyCount || 0,
        views: post.viewCount || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Bluesky analytics for ${postUrl}:`, error);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { identifier, password } = this.credentials;
      await this.agent.login({
        identifier,
        password
      });
      const profile = await this.agent.getProfile({ actor: identifier });
      const response = await this.agent.getAuthorFeed({
        actor: identifier,
        limit
      });
      const posts = response.data.feed.map((item) => {
        const post = item.post;
        const record = post.record;
        return {
          url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("/").pop()}`,
          content: record.text || "",
          createdAt: new Date(record.createdAt),
          analytics: {
            likes: post.likeCount || 0,
            reposts: post.repostCount || 0,
            replies: post.replyCount || 0,
            views: post.viewCount || 0
          }
        };
      });
      return posts;
    } catch (error) {
      console.warn(`Failed to discover Bluesky posts:`, error);
      return [];
    }
  }
};

// src/platforms/DiscordPlatform.ts
var import_discord = require("discord.js");
var DiscordPlatform = class extends BasePlatform {
  client;
  constructor(credentials) {
    super(credentials);
    this.client = new import_discord.Client({
      intents: [import_discord.GatewayIntentBits.Guilds, import_discord.GatewayIntentBits.GuildMessages]
    });
  }
  get name() {
    return "discord";
  }
  get displayName() {
    return "Discord";
  }
  getRequiredCredentials() {
    return ["token", "channelId"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { token, channelId } = this.credentials;
      await this.client.login(token);
      await new Promise((resolve) => {
        if (this.client.isReady()) {
          resolve();
        } else {
          this.client.once("ready", () => resolve());
        }
      });
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error("Channel not found");
      }
      let message = content.content;
      if (content.title) {
        message = `**${content.title}**

${content.content}`;
      }
      if (content.url) {
        message += `

${content.url}`;
      }
      const sentMessage = await channel.send(message);
      await this.client.destroy();
      return this.createResult(
        true,
        sentMessage.id,
        sentMessage.url
      );
    } catch (error) {
      if (this.client) {
        await this.client.destroy();
      }
      return this.createResult(
        false,
        void 0,
        void 0,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const urlMatch = postUrl.match(/\/channels\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Discord URL format: ${postUrl}`);
      }
      const [, guildId, channelId, messageId] = urlMatch;
      const { token } = this.credentials;
      this.client = new import_discord.Client({
        intents: [import_discord.GatewayIntentBits.Guilds, import_discord.GatewayIntentBits.GuildMessages, import_discord.GatewayIntentBits.MessageContent]
      });
      await this.client.login(token);
      const channel = await this.client.channels.fetch(channelId);
      const message = await channel.messages.fetch(messageId);
      const totalReactions = message.reactions.cache.reduce((total, reaction) => {
        return total + reaction.count;
      }, 0);
      await this.client.destroy();
      return {
        likes: totalReactions,
        // reactions as likes
        replies: 0
        // Discord doesn't expose reply counts easily
      };
    } catch (error) {
      console.warn(`Failed to gather Discord analytics for ${postUrl}:`, error);
      if (this.client) {
        await this.client.destroy();
      }
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account (not well supported by Discord API)
   */
  async discoverPosts(limit = 20) {
    console.warn("Discord post discovery not implemented - Discord API limitations");
    return [];
  }
};

// src/platforms/RedditPlatform.ts
var import_axios = __toESM(require("axios"));
var RedditPlatform = class extends BasePlatform {
  accessToken = null;
  get name() {
    return "reddit";
  }
  get displayName() {
    return "Reddit";
  }
  getRequiredCredentials() {
    return ["clientId", "clientSecret", "username", "password"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }
      const { subreddit = "hyperdrift" } = this.credentials;
      const postData = {
        title: content.title || "New Post",
        text: content.content,
        kind: "self",
        // Text post
        sr: subreddit
      };
      if (content.url) {
        postData.kind = "link";
        postData.url = content.url;
        if (content.content) {
          postData.text = content.content;
        }
      }
      const response = await import_axios.default.post(
        "https://oauth.reddit.com/api/submit",
        new URLSearchParams(postData).toString(),
        {
          headers: {
            "Authorization": `Bearer ${this.accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
          }
        }
      );
      if (response.data.success) {
        const postId = response.data.jquery?.[10]?.[3]?.[0]?.data?.id;
        const postUrl = `https://reddit.com/r/${subreddit}/comments/${postId}`;
        return this.createResult(true, postId, postUrl);
      } else {
        return this.createResult(false, void 0, void 0, "Reddit API submission failed");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        this.accessToken = null;
        try {
          await this.authenticate();
          return this.post(content);
        } catch (retryError) {
          return this.createResult(false, void 0, void 0, "Authentication failed");
        }
      }
      return this.createResult(
        false,
        void 0,
        void 0,
        error.response?.data?.message || error.message || "Unknown error"
      );
    }
  }
  async authenticate() {
    try {
      const { clientId, clientSecret, username, password } = this.credentials;
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const response = await import_axios.default.post(
        "https://www.reddit.com/api/v1/access_token",
        new URLSearchParams({
          grant_type: "password",
          username,
          password
        }).toString(),
        {
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
          }
        }
      );
      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
      } else {
        throw new Error("Failed to get access token");
      }
    } catch (error) {
      throw new Error(`Reddit authentication failed: ${error.response?.data?.error || error.message || "Unknown error"}`);
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }
      const urlMatch = postUrl.match(/\/r\/[^\/]+\/comments\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error(`Invalid Reddit URL format: ${postUrl}`);
      }
      const postId = urlMatch[1];
      const response = await import_axios.default.get(
        `https://oauth.reddit.com/by_id/t3_${postId}`,
        {
          headers: {
            "Authorization": `Bearer ${this.accessToken}`,
            "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
          }
        }
      );
      if (response.data && response.data.data && response.data.data.children.length > 0) {
        const post = response.data.data.children[0].data;
        return {
          likes: post.score || 0,
          // upvotes - downvotes
          replies: post.num_comments || 0,
          views: post.view_count || 0,
          reposts: post.num_crossposts || 0
        };
      }
      return {};
    } catch (error) {
      console.warn(`Failed to gather Reddit analytics for ${postUrl}:`, error);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      if (!this.accessToken) {
        await this.authenticate();
      }
      const { username } = this.credentials;
      const response = await import_axios.default.get(`https://oauth.reddit.com/user/${username}/submitted`, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "User-Agent": "HyperPost:v0.1.0 (by /u/hyperdrift)"
        },
        params: {
          limit,
          sort: "new"
        }
      });
      const posts = response.data.data.children.map((child) => {
        const post = child.data;
        return {
          url: `https://www.reddit.com${post.permalink}`,
          content: post.selftext || post.title,
          createdAt: new Date(post.created_utc * 1e3),
          analytics: {
            likes: post.score || 0,
            reposts: 0,
            // Reddit doesn't have reposts
            replies: post.num_comments || 0,
            views: 0
            // Reddit doesn't expose view counts easily
          }
        };
      });
      return posts;
    } catch (error) {
      console.warn(`Failed to discover Reddit posts:`, error);
      return [];
    }
  }
};

// src/platforms/DevtoPlatform.ts
var import_axios2 = __toESM(require("axios"));
var DevtoPlatform = class extends BasePlatform {
  get name() {
    return "devto";
  }
  get displayName() {
    return "Dev.to";
  }
  getRequiredCredentials() {
    return ["apiKey"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { apiKey } = this.credentials;
      const articleData = {
        article: {
          title: content.title || content.content.substring(0, 50) + (content.content.length > 50 ? "..." : ""),
          body_markdown: content.content,
          published: true,
          tags: content.tags || [],
          canonical_url: content.url
        }
      };
      const response = await import_axios2.default.post("https://dev.to/api/articles", articleData, {
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json"
        }
      });
      const article = response.data;
      return this.createResult(
        true,
        article.id.toString(),
        article.url
      );
    } catch (error) {
      console.error("Dev.to posting error:", error.response?.data || error.message);
      return this.createResult(
        false,
        void 0,
        void 0,
        error.response?.data?.error || error.message
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const { apiKey } = this.credentials;
      const urlMatch = postUrl.match(/\/([^\/]+)\/([^\/\-]+)(?:-([a-z0-9]+))?$/);
      if (!urlMatch) {
        throw new Error(`Invalid Dev.to URL format: ${postUrl}`);
      }
      const username = urlMatch[1];
      const slug = urlMatch[2];
      const id = urlMatch[3];
      let article;
      if (id) {
        const response = await import_axios2.default.get(`https://dev.to/api/articles/${id}`, {
          headers: {
            "Api-Key": apiKey
          }
        });
        article = response.data;
      } else {
        const response = await import_axios2.default.get("https://dev.to/api/articles/me", {
          headers: {
            "Api-Key": apiKey
          }
        });
        const articles = response.data;
        article = articles.find((a) => a.slug === slug || a.slug.startsWith(slug));
      }
      if (!article) {
        console.warn(`Could not find Dev.to article for URL: ${postUrl}`);
        return {};
      }
      return {
        likes: article.positive_reactions_count || 0,
        reposts: 0,
        // Dev.to doesn't have reposts
        replies: article.comments_count || 0,
        views: article.page_views_count || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Dev.to analytics for ${postUrl}:`, error.response?.data || error.message);
      return {};
    }
  }
  /**
   * Discover recent articles from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { apiKey } = this.credentials;
      const response = await import_axios2.default.get("https://dev.to/api/articles/me/published", {
        headers: {
          "Api-Key": apiKey
        },
        params: {
          per_page: Math.min(limit, 100)
          // Dev.to limits to 100 per page
        }
      });
      const articles = response.data;
      return articles.map((article) => ({
        url: article.url,
        content: article.body_markdown || article.description || article.title,
        createdAt: new Date(article.created_at),
        analytics: {
          likes: article.positive_reactions_count || 0,
          reposts: 0,
          replies: article.comments_count || 0,
          views: article.page_views_count || 0
        }
      }));
    } catch (error) {
      console.warn(`Failed to discover Dev.to posts:`, error.response?.data || error.message);
      return [];
    }
  }
};

// src/platforms/MediumPlatform.ts
var import_axios3 = __toESM(require("axios"));
var MediumPlatform = class extends BasePlatform {
  get name() {
    return "medium";
  }
  get displayName() {
    return "Medium";
  }
  getRequiredCredentials() {
    return ["integrationToken"];
  }
  async post(content) {
    try {
      this.validateCredentials();
      const { integrationToken } = this.credentials;
      const userResponse = await import_axios3.default.get("https://api.medium.com/v1/me", {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Charset": "utf-8"
        }
      });
      const userId = userResponse.data.data.id;
      const postData = {
        title: content.title || content.content.substring(0, 50) + (content.content.length > 50 ? "..." : ""),
        contentFormat: "markdown",
        content: content.content,
        canonicalUrl: content.url,
        tags: content.tags || [],
        publishStatus: "public"
      };
      const response = await import_axios3.default.post(`https://api.medium.com/v1/users/${userId}/posts`, postData, {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Charset": "utf-8"
        }
      });
      const post = response.data.data;
      return this.createResult(
        true,
        post.id,
        post.url
      );
    } catch (error) {
      console.error("Medium posting error:", error.response?.data || error.message);
      return this.createResult(
        false,
        void 0,
        void 0,
        error.response?.data?.errors?.[0]?.message || error.message
      );
    }
  }
  async gatherAnalytics(postUrl) {
    try {
      this.validateCredentials();
      const { integrationToken } = this.credentials;
      const urlMatch = postUrl.match(/\/([^\/]+)$/);
      if (!urlMatch) {
        throw new Error(`Invalid Medium URL format: ${postUrl}`);
      }
      const postId = urlMatch[1];
      const response = await import_axios3.default.get(`https://api.medium.com/v1/posts/${postId}`, {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Accept": "application/json"
        }
      });
      const post = response.data.data;
      return {
        likes: post.clapCount || 0,
        replies: 0,
        // Medium doesn't expose comment counts easily
        views: 0,
        // Medium doesn't expose view counts in API
        bookmarks: post.voterCount || 0
      };
    } catch (error) {
      console.warn(`Failed to gather Medium analytics for ${postUrl}:`, error.response?.data || error.message);
      return {};
    }
  }
  /**
   * Discover recent posts from the user's account
   */
  async discoverPosts(limit = 20) {
    try {
      this.validateCredentials();
      const { integrationToken } = this.credentials;
      const userResponse = await import_axios3.default.get("https://api.medium.com/v1/me", {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Accept": "application/json"
        }
      });
      const userId = userResponse.data.data.id;
      const postsResponse = await import_axios3.default.get(`https://api.medium.com/v1/users/${userId}/posts`, {
        headers: {
          "Authorization": `Bearer ${integrationToken}`,
          "Accept": "application/json"
        },
        params: {
          limit: Math.min(limit, 50)
          // Medium limits to 50
        }
      });
      const posts = postsResponse.data.data;
      return posts.map((post) => ({
        url: post.url,
        content: post.title + "\n\n" + (post.virtuals?.subtitle || ""),
        createdAt: new Date(post.createdAt),
        analytics: {
          likes: post.clapCount || 0,
          replies: 0,
          views: 0,
          bookmarks: post.voterCount || 0
        }
      }));
    } catch (error) {
      console.warn(`Failed to discover Medium posts:`, error.response?.data || error.message);
      return [];
    }
  }
};

// src/HyperPost.ts
var crypto = __toESM(require("crypto"));
init_database();
var HyperPost = class {
  platforms = /* @__PURE__ */ new Map();
  duplicateCheckWindow = 24 * 60 * 60 * 1e3;
  // 24 hours in milliseconds
  constructor(credentials) {
    this.initializePlatforms(credentials);
    this.initializeDatabase();
  }
  /**
   * Initialize database tables and ensure platforms exist
   */
  async initializeDatabase() {
    try {
      const platformData = [
        { name: "mastodon", displayName: "Mastodon" },
        { name: "bluesky", displayName: "Bluesky" },
        { name: "reddit", displayName: "Reddit" },
        { name: "discord", displayName: "Discord" },
        { name: "devto", displayName: "Dev.to" },
        { name: "medium", displayName: "Medium" }
      ];
      for (const platform of platformData) {
        await prisma.platform.upsert({
          where: { name: platform.name },
          update: { displayName: platform.displayName },
          create: platform
        });
      }
    } catch (error) {
      console.warn("Database initialization warning:", error);
    }
  }
  /**
   * Generate content hash for deduplication
   */
  generateContentHash(content) {
    const contentString = `${content.title || ""}|${content.content}|${content.url || ""}`;
    return crypto.createHash("sha256").update(contentString).digest("hex");
  }
  /**
   * Check if content has been posted recently to a specific platform
   */
  async isDuplicate(content, platformName) {
    try {
      const contentHash = this.generateContentHash(content);
      const cutoffTime = new Date(Date.now() - this.duplicateCheckWindow);
      const post = await prisma.post.findUnique({
        where: { contentHash },
        include: {
          postPlatforms: {
            where: {
              postedAt: { gte: cutoffTime },
              platform: { name: platformName }
            },
            include: {
              platform: true
            }
          }
        }
      });
      if (!post) {
        return { isDuplicate: false, postedTo: [] };
      }
      const postedToThisPlatform = post.postPlatforms.length > 0;
      const postedTo = post.postPlatforms.map((pp) => pp.platform.name);
      return {
        isDuplicate: postedToThisPlatform,
        postedTo,
        lastPosted: post.postPlatforms[0]?.postedAt
      };
    } catch (error) {
      console.warn("Database query failed, falling back to allowing post:", error);
      return { isDuplicate: false, postedTo: [] };
    }
  }
  /**
   * Record a successful post
   */
  async recordPost(content, platformName, result) {
    if (!result.success || !result.url)
      return;
    try {
      const contentHash = this.generateContentHash(content);
      const platform = await prisma.platform.findUnique({
        where: { name: platformName }
      });
      if (!platform) {
        console.warn(`Platform ${platformName} not found in database`);
        return;
      }
      const post = await prisma.post.upsert({
        where: { contentHash },
        update: {
          title: content.title,
          content: content.content,
          url: content.url
        },
        create: {
          contentHash,
          title: content.title,
          content: content.content,
          url: content.url
        }
      });
      await prisma.postPlatform.create({
        data: {
          postId: post.id,
          platformId: platform.id,
          postUrl: result.url
        }
      });
    } catch (error) {
      console.warn("Failed to record post in database:", error);
    }
  }
  initializePlatforms(credentials) {
    if (credentials.mastodon) {
      this.platforms.set("mastodon", new MastodonPlatform(credentials.mastodon));
    }
    if (credentials.bluesky) {
      this.platforms.set("bluesky", new BlueskyPlatform(credentials.bluesky));
    }
    if (credentials.discord) {
      this.platforms.set("discord", new DiscordPlatform(credentials.discord));
    }
    if (credentials.reddit) {
      this.platforms.set("reddit", new RedditPlatform(credentials.reddit));
    }
    if (credentials.devto) {
      this.platforms.set("devto", new DevtoPlatform(credentials.devto));
    }
    if (credentials.medium) {
      this.platforms.set("medium", new MediumPlatform(credentials.medium));
    }
  }
  /**
   * Post to a single platform
   */
  async postToPlatform(platform, content) {
    const platformInstance = this.platforms.get(platform);
    if (!platformInstance) {
      return {
        platform,
        success: false,
        error: `Platform ${platform} not configured or credentials missing`
      };
    }
    const duplicateCheck = await this.isDuplicate(content, platform);
    if (duplicateCheck.isDuplicate) {
      const lastPosted = duplicateCheck.lastPosted ? ` (last posted: ${duplicateCheck.lastPosted.toLocaleString()})` : "";
      return {
        platform,
        success: false,
        error: `Duplicate content: This post was already sent to ${platform} recently${lastPosted}. Previously posted to: ${duplicateCheck.postedTo.join(", ")}`
      };
    }
    const result = await platformInstance.post(content);
    await this.recordPost(content, platform, result);
    return result;
  }
  /**
   * Post to all configured platforms
   */
  async postToAll(content) {
    const results = [];
    let successful = 0;
    let failed = 0;
    const promises = Array.from(this.platforms.entries()).map(async ([name, platform]) => {
      const result = await this.postToPlatform(name, content);
      results.push(result);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    });
    await Promise.allSettled(promises);
    return {
      results,
      successful,
      failed
    };
  }
  /**
   * Post to specific platforms
   */
  async postToPlatforms(platforms, content) {
    const results = [];
    let successful = 0;
    let failed = 0;
    const promises = platforms.map(async (platformName) => {
      const result = await this.postToPlatform(platformName, content);
      results.push(result);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    });
    await Promise.allSettled(promises);
    return {
      results,
      successful,
      failed
    };
  }
  /**
   * Get posted content history
   */
  async getPostedContentHistory(limit = 50) {
    try {
      const posts = await prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          postPlatforms: {
            include: {
              platform: true
            }
          }
        }
      });
      return posts.map((post) => ({
        contentHash: post.contentHash,
        title: post.title,
        content: post.content,
        url: post.url,
        platforms: post.postPlatforms.map((pp) => pp.platform.name),
        timestamp: post.createdAt.getTime(),
        postUrls: post.postPlatforms.map((pp) => ({
          platform: pp.platform.name,
          url: pp.postUrl,
          postedAt: pp.postedAt
        }))
      }));
    } catch (error) {
      console.warn("Failed to fetch posting history:", error);
      return [];
    }
  }
  /**
   * Clear posted content history
   */
  async clearPostedContentHistory() {
    try {
      await prisma.postPlatform.deleteMany();
      await prisma.post.deleteMany();
      console.log("\u2705 Posting history cleared from database.");
    } catch (error) {
      console.warn("Failed to clear posting history:", error);
    }
  }
  /**
   * Get posting analytics
   */
  async getPostingAnalytics(platform, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
      const analytics = await prisma.postPlatform.findMany({
        where: {
          postedAt: { gte: startDate },
          ...platform && {
            platform: { name: platform }
          }
        },
        include: {
          platform: true,
          post: true,
          analytics: true
        },
        orderBy: { postedAt: "desc" }
      });
      return {
        totalPosts: analytics.length,
        byPlatform: analytics.reduce((acc, item) => {
          acc[item.platform.name] = (acc[item.platform.name] || 0) + 1;
          return acc;
        }, {}),
        recentPosts: analytics.slice(0, 10),
        engagementData: analytics.map((item) => ({
          platform: item.platform.name,
          postTitle: item.post.title,
          url: item.postUrl,
          postedAt: item.postedAt,
          metrics: item.analytics.reduce((acc, metric) => {
            acc[metric.metric] = metric.value;
            return acc;
          }, {})
        }))
      };
    } catch (error) {
      console.warn("Failed to fetch analytics:", error);
      return { totalPosts: 0, byPlatform: {}, recentPosts: [], engagementData: [] };
    }
  }
  /**
   * Gather analytics for all posts
   */
  async gatherAnalyticsForAllPosts() {
    try {
      const results = [];
      let totalProcessed = 0;
      let totalUpdated = 0;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
      const postPlatforms = await prisma.postPlatform.findMany({
        where: {
          analytics: {
            none: {
              recordedAt: { gte: oneHourAgo }
            }
          }
        },
        include: {
          platform: true
        }
      });
      for (const postPlatform of postPlatforms) {
        try {
          const platformInstance = this.platforms.get(postPlatform.platform.name);
          if (!platformInstance)
            continue;
          totalProcessed++;
          const analytics = await platformInstance.gatherAnalytics(postPlatform.postUrl);
          for (const [metric, value] of Object.entries(analytics)) {
            if (value !== void 0) {
              await prisma.postAnalytics.upsert({
                where: {
                  postPlatformId_metric: {
                    postPlatformId: postPlatform.id,
                    metric
                  }
                },
                update: {
                  value: value || 0,
                  recordedAt: /* @__PURE__ */ new Date()
                  // Update timestamp when we refresh analytics
                },
                create: {
                  postPlatformId: postPlatform.id,
                  metric,
                  value: value || 0
                }
              });
            }
          }
          results.push({
            platform: postPlatform.platform.name,
            url: postPlatform.postUrl,
            analytics,
            success: true
          });
          totalUpdated++;
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        } catch (error) {
          results.push({
            platform: postPlatform.platform.name,
            url: postPlatform.postUrl,
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          });
        }
      }
      return {
        processed: totalProcessed,
        updated: totalUpdated,
        results
      };
    } catch (error) {
      console.warn("Failed to gather analytics for posts:", error);
      return { processed: 0, updated: 0, results: [] };
    }
  }
  /**
   * Set duplicate check window (in hours)
   */
  setDuplicateCheckWindow(hours) {
    this.duplicateCheckWindow = hours * 60 * 60 * 1e3;
  }
  /**
   * Get list of configured platforms
   */
  getConfiguredPlatforms() {
    return Array.from(this.platforms.keys());
  }
  /**
   * Check if a platform is configured
   */
  isPlatformConfigured(platform) {
    return this.platforms.has(platform);
  }
  /**
   * Get a specific platform instance
   */
  getPlatform(platformName) {
    return this.platforms.get(platformName);
  }
};

// src/cli.ts
init_signup_manager();
init_database();
var crypto2 = __toESM(require("crypto"));
var program = new import_commander.Command();
program.name("hyper-post").description("A unified social media posting tool for underground platforms").version("0.1.0");
program.command("post").description("Post content to social media platforms").requiredOption("-c, --content <content>", "Post content").option("-t, --title <title>", "Post title").option("-u, --url <url>", "URL to include").option("--tags <tags>", "Comma-separated tags").option("-p, --platforms <platforms>", "Comma-separated list of platforms (defaults to all configured)").option("--dry-run", "Preview the post without actually posting (recommended for testing)").action(async (options) => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    const post = {
      content: options.content,
      title: options.title,
      url: options.url,
      tags: options.tags ? options.tags.split(",").map((tag) => tag.trim()) : void 0
    };
    if (options.dryRun) {
      console.log("\u{1F50D} Dry run mode - previewing post:");
      console.log("=".repeat(50));
      console.log(`Content: ${post.content}`);
      if (post.title)
        console.log(`Title: ${post.title}`);
      if (post.url)
        console.log(`URL: ${post.url}`);
      if (post.tags)
        console.log(`Tags: ${post.tags.join(", ")}`);
      console.log("");
      let targetPlatforms;
      if (options.platforms) {
        targetPlatforms = options.platforms.split(",").map((p) => p.trim());
        const configuredPlatforms = hyperPost.getConfiguredPlatforms();
        const invalidPlatforms = targetPlatforms.filter((p) => !configuredPlatforms.includes(p));
        if (invalidPlatforms.length > 0) {
          console.error(`\u274C Invalid platforms: ${invalidPlatforms.join(", ")}`);
          console.error(`Configured platforms: ${configuredPlatforms.join(", ")}`);
          process.exit(1);
        }
      } else {
        targetPlatforms = hyperPost.getConfiguredPlatforms();
      }
      console.log(`Will post to: ${targetPlatforms.join(", ")}`);
      console.log("");
      console.log("\u{1F4A1} Remove --dry-run to actually post");
      return;
    }
    let result;
    if (options.platforms) {
      const platforms = options.platforms.split(",").map((p) => p.trim());
      result = await hyperPost.postToPlatforms(platforms, post);
    } else {
      result = await hyperPost.postToAll(post);
    }
    console.log("\u{1F4E4} Posting results:");
    console.log(`\u2705 Successful: ${result.successful}`);
    console.log(`\u274C Failed: ${result.failed}`);
    console.log("");
    result.results.forEach((r) => {
      if (r.success) {
        console.log(`\u2705 ${r.platform}: ${r.url || "Posted successfully"}`);
      } else {
        console.log(`\u274C ${r.platform}: ${r.error}`);
      }
    });
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});
program.command("platforms").description("List configured platforms").action(() => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    const platforms = hyperPost.getConfiguredPlatforms();
    if (platforms.length === 0) {
      console.log("No platforms configured. Check your .env file or run setup.");
      console.log('Run "hyper-post setup" to configure platforms interactively.');
    } else {
      console.log("Configured platforms:");
      platforms.forEach((platform) => {
        console.log(`- ${platform}`);
      });
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});
program.command("setup").description("Interactive setup wizard for configuring social media platforms").action(async () => {
  const { HyperPostSetup: HyperPostSetup2 } = await Promise.resolve().then(() => (init_setup(), setup_exports));
  const setup = new HyperPostSetup2();
  await setup.run();
});
function loadCredentials() {
  const credentials = {};
  const signupManager = new SignupManager();
  const completedAccounts = signupManager.getAllCompletedAccounts();
  for (const [platform, accountData] of Object.entries(completedAccounts)) {
    credentials[platform] = accountData;
  }
  if (process.env.MASTODON_INSTANCE && process.env.MASTODON_ACCESS_TOKEN) {
    credentials.mastodon = {
      instance: process.env.MASTODON_INSTANCE,
      accessToken: process.env.MASTODON_ACCESS_TOKEN
    };
  }
  if (process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_PASSWORD) {
    credentials.bluesky = {
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_PASSWORD
    };
  }
  if (process.env.DISCORD_DISABLED !== "true" && process.env.DISCORD_TOKEN && process.env.DISCORD_CHANNEL_ID) {
    credentials.discord = {
      token: process.env.DISCORD_TOKEN,
      channelId: process.env.DISCORD_CHANNEL_ID
    };
  }
  if (process.env.DEVTO_API_KEY) {
    credentials.devto = {
      apiKey: process.env.DEVTO_API_KEY
    };
  }
  if (process.env.MEDIUM_TOKEN) {
    credentials.medium = {
      integrationToken: process.env.MEDIUM_TOKEN
    };
  }
  if (process.env.REDDIT_DISABLED !== "true" && process.env.REDDIT_CLIENTID && process.env.REDDIT_CLIENTSECRET && process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD) {
    credentials.reddit = {
      clientId: process.env.REDDIT_CLIENTID,
      clientSecret: process.env.REDDIT_CLIENTSECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
      subreddit: process.env.REDDIT_SUBREDDIT
    };
  }
  return credentials;
}
program.command("history").description("Show posting history and check for duplicates").option("--clear", "Clear the posting history").option("--platform <platform>", "Filter history by platform").option("--limit <number>", "Limit number of results", "50").action(async (options) => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    if (options.clear) {
      await hyperPost.clearPostedContentHistory();
      return;
    }
    const history = await hyperPost.getPostedContentHistory(parseInt(options.limit) || 50);
    if (history.length === 0) {
      console.log("No posting history found.");
      return;
    }
    let filteredHistory = history;
    if (options.platform) {
      filteredHistory = history.filter((item) => item.platforms.includes(options.platform));
    }
    console.log(`\u{1F4DA} Posting History (${filteredHistory.length} entries):`);
    console.log("=".repeat(60));
    filteredHistory.forEach((item, index) => {
      const date = new Date(item.timestamp).toLocaleString();
      console.log(`${index + 1}. [${date}]`);
      console.log(`   Platforms: ${item.platforms.join(", ")}`);
      if (item.title)
        console.log(`   Title: ${item.title}`);
      console.log(`   Content: ${item.content.substring(0, 100)}${item.content.length > 100 ? "..." : ""}`);
      if (item.postUrls && item.postUrls.length > 0) {
        console.log(`   URLs:`);
        item.postUrls.forEach((url) => {
          console.log(`     ${url.platform}: ${url.url}`);
        });
      }
      console.log(`   Hash: ${item.contentHash.substring(0, 16)}...`);
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});
program.command("analytics").description("Show posting analytics (cached data from database)").option("--platform <platform>", "Filter analytics by platform").option("--days <number>", "Number of days to analyze", "30").action(async (options) => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    const analytics = await hyperPost.getPostingAnalytics(
      options.platform,
      parseInt(options.days) || 30
    );
    console.log(`\u{1F4CA} Posting Analytics (${options.days} days - cached data):`);
    console.log("=".repeat(60));
    console.log(`Total Posts: ${analytics.totalPosts}`);
    console.log("");
    if (Object.keys(analytics.byPlatform).length > 0) {
      console.log("Posts by Platform:");
      Object.entries(analytics.byPlatform).forEach(([platform, count]) => {
        console.log(`  ${platform}: ${count}`);
      });
      console.log("");
    }
    if (analytics.recentPosts.length > 0) {
      console.log("Recent Posts:");
      analytics.recentPosts.slice(0, 5).forEach((post, index) => {
        const date = post.postedAt.toLocaleString();
        console.log(`${index + 1}. [${date}] ${post.platform.name}: ${post.post.title || post.post.content.substring(0, 50)}...`);
      });
      console.log("");
    }
    if (analytics.engagementData.length > 0) {
      console.log("Engagement Data (likes, reposts, etc.):");
      analytics.engagementData.slice(0, 5).forEach((item, index) => {
        const metrics = Object.entries(item.metrics).map(([key, value]) => `${key}: ${value}`).join(", ");
        console.log(`${index + 1}. ${item.platform}: ${metrics || "No engagement data"} - ${item.postTitle || "Untitled"}`);
      });
    }
    console.log("");
    console.log('\u{1F4A1} Tip: Use "hyper-post gather-analytics" to fetch fresh engagement data from platforms!');
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    console.log("");
    console.log("\u{1F4A1} Tip: Make sure your DATABASE_URL is properly configured for PostgreSQL.");
    process.exit(1);
  }
});
program.command("gather-analytics").description("Fetch fresh engagement metrics (likes/faves/reposts) from all platforms").action(async () => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    console.log("\u{1F50D} Gathering fresh analytics from platforms...");
    console.log("This fetches likes, reposts, replies, and other engagement data.");
    console.log("This may take a while depending on the number of posts.");
    console.log("");
    const results = await hyperPost.gatherAnalyticsForAllPosts();
    console.log(`\u{1F4CA} Analytics Gathering Complete:`);
    console.log("=".repeat(50));
    console.log(`Posts Processed: ${results.processed}`);
    console.log(`Posts Updated: ${results.updated}`);
    console.log("");
    if (results.results.length > 0) {
      console.log("Results:");
      results.results.forEach((result, index) => {
        if (result.success) {
          const metrics = Object.entries(result.analytics).map(([key, value]) => `${key}: ${value}`).join(", ");
          console.log(`\u2705 ${result.platform}: ${metrics || "No engagement data"}`);
        } else {
          console.log(`\u274C ${result.platform}: ${result.error}`);
        }
      });
    }
    console.log("");
    console.log('\u{1F4A1} Tip: Run "hyper-post analytics" to see updated engagement data!');
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});
program.command("discover-posts").description("Discover existing posts on platforms with their analytics").option("--platform <platform>", "Limit discovery to specific platform").option("--limit <number>", "Number of posts to discover per platform", "10").action(async (options) => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    console.log("\u{1F50D} Discovering posts on platforms...");
    console.log("This finds existing posts and shows their current engagement metrics.");
    console.log("");
    const limit = parseInt(options.limit) || 10;
    const allPosts = [];
    const configuredPlatforms = hyperPost.getConfiguredPlatforms();
    for (const platformName of configuredPlatforms) {
      if (options.platform && options.platform !== platformName) {
        continue;
      }
      try {
        const platform = hyperPost.getPlatform(platformName);
        if (!platform || !platform.discoverPosts) {
          console.log(`\u26A0\uFE0F  ${platformName}: Post discovery not supported`);
          continue;
        }
        console.log(`\u{1F4E1} Checking ${platformName}...`);
        const posts = await platform.discoverPosts(limit);
        if (posts.length > 0) {
          console.log(`\u2705 Found ${posts.length} posts on ${platformName}`);
          allPosts.push(...posts.map((post) => ({ ...post, platform: platformName })));
        } else {
          console.log(`\u{1F4ED} No posts found on ${platformName}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      } catch (error) {
        console.log(`\u274C ${platformName}: Failed to discover posts - ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
    console.log("");
    console.log(`\u{1F4CA} Discovery Complete:`);
    console.log("=".repeat(50));
    console.log(`Total Posts Found: ${allPosts.length}`);
    console.log("");
    if (allPosts.length > 0) {
      console.log("Posts with Analytics:");
      console.log("=".repeat(50));
      allPosts.forEach((post, index) => {
        const date = post.createdAt.toLocaleString();
        const metrics = Object.entries(post.analytics).filter(([key, value]) => typeof value === "number" && value > 0).map(([key, value]) => `${key}: ${value}`).join(", ") || "No engagement yet";
        console.log(`${index + 1}. [${date}] ${post.platform.toUpperCase()}`);
        console.log(`   URL: ${post.url}`);
        console.log(`   Content: ${post.content.substring(0, 100)}${post.content.length > 100 ? "..." : ""}`);
        console.log(`   Analytics: ${metrics}`);
        console.log("");
      });
      console.log('\u{1F4A1} Tip: Use "hyper-post import-post <url>" to add these posts to analytics tracking!');
    } else {
      console.log("No posts found on any platforms.");
      console.log("This could mean:");
      console.log("- No posts exist on the platforms");
      console.log("- Platform APIs are rate limited");
      console.log("- Authentication issues");
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});
program.command("import-post <url>").description("Import an existing post by URL for analytics tracking").action(async (url) => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    console.log(`\u{1F4E5} Importing post: ${url}`);
    console.log("This will add the post to the database and start tracking its analytics.");
    console.log("");
    let platformName = "";
    if (url.includes("mastodon.social")) {
      platformName = "mastodon";
    } else if (url.includes("bsky.app")) {
      platformName = "bluesky";
    } else if (url.includes("reddit.com")) {
      platformName = "reddit";
    } else if (url.includes("discord.com")) {
      platformName = "discord";
    }
    if (!platformName) {
      console.error("\u274C Could not determine platform from URL");
      console.log("Supported platforms: Mastodon, Bluesky, Reddit, Discord");
      process.exit(1);
    }
    if (!hyperPost.isPlatformConfigured(platformName)) {
      console.error(`\u274C ${platformName} is not configured in your credentials`);
      process.exit(1);
    }
    const platform = hyperPost.getPlatform(platformName);
    if (!platform) {
      console.error(`\u274C Could not get ${platformName} platform instance`);
      process.exit(1);
    }
    console.log(`\u{1F50D} Gathering analytics for ${platformName} post...`);
    const analytics = await platform.gatherAnalytics(url);
    let postDetails = null;
    try {
      const recentPosts = await platform.discoverPosts(50);
      postDetails = recentPosts.find((post) => post.url === url);
    } catch (error) {
      console.warn("Could not fetch post details, using basic import");
    }
    if (!postDetails) {
      console.error("\u274C Could not find post details. The post may not exist or the platform API is not accessible.");
      process.exit(1);
    }
    try {
      const { prisma: prisma2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      const dbPlatform = await prisma2.platform.findUnique({
        where: { name: platformName }
      });
      if (!dbPlatform) {
        console.error(`\u274C Platform ${platformName} not found in database`);
        process.exit(1);
      }
      const contentHash = crypto2.createHash("sha256").update(postDetails.content + url).digest("hex");
      const post = await prisma2.post.upsert({
        where: { contentHash },
        update: {
          title: postDetails.content.split("\n")[0].substring(0, 200),
          // First line as title
          content: postDetails.content,
          url
        },
        create: {
          contentHash,
          title: postDetails.content.split("\n")[0].substring(0, 200),
          content: postDetails.content,
          url
        }
      });
      await prisma2.postPlatform.upsert({
        where: {
          postId_platformId: {
            postId: post.id,
            platformId: dbPlatform.id
          }
        },
        update: {
          postUrl: url
        },
        create: {
          postId: post.id,
          platformId: dbPlatform.id,
          postUrl: url,
          postedAt: postDetails.createdAt || /* @__PURE__ */ new Date()
        }
      });
      console.log(`\u2705 Post imported to database successfully!`);
      console.log(`\u{1F4CA} Current analytics: ${Object.entries(analytics).map(([k, v]) => `${k}: ${v}`).join(", ") || "None yet"}`);
      console.log("");
      console.log('\u{1F4A1} Tip: Run "hyper-post gather-analytics" periodically to update analytics!');
    } catch (dbError) {
      console.error("\u274C Failed to import post to database:", dbError);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});
program.command("repost").description("Repost existing content to additional platforms").option("-p, --platforms <platforms>", "Comma-separated list of platforms to repost to").option("--all", "Repost all existing posts to specified platforms (requires --batch)").option("--batch", "Enable batch mode with 5-minute delays between posts").option("--hash <hash>", "Repost specific post by content hash").option("--dry-run", "Preview reposts without actually posting").action(async (options) => {
  try {
    const credentials = loadCredentials();
    const hyperPost = new HyperPost(credentials);
    if (!options.platforms) {
      console.error("\u274C Please specify platforms with -p or --platforms");
      console.error("Examples:");
      console.error("  hyper-post repost --platforms devto --hash <hash>     # Single post");
      console.error("  hyper-post repost --platforms devto --batch --all    # Batch mode");
      process.exit(1);
    }
    const targetPlatforms = options.platforms.split(",").map((p) => p.trim());
    const configuredPlatforms = hyperPost.getConfiguredPlatforms();
    const invalidPlatforms = targetPlatforms.filter((p) => !configuredPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      console.error(`\u274C Invalid platforms: ${invalidPlatforms.join(", ")}`);
      console.error(`Configured platforms: ${configuredPlatforms.join(", ")}`);
      process.exit(1);
    }
    let postsToRepost = [];
    if (options.all) {
      if (!options.batch) {
        console.error("\u274C --all requires --batch flag for safety");
        console.error("Use --batch to enable posting multiple posts with delays");
        console.error("Or use --hash to repost a specific post");
        process.exit(1);
      }
      const allPosts = await prisma.post.findMany({
        include: {
          postPlatforms: {
            include: {
              platform: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      postsToRepost = allPosts.filter((post) => {
        const postedPlatforms = post.postPlatforms.map((pp) => pp.platform.name);
        return !targetPlatforms.every((platform) => postedPlatforms.includes(platform));
      });
    } else if (options.hash) {
      const post = await prisma.post.findUnique({
        where: { contentHash: options.hash },
        include: {
          postPlatforms: {
            include: {
              platform: true
            }
          }
        }
      });
      if (!post) {
        console.error(`\u274C Post with hash ${options.hash} not found`);
        process.exit(1);
      }
      const postedPlatforms = post.postPlatforms.map((pp) => pp.platform.name);
      const needsRepost = !targetPlatforms.every((platform) => postedPlatforms.includes(platform));
      if (!needsRepost) {
        console.log(`\u2139\uFE0F Post ${options.hash} has already been posted to all target platforms`);
        return;
      }
      postsToRepost = [post];
    } else {
      console.error("\u274C Please specify --all (with --batch) or --hash <hash>");
      console.error("Examples:");
      console.error("  hyper-post repost --platforms devto --batch --all  # Batch mode with delays");
      console.error("  hyper-post repost --platforms devto --hash abc123...  # Single post");
      process.exit(1);
    }
    if (postsToRepost.length === 0) {
      console.log("\u2139\uFE0F No posts need reposting to the specified platforms");
      return;
    }
    console.log(`\u{1F504} Found ${postsToRepost.length} post(s) to repost to: ${targetPlatforms.join(", ")}`);
    if (options.batch && postsToRepost.length > 1) {
      console.log(`\u23F0 Batch mode: 5-minute delays between posts`);
    }
    console.log("");
    for (let i = 0; i < postsToRepost.length; i++) {
      const post = postsToRepost[i];
      if (options.batch && postsToRepost.length > 1) {
        console.log(`\u{1F4E6} Batch Progress: ${i + 1}/${postsToRepost.length}`);
      }
      console.log(`\u{1F4DD} Reposting: ${post.title || post.content.substring(0, 50)}${post.title ? "" : "..."}`);
      console.log(`   Hash: ${post.contentHash}`);
      console.log(`   Created: ${post.createdAt.toLocaleString()}`);
      const socialPost = {
        content: post.content,
        title: post.title,
        url: post.url
      };
      if (options.dryRun) {
        console.log(`   \u{1F50D} Would post to: ${targetPlatforms.join(", ")}`);
      } else {
        try {
          const result = await hyperPost.postToPlatforms(targetPlatforms, socialPost);
          console.log(`   \u2705 Results: ${result.successful} successful, ${result.failed} failed`);
          result.results.forEach((r) => {
            if (r.success) {
              console.log(`     \u2705 ${r.platform}: ${r.url || "Posted successfully"}`);
            } else {
              console.log(`     \u274C ${r.platform}: ${r.error}`);
            }
          });
        } catch (error) {
          console.log(`   \u274C Failed to repost: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      console.log("");
      if (options.batch && i < postsToRepost.length - 1) {
        console.log(`\u23F3 Waiting 5 minutes before next post...`);
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1e3));
        console.log(`\u{1F680} Continuing with next post...
`);
      }
    }
    if (options.dryRun) {
      console.log("\u{1F4A1} Remove --dry-run to actually repost");
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=cli.js.map