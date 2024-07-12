export enum Codes {
  SUCCESS = 0,

  PERMISSION_DENIED,

  UNREGISTERED,
  REGISTERED,
  INVALID_API_VERSION,
  ERROR_UPLOADING_TO_AWS_S3,
  ERROR_DOWNLOADING_FROM_AWS_S3,
  ERROR_CREATING_ESAK,

  /* Account    - 1000 */
  PHONE_NUMBER_INVALID = 1000,
  PASSWORD_INVALID,
  VERIFICATION_CODE_INVALID,
  REQUIRED_VERIFICATION_CODE,
  REQUIRED_PASSWORD,
  REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE,
  ERROR_CLEARING_CREDENTIALS,
  LOGIN_REQUIRED,

  /* common     - 2000 */
  OBJECT_TYPE_INVALID = 2000,
  NUll_INPUT_OBJECT,
  INVALID_NAME_JSON,
  JWT_OBJECT_TYPE_ERROR,
  JWT_NOT_FOUND,
  JWT_V_CODE_ERROR,
  JWT_EXPIRED,
  JWT_PERMISSION_DENY,
  DB_CONNECTION_ERROR,
  SQL_EXEC_ERROR,
  SQL_BEGIN_ERROR,
  SQL_COMMIT_ERROR,
  SQL_RESULT_ERROR,
  SQL_STATEMENT_GEN_ERROR,
  SQL_UPDATE_WITHOUT_ID,
  TWILIO_CONNECTION_ERROR,
  TWILIO_RESPONSE_ERROR,
  NOT_IMPLEMENTED_MULTIPLE_DELETE,
  JSON_STRINGIFY_FAILED,
  ERROR_DECRYPTING_DATA,
  JSON_PARSE_FAILED,

  /* Vertex     - 3000 */
  CREATE_VERTEX_WRONG_ID = 3000,
  INVALID_USER_ID,
  CANNOT_FIND_UID,
  DELETE_ID_NOT_FOUND,
  CANNOT_FIND_USER_ID,
  UID_HAS_BEEN_USED,
  USER_ID_NOT_MATCH,
  UID_IS_EMPTY,
  INVALID_PUBLIC_KEY_LENGTH,
  INVALID_SECRET_KEY_LENGTH,
  CANNOT_FIND_HOST_EDGE,
  DELETE_HOST_ID_NOT_FOUND,
  VERTEX_IS_UNDEFINED,

  /* Edge       - 4000 */
  CREATE_EDGE_WRONG_ID = 4000,
  UPDATE_EDGE_ID_NOT_FOUND,
  INVALID_E_TYPE,
  DELETE_OBJ_HAS_CHILD,
  NO_VERIFICATION_CODE,
  EDGE_IS_UNDEFINED,
  ERROR_CREATING_BESAK,

  /* Document   - 5000 */
  CREATE_DOC_WRONG_ID = 5000,
  UPDATE_DOC_ID_NOT_FOUND,
  CREATE_DOC_INVALID_EID,
  DOCUMENT_IS_UNDEFINED,

  /* UIDL - 6000 */
  YAML_PARSE_FAILED = 6000,
  REACT_YAML_PARSE_FAILED,
  INVALID_TARGET_OPTION,
}

