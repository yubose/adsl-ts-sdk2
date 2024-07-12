import { sha256 } from 'hash.js'
import hash from 'hash.js'
import { scalarMult, secretbox, box, randomBytes, sign } from 'tweetnacl'
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64,
} from 'tweetnacl-util'
import * as grpcWeb from 'grpc-web'
import AitmedError from '../common/Error'
import AitmedResponse from '../common/Response'
import log from './log'
import { Buffer } from 'buffer'
import * as bs58 from 'bs58'

export {
  generalCallback,
  encryptSecretKeyWithPassword,
  encryptSecretKeyWithParentSK,
  generatePasswordWithParentSK,
  normalizeStringTo32BitArray,
  objectToBase64,
  storeCredentialsInLocalStorage,
  removeCredentialsFromLocalStorage,
  generateAKey,
  aKeyCheck,
  aKeyEncrypt,
  aKeyEncrypt_str,
  aKeyDecrypt,
  aKeyDecrypt_str,
  generateSKey,
  sKeyEncrypt,
  sKeyDecrypt,
  uint8ArrayToBase64,
  base64ToUint8Array,
  uTF8ToUint8Array,
  uint8ArrayToUTF8,
  base64ToBlob,
  blobToBase64,
  uTF8ToBase64,
  base64ToUTF8,
  blobToUint8Array,
  uint8ArrayToBlob,
  signature,
  generateSignatureKeyPair,
  verifySignature,
  jsonEscape,
  base58ToUint8Array,
  uint8ArrayToBase58,
  serverDownhandle
}

export function isBrowser() {
  return typeof window !== 'undefined'
}

