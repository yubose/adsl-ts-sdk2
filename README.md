# AiTmed's Encryption/Decryption SDK

## Usage

These methods were built on top of [TweetNaCl.js](https://www.npmjs.com/package/tweetnacl#examples)

```ts
import services from '@aitmed/ecos-lvl2-sdk'

const level2SDK = new lvl2SDK({
      apiVersion,
      apiHost,
      env: 'test',
      configUrl: 'https://public.aitmed.com/config',
    })
    
async function callSomeApi() {
  const deat = await level2SDK.Account.createUser({
    phone_number: '(555)555-5555',
    password: 'letmein123',
    verification_code: '00000',
    first_name: 'Tom',
    last_name: 'Jones',
  })

  return deat
}

async function callSomeApi() {
  const deat = await level2SDK.edgeServices.createEdge({
    etype: 'CREATE_USER',
    apiVersion: 'v1beta1',
    name: {
      phone_number: '(555)555-5555',
      first_name: 'Tom',
      last_name: 'Jones',
    },
  })

  return deat
}
```

## Methods Include:

| Method                                                             | Returns                                             | Description                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Encryption/Decryption                                              |                                                     |                                                                                     |
| `.generateAKey()`                                                  | `{sk:Uint8Array, pk:Uint8Array}`                    | Generates a keyPair for assymetric encryption/decryption                            |
| `.aKeyCheck(publicKey:Uint8Array,secretKey:Uint8Array)`            | `boolean`                                           | Checks if the keyPair is a valid one                                                |
| `.aKeyEncrypt(secretKey:Uint8Array, data:Uint8Array)`              | `Uint8Array`                                        | Assymetrically encrypts the given data using a secret key from a valid keyPair      |
| `.aKeyDecrypt: (publicKey: Uint8Array, encryptedData: Uint8Array)` | `Uint8Array`                                        | Decrypts the assymetrically encrypted data using the publicKey from a valid keyPair |
| `.generateSKey()`                                                  | `Uint8Array`                                        | Generates a secretKey for symetrical encryption/decryption                          |
| `.sKeyEncrypt(secretKey: Uint8Array, data: Uint8Array)`            | `Uint8Array`                                        | Symetrically encrypts data using a secretKey                                        |
| `.sKeyDecrypt(secretKey: Uint8Array, encryptedData: Uint8Array)`   | `Uint8Array`                                        | Decrypts the symetrically encrypted data using the secretKey it was encrypted with  |
| `.uint8ArrayToBase64(data: Uint8Array)`                            | `string`                                            | Encodes Uint8Array value to base64 string                                           |
| `.base64ToUint8Array(data: string)`                                | `Uint8Array`                                        | Decodes string value to Uint8Array                                                  |
| `.uTF8ToUint8Array(data: string)`                                  | `Uint8Array`                                        | Decodes string and returns Uint8Array                                               |
| `.uint8ArrayToUTF8(data: Uint8Array)`                              | `string`                                            | Encodes Uint8Array or Array of bytes into string                                    |
| Account                                                            |
| `.createUser`                                                      | `{ status: success, user_id: UUID, token: string,}` | creates a user                                                                      |
| `.login`                                                           | `{ status: success or error}`                       | login a user                                                                        |
| Edges                                                              |
| `.createEdge`                                                      | `Edge`                                              | creates an edge                                                                     |
| `.retrieveEdge`                                                    | `Edge`                                              | retrieves an edge                                                                   |


#####################################################################################

===>ECOS - Lvl 2 SDK. This layer connects itself to the protorepo, and is used by the Lvl 2.5 layer. In a nutshell, ECOS provides various types of services that can be used by later layers. Services include edgeServices, documentServices, vertexServices, commonServices, and utilServices. Its constructor also calls for the creation of an account, and we can access store from Lvl 2 SDK. Once a SDK is created, we can use it to access various attributes of the store, as well as the methods provided by different services. Through the store, a SDK can access any store related attributes, get config information, etc.

=>Store - The Store contains serveral private fields and one public field:
- apiPort, a string, defaults to 443
- _apiHost, a string
- _apiVersion, a string
- _env, defaults to development (but can be production)
- _configUrl, a string, currently defaults to https://public.aitmed.com/config
- (PUBLIC FIELD) grpcClient: this is the url that connects to the backend 

The store constructor can take apiVersion, apiHost, env, and configUrl, but only the last two are provided when creating by default. These fields can be accessed/modified via setters and getters.

Upon creation, store also generates the link to the backend using the generateGrpcClient() function provided in its constructor, and will define the generated result to its public grpcClient variable. 

Additionally, store can get CONFIG_NAME stored in localStorage, if it exists. It has a function called loadConfig, which can be called to retrieve config data from {appName}.yml file. {appName} is provided as a parameter, but will default to aitmed if not provided. Lastly, a store is also able to clean config by removing it from local storage.

=>Account - An account is created and attached to the SDK through SDK constructor. Through account, we can access the following methods:
- requestVerificationCode
- createUser
- createInvitedUser
- login
- loginNewDevice
- logout
- logoutClean
- getStatus
- changePasswordWithOldPasswor:
- changePasswordWithVerificationCode
- verifyUserPassword

Each of the above functions handles a specific aspect of user authentication process. #**# I still need to discover where in later layers are these functions being utilized.

#vertexServices - A vertex is "like" a user. Four services are bundled into vertexServices: 
- createVertex: creates a vertex, this method is called when an user is created
- retrieveVertex: retrieves a vertex, this method is called when logging in
- updateVertex: updates a vertex, this method is called to make minor changes when logging in or creating invited user, but most notably for updating password
- deleteVertex: deletes a vertex, I have not discovered an instance where this method is called yet

#edgeServices - An edge can be a video session, chatting session, appointment, etc. and is distinguished by type. Every document is attached to an edge, and an edge is connected to/created by a vertex (which for the moment is an user). Related services are:
- createEdge: Creates an edge
- retrieveEdge: Retrieves an edge
- updateEdge: Updates an edge
- deleteEdge: Deletes an edge

#documentServices - A document can be anything, a pdf file, a jpeg image, etc. We can perform specific CRUD operations through documentServices. Its methods include:
- createDocument
- retrieveDocument
- updateDocument
- deleteDocument
- attachDocument
- uploadDocumentToS3
- downloadDocumentFromS3

#commonServices - Services provided here are mostly meant to help other services. For instance, toSDKVertex method is used in createVertex. Services here include:
- deleteRequest: helps to delete entities
- toSDKVertex
- toSDKEdge
- toSDKDoc
- generateEsak: will be relocated to CADL
- encryptData: will be relocated to CADL
- decryptData: will be relocated to CADL

#utilServices - These services primarily serve to help in the data encryption/decryption process. Methods include encryption, decryption, key generation, and data conversion.

#AiTmed Error errorCode translate

//common - 2000
*  case 10:
      return 2001
    
*  case 20:
      return 2002
    
*  case 110:
      return 2003
    
*  case 111:
      return 2004
    
*  case 113:
      return 2006
    
*  case 114:
      return 2007
    
*  case 120:
      return 2008
    
*  case 200:
      return 2009
    
*  case 201:
      return 2010
    
*  case 202:
      return 2011
    
*  case 205:
      return 2012
    
*  case 210:
      return 2013
    
*  case 240:
      return 2014
    
*  case 300:
      return 2015
    
*  case 310:
      return 2016
    
*  case 400:
      return 2017

// Vertex
*  case 1060:
      return 3000
    
*  case 1000:
      return 3001
    
*  case 1072:
      return 3003
    
*  case 1010:
      return 3004
    
*  case 1030:
      return 3005
    
*  case 1030:
      return 3005
    
*  case 1040:
      return 3006
    
*  case 1050:
      return 3007
   
*   case 1070:
      return 3008
    
*  case 1071:
      return 3009
    
*  case 2010:
      return 3010
    
*  case 2072:
      return 3011
    
// Edge
    
*  case 3060:
      return 4000
    
*  case 3070:
      return 4001
    
*  case 3000:
      return 4002
    
*  case 3001:
      return 4003
    
*  case 3010:
      return 4004
    
//Document
    
*  case 2060:
      return 5000
    
*  case 2070:
      return 5001
    
*  case 2000:
      return 5002
