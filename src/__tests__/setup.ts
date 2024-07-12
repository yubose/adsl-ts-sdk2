import 'mock-local-storage'
import { JSDOM } from 'jsdom'
import pb from 'pretty-bytes'

const { window } = new JSDOM('<html><body></body></html>', {
  beforeParse(win) {
    global.document = win.document
    global.window = win as any
  },
  resources: 'usable',
  runScripts: 'dangerously',
  url: `http://127.0.0.1:3000`,
})

before(() => {
  process.stdout.write('\x1Bc')
})

afterEach(() => {
  window.document.head.innerText = ''
  window.document.body.innerText = ''
  document.head.innerText = ''
  document.body.innerText = ''
})

after(() => {
  const memUsage = process.memoryUsage()
  console.log({
    heapUsed: pb(memUsage.heapUsed),
    heapTotal: pb(memUsage.heapTotal),
  })
})
