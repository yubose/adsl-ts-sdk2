export enum StatusCodes {
  LOGGED_IN = 0,
  LOGGED_OUT,
  NEW_DEVICE,
  TEMP_ACCOUNT,
}

export const defaultMessages: Record<string, string> = {
  LOGGED_IN: 'User is already in a logged in state.',
  LOGGED_OUT: 'User needs to verify their password to be logged in.',

  NEW_DEVICE:
    'There are no user credentials stored. User must be authenticated.',
  TEMP_ACCOUNT:
    'The user has been invited to join and needs to complete registration.',
}
