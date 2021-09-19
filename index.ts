const express = require("express");
const app = express();
import { Ping } from "./controllers/PingMessage";
import { uploadProto } from "./controllers/uploadProto";
import multer from "multer";
import { CodeGenerator } from "./controllers/CodeGenerator";
import { Request, Response } from "express";
import {
  serverStreamComms,
  clientStreamComms,
  bidirStreamComms,
} from "./code_generator_template/unaryDemo";
import ws from "ws";
import WebSocket from "ws";
const port = 8080; // default port to listen
// define a route handler for the default home page
//  Allow body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/proto");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      "recieved_" + Math.round(Math.random() * 1e9) + ".proto";
    cb(null, uniqueSuffix);
  },
});
const upload = multer({
  dest: "proto/",
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/octet-stream") {
      cb(null, false);
      return;
    }
    console.log("Hello");
    cb(null, true);
  },
});

app.get("/", Ping);
app.post("/grpc/upload", upload.single("proto_file"), uploadProto);
app.post("/grpc/client_gen", CodeGenerator);

const wss = new ws.Server({ host: "localhost", port: 8000 });
let wsClient: any;
wss.on("connection", (ws) => {
  console.log("A new Client connected");
  wsClient = ws;
});
app.get("/test/unary", (req: Request, res: Response) => {
  const { query } = req;
  const func = require(`./generated_clients/${query.func}`);
  func(req, res);
});

app.post("/test/serverstream", (req: Request, res: Response) => {
  serverStreamComms(req, res, wsClient);
});

app.get("/test/clientstream", (req: Request, res: Response) => {
  clientStreamComms(req, res, wsClient);
});

app.get("/test/bidirstream", (req: Request, res: Response) => {
  bidirStreamComms(req, res, wsClient);
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
