import { sha256 } from 'hash.js'
import {
  Edge as SDKEdge,
  Vertex as SDKVertex,
  Doc as SDKDoc,
} from '../../common/types'

import {
  Edge as gRPCEdge,
  Vertex as gRPCVertex,
  Doc as gRPCDoc,
} from '@aitmed/protorepo/js/ecos/v1beta1/types_pb'

import utils, { jsonEscape } from '../../utils'
import AitmedError from '../../common/Error'
import deleteRequest from './deleteRequest'
export {
  toSDKVertex,
  toSDKEdge,
  toSDKDoc,
  generateEsak,
  encryptData,
  decryptData,
  deleteRequest,
  decryptDoc,
  encryptDoc
}

function toSDKVertex(vertex: gRPCVertex): SDKVertex {
  let res = new SDKVertex()
  res.id = vertex.getId()
  res.mtime = vertex.getMtime()
  res.ctime = vertex.getCtime()
  res.atime = vertex.getAtime()
  res.atimes = vertex.getAtimes()
  res.type = vertex.getType()
  res.subtype = vertex.getSubtype()
  const name = vertex.getName()
  if (name === '') {
    res.name = null
  } else {
    try {
      res.name = JSON.parse(jsonEscape(name))
    } catch (error) {
      new AitmedError({ name: 'JSON_PARSE_FAILED', message: name })
    }
  }
  res.esk = vertex.getEsk()
  res.pk = vertex.getPk()
  res.uid = vertex.getUid()
  const deat = vertex.getDeat()
  if (deat === '') {
    res.deat = null
  } else {
    try {
      res.deat = JSON.parse(deat)
    } catch (error) {
      new AitmedError({ name: 'JSON_PARSE_FAILED', message: deat })
    }
  }
  res.tage = vertex.getTage()
  return res
}

function toSDKEdge(edge: gRPCEdge): SDKEdge {
  let res = new SDKEdge()
  res.eid = edge.getId()
  res.bvid = edge.getBvid()
  res.type = edge.getType()
  res.tage = edge.getTage()

  const name = edge.getName()
  if (name === '') {
    res.name = ''
  } else {
    try {
      res.name = JSON.parse(jsonEscape(name))
    } catch (error) {
      throw new AitmedError({ name: 'JSON_PARSE_FAILED', message: name })
    }
  }
  res.evid = edge.getEvid()
  res.subtype = edge.getSubtype()
  res.etime = edge.getEtime()
  res.mtime = edge.getMtime()
  res.atime = edge.getAtime()
  res.stime = edge.getStime()
  res.atimes = edge.getAtimes()
  res.refid = edge.getRefid()
  res.besak = edge.getBesak()
  res.eesak = edge.getEesak()
  res.ctime = edge.getCtime()
  res.sig = edge.getSig()
  const deat = edge.getDeat()
  if (deat === '') {
    res.deat = null
  } else {
    try {
      res.deat = JSON.parse(deat)
    } catch (error) {
      throw new AitmedError({ name: 'JSON_PARSE_FAILED', message: deat })
    }
  }
  return res
}

function toSDKDoc(doc: gRPCDoc): SDKDoc {
  const res = new SDKDoc()
  res.id = doc.getId()
  res.ctime = doc.getCtime()
  res.mtime = doc.getMtime()
  res.atime = doc.getAtime()
  res.atimes = doc.getAtimes()
  res.tage = doc.getTage()
  res.type = doc.getType()
  res.subtype = doc.getSubtype()
  const name = doc.getName()
  if (name === '') {
    res.name = null
  } else {
    try {
      res.name = JSON.parse(jsonEscape(name))
    } catch (error) {
      throw new AitmedError({ name: 'JSON_PARSE_FAILED', message: name })
    }
  }
  const deat = doc.getDeat()
  if (deat === '') {
    res.deat = null
  } else {
    try {
      res.deat = JSON.parse(deat)
    } catch (error) {
      throw new AitmedError({ name: 'JSON_PARSE_FAILED', message: deat })
    }
  }
  res.size = doc.getSize()
  res.fid = doc.getFid()
  res.eid = doc.getEid()
  res.bsig = doc.getBsig()
  res.esig = doc.getEsig()
  res.reid = doc.getEsig()
  return res
}

/**
 * creates esak for an edge(either besak || eesak)
 */
