import edgeServices from '../edges'
import vertexServices from '../vertex'
import utils from '../../utils'
import Response from '../../common/Response'
import Status from '../../common/Status'
import AitmedError from '../../common/Error'
import Etypes from '../../common/codes/etypes'
import {
  RequestVerificationCodeArgs,
  ChangePasswordWithOldPasswordArgs,
  ChangePasswordWithVerificationCode,
  CreateUserArgs,
  LoginNewDeviceArgs,
  LoginArgs,
  VerifyUserPasswordArgs,
  CreateInvitedUserArgs,
  GeneratorSigForOldAccountArgs,
} from './types'
import log from '../../utils/log'

import store from '../../common/store'

import { signature } from '../../utils'

export default class Account {
  edgeServices?: typeof edgeServices
  vertexServices?: typeof vertexServices

  constructor(options?: {
    edgeServices?: Account['edgeServices']
    vertexServices?: Account['vertexServices']
  }) {
    if (options) {
      this.edgeServices = options.edgeServices
      this.vertexServices = options.vertexServices
    }
  }
  /**
   *
   * @param {RequestVerificationCodeArgs} args
   *
   * requests a verification code needed for the user to
   * complete loging in from new device or registering for the first time
   */

  async requestVerificationCode({
    phone_number,
  }: RequestVerificationCodeArgs): Promise<Response> {
    if (store.getConfig() === null) await store.loadConfig()

    const name = { phone_number }
    try {
      const { data } = await this.edgeServices.createEdge({
        type: Etypes.sendVerificationCode,
        name,
      })
      const { deat } = data?.edge
      return new Response({
        code: 0,
        data: deat,
      })
    } catch (error) {
      throw error
    }
  }

  /**
   *
   * @param {CreateUserArgs} args
   *
   * used to register user and store the user credentials such jwt, publicKey, secretKey in
   * localStorage
   */
  async createUser({
    password,
    phone_number,
    verification_code,
    userInfo: name,
    type = 1,
  }: CreateUserArgs): Promise<Response> {
    if (store.getConfig() === null) await store.loadConfig()

    //generate assymetric keyPair for credentials
    const { publicKey, secretKey } = utils.generateAKey()
    //symmetrically encrypt secretKey with password
    const encryptedSecretKey = utils.encryptSecretKeyWithPassword({
      password,
      secretKey,
    })

    //generate keyPair for signature
    const { pkSign, skSign } = utils.generateSignatureKeyPair()

    //symmetrically encrypt skSign with sk from credentials
    const eskSign = utils.sKeyEncrypt(secretKey, skSign)

    const pkSignBase64 = utils.uint8ArrayToBase64(pkSign)
    const eskSignBase64 = utils.uint8ArrayToBase64(eskSign)

    try {
      const { data: response } = await this.vertexServices.createVertex({
        uid: phone_number,
        name: { ...name, pkSign: pkSignBase64, eskSign: eskSignBase64 },
        pk: publicKey,
        type,
        subtype: 2,
        tage: verification_code,
        esk: encryptedSecretKey,
      })
      if (response.error)
        return new Response({ code: response.code, data: response })
      //store credentials in local storage
      utils.storeCredentialsInLocalStorage({
        pkSign,
        eskSign,
        publicKey,
        secretKey,
        encryptedSecretKey,
        user_vid: response?.vertex?.id,
        uid: phone_number,
      })
      return new Response({ code: response.code, data: response })
    } catch (error) {
      throw error
    }
  }
  
