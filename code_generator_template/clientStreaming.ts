import { capitalizeFirstLetter } from "../utils";
import fs from "fs";
import { IStreamRpcTemplate } from "../types/rpc";

const template = (populate: IStreamRpcTemplate): string => {
  let request_code = "";
  let funcName = `streamServer${capitalizeFirstLetter(populate.rpcName)}`;
  populate.clientMessageBody.map(
    (key: IStreamRpcTemplate["clientMessageBody"]) => {
      let keyCaptitalised = capitalizeFirstLetter(key.name);
      request_code += `request.set${keyCaptitalised}(recieved.${key.name});\n`;
      request_code += "    ";
    }
  );

  // TODO : make server data sent on ws too

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
      });
  
      setTimeout(() => {
        stream.end();
        wsc.close();
      }, ${populate.socketKeepAliveTime});
    }
  };
  module.exports = ${funcName};
`;
};

export function generateClientStreamFunction(rpc: IStreamRpcTemplate) {
  const data: string = template(rpc);
  const dir = __dirname + `/../generated_clients`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o744);
  }
  console.log(`${dir}/${rpc.rpcName}.ts`);
  fs.writeFileSync(`${dir}/${rpc.rpcName}.ts`, data);
}
