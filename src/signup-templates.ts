// Signup templates for creating genuine social media accounts
// These templates ensure consistent branding and professional presentation

export interface SignupTemplate {
  // Basic account info
  username: string;
  displayName: string;
  email: string;

  // Profile information
  bio?: string;
  description?: string;
  website?: string;
  location?: string;

  // Social/branding
  avatarUrl?: string;
  bannerUrl?: string;
  themeColor?: string;

  // Platform-specific fields
  customFields?: Record<string, any>;

  // Account purpose/goals
  accountType: 'personal' | 'business' | 'community' | 'project';
  primaryTopics: string[];
  targetAudience: string;
}

export const DEFAULT_SIGNUP_TEMPLATE: SignupTemplate = {
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

// Platform-specific signup requirements and templates
export interface PlatformSignupRequirements {
  platform: string;
  displayName: string;

  // Required fields for account creation
  requiredFields: {
    key: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'url' | 'textarea' | 'select';
    description: string;
    validation?: (value: string) => boolean | string;
    options?: string[]; // for select fields
  }[];

  // Optional profile enhancement fields
  profileFields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'url' | 'file';
    description: string;
    maxLength?: number;
    recommended?: boolean;
  }[];

  // Platform-specific signup instructions
  signupSteps: string[];

  // Post-creation setup steps
  setupSteps: string[];

  // Verification requirements
  verificationNotes?: string;
}

