#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/setup.ts
var setup_exports = {};
__export(setup_exports, {
  HyperPostSetup: () => HyperPostSetup
});
module.exports = __toCommonJS(setup_exports);
var readline = __toESM(require("readline"));
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));

// src/signup-templates.ts
var PLATFORM_SIGNUP_REQUIREMENTS = {
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
      "4. Copy the access token (the setup wizard will collect this)"
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
      "5. Copy the generated app password (the setup wizard will collect this)"
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
      "7. Copy the API key (the setup wizard will collect this)"
    ],
    setupSteps: [],
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
      "5. Copy the integration token (the setup wizard will collect this)"
    ],
    setupSteps: [],
    verificationNotes: "Medium integration tokens are created instantly. Requires a Medium account."
  }
};
var DIFFICULT_PLATFORM_SIGNUP_REQUIREMENTS = {
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
      "6. Copy the bot token (the setup wizard will collect this)",
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
      "6. Copy the client_id and secret (the setup wizard will collect this)"
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
var ALL_PLATFORM_SIGNUP_REQUIREMENTS = {
  ...PLATFORM_SIGNUP_REQUIREMENTS,
  ...DIFFICULT_PLATFORM_SIGNUP_REQUIREMENTS
};

// src/signup-manager.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var os = __toESM(require("os"));
var DEFAULT_CONFIG_FILE = "config.json";
var LEGACY_CONFIG_FILE = ".hyperpost-config.json";
var FALLBACK_DEFAULT_TEMPLATE = {
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
var SignupManager = class {
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

// src/setup.ts
var colors = {
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
var HyperPostSetup = class {
  rl;
  signupManager;
  isRunning = false;
  constructor() {
    const isPiped = !process.stdin.isTTY || process.env.CI === "true";
    this.rl = readline.createInterface({
      input: process.stdin,
      output: isPiped ? void 0 : process.stdout,
      terminal: !isPiped
    });
    this.signupManager = new SignupManager();
  }
  isPipedInput() {
    return !process.stdin.isTTY || process.env.CI === "true";
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
    console.log(`${colors.blue}\u{1F4C1} Configuration Status:${colors.reset}`);
    const existingPlatforms = this.signupManager.getConfiguredPlatforms();
    if (existingPlatforms.length > 0) {
      console.log(`${colors.green}Currently configured platforms:${colors.reset}`, existingPlatforms.join(", "));
    } else {
      console.log(`${colors.yellow}No platforms currently configured.${colors.reset}`);
    }
    console.log(`${colors.dim}New platform credentials will be added to your configuration.${colors.reset}
`);
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
    console.log(`
${colors.bright}${colors.green}\u{1F389} ALL ACCOUNTS CREATED AND CONFIGURED!${colors.reset}`);
    console.log(`${colors.cyan}You can now post to all platforms with:${colors.reset}`);
    console.log(`${colors.yellow}hyper-post post -c "Your message" -t "Title" -u "https://link.com"${colors.reset}`);
    this.rl.close();
    this.isRunning = false;
  }
  async quickSetup() {
    console.log(`${colors.yellow}\u26A1 QUICK SETUP MODE${colors.reset}`);
    console.log(`${colors.dim}\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550${colors.reset}`);
    console.log(`${colors.cyan}This mode will use default values and skip most prompts.${colors.reset}
`);
    await this.setupSQLite();
    const defaultTemplate = this.signupManager.getDefaultTemplate();
    Object.keys(ALL_PLATFORM_SIGNUP_REQUIREMENTS).forEach((platform) => {
      this.signupManager.saveTemplate(platform, defaultTemplate);
    });
    console.log(`${colors.green}\u2705 Quick setup complete!${colors.reset}`);
    console.log(`${colors.cyan}You can now configure individual platforms manually.${colors.reset}`);
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
        const baseTemplate2 = Object.values(existingTemplates)[0];
        Object.keys(ALL_PLATFORM_SIGNUP_REQUIREMENTS).forEach((platform) => {
          if (!existingTemplates[platform]) {
            this.signupManager.saveTemplate(platform, baseTemplate2);
          }
        });
        console.log(`${colors.green}\u2705 Using existing template for all platforms.${colors.reset}
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
    console.log(`${colors.cyan}DATABASE_URL format:${colors.reset}`);
    console.log(`${colors.dim}postgresql://username:password@host:port/database${colors.reset}`);
    const currentUser = process.env.USER || "postgres";
    console.log(`${colors.dim}Example: postgresql://[${currentUser}]@localhost:5432/hyper-post${colors.reset}`);
    console.log("");
    const dbUrl = await this.askFieldWithDefault({
      key: "database_url",
      label: "DATABASE_URL",
      description: "Full PostgreSQL connection URL",
      type: "text",
      required: true,
      defaultValue: `postgresql://${currentUser}:password@localhost:5432/hyperpost`
    });
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
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HyperPostSetup
});
//# sourceMappingURL=setup.js.map