function generateEsak(publicKey): Uint8Array {
  if (typeof window?.localStorage !== 'undefined') {
    const secretKey = localStorage.getItem('facility_sk')?localStorage.getItem('facility_sk'):localStorage.getItem('sk')
    if (publicKey === null) {
      throw new AitmedError({
        name: 'ERROR_CREATING_ESAK',
      })
    }
    if (secretKey === null) {
      throw new AitmedError({
        name: 'LOGIN_REQUIRED',
        message:
          'There is no secretKey present in localStorage. Please log In.',
      })
    }

    let pkToUint8Array
    if (typeof publicKey === 'string') {
      pkToUint8Array = utils.base64ToUint8Array(publicKey)
    } else {
      pkToUint8Array = publicKey
    }
    const skToUint8Array = utils.base64ToUint8Array(secretKey)
    const symmetricKey = utils.generateSKey()
    const partialKey = symmetricKey.slice(0, 16)

    const esak = utils.aKeyEncrypt(pkToUint8Array, skToUint8Array, partialKey)
    return esak
  }
}

//TODO change when a receiver is added
//currently both sk and pk belong to the current logged in user
async function encryptData(
  esak: Uint8Array | string,
  publicKey: string,
  data: Uint8Array,
): Promise<Uint8Array> {
  if (typeof window?.localStorage !== 'undefined') {
    const secretKey = localStorage.getItem('facility_sk')?localStorage.getItem('facility_sk'):localStorage.getItem('sk')
    if (publicKey === null) {
      throw new AitmedError({
        name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
        message:
          'There is no publicKey present in localStorage. Please log In.',
      })
    }

    if (secretKey === null) {
      throw new AitmedError({
        name: 'LOGIN_REQUIRED',
        message:
          'There is no secretKey present in localStorage. Please log In.',
      })
    }
    let esakUint8Array: Uint8Array
    if (typeof esak === 'string') {
      esakUint8Array = utils.base64ToUint8Array(esak)
    } else {
      esakUint8Array = esak
    }

    const pkToUint8Array = utils.base64ToUint8Array(publicKey)
    const skToUint8Array = utils.base64ToUint8Array(secretKey)
    const partialKey = utils.aKeyDecrypt(
      pkToUint8Array,
      skToUint8Array,
      esakUint8Array,
    )

    const sak = sha256()
      .update(partialKey)
      .digest()
    const sakUint8Array = new Uint8Array(sak)
    const encryptedData = utils.sKeyEncrypt(sakUint8Array, data)

    return encryptedData
  }
}
async function encryptDoc(halfKey: Uint8Array | string,
  data: Uint8Array,):Promise<Uint8Array>{
  const sak = sha256()
      .update(halfKey)
      .digest()
    const sakUint8Array = new Uint8Array(sak)  
    const encryptedData = utils.sKeyEncrypt(sakUint8Array, data)
    return encryptedData
}
//TODO change when a receiver is added
//currently both sk and pk belong to the current logged in user
function decryptData(
  esak: Uint8Array | string,
  publicKey: string,
  data: Uint8Array,
): Uint8Array {
  if (typeof window?.localStorage !== 'undefined') {
    const secretKey = localStorage.getItem('facility_sk')?localStorage.getItem('facility_sk'):localStorage.getItem('sk')
    if (publicKey === null) {
      throw new AitmedError({
        name: 'REQUIRED_PHONE_NUMBER_AND_VERIFICATION_CODE',
        message:
          'There is no publicKey present in localStorage. Please log In.',
      })
    }
    if (secretKey === null) {
      throw new AitmedError({
        name: 'LOGIN_REQUIRED',
        message:
          'There is no secretKey present in localStorage. Please log In.',
      })
    }
    let esakUint8Array: Uint8Array
    if (typeof esak === 'string') {
      esakUint8Array = utils.base64ToUint8Array(esak)
    } else {
      esakUint8Array = esak
    }
    const pkToUint8Array = utils.base64ToUint8Array(publicKey)
    const skToUint8Array = utils.base64ToUint8Array(secretKey)
    const partialKey = utils.aKeyDecrypt(
      pkToUint8Array,
      skToUint8Array,
      esakUint8Array,
    )
    const sak = sha256()
      .update(partialKey)
      .digest()
    const sakUint8Array = new Uint8Array(sak)
    const decryptedDataUint8Array = utils.sKeyDecrypt(sakUint8Array, data)
    if (decryptedDataUint8Array !== null) {
      return decryptedDataUint8Array
    } else {
      throw new AitmedError({ name: 'ERROR_DECRYPTING_DATA' })
    }
  }
}

function decryptDoc( halfkey: Uint8Array | string, data: Uint8Array, ):Uint8Array {
  const sak = sha256().update(halfkey).digest()
  const sakUint8Array = new Uint8Array(sak)
  const decryptedDataUint8Array = utils.sKeyDecrypt(sakUint8Array, data)
  if (decryptedDataUint8Array !== null) {       
    return decryptedDataUint8Array
  } else {
    console.error('lvl2 error: decrypt failed');
    // throw new AitmedError({ name: 'ERROR_DECRYPTING_DATA' })
    return null
  }
}