import { Codes, defaultMessages } from '../codes/error'
import { AitmedErrorArgs } from './types'

export default class AitmedError extends Error {
  readonly code: number
  readonly name: string
  readonly message: any
  readonly source: string
  constructor({ code, message, source, name }: AitmedErrorArgs) {
    super()
    if (code === undefined && name) {
      this.code = Codes[name] === undefined ? -1 : Codes[name]
      this.name = name
      this.message = message === undefined ? defaultMessages[name] : message
    } else if (name === undefined && code) {
      this.name = Codes[code] === undefined ? 'UNKNOWN_ERROR' : Codes[code]
      this.code = code
      this.message = message === undefined ? defaultMessages[code] : message
    } else {
      this.code = -1
      this.name = 'UNKNOWN_ERROR'
    }
    if (source === undefined) {
      this.source = 'lvl-2'
    } else {
      this.source = source
    }
  }

  getCode() {
    return this.code
  }
}
export const translateErrorCode = (code: number): number => {
  switch (code) {
    //common - 2000
    case 10:
      return 2001
    case 20:
      return 2002
    case 110:
      return 2003
    case 111:
      return 2004
    case 113:
      return 2006
    case 114:
      return 2007
    case 120:
      return 2008
    case 200:
      return 2009
    case 201:
      return 2010
    case 202:
      return 2011
    case 205:
      return 2012
    case 210:
      return 2013
    case 240:
      return 2014
    case 300:
      return 2015
    case 310:
      return 2016
    case 400:
      return 2017
    // Vertex
    case 1060:
      return 3000
    case 1000:
      return 3001
    case 1072:
      return 3003
    case 1010:
      return 3004
    case 1030:
      return 3005
    case 1040:
      return 3006
    case 1050:
      return 3007
    case 1070:
      return 3008
    case 1071:
      return 3009
    case 2010:
      return 3010
    case 2072:
      return 3011
    // Edge
    case 3060:
      return 4000
    case 3070:
      return 4001
    case 3000:
      return 4002
    case 3001:
      return 4003
    case 3010:
      return 4004
    //Document
    case 2060:
      return 5000
    case 2070:
      return 5001
    case 2000:
      return 5002
    default:
      return code
  }
}