  async createUserNoModifyKey({
    password,
    phone_number,
    verification_code,
    userInfo: name,
    type = 1,
  }: CreateUserArgs): Promise<Response> {
    if (store.getConfig() === null) await store.loadConfig()
    //generate assymetric keyPair for credentials
    const { publicKey, secretKey } = utils.generateAKey()
    //symmetrically encrypt secretKey with password
    const encryptedSecretKey = utils.encryptSecretKeyWithPassword({
      password,
      secretKey,
    })

    //generate keyPair for signature
    const { pkSign, skSign } = utils.generateSignatureKeyPair()

    //symmetrically encrypt skSign with sk from credentials
    const eskSign = utils.sKeyEncrypt(secretKey, skSign)

    const pkSignBase64 = utils.uint8ArrayToBase64(pkSign)
    const eskSignBase64 = utils.uint8ArrayToBase64(eskSign)

    try {
      const { data: response } = await this.vertexServices.createVertex({
        uid: phone_number,
        name: { ...name, pkSign: pkSignBase64, eskSign: eskSignBase64 },
        pk: publicKey,
        type,
        subtype: 2,
        tage: verification_code,
        esk: encryptedSecretKey,
      })
      if (response.error)
        return new Response({ code: response.code, data: response })
      return new Response({ code: response.code, data: response })
    } catch (error) {
      throw error
    }
  }
  /**
   *
   * @param {CreateInvitedUserArgs} args
   *
   * used to register invited user and store the user credentials such jwt, publicKey, secretKey in
   * localStorage
   */
  async createInvitedUser({
    id,
    phone_number,
    password,
    userInfo: name,
  }: CreateInvitedUserArgs): Promise<Response> {
    if (store.getConfig() === null) await store.loadConfig()

    //generate assymetric keyPair
    const { publicKey, secretKey } = utils.generateAKey()
    //symmetrically encrypt secretKey with password
    const encryptedSecretKey = utils.encryptSecretKeyWithPassword({
      password,
      secretKey,
    })
    //generate keyPair for signature
    const { pkSign, skSign } = utils.generateSignatureKeyPair()

    //symmetrically encrypt skSign with sk from credentials
    const eskSign = utils.sKeyEncrypt(secretKey, skSign)

    const pkSignBase64 = utils.uint8ArrayToBase64(pkSign)
    const eskSignBase64 = utils.uint8ArrayToBase64(eskSign)
    try {
      const { data: response } = await this.vertexServices.updateVertex({
        name: { ...name, pkSign: pkSignBase64, eskSign: eskSignBase64 },
        pk: publicKey,
        subtype: 2,
        esk: encryptedSecretKey,
        id,
      })
      if (response.error)
        return new Response({ code: response.code, data: response })
      //store credentials in local storage
      utils.storeCredentialsInLocalStorage({
        pkSign,
        eskSign,
        publicKey,
        secretKey,
        encryptedSecretKey,
        user_vid: response?.vertex?.id,
        uid: phone_number,
      })
      return new Response({ code: response.code, data: response })
    } catch (error) {
      throw error
    }
  }
  async generatorSigForOldAccount({
    id,
    userInfo: name,
    phoneNumber,
    sk,
  }: GeneratorSigForOldAccountArgs): Promise<Response> {
    //generate keyPair for signature
    // const publicKey = base64ToUint8Array(pk)
    // const secretKey = base64ToUint8Array(sk)
    // const encryptedSecretKey = base64ToUint8Array(esk)

    const secretKey = utils.base64ToUint8Array(sk)
    const { pkSign, skSign } = utils.generateSignatureKeyPair()
    //symmetrically encrypt skSign with sk from credentials
    const eskSign = utils.sKeyEncrypt(secretKey, skSign) 
    const pkSignBase64 = utils.uint8ArrayToBase64(pkSign)
    const eskSignBase64 = utils.uint8ArrayToBase64(eskSign)
    const content =
      !name?.phoneNumber && phoneNumber
        ? {
            ...name,
            pkSign: pkSignBase64,
            eskSign: eskSignBase64,
            phoneNumber: phoneNumber,
          }
        : { ...name, pkSign: pkSignBase64, eskSign: eskSignBase64 }

    try {
      const { data: response } = await this.vertexServices.updateVertex({
        name: content,
        id,
      })
      if (response.error)
        return new Response({ code: response.code, data: response })
      //store credentials in local storage
      utils.storeCredentialsInLocalStorage({
        pkSign,
        eskSign,
      })
      return new Response({ code: response.code, data: response })
    } catch (error) {
      throw error
    }
  }
  /**
   *
   * @param {LoginArgs} args
   *
   * the user's credentials found in the locaStorage are used to authenticate the user
   * this sends back a JWT token
   *
   * Logic here is also used for automatic login to replace the jwt when its expired
   *
   */
  async login({ password, autoLogin }: LoginArgs = {}): Promise<Response> {
    if (store.getConfig() === null) await store.loadConfig()
    if (typeof window?.localStorage !== 'undefined') {
      // if(!(localStorage.getItem('sk')&&localStorage.getItem('esk'))){
      //   localStorage.clear();
      //   let [db_noodl,db_data] = [indexedDB.deleteDatabase("noodl"),indexedDB.deleteDatabase("dataIndex")]
      //   window.location.href=location.origin+location.pathname+'?SignIn';
      //   return;
      // }
      const user_id = localStorage.getItem('user_vid')
      if (user_id === null) {
        throw new AitmedError({
          name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
        })
      }
      const userIdToUint8Array = utils.base64ToUint8Array(user_id)
      //TODO eventually a signature parameter will be sent along
      //with the loginUser createEdge request to verify that the sk is valid
      //Check for invalid password or user is not registered
      try {
        const sk = localStorage.getItem('sk')
        let eskSignBase64 = localStorage.getItem('eskSign')
        if (user_id && !eskSignBase64) {
          const { data } = await vertexServices.retrieveVertex({
            idList: [user_id],
            options: {
              jwtNoUse: true
            }
          })

          if (data?.vertex[0]?.name?.eskSign) {
            eskSignBase64 = data?.vertex[0]?.name?.eskSign
          }
        }
        if (password !== undefined && sk === null) {
          try {
            const [isPasswordValid, secretKey] = this.verifyUserPassword({
              password,
            })
            if (isPasswordValid === false) {
              throw new AitmedError({ name: 'PASSWORD_INVALID' })
            } else if (isPasswordValid && secretKey !== null) {
              const { data } = await vertexServices.retrieveVertex({
                idList: [user_id],
              })
              if (
                !data?.vertex[0]?.name?.eskSign ||
                !data?.vertex[0]?.name?.pkSign
              ) {
                //user does not have a signature key pair

                //generate keyPair for signature
                const { pkSign, skSign } = utils.generateSignatureKeyPair()

                //symmetrically encrypt skSign with sk from credentials
                const eskSign = utils.sKeyEncrypt(secretKey, skSign)

                const pkSignBase64 = utils.uint8ArrayToBase64(pkSign)
                eskSignBase64 = utils.uint8ArrayToBase64(eskSign)

                try {
                  await this.vertexServices.updateVertex({
                    id: user_id,
                    name: {
                      ...data?.vertex[0]?.name,
                      pkSign: pkSignBase64,
                      eskSign: eskSignBase64,
                    },
                  })
                  utils.storeCredentialsInLocalStorage({ pkSign, eskSign })
                } catch (error) {
                  log.error(
                    error instanceof Error ? error : new Error(String(error)),
                  )
                }
              } else if (
                data?.vertex[0]?.name?.eskSign &&
                data?.vertex[0]?.name?.pkSign
              ) {
                utils.storeCredentialsInLocalStorage({
                  pkSign: data?.vertex[0]?.name?.pkSign,
                  eskSign: data?.vertex[0]?.name?.eskSign,
                })
              }
              utils.storeCredentialsInLocalStorage({ secretKey })
            }
          } catch (error) {
            throw error
          }
        }
        ////////////////////////////////////////////
        ///////////////////////////////////////////
        const stime = Date.now()
        const bvidB64 = user_id
        const message = `${bvidB64} ${stime}`
        const secretkey = localStorage.getItem('sk')
        const sig = signature({ sk: sk, message, eskSign: eskSignBase64 })
        const eType = autoLogin ? Etypes.autoLogin : Etypes.loginUser
        let resp = {}
        const vcode = await localStorage.getItem('vcode')
        if (vcode) {
          resp = await edgeServices.createEdge({
            type: eType,
            bvid: userIdToUint8Array,
            stime,
            name: {
              sig,
            },
            tage: +vcode
          })
          localStorage.removeItem('vcode')
        } else {
          resp = await edgeServices.createEdge({
            type: eType,
            bvid: userIdToUint8Array,
            stime,
            name: {
              sig,
            }
          })
        }
        //@ts-ignore
        const { code, data } = resp
        const facility_vid = localStorage.getItem('facility_vid')
        if (facility_vid) {
          await edgeServices.createEdge({
            type: 1030,
            bvid: facility_vid,
          })
        }
        return new Response({ code, data })
      } catch (error) {
        await this.simpleLogin()
        // throw error
      }
    }
  }

