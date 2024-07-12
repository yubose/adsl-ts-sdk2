import cryptoFunc from '../utils'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { verify } from 'tweetnacl'

chai.use(chaiAsPromised)

let crypto: any
beforeEach(() => {
  crypto = cryptoFunc
})

describe('Encryption/Decryption Methods', () => {
  describe('generateAKey', () => {
    it('Should correctly generate a keyPair for assymetric encryption', () => {
      const keyPair = crypto.generateAKey()
      expect(keyPair).to.be.a('object')
      expect(keyPair.publicKey).to.be.a('Uint8Array')
      expect(keyPair.publicKey.length).to.be.equal(32)
      expect(keyPair.secretKey).to.be.a('Uint8Array')
      expect(keyPair.secretKey.length).to.be.equal(32)
    })
  })
  describe('aKeyCheck', () => {
    it('Should correctly validate that the given keyPair is valid for assymetric encryption', () => {
      const keyPair = crypto.generateAKey()
      const isKeyPairValid = crypto.aKeyCheck(
        keyPair.publicKey,
        keyPair.secretKey,
      )
      expect(isKeyPairValid).to.be.true
    })
    it('Should correctly validate that the given keyPair is invalid for assymetric encryption', () => {
      const keyPair = crypto.generateAKey()
      const keyPair_2 = crypto.generateAKey()
      const isKeyPairValid = crypto.aKeyCheck(
        keyPair.publicKey,
        keyPair_2.secretKey,
      )
      expect(isKeyPairValid).to.be.false
    })
  })
  describe('assymetrical Key Ecryption Decrypt', () => {
    it('Should correctly decrypt the given data using the given publicKey of a valid KeyPair', () => {
      const keyPairA = crypto.generateAKey()
      const keyPairB = crypto.generateAKey()
      const data = 'hello world'
      const encryptedData = crypto.aKeyEncrypt_str(
        keyPairB.publicKey,
        keyPairA.secretKey,
        data,
      )
      const decryptedData = crypto.aKeyDecrypt_str(
        keyPairA.publicKey,
        keyPairB.secretKey,
        encryptedData,
      )
      expect(decryptedData).to.be.equal(data)
    })
  })
  describe('generateSKey', () => {
    it('Should correctly generate a secretKey for symmetrical encryption', () => {
      const secretKey = crypto.generateSKey()
      expect(secretKey).to.be.a('Uint8Array')
    })
  })
  describe('sKeyEncrypt', () => {
    it('Should correctly ecrypt the given data with the given secretKey', () => {
      const secretKey = crypto.generateSKey()
      const data = crypto.uTF8ToUint8Array('hello world')
      const encryptedData = crypto.sKeyEncrypt(secretKey, data)
      expect(encryptedData).to.be.a('Uint8Array')
    })
  })
  describe('sKeyDecrypt', () => {
    it('Should correctly decrypt the data given the secretKey that it was encrypted with', () => {
      const secretKey = crypto.generateSKey()
      const data = crypto.uTF8ToUint8Array('hello world')
      const encryptedData = crypto.sKeyEncrypt(secretKey, data)
      const decryptedData = crypto.sKeyDecrypt(secretKey, encryptedData)
      expect(verify(decryptedData, data)).to.be.true
    })
  })
})
