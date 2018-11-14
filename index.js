// Run this server with "node app.js"
const http = require("http")
const fs = require("fs")

const hostName = "localhost"
const port = process.env.PORT || 3000

const respond = (res, content, contentType = "text/plain", statusCode = 200) => {
  res.statusCode = statusCode
  res.setHeader("Content-Type", contentType)
  res.end(content)
}

const home = (_req, res) => {
  fs.readdir(__dirname + "/photos", (err, items) => {
    const styles = `
      <style>
        img { width: 96%; padding: 2%; }
      </style>
    `
    const photos = items
      .filter(filename => filename[0] !== ".")
      .map(filename => `<img src="/photos/${filename}" /><br/>`)

    respond(res, styles + photos.join("\n"), "text/html")
  })
}

const photo = url => {
  return (_req, res) => {
    const path = __dirname + url
    fs.readFile(path, (err, contents) => {
      if (err) {
        console.log("photo read error!", err)
        respond(res, "Can't read photo", "text/plain", 500)
      } else {
        respond(res, contents, "image/jpeg")
      }
    })
  }
}

const fourohfour = (_req, res) => {
  respond(res, "404: Not Found", "text/plain", 404)
}

const findHandler = url => {
  if (url === "/") return home
  if (url.startsWith("/photos/")) return photo(url)
  return fourohfour
}

const server = http.createServer((req, res) => {
  findHandler(req.url)(req, res)
})
server.listen(port)