  async simpleLogin(){
    if (typeof window?.localStorage !== 'undefined') {
      const user_id = localStorage.getItem('user_vid')
      if (user_id === null) {
        throw new AitmedError({
          name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
        })
      }
      const userIdToUint8Array = utils.base64ToUint8Array(user_id)
      try {
        let resp = {}
        const vcode = await localStorage.getItem('vcode')
        if (vcode) {
          resp = await edgeServices.createEdge({
            type: 1030,
            bvid: userIdToUint8Array,
          })
          localStorage.removeItem('vcode')
        } else {
          resp = await edgeServices.createEdge({
            type: 1030,
            bvid: userIdToUint8Array,
          })
        }
        //@ts-ignore
        const { code, data } = resp
        const facility_vid = localStorage.getItem('facility_vid')
        if (facility_vid) {
          await edgeServices.createEdge({
            type: 1030,
            bvid: facility_vid,
          })
        }
        return new Response({ code, data })
      } catch (error) {
        throw error
      }
    }
  }

  /**
   *
   * @param {LoginNewDeviceArgs} args
   *
   * the user's credentials were not found in localStorage so a phone_number and verification_code are required
   */
  async loginNewDevice({
    phone_number,
    verification_code,
  }: LoginNewDeviceArgs): Promise<Response | Status> {
    if (store.getConfig() === null) await store.loadConfig()

    const name = {
      phone_number,
      verification_code,
    }

    let _response
    try {
      _response = await this.edgeServices.createEdge({
        type: Etypes.loginNewDevice,
        name,
      })
    } catch (error) {
      throw error
    }

    const { data } = _response
    const { deat } = data?.edge
    if (deat.pk && deat.esk) {
      //we know the user is registered since they have a publicKey and secretKey pair

      utils.storeCredentialsInLocalStorage({
        encryptedSecretKey: deat.esk,
        publicKey: deat.pk,
        user_vid: deat.user_id,
        uid: phone_number,
      })
      return new Response({ code: 0, data })
    } else if (deat.user_id) {
      utils.storeCredentialsInLocalStorage({
        user_vid: deat.user_id,
        uid: phone_number,
      })
      //user is a temporary status and needs to complete registration.
      return new Status({
        name: 'TEMP_ACCOUNT',
        data: { user_id: deat.user_id },
      })
    } else {
      //user is unregistered
      throw new AitmedError({ name: 'UNREGISTERED' })
    }
  }

