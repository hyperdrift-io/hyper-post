import { SignupManager } from './signup-manager';

export function loadCredentials(): Record<string, Record<string, string>> {
  const credentials: Record<string, Record<string, string>> = {};
  const signupManager = new SignupManager();
  const completedAccounts = signupManager.getAllCompletedAccounts();

  for (const [platform, accountData] of Object.entries(completedAccounts)) {
    credentials[platform] = accountData as Record<string, string>;
  }

  return credentials;
}