// Main supported platforms - these are shown in the setup wizard
export const PLATFORM_SIGNUP_REQUIREMENTS: Record<string, PlatformSignupRequirements> = {
  mastodon: {
    platform: 'mastodon',
    displayName: 'Mastodon',
    requiredFields: [
      {
        key: 'instance',
        label: 'Mastodon Instance',
        type: 'url',
        description: 'Your Mastodon server (e.g., mastodon.social, fosstodon.org)',
        validation: (value) => {
          if (!value.includes('.')) return 'Must be a valid domain';
          if (!value.startsWith('http')) value = 'https://' + value;
          return true;
        }
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        description: 'Choose a unique username for this instance',
        validation: (value) => {
          if (value.length < 1) return 'Username is required';
          if (value.length > 30) return 'Username must be 30 characters or less';
          if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores allowed';
          return true;
        }
      },
      {
        key: 'email',
        label: 'Email Address',
        type: 'email',
        description: 'Email for account verification and recovery',
        validation: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) || 'Must be a valid email address';
        }
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        description: 'Strong password for your account',
        validation: (value) => {
          if (value.length < 8) return 'Password must be at least 8 characters';
          return true;
        }
      }
    ],
    profileFields: [
      {
        key: 'displayName',
        label: 'Display Name',
        type: 'text',
        description: 'How others will see you (can include spaces and special characters)',
        maxLength: 30,
        recommended: true
      },
      {
        key: 'bio',
        label: 'Bio',
        type: 'textarea',
        description: 'Short description of yourself or your project',
        maxLength: 500,
        recommended: true
      },
      {
        key: 'website',
        label: 'Website',
        type: 'url',
        description: 'Link to your website or project',
        recommended: true
      },
      {
        key: 'location',
        label: 'Location',
        type: 'text',
        description: 'Where you\'re based (city, country, or "Digital Nomad")',
        maxLength: 30,
        recommended: false
      },
      {
        key: 'avatar',
        label: 'Profile Picture',
        type: 'file',
        description: 'Square image, minimum 400x400px',
        recommended: true
      },
      {
        key: 'header',
        label: 'Header Image',
        type: 'file',
        description: 'Banner image, 1500x500px recommended',
        recommended: false
      }
    ],
    signupSteps: [
      '1. Choose a Mastodon instance (server) - we recommend mastodon.social for beginners',
      '2. Visit the instance website and click "Create account"',
      '3. Accept the server rules',
      '4. Fill in your chosen username, email, and password',
      '5. Complete any CAPTCHA if required',
      '6. Check your email and click the verification link'
    ],
    setupSteps: [
      '1. Complete your profile with bio, website, and images',
      '2. Go to Preferences → Development → New application',
      '3. Name: "HyperPost", Scopes: read + write',
      '4. Copy the access token to your .env file'
    ],
    verificationNotes: 'Mastodon accounts are verified through email confirmation. Some instances may require additional verification.'
  },

  bluesky: {
    platform: 'bluesky',
    displayName: 'Bluesky',
    requiredFields: [
      {
        key: 'email',
        label: 'Email Address',
        type: 'email',
        description: 'Email for account creation and verification',
        validation: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) || 'Must be a valid email address';
        }
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        description: 'Strong password for your account',
        validation: (value) => {
          if (value.length < 8) return 'Password must be at least 8 characters';
          return true;
        }
      },
      {
        key: 'username',
        label: 'Username/Handle',
        type: 'text',
        description: 'Choose a unique handle (will become @handle.bsky.social)',
        validation: (value) => {
          if (value.length < 3) return 'Handle must be at least 3 characters';
          if (value.length > 18) return 'Handle must be 18 characters or less';
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Only letters, numbers, hyphens, and underscores allowed';
          return true;
        }
      }
    ],
    profileFields: [
      {
        key: 'displayName',
        label: 'Display Name',
        type: 'text',
        description: 'Your full name or project name',
        maxLength: 64,
        recommended: true
      },
      {
        key: 'description',
        label: 'Bio/Description',
        type: 'textarea',
        description: 'Tell people about yourself or your project',
        maxLength: 256,
        recommended: true
      },
      {
        key: 'website',
        label: 'Website',
        type: 'url',
        description: 'Link to your website or project',
        recommended: true
      },
      {
        key: 'avatar',
        label: 'Profile Picture',
        type: 'file',
        description: 'Square image, will be cropped to circle',
        recommended: true
      },
      {
        key: 'banner',
        label: 'Banner Image',
        type: 'file',
        description: 'Header image for your profile',
        recommended: false
      }
    ],
    signupSteps: [
      '1. Go to https://bsky.app and click "Create account"',
      '2. Enter your email address',
      '3. Create a strong password',
      '4. Choose your birth date (must be 16+ to use Bluesky)',
      '5. Choose your unique handle/username',
      '6. Complete the CAPTCHA challenge',
      '7. Check your email and click the verification link'
    ],
    setupSteps: [
      '1. Complete your profile with bio, website, and images',
      '2. Go to Settings → Privacy and security → App passwords',
      '3. Click "Add App Password"',
      '4. Name: "HyperPost"',
      '5. Copy the generated app password to your .env file'
    ],
    verificationNotes: 'Bluesky requires email verification. Accounts must be 16+ years old. App passwords are required for API access (not your main password).'
  },

  devto: {
    platform: 'devto',
    displayName: 'Dev.to',
    requiredFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        description: 'API key from Dev.to settings',
        validation: (value) => {
          if (value.length < 10) return 'API key appears too short';
          return true;
        }
      }
    ],
    profileFields: [
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        description: 'Your Dev.to username',
        required: true
      },
      {
        key: 'name',
        label: 'Display Name',
        type: 'text',
        description: 'Your full name',
        required: true
      },
      {
        key: 'summary',
        label: 'Bio/Summary',
        type: 'textarea',
        description: 'Short bio (160 characters max)',
        required: false
      },
      {
        key: 'location',
        label: 'Location',
        type: 'text',
        description: 'Your location',
        required: false
      },
      {
        key: 'website_url',
        label: 'Website',
        type: 'url',
        description: 'Your website URL',
        required: false
      }
    ],
    signupSteps: [
      '1. Go to https://dev.to/settings',
      '2. Look for "Account", "Extensions", or "Integrations" tab',
      '3. Find the "DEV Community API Keys" section',
      '4. Click the "Generate API Key" button',
      '5. Enter a name like "HyperPost" and click generate',
      '6. Copy the generated API key immediately (it won\'t be shown again)',
      '7. Add DEVTO_API_KEY=your_key_here to your .env file'
    ],
    verificationNotes: 'Dev.to API keys are available to all verified accounts. If you don\'t see the API Keys section, try refreshing the page or check if your account needs additional verification. API keys are generated instantly once the section is visible.'
  },

  medium: {
    platform: 'medium',
    displayName: 'Medium',
    requiredFields: [
      {
        key: 'integrationToken',
        label: 'Integration Token',
        type: 'password',
        description: 'Integration token from Medium settings',
        validation: (value) => {
          if (value.length < 20) return 'Integration token appears too short';
          return true;
        }
      }
    ],
    profileFields: [
      {
        key: 'name',
        label: 'Display Name',
        type: 'text',
        description: 'Your display name on Medium',
        required: true
      },
      {
        key: 'bio',
        label: 'Bio',
        type: 'textarea',
        description: 'Short bio/about section',
        required: false
      },
      {
        key: 'url',
        label: 'Website URL',
        type: 'url',
        description: 'Your personal website',
        required: false
      }
    ],
    signupSteps: [
      '1. Go to https://medium.com/me/settings',
      '2. Scroll down to "Integration tokens"',
      '3. Click "Get integration token"',
      '4. Name it "HyperPost" and create',
      '5. Copy the token to your .env file as MEDIUM_TOKEN'
    ],
    verificationNotes: 'Medium integration tokens are created instantly. Requires a Medium account.'
  }

}

