import { StreamNormalMessage } from "../proto/recieved_pb";
import { Request, Response } from "express";
import { credentials } from "grpc";
import { ChatServiceClient } from "../proto/recieved_grpc_pb";
import ws from "ws";

// export const serverStreamComms = (
//   req: Request,
//   res: Response,
//   wsc: ws
// ): any => {
//   if (wsc.OPEN === 1) {
//     const request = new StreamNormalMessage();
//     const recieved = req.body;
//     // console.log(recieved);
//     request.setBody(recieved.body);
//     request.setLanguage(recieved.language);
//     // read message sent to server

//     const port = 7899;
//     const uri = `localhost:${port}`;
//     const client = new ChatServiceClient(uri, credentials.createInsecure());
//     const stream = client.serverStreamComms(request);
//     stream.on("err", (err) => console.log(err));
//     stream.on("data", (d) => {
//       wsc.send(d.toString());
//     });
//     stream.on("end", () => {
//       res.json({ msg: "stream closed" });
//     });
//   }
// };

export const clientStreamComms = async (
  req: Request,
  res: Response,
  wsc: ws
) => {
  if (wsc.OPEN === 1) {
    const port = 7899;
    const uri = `localhost:${port}`;
    const client = new ChatServiceClient(uri, credentials.createInsecure());
    // Send Server response as json
    const stream = client.clientStreamComms((error, data) => {
      res.json(data.toObject());
    });
    // send websocket data to server
    wsc.on("message", (msg: string) => {
      let recieved = JSON.parse(msg);
      let request = new StreamNormalMessage();
      request.setBody(recieved.body);
      request.setLanguage(recieved.language);
      stream.write(request);
      wsc.send("ACK from server socket");
    });

    setTimeout(() => {
      stream.end();
      res.json({ msg: "Stream Closed" });
    }, 5000);
  }
};

// export const bidirStreamComms = async (
//   req: Request,
//   res: Response,
//   wsc: ws
// ) => {
//   if (wsc.OPEN === 1) {
//     const port = 7899;
//     const uri = `localhost:${port}`;
//     const client = new ChatServiceClient(uri, credentials.createInsecure());
//     const stream = client.biDirectionStreamComms();

//     // send data through ws
//     wsc.on("message", (msg: string) => {
//       let recieved = JSON.parse(msg);
//       let request = new StreamNormalMessage();
//       request.setBodyList(recieved.body);
//       request.setLanguage(recieved.language);
//       stream.write(request);
//       wsc.send("ACK from server socket");
//     });

//     // get data through ws
//     stream.on("data", (d) => {
//       wsc.send(d.toString());
//     });
//     setTimeout(() => {
//       stream.end();
//       res.json({ msg: "Stream Closed" });
//     }, 5000);
//   }
// };
