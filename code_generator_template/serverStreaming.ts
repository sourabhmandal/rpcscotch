import { capitalizeFirstLetter } from "../utils";
import fs from "fs";

interface IServerStreamRpcTemplate {
  rpcName: string;
  clientMessageType: string;
  requestBody: any;
  uri: string;
  serviceName: string;
}

const template = (populate: IServerStreamRpcTemplate): string => {
  let request_code = "";
  let funcName = `streamServer${capitalizeFirstLetter(populate.rpcName)}`;
  Object.keys(populate.requestBody).map((key: string, idx: number) => {
    let keyCaptitalised = capitalizeFirstLetter(key);
    if (typeof populate.requestBody[key] === "string")
      request_code += `request.set${keyCaptitalised}("${populate.requestBody[key]}");\n\t`;
    else
      request_code += `request.set${keyCaptitalised}(${populate.requestBody[key]});\n`;

    request_code += "\t\t";
  });

  return `
  import { ${populate.clientMessageType} } from "../proto/recieved_pb";
  import { Request, Response } from "express";
  import { credentials } from "grpc";
  import { ${populate.serviceName}Client } from "../proto/recieved_grpc_pb";
  import ws from "ws";

  const client = new ${populate.serviceName}Client("${populate.uri}", credentials.createInsecure());
  
  const ${funcName} = (req: Request, res: Response, wsc: ws): any => {
    if (wsc.OPEN === 1) {
      const request = new ${populate.clientMessageType}();
      const recieved = req.body;
      // console.log(recieved);
      ${request_code}

      const client = new ${populate.serviceName}Client("${populate.uri}", credentials.createInsecure());
      
      // send single message to server
      const stream = client.${populate.rpcName}(request);
      stream.on("err", (err) => console.log(err));
      
      // read message sent from server
      stream.on("data", (d) => {
        wsc.send(d.toString());
      });
      // close stream on Data transfer completion
      stream.on("end", () => {
        res.json({ msg: "stream closed" });
      });
    }
  };
  module.exports = ${funcName};
`;
};

export function generateServerStreamFunction(rpc: IServerStreamRpcTemplate) {
  const data: string = template(rpc);
  const dir = __dirname + `/../generated_clients`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o744);
  }
  console.log(`${dir}/${rpc.rpcName}.ts`);
  fs.writeFileSync(`${dir}/${rpc.rpcName}.ts`, data);
}