// Difficult/advanced platforms - NOT shown in setup wizard
// These require significant setup effort or have complex APIs
export const DIFFICULT_PLATFORM_SIGNUP_REQUIREMENTS: Record<string, PlatformSignupRequirements> = {
  discord: {
    platform: 'discord',
    displayName: 'Discord',
    requiredFields: [
      {
        key: 'email',
        label: 'Email Address',
        type: 'email',
        description: 'Email for account creation',
        validation: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) || 'Must be a valid email address';
        }
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        description: 'Choose a unique username',
        validation: (value) => {
          if (value.length < 2) return 'Username must be at least 2 characters';
          if (value.length > 32) return 'Username must be 32 characters or less';
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Only letters, numbers, hyphens, and underscores allowed';
          return true;
        }
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        description: 'Strong password for your account',
        validation: (value) => {
          if (value.length < 8) return 'Password must be at least 8 characters';
          return true;
        }
      }
    ],
    profileFields: [
      {
        key: 'displayName',
        label: 'Display Name',
        type: 'text',
        description: 'Your display name (can include spaces and special characters)',
        maxLength: 32,
        recommended: true
      },
      {
        key: 'bio',
        label: 'About Me/Bio',
        type: 'textarea',
        description: 'Tell people about yourself or your project',
        maxLength: 190,
        recommended: true
      },
      {
        key: 'avatar',
        label: 'Profile Picture',
        type: 'file',
        description: 'Profile picture (will be cropped to circle)',
        recommended: true
      },
      {
        key: 'banner',
        label: 'Profile Banner',
        type: 'file',
        description: 'Banner image for your profile',
        recommended: false
      }
    ],
    signupSteps: [
      '1. Go to https://discord.com/register',
      '2. Enter your email address',
      '3. Choose a unique username',
      '4. Create a strong password',
      '5. Enter your date of birth (must be 13+ to use Discord)',
      '6. Complete any CAPTCHA if required',
      '7. Check your email and verify your account'
    ],
    setupSteps: [
      '1. Complete your profile with bio and images',
      '2. Go to https://discord.com/developers/applications',
      '3. Click "New Application"',
      '4. Name: "HyperPost Bot"',
      '5. Go to "Bot" section and click "Add Bot"',
      '6. Copy the bot token to your .env file',
      '7. Get a channel ID from your server (right-click channel → Copy ID)'
    ],
    verificationNotes: 'Discord requires email verification and accounts must be 13+. Bot tokens are separate from user accounts and require a bot application. You need a server and channel to post to. Discord has rate limits on bot posting.'
  },

  reddit: {
    platform: 'reddit',
    displayName: 'Reddit',
    requiredFields: [
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        description: 'Choose a unique Reddit username',
        validation: (value) => {
          if (value.length < 3) return 'Username must be at least 3 characters';
          if (value.length > 20) return 'Username must be 20 characters or less';
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Only letters, numbers, hyphens, and underscores allowed';
          return true;
        }
      },
      {
        key: 'email',
        label: 'Email Address',
        type: 'email',
        description: 'Email for account verification',
        validation: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) || 'Must be a valid email address';
        }
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        description: 'Strong password for your account',
        validation: (value) => {
          if (value.length < 8) return 'Password must be at least 8 characters';
          return true;
        }
      }
    ],
    profileFields: [
      {
        key: 'displayName',
        label: 'Display Name',
        type: 'text',
        description: 'Your display name (optional, can be changed later)',
        maxLength: 30,
        recommended: false
      },
      {
        key: 'bio',
        label: 'About/Description',
        type: 'textarea',
        description: 'Tell the Reddit community about yourself',
        maxLength: 200,
        recommended: true
      },
      {
        key: 'website',
        label: 'Website',
        type: 'url',
        description: 'Link to your website or project',
        recommended: true
      },
      {
        key: 'avatar',
        label: 'Profile Picture',
        type: 'file',
        description: 'Square image, will be displayed on your profile',
        recommended: true
      },
      {
        key: 'banner',
        label: 'Profile Banner',
        type: 'file',
        description: 'Banner image for your profile',
        recommended: false
      },
      {
        key: 'location',
        label: 'Location',
        type: 'text',
        description: 'Where you\'re from or based',
        maxLength: 100,
        recommended: false
      }
    ],
    signupSteps: [
      '1. Go to https://www.reddit.com/register/',
      '2. Choose a unique username',
      '3. Enter your email address',
      '4. Create a strong password',
      '5. Complete any CAPTCHA if required',
      '6. Check your email and verify your account'
    ],
    setupSteps: [
      '1. Complete your profile with bio, website, and images',
      '2. Go to https://www.reddit.com/prefs/apps/',
      '3. Click "Create App" or "Create Another App"',
      '4. Type: "script", Name: "HyperPost", Description: "Multi-platform posting"',
      '5. Redirect URI: "http://localhost:8080"',
      '6. Copy the client_id and secret to your .env file'
    ],
    verificationNotes: 'Reddit requires email verification. You must create an app in preferences to get API credentials. Reddit has strict API rate limits and requires OAuth for posting. Network connectivity issues may prevent API access.'
  },

  twitter: {
    platform: 'twitter',
    displayName: 'Twitter/X',
    requiredFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        description: 'Twitter API Key from developer portal',
        validation: (value) => {
          if (value.length < 20) return 'API Key should be longer';
          return true;
        }
      },
      {
        key: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        description: 'Twitter API Secret from developer portal',
        validation: (value) => {
          if (value.length < 40) return 'API Secret should be longer';
          return true;
        }
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        description: 'Twitter Access Token from developer portal',
        validation: (value) => {
          if (value.length < 40) return 'Access Token should be longer';
          return true;
        }
      },
      {
        key: 'accessTokenSecret',
        label: 'Access Token Secret',
        type: 'password',
        description: 'Twitter Access Token Secret from developer portal',
        validation: (value) => {
          if (value.length < 40) return 'Access Token Secret should be longer';
          return true;
        }
      }
    ],
    profileFields: [
      {
        key: 'displayName',
        label: 'Display Name',
        type: 'text',
        description: 'Your display name on Twitter',
        maxLength: 50,
        recommended: true
      },
      {
        key: 'bio',
        label: 'Bio',
        type: 'textarea',
        description: 'Your Twitter bio',
        maxLength: 160,
        recommended: true
      },
      {
        key: 'website',
        label: 'Website',
        type: 'url',
        description: 'Link to your website',
        recommended: true
      },
      {
        key: 'location',
        label: 'Location',
        type: 'text',
        description: 'Your location',
        maxLength: 30,
        recommended: false
      },
      {
        key: 'avatar',
        label: 'Profile Picture',
        type: 'file',
        description: 'Profile picture (will be cropped to circle)',
        recommended: true
      },
      {
        key: 'banner',
        label: 'Header Image',
        type: 'file',
        description: 'Header/banner image for your profile',
        recommended: false
      }
    ],
    signupSteps: [
      '1. Apply for Twitter Developer Account at https://developer.twitter.com/',
      '2. Wait for approval (can take days/weeks)',
      '3. Create a new app in the developer portal',
      '4. Generate API keys and access tokens',
      '5. Set up OAuth 1.0a authentication'
    ],
    setupSteps: [
      '1. Complete your Twitter profile with bio, website, and images',
      '2. In developer portal, go to your app settings',
      '3. Generate API Key, API Secret, Access Token, and Access Token Secret',
      '4. Ensure your app has write permissions',
      '5. Test API connectivity before using'
    ],
    verificationNotes: 'Twitter/X requires developer account approval which can take significant time. API access is restricted and requires OAuth 1.0a. Twitter has strict rate limits and API changes frequently. Not recommended for casual use.'
  }
};

