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

  return `
  import { ${populate.clientMessageType}, ${populate.serverMessageType} } from "../proto/recieved_pb";
  import { Request, Response } from "express";
  import { credentials } from "grpc";
  import { ${populate.serviceName}Client } from "../proto/recieved_grpc_pb";
  import ws from "ws";
  
  const ${funcName} = (req: Request, res: Response, wsc: ws): any => {
    if (wsc.OPEN === 1) {
      const client = new ${populate.serviceName}Client("${populate.uri}", credentials.createInsecure());
      
      const stream = client.${populate.rpcName}();
      // send websocket data to server
      wsc.on("message", (msg: string) => {
        let recieved = JSON.parse(msg);
        let request = new ${populate.clientMessageType}();
        ${request_code}
        stream.write(request);
      });

      // get data through ws
      stream.on("data", (data: ${populate.serverMessageType}) => {
        wsc.send(data.toString());
      });

      // close stream on Data transfer completion
      stream.on("end", () => {
        res.json({ msg: "stream closed" });
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

export function generateBiDirStreamFunction(rpc: IStreamRpcTemplate) {
  const data: string = template(rpc);
  const dir = __dirname + `/../generated_clients`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o744);
  }
  console.log(`${dir}/${rpc.rpcName}.ts`);
  fs.writeFileSync(`${dir}/${rpc.rpcName}.ts`, data);
}