export const defaultMessages: Record<string, string> = {
  UNKNOWN_ERROR: 'error occurred',

  SUCCESS: 'success',

  PERMISSION_DENIED: 'permission denied',

  UNREGISTERED: 'account is not registered',
  REGISTERED: 'account is already registered',
  INVALID_API_VERSION: 'Invalid apiVersion',
  ERROR_UPLOADING_TO_AWS_S3: 'Error uploading document to aws S3',
  ERROR_DOWNLOADING_FROM_AWS_S3: 'Error downloading document from aws S3',
  ERROR_CREATING_ESAK: 'Please provide a public key',

  /* Account    - 1000 */
  PHONE_NUMBER_INVALID: 'phone number is invalid',
  PASSWORD_INVALID: 'password is invalid',
  VERIFICATION_CODE_INVALID: 'verification code is invalid',
  REQUIRED_VERIFICATION_CODE: 'verification code is required',
  REQUIRED_PASSWORD: 'password is required',
  REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE:
    'phone number and verification are required',
  ERROR_CLEARING_CREDENTIALS:
    'There was an error clearing out the localStorage.',
  LOGIN_REQUIRED: 'User must log In.',

  /* common     - 2000 */
  OBJECT_TYPE_INVALID: 'Object type is invalid',
  NUll_INPUT_OBJECT: 'Nil Input Object',
  INVALID_NAME_JSON: 'Invalid name Json',
  JWT_OBJECT_TYPE_ERROR: 'Mismatched JWT object type',
  JWT_NOT_FOUND: 'JWT is not found, may have been expired',
  JWT_V_CODE_ERROR: 'JWT Verification Code Error',
  JWT_EXPIRED: 'JWT Expired',
  JWT_PERMISSION_DENY: 'JWT Permission Deny',
  DB_CONNECTION_ERROR: 'Cannot connect to DB',
  SQL_EXEC_ERROR: 'SQL Execution Error',
  SQL_BEGIN_ERROR: 'SQL Begin Transaction Error',
  SQL_COMMIT_ERROR: 'SQL Commit Transaction Error',
  SQL_RESULT_ERROR: 'SQL Result Processing Error',
  SQL_STATEMENT_GEN_ERROR: 'SQL Error When Generate Statement',
  SQL_UPDATE_WITHOUT_ID: 'Update Without ID',
  TWILIO_CONNECTION_ERROR: 'Twilio Http Connection Error',
  TWILIO_RESPONSE_ERROR: 'Twilio Http Response Error',
  NOT_IMPLEMENTED_MULTIPLE_DELETE: 'Multiple id deletion has not implemented',
  JSON_STRINGIFY_FAILED: 'Failed attempt to stringify value.',
  ERROR_DECRYPTING_DATA: 'Error in decrypting data.',
  JSON_PARSE_FAILED: 'Failed attempt to parse JSON',

  /* Vertex     - 3000 */
  CREATE_VERTEX_WRONG_ID: 'Create Vertex With a Wrong Id',
  INVALID_USER_ID: 'Invalid user_id',
  CANNOT_FIND_UID: 'Cannot Find user_id',
  DELETE_ID_NOT_FOUND: 'Delete ID not found',
  CANNOT_FIND_USER_ID: 'Cannot Find user_id',
  UID_HAS_BEEN_USED: 'Uid Has Been Used',
  USER_ID_NOT_MATCH: 'UserId not match',
  UID_IS_EMPTY: 'Uid Is Empty',
  INVALID_PUBLIC_KEY_LENGTH: 'Invalid Public Key Length, expected 32',
  INVALID_SECRET_KEY_LENGTH: 'Invalid Encrypted Secret Key Length, expected 72',
  CANNOT_FIND_HOST_EDGE: 'Create Doc Cannot Find Host Edge',
  DELETE_HOST_ID_NOT_FOUND: 'Cannot find the host ID of a Delete item',
  VERTEX_IS_UNDEFINED: 'Vertex is undefined',

  /* Edge       - 4000 */
  CREATE_EDGE_WRONG_ID: 'Create Edge With a Wrong Id',
  UPDATE_EDGE_ID_NOT_FOUND: 'Update Edge, ID is not found',
  INVALID_E_TYPE: 'Invalid etype, not implemented yet',
  DELETE_OBJ_HAS_CHILD: 'Cannot Delete Item which has child(ren)',
  NO_VERIFICATION_CODE: 'No Verication Code in name of edge',
  EDGE_IS_UNDEFINED: 'The edge is undefined.',
  ERROR_CREATING_BESAK: 'There was an error creating the edge besak',

  /* Document   - 5000 */
  CREATE_DOC_WRONG_ID: 'Create Doc With a Wrong Id',
  UPDATE_DOC_ID_NOT_FOUND: 'Update Doc, ID is not found',
  CREATE_DOC_INVALID_EID: 'Create Doc with Invalid Edge Id',
  DOCUMENT_IS_UNDEFINED: 'Document is undefined',

  /* UIDL   - 6000 */
  YAML_PARSE_FAILED: 'Failed to parse yaml',
  REACT_YAML_PARSE_FAILED:
    'Something went wrong while attempting to use react yaml parser',
  INVALID_TARGET_OPTION: 'Please enter a valid target option',
}
