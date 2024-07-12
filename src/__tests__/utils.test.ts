import utils from '../utils'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

describe('Util Methods', () => {
  describe('objectToBase64', () => {
    it('Should convert an object into a base64 string', () => {
      const result = utils.objectToBase64({ movie: 'bambi' })
      expect(result).to.be.a('String')
    })
  })
  describe('uTF8ToBase64', () => {
    it('Should convert a utf8 string into a base64 string', () => {
      const result = utils.uTF8ToBase64('toy story')
      expect(utils.base64ToUint8Array.bind(utils, result)).to.not.throw(
        'invalid encoding',
      )
      expect(result).to.be.a('string')
    })
  })

  describe('base64ToUTF8', () => {
    it('Should convert a base64 string into a utf8 string', () => {
      const result = utils.base64ToUTF8('toy story')
      expect(result).to.be.a('string')
    })
  })

  describe('storeCredentialsInLocalStorage', () => {
    it('Should correctly store the given credentials to localStorage.', () => {
      utils.storeCredentialsInLocalStorage({
        secretKey: new Uint8Array([1, 3, 4]),
        publicKey: new Uint8Array([5, 6, 7]),
        encryptedSecretKey: new Uint8Array([8, 9, 10]),
        jwt: '1121212',
        user_vid: '768678',
        uid: '1213',
      })
      const sk = localStorage.getItem('sk')
      const pk = localStorage.getItem('pk')
      const esk = localStorage.getItem('esk')
      const jwt = localStorage.getItem('jwt')
      const user_vid = localStorage.getItem('user_vid')
      const uid = localStorage.getItem('uid')

      expect(sk).not.to.be.null
      expect(pk).not.to.be.null
      expect(esk).not.to.be.null
      expect(jwt).not.to.be.null
      expect(user_vid).not.to.be.null
      expect(uid).not.to.be.null
    })
  })

  describe('uint8ArrayToBase64', () => {
    it('Should convert uint8Array to a base64 string.', () => {
      const result = utils.uint8ArrayToBase64(new Uint8Array([1, 2, 3, 4, 5]))
      expect(utils.base64ToUint8Array.bind(utils, result)).to.not.throw(
        'invalid encoding',
      )
      expect(result).to.be.a('string')
    })
  })
  describe('base64ToUint8Array', () => {
    it('Should convert a base64 string to a uint8array.', () => {
      const base64String = utils.uTF8ToBase64('Hello there')
      const result = utils.base64ToUint8Array(base64String)
      expect(result).to.be.a('Uint8Array')
      expect(result).not.to.be.a('string')
    })
  })

  describe('uTF8ToUint8Array', () => {
    it('Should convert a utf8 string to uint8array', () => {
      const result = utils.uTF8ToUint8Array('hello there')
      expect(result).to.be.a('Uint8Array')
    })
  })

  describe('uint8ArrayToUTF8', () => {
    it('Should convert a uint8array to a utf8 string', () => {
      const uTF8ToUint8Array = utils.uTF8ToUint8Array('hello there')
      const result = utils.uint8ArrayToUTF8(uTF8ToUint8Array)
      expect(result).to.be.a('string')
    })
  })

  describe('removeCredentialsFromLocalStorage', () => {
    it('Should remove the user credentials from localStorage', () => {
      utils.storeCredentialsInLocalStorage({
        secretKey: new Uint8Array([1, 3, 4]),
        publicKey: new Uint8Array([5, 6, 7]),
        encryptedSecretKey: new Uint8Array([8, 9, 10]),
        jwt: '1121212',
        user_vid: '768678',
        uid: '1213',
      })
      utils.removeCredentialsFromLocalStorage()
      const sk = localStorage.getItem('sk')
      const pk = localStorage.getItem('pk')
      const esk = localStorage.getItem('esk')
      const jwt = localStorage.getItem('jwt')
      const user_vid = localStorage.getItem('user_vid')
      const uid = localStorage.getItem('uid')

      expect(sk).to.be.null
      expect(pk).to.be.null
      expect(esk).to.be.null
      expect(jwt).to.be.null
      expect(user_vid).to.be.null
      expect(uid).to.be.null
    })
  })
})
