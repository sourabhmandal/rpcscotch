import { capitalizeFirstLetter } from "../utils";
import fs from "fs";

interface IClientStreamRpcTemplate {
  rpcName: string;
  clientMessageType: string;
  requestBody: any;
  uri: string;
  serviceName: string;
  socketKeepAliveTime: number;
}

const template = (populate: IClientStreamRpcTemplate): string => {
  let request_code = "";
  let funcName = `streamServer${capitalizeFirstLetter(populate.rpcName)}`;
  Object.keys(populate.requestBody).map((key: string, idx: number) => {
    let keyCaptitalised = capitalizeFirstLetter(key);
    request_code += `request.set${keyCaptitalised}(recieved.${key});\n\t\t`;
    request_code += "\t\t";
  });

  return `
  import { ${populate.clientMessageType} } from "../proto/recieved_pb";
  import { Request, Response } from "express";
  import { credentials } from "grpc";
  import { ${populate.serviceName}Client } from "../proto/recieved_grpc_pb";
  import ws from "ws";
  
  const ${funcName} = (req: Request, res: Response, wsc: ws): any => {
    if (wsc.OPEN === 1) {
      const client = new ${populate.serviceName}Client("${populate.uri}", credentials.createInsecure());
      // Send Server response as json
      const stream = client.${populate.rpcName}((error, data) => {
        res.json(data.toObject());
      });
      // send websocket data to server
      wsc.on("message", (msg: string) => {
        let recieved = JSON.parse(msg);
        let request = new ${populate.clientMessageType}();
        ${request_code}
        stream.write(request);
        wsc.send("ACK");
      });
  
      setTimeout(() => {
        stream.end();
        if (wsc.CLOSED) wsc.close();
      }, ${populate.socketKeepAliveTime});
    }
  };
  module.exports = ${funcName};
`;
};

export function generateClientStreamFunction(rpc: IClientStreamRpcTemplate) {
  const data: string = template(rpc);
  const dir = __dirname + `/../generated_clients`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o744);
  }
  console.log(`${dir}/${rpc.rpcName}.ts`);
  fs.writeFileSync(`${dir}/${rpc.rpcName}.ts`, data);
}