  /**
   * logs user out by removing the sk from localStorage and leaving the esk
   */
  logout(): Response {
    if (typeof window?.localStorage !== 'undefined') {
      const sk = localStorage.getItem('sk')
      if (sk !== null) {
        localStorage.removeItem('sk')
        return new Response({ code: 0, message: 'Successfully logged out' })
      }
    }
    return new Response({ code: 0, message: 'Already logged out.' })
  }

  /**
   * clears the user's credentials from local storage. User must sign in
   * using the loginNewDevice method
   */
  logoutClean(): Response {
    try {
      utils.removeCredentialsFromLocalStorage()
      store.cleanConfig()
    } catch (error) {
      throw new AitmedError({ name: 'ERROR_CLEARING_CREDENTIALS' })
    }
    return new Response({
      code: 0,
      message: 'Local credentials were cleared. User logged out.',
    })
  }

  /**
   * Retrieves the users login status
   *
   *  @returns Status
   * Status.code:
   *  0 - LOGGED_IN
   *  1 - LOGGED_OUT
   *  2 - NEW_DEVICE
   *  3 - TEMP_ACCOUNT
   */
  async getStatus(): Promise<Status> {
    if (store.getConfig() === null) await store.loadConfig()

    if (typeof window?.localStorage !== 'undefined') {
      const sk = localStorage.getItem('sk')
      const esk = localStorage.getItem('esk')
      const user_vid = localStorage.getItem('user_vid')

      const userIsLoggedIn = sk !== null
      const userIsLoggedOut = sk === null
      const userIsLoggingIntoANewDevice =
        esk === null && sk === null && user_vid === null
      const userHasATemporaryAccount =
        esk === null && sk === null && user_vid !== null
      let status

      if (userIsLoggedIn) {
        status = new Status({
          name: 'LOGGED_IN',
          data: { user_id: user_vid },
        })
      } else if (userIsLoggingIntoANewDevice) {
        status = new Status({ name: 'NEW_DEVICE' })
      } else if (userHasATemporaryAccount) {
        status = new Status({
          name: 'TEMP_ACCOUNT',
          data: { user_id: user_vid },
        })
      } else if (userIsLoggedOut) {
        status = new Status({ name: 'LOGGED_OUT' })
      }
      return status
    }
  }

  /**
   *
   * @param {ChangePasswordWithOldPasswordArgs} args
   *
   * change the users password by providing the old and new password.
   * User must be in loggedIn(status 0) or loggedOut(status 1) to be able to
   * use this method.
   */
  async changePasswordWithOldPassword({
    oldPassword,
    newPassword,
  }: ChangePasswordWithOldPasswordArgs): Promise<Response> {
    const { code: statusCode } = await this.getStatus()
    if (statusCode === 2) {
      throw new AitmedError({
        name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
        message: 'Local credentials were not found. Please login.',
      })
    }
    const pk = localStorage.getItem('pk')
    const userIdBase64 = localStorage.getItem('user_vid')
    if (userIdBase64 === null || pk === null) {
      throw new AitmedError({
        name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
        message:
          'User id or pk were not found in localStorage. Login as new device is required.',
      })
    }

    let isOldPasswordValid, sk
    try {
      ;[isOldPasswordValid, sk] = this.verifyUserPassword({
        password: oldPassword,
      })
      if (!isOldPasswordValid) {
        throw new AitmedError({ name: 'PASSWORD_INVALID' })
      }
    } catch (error) {
      throw error
    }

    const response = await this.updatePassword({
      password: newPassword,
      userId: userIdBase64,
      pk,
      sk,
    })
    return response
  }

