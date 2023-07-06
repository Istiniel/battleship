import * as fs from 'node:fs'
import * as path from 'node:path'
import * as http from 'http'

export const httpServer = http.createServer(function (req, res) {
  const dirname = path.resolve(path.dirname(''))
  const filePath = path.resolve(
    dirname,
    req.url === '/' ? 'front/index.html' : `front${req.url ?? ''}`,
  )

  fs.readFile(filePath, function (err, data) {
    if (err !== undefined && err !== null) {
      res.writeHead(404)
      res.end(JSON.stringify(err))
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  })
})