// All platforms (main + difficult) for internal use
export const ALL_PLATFORM_SIGNUP_REQUIREMENTS = {
  ...PLATFORM_SIGNUP_REQUIREMENTS,
  ...DIFFICULT_PLATFORM_SIGNUP_REQUIREMENTS
};

// Function to get a signup template for a platform
export function getSignupTemplate(platform: string): SignupTemplate {
  const requirements = PLATFORM_SIGNUP_REQUIREMENTS[platform];
  if (!requirements) {
    throw new Error(`No signup template available for platform: ${platform}`);
  }

  // Create a template based on the platform requirements
  const template: SignupTemplate = {
    ...DEFAULT_SIGNUP_TEMPLATE,
    username: DEFAULT_SIGNUP_TEMPLATE.username,
    displayName: DEFAULT_SIGNUP_TEMPLATE.displayName,
    email: DEFAULT_SIGNUP_TEMPLATE.email
  };

  return template;
}

// Function to validate a signup template for a platform
export function validateSignupTemplate(platform: string, template: SignupTemplate): { valid: boolean; errors: string[] } {
  const requirements = PLATFORM_SIGNUP_REQUIREMENTS[platform];
  if (!requirements) {
    return { valid: false, errors: [`Unknown platform: ${platform}`] };
  }

  const errors: string[] = [];

  // Check required fields
  for (const field of requirements.requiredFields) {
    const value = template[field.key as keyof SignupTemplate] as string;
    if (!value) {
      errors.push(`Missing required field: ${field.label}`);
    } else if (field.validation) {
      const validationResult = field.validation(value);
      if (validationResult !== true) {
        errors.push(`${field.label}: ${validationResult}`);
      }
    }
  }

  // Check profile field lengths
  for (const field of requirements.profileFields) {
    const value = template[field.key as keyof SignupTemplate] as string;
    if (value && field.maxLength && value.length > field.maxLength) {
      errors.push(`${field.label} exceeds maximum length of ${field.maxLength} characters`);
    }
  }

  return { valid: errors.length === 0, errors };
}
