// цей файл потрібно буде дописати...

// не звертайте увагу на цю функцію
// вона потрібна для того, щоб коректно зчитувати вхідні данні
function readHttpLikeInput() {
  var fs = require("fs");
  var res = "";
  var buffer = Buffer.alloc ? Buffer.alloc(1) : new Buffer(1);
  let was10 = 0;
  for (;;) {
    try {
      fs.readSync(0 /*stdin fd*/, buffer, 0, 1);
    } catch (e) {
      break; /* windows */
    }
    if (buffer[0] === 10 || buffer[0] === 13) {
      if (was10 > 10) break;
      was10++;
    } else was10 = 0;
    res += new String(buffer);
  }

  return res;
}

let contents = readHttpLikeInput();

function outputHttpResponse(statusCode, statusMessage, headers, body) {
  console.log(`HTTP 1.1 ${statusCode}: ${statusMessage}`);

  for (header in headers) {
    console.log(`${header}: ${headers[header]}`);
  }

  console.log("");
  console.log(body);
}

function processHttpRequest($method, $uri, $headers, $body) {
  let statusCode = "";
  let statusMessage = "";
  let headers = {};

  if ($method === "GET" && $uri.includes("sum?nums")) {
    statusCode = "200";
    statusMessage = "OK";
    headers = {
      Date: new Date().toUTCString(),
      Server: "Apache/2.2.14 (Win32)",
      "Content-Length": Buffer.byteLength($body, "utf8"),
      Connection: "Closed",
      "Content-Type": "text/html; charset=utf-8",
      sum: $uri
        .split("=")[1]
        .split(",")
        .reduce((acc, current) => Number(acc) + Number(current), 0),
    };
  } else if ($method === "POST") {
    const dataBase = require("fs")
      .readFileSync("passwords.txt", "utf-8")
      .split("\n")
      .map((str) => str.replace(/\r/g, ""));
    const logins = dataBase.map((str) => str.split(":")[0]);

    const credentials = $body.split("&");
    const login = credentials[0].split("=")[1];
    const password = credentials[1].split("=")[1];

    if (logins.includes(login)) {
      const checkedLogin = dataBase
        .find((item) => item.includes(login))
        .split(":")[0];
      const checkedPassword = dataBase
        .find((item) => item.includes(login))
        .split(":")[1];

      if (
        checkedLogin === login &&
        checkedPassword.trim() === password.trim()
      ) {
        statusCode = 200;
        statusMessage = "OK";
        $body = '<h1 style=color:green">FOUND</h1>';
      } else if (!dataBase) {
        statusCode = 500;
        statusMessage = "Internal Server Error";
        $body = "";
      } else {
        statusCode = 401;
        statusMessage = "Unauthorized";
        $body = "";
      }
      headers = "";
    }
  } else {
    if (!$uri.includes("nums") || $method !== "GET") {
      statusCode = "400";
      statusMessage = "Bad Request";
    } else {
      statusCode = "404";
      statusMessage = "Not Found";
    }

    headers = {
      Date: new Date().toUTCString,
      Server: "Apache/2.2.14 (Win32)",
      "Content-Length": Buffer.byteLength(body, "utf8"),
      Connection: "Closed",
      "Content-Type": "text/html; charset=utf-8",
      sum: "not found",
    };
  }

  outputHttpResponse(statusCode, statusMessage, headers, $body);
}

function parseTcpStringAsHttpRequest(string) {
  const httpData = string.split("\n").filter((item) => item !== "");
  const methodAndURIRow = httpData.shift().split(" ");

  const bodyData = httpData.at(-1);
  httpData.pop();

  const headersData = {};
  for (let dataRow of httpData) {
    const dataInArray = dataRow.split(":");
    headersData[dataInArray[0]] = dataInArray[1];
  }
  return {
    method: methodAndURIRow[0],
    uri: methodAndURIRow[1],
    headers: headersData,
    body: bodyData,
  };
}

http = parseTcpStringAsHttpRequest(contents);
processHttpRequest(http.method, http.uri, http.headers, http.body);