  /**
   *
   * @param {ChangePasswordWithVerificationCode} args
   *
   * change the users password by providing the old and new password.
   * User must be in loggedIn(status 0) or loggedOut(status 1) to be able to
   * use this method.
   */
  async changePasswordWithVerificationCode({
    password,
  }: ChangePasswordWithVerificationCode): Promise<Response> {
    const { code: statusCode } = await this.getStatus()
    if (statusCode === 2) {
      throw new AitmedError({
        name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
        message: 'Local credentials were not found. Please login.',
      })
    }
    if (typeof window?.localStorage !== 'undefined') {
      const pk = localStorage.getItem('pk')
      const userIdBase64 = localStorage.getItem('user_vid')
      const sk = localStorage.getItem('sk')
      if (userIdBase64 === null || pk === null || sk === null) {
        throw new AitmedError({
          name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
          message:
            'User id or pk or sk were not found in localStorage. Login as new device is required.',
        })
      }

      const response = await this.updatePassword({
        password,
        userId: userIdBase64,
        pk,
        sk,
      })
      return response
    }
  }

  /**
   *
   * @param {VerifyUserPasswordArgs} args.password
   * @returns Array<[boolean, null | Uint8Array]>
   *
   * used to verify the user's password
   *
   * returns [true, sk:Uint8Array] if password is valid
   *
   */
  verifyUserPassword({
    password,
  }: VerifyUserPasswordArgs): [boolean, null | Uint8Array] {
    const passwordTo32BitArray = utils.normalizeStringTo32BitArray(password)
    const eskBase64 = localStorage.getItem('esk')
    const pkBase64 = localStorage.getItem('pk')
    let sk
    let isSkValid
    if (eskBase64 && pkBase64) {
      const pkUint8Array = utils.base64ToUint8Array(pkBase64)
      const eskUint8Array = utils.base64ToUint8Array(eskBase64)
      sk = utils.sKeyDecrypt(passwordTo32BitArray, eskUint8Array)
      if (sk === null) {
        return [false, null]
      }
      isSkValid = utils.aKeyCheck(pkUint8Array, sk)
    } else {
      throw new AitmedError({
        name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
      })
    }
    if (isSkValid) {
      return [true, sk]
    }
    return [false, null]
  }

  async updatePassword({
    password,
    userId,
    pk,
    sk,
  }: {
    password: string
    userId: string | Uint8Array
    pk: string | Uint8Array
    sk: string | Uint8Array
  }): Promise<Response> {
    try {
      const vidUint8Array =
        typeof userId === 'string' ? utils.base64ToUint8Array(userId) : userId
      const pkUint8Array =
        typeof pk === 'string' ? utils.base64ToUint8Array(pk) : pk
      const skUint8Array =
        typeof sk === 'string' ? utils.base64ToUint8Array(sk) : sk
      const newESK = utils.encryptSecretKeyWithPassword({
        secretKey: skUint8Array,
        password,
      })
      await this.vertexServices.updateVertex({
        id: vidUint8Array,
        esk: newESK,
        pk: pkUint8Array,
      })
      utils.storeCredentialsInLocalStorage({ encryptedSecretKey: newESK })
      return new Response({ code: 0 })
    } catch (error) {
      throw error
    }
  }
}

let calls = 0
let timeoutRef: NodeJS.Timeout | null = null
function automaticLoginWrapper() {
  return async function() {
    if (calls > 2) {
      calls = 0
      Account.prototype.logoutClean()
      timeoutRef && clearTimeout(timeoutRef)
      window['app'].root.Global.currentUser.vertex.sk = ''
      window['app'].root.Global.currentUser.vertex.esk = ''
      window.location.href=location.origin+location.pathname+'?SignIn'
      throw new AitmedError({ name: 'LOGIN_REQUIRED' })
    }else {
      try {
        calls++
        const sk = localStorage.getItem('sk')
        if(sk){
          await Account.prototype.login({ autoLogin: true })
        }else{
          calls = 2
          return
        }
        timeoutRef && clearTimeout(timeoutRef)
        timeoutRef = setTimeout(() => {
          calls = 0
        }, 3600000)
      } catch (error) {
        if (error instanceof Error) throw error
        throw new Error(String(error))
      }
    }
  }
}
const automaticLogin = automaticLoginWrapper()
export { automaticLogin }