export function delay(ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 *
 * @param _response the response
 * @param _error an error response
 *
 * used as a general callback to pass to methods
 */

//@ts-ignore
function generalCallback(_response: any, _error: grpcWeb.Error | null) {
  if (_error !== null) {
    throw new AitmedError({ code: _error.code, message: _error.message })
  }
  return new AitmedResponse({ code: _response.code })
}
/**
 *
 * @param param0
 *
 * helper method to encrypt the secretKey with the user's password
 */
function encryptSecretKeyWithPassword({ secretKey, password }: any) {
  const passwordSha256 = sha256()
    .update(password)
    .digest()
  const passwordUintArray = new Uint8Array(passwordSha256)
  const encryptedSecretKey = sKeyEncrypt(passwordUintArray, secretKey)
  return encryptedSecretKey
}


function encryptSecretKeyWithParentSK({ secretKey, password }: any) {
  const newPassword = generatePasswordWithParentSK({password})
  const encryptedSecretKey = encryptSecretKeyWithPassword({secretKey,password:newPassword})
  return encryptedSecretKey
}

function generatePasswordWithParentSK({password}:any){
  let passwordSha256 = sha256()
    .update(password)
    .digest()
  let passwordUintArray = new Uint8Array(passwordSha256)
  passwordUintArray = passwordUintArray.slice(0,16)
  const newPassword = uint8ArrayToBase64(passwordUintArray)
  return newPassword
}

/**
 *
 * @param string
 *
 * helper method used to normalize any size string to a 32bit array
 * used to pass in data to encrypt since encrypt/decrypt methods
 * only handle 32bit array data
 */
function normalizeStringTo32BitArray(string: string) {
  const stringSha256 = sha256()
    .update(string)
    .digest()
  const stringUintArray = new Uint8Array(stringSha256)
  return stringUintArray
}

/**
 *
 * @param obj
 *
 * converts object to base64 to be able to decrease the data size of the JSONObject
 */
function objectToBase64(obj: Record<string, any> | null) {
  let objJsonString: string = ''
  try {
    objJsonString = JSON.stringify(obj)
  } catch (error) {
    new AitmedError({ name: 'JSON_STRINGIFY_FAILED' })
  }
  if (objJsonString) {
    const objJsonB64 = Buffer.from(objJsonString).toString('base64')
    return objJsonB64
  } else {
    return null
  }
}

/**
 *
 * @param string
 *
 * converts utf8 string to base64
 */
function uTF8ToBase64(string: string) {
  const stringB64 = Buffer.from(string).toString('base64')
  return stringB64
}
/**
 *
 * @param string
 *
 * converts base64 string to utf8
 */
function base64ToUTF8(string: string): string {
  const stringUTF8 = Buffer.from(string, 'base64').toString('utf8')
  return stringUTF8
}

/**
 *
 * @param param0
 *
 * helper function to store user credentials in localstorage
 */
function storeCredentialsInLocalStorage({
  pkSign,
  eskSign,
  secretKey,
  publicKey,
  encryptedSecretKey,
  vcjwt,
  jwt,
  user_vid,
  uid,
}: {
  pkSign?: Uint8Array | string
  eskSign?: Uint8Array | string
  secretKey?: Uint8Array | string
  publicKey?: Uint8Array | string
  encryptedSecretKey?: Uint8Array | string
  jwt?: string
  vcjwt?: string
  user_vid?: string
  uid?: string
}) {
  if (typeof window?.localStorage == 'undefined') {
    return
  }

  if (publicKey) {
    let pk
    if (typeof publicKey !== 'string') {
      pk = uint8ArrayToBase64(publicKey)
    } else {
      pk = publicKey
    }
    localStorage.setItem('pk', pk)
  }
  if (secretKey) {
    let sk
    if (typeof secretKey !== 'string') {
      sk = uint8ArrayToBase64(secretKey)
    } else {
      sk = secretKey
    }
    localStorage.setItem('sk', sk)
  }
  if (encryptedSecretKey) {
    let esk
    if (typeof encryptedSecretKey !== 'string') {
      esk = uint8ArrayToBase64(encryptedSecretKey)
    } else {
      esk = encryptedSecretKey
    }
    localStorage.setItem('esk', esk)
  }
  if (eskSign) {
    if (typeof eskSign !== 'string') {
      eskSign = uint8ArrayToBase64(eskSign)
    }
    localStorage.setItem('eskSign', eskSign)
  }
  if (pkSign) {
    if (typeof pkSign !== 'string') {
      pkSign = uint8ArrayToBase64(pkSign)
    }
    localStorage.setItem('pkSign', pkSign)
  }
  if (user_vid) {
    let userVidB64
    if (typeof user_vid !== 'string') {
      userVidB64 = uint8ArrayToBase64(user_vid)
    } else {
      userVidB64 = user_vid
    }
    localStorage.setItem('user_vid', userVidB64)
  }
  if (jwt) {
    localStorage.setItem('jwt', jwt)
  }
  if (vcjwt) {
    localStorage.setItem('vcjwt', vcjwt)
  }
  if (uid) {
    const uidToBase64 = uTF8ToBase64(uid)
    localStorage.setItem('uid', uidToBase64)
  }
}
/**
 * returns a public, and secret key pair for asymmetric encrypting
 */
function generateAKey() {
  return box.keyPair()
}

/**
 *
 * @param publicKey
 * @param secretKey
 *
 * checks if the inputs are a valid KeyPair
 */
function isUint8ArrayEqual(aa: Uint8Array, bb: Uint8Array): boolean {
  if (aa.length != bb.length) {
    return false
  }
  for (let ii = 0; ii < aa.length; ii++) {
    if (aa[ii] != bb[ii]) return false
  }
  return true
}

function aKeyCheck(publicKey: Uint8Array, secretKey: Uint8Array): boolean {
  return isUint8ArrayEqual(publicKey, scalarMult.base(secretKey))
}

/**
 *
 * @param secretKey
 * @param data
 *
 * assymetrically encrypts data using the sender's secretKey
 * and receiver's publicKey
 * extraKey provide extra protection which needs to be exchanged separatedly
 */
function aKeyEncrypt(
  recvPublicKey: Uint8Array,
  sendSecretKey: Uint8Array,
  data: Uint8Array,
  extraKey?: Uint8Array,
): Uint8Array {
  const nonce = newNonce()
  const sharedKey = box.before(recvPublicKey, sendSecretKey)
  const encrypted = extraKey
    ? box(data, nonce, extraKey, sharedKey)
    : box.after(data, nonce, sharedKey)

  const fullMessage = new Uint8Array(nonce.length + encrypted.length)
  fullMessage.set(nonce)
  fullMessage.set(encrypted, nonce.length)
  return fullMessage
}

function aKeyEncrypt_str(
  recvPublicKey: Uint8Array,
  sendSecretKey: Uint8Array,
  data: string,
  extraKey?: string,
): string {
  const fullMessage = extraKey
    ? aKeyEncrypt(
        recvPublicKey,
        sendSecretKey,
        decodeUTF8(data),
        new Uint8Array(
          hash
            .sha256()
            .update(extraKey)
            .digest(),
        ),
      )
    : aKeyEncrypt(recvPublicKey, sendSecretKey, decodeUTF8(data))
  return encodeBase64(fullMessage)
}

/**
 *
 * @param publicKey
 * @param eData
 *
 * decrypts assymetrically encrypted data using the sender's publicKey
 * and receiver's secretKey
 * extraKey:may needed
 */
function aKeyDecrypt(
  sendPublicKey: Uint8Array,
  recvSecretKey: Uint8Array,
  eData: Uint8Array,
  extraKey?: Uint8Array,
): Uint8Array | null {
  const sharedKey = box.before(sendPublicKey, recvSecretKey)
  const nonce = eData.slice(0, box.nonceLength)
  const message = eData.slice(box.nonceLength, eData.length)

  const decrypted = extraKey
    ? box.open(message, nonce, extraKey, sharedKey)
    : box.open.after(message, nonce, sharedKey)

  if (!decrypted) {
    log.debug('fail to decrypt!')
    return decrypted
  }
  return decrypted
}

function aKeyDecrypt_str(
  sendPublicKey: Uint8Array,
  recvSecretKey: Uint8Array,
  eData: string, // any string
  extraKey?: string, // base64 encoded byte array
): string | null {
  const eDataArr = decodeBase64(eData)
  log.debug(eDataArr.length)
  const decrypted = extraKey
    ? aKeyDecrypt(
        sendPublicKey,
        recvSecretKey,
        eDataArr,
        new Uint8Array(
          hash
            .sha256()
            .update(extraKey)
            .digest(),
        ),
      )
    : aKeyDecrypt(sendPublicKey, recvSecretKey, eDataArr)
  if (!decrypted) {
    log.debug('fail to decrypt!')
    return ''
  }
  return encodeUTF8(decrypted)
}
/**
 * returns a secretKey for symmetric encrypting
 */
function generateSKey(): Uint8Array {
  const secretKey: Uint8Array = randomBytes(secretbox.keyLength)
  return secretKey
}

/**
 *
 * @param secretKey
 * @param data
 *
 * encrypts data symmetrically using teh provided secretKey
 */
function sKeyEncrypt(secretKey: Uint8Array, data: Uint8Array): Uint8Array {
  const nonce: Uint8Array = randomBytes(secretbox.nonceLength)
  const box: Uint8Array = secretbox(data, nonce, secretKey)
  const encryptedData: Uint8Array = new Uint8Array(nonce.length + box.length)
  encryptedData.set(nonce)
  encryptedData.set(box, nonce.length)
  return encryptedData
}

/**
 *
 * @param secretKey
 * @param eData
 *
 * decrypt data symmetrically using the secretKey provided
 */
function sKeyDecrypt(
  secretKey: Uint8Array,
  eData: Uint8Array,
): Uint8Array | null {
  const nonce: Uint8Array = eData.slice(0, secretbox.nonceLength)
  const data: Uint8Array = eData.slice(secretbox.nonceLength, eData.length)
  let decryptedData: Uint8Array | null
  try {
    decryptedData = secretbox.open(data, nonce, secretKey)
  } catch (error) {
    throw new Error('Could not decrypt data')
  }
  return decryptedData
}

/**
 *
 * @param data
 *
 * encodes Uint8Array data to base64 string
 */
function uint8ArrayToBase64(data: Uint8Array): string {
  return encodeBase64(data)
}

/**
 *
 * @param data
 *
 * decodes string data to Uint8Array
 */
function base64ToUint8Array(data: string): Uint8Array {
  return decodeBase64(data)
}
/**
 *
 * @param data
 *
 * converts Blob to base64
 */
async function blobToBase64(data: Blob): Promise<string> {
  const dataToBuffer = await new Response(data).arrayBuffer()
  const dataBufferToUint8Array = new Uint8Array(dataToBuffer)
  const dataUint8ArrayToBase64 = uint8ArrayToBase64(dataBufferToUint8Array)
  return dataUint8ArrayToBase64
}

/**
 *
 * @param data
 * @param type optional
 *
 * converts string data to Blob
 */
function base64ToBlob(data: string, type?: string): Blob {
  const dataToUint8Array = decodeBase64(data)
  const dataUint8ArrayToBuffer = new Buffer(dataToUint8Array)
  const dataBufferToBlob = new Blob([dataUint8ArrayToBuffer.buffer], {
    type,
  })
  return dataBufferToBlob
}
/**
 *
 * @param data
 *
 * decodes string and returns Uint8Array
 */
function uTF8ToUint8Array(data: string): Uint8Array {
  return decodeUTF8(data)
}

/**
 *
 * @param data
 *
 * encodes Uint8Array or Array of bytes into string
 */
function uint8ArrayToUTF8(data: Uint8Array): string {
  return encodeUTF8(data)
}

/**
 *
 * @param data
 *
 * converts data from Blob to Uint8Array
 */
async function blobToUint8Array(data: Blob): Promise<Uint8Array> {
  const dataToBuffer = await new Response(data).arrayBuffer()
  const dataBufferToUint8Array = new Uint8Array(dataToBuffer)
  return dataBufferToUint8Array
}

/**
 *
 * @param data
 * @param type
 *
 * converts data from Uint8Array to Blob
 */
function uint8ArrayToBlob(data: Uint8Array, type?: string): Blob {
  const dataUint8ArrayToBuffer = new Buffer(data)
  const dataBufferToBlob = new Blob([dataUint8ArrayToBuffer.buffer], {
    type,
  })
  return dataBufferToBlob
}

/**
 * creates random nonce
 */
function newNonce() {
  return randomBytes(box.nonceLength)
}

function removeCredentialsFromLocalStorage() {
  if (typeof window?.localStorage !== 'undefined') {
    localStorage.removeItem('sk')
    localStorage.removeItem('pk')
    localStorage.removeItem('esk')
    localStorage.removeItem('user_vid')
    localStorage.removeItem('jwt')
    localStorage.removeItem('vcjwt')
    localStorage.removeItem('uid')
    localStorage.removeItem('Global')
  }
}

/**
 *
 * @param
 */
function generateSignatureKeyPair(): {
  pkSign: Uint8Array
  skSign: Uint8Array
} {
  const { publicKey, secretKey } = sign.keyPair()
  return { pkSign: publicKey, skSign: secretKey }
}

/**
 *
 * @param message
 * @throws {LOGIN_REQUIRED} If the user is not logged in.
 */
function signature({ sk, message, eskSign }): string {
  const secretKey = sk
  if (!secretKey || !eskSign) {
    throw new AitmedError({ name: 'LOGIN_REQUIRED' })
  }

  let skSign, signature
  if (secretKey && eskSign) {
    const secretKeyUint8Array = base64ToUint8Array(secretKey)
    const eskSignUint8Array = base64ToUint8Array(eskSign)

    try {
      skSign = sKeyDecrypt(secretKeyUint8Array, eskSignUint8Array)
    } catch (error) {
      throw error
    }
  }
  if (skSign) {
    const messageSha256 = sha256()
      .update(message)
      .digest()
    const messageUint8Array = new Uint8Array(messageSha256)

    const signatureUint8Array = sign(messageUint8Array, skSign)

    const signatureBase64 = uint8ArrayToBase64(signatureUint8Array)
    signature = signatureBase64
  }
  return signature
}

/**
 *
 * @param signature
 * @param pkSign
 */
function verifySignature(
  signature: string | Uint8Array,
  pkSign: string | Uint8Array,
): boolean {
  if (typeof signature === 'string') {
    signature = base64ToUint8Array(signature)
  }
  if (typeof pkSign === 'string') {
    pkSign = base64ToUint8Array(pkSign)
  }
  const isValid = sign.open(signature, pkSign)
  return !!isValid
}

const jsonEscape = (str: string) => {
  return str
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

/**
 * @description base58 to uint8Array
 * @param data base58
 * @returns uint8Array
 */
function base58ToUint8Array(data: string): Uint8Array {
  return bs58.decode(data)
}

/**
 * @description uint8Array to base58
 * @param data uint8Array
 * @returns base58
 */
function uint8ArrayToBase58(data: Uint8Array): string{
  return bs58.encode(data)
}

function serverDownhandle(){
  const href = window.location.href 
  if (href.endsWith("?")) {
      window.location.href+='SignIn-ErrorResponse'
  } else if (href.endsWith("ErrorResponse")) {
      window.location.href = window.location.href 
  } else  {
      window.location.href+="-ErrorResponse"
  }
  
}