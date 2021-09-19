import { capitalizeFirstLetter } from "../utils";

const fs = require("fs");

interface IUnaryRpcTemplate {
  rpcName: string;
  clientMessageType: string;
  requestBody: any;
  uri: string;
  serviceName: string;
}

const template = (populate: IUnaryRpcTemplate): string => {
  let request_code = "";
  let funcName = `unary${capitalizeFirstLetter(populate.rpcName)}`;
  Object.keys(populate.requestBody).map((key: string, idx: number) => {
    let keyCaptitalised = capitalizeFirstLetter(key);
    if (typeof populate.requestBody[key] === "string")
      request_code += `request.set${keyCaptitalised}("${populate.requestBody[key]}");\n`;
    else
      request_code += `request.set${keyCaptitalised}(${populate.requestBody[key]});\n`;

    request_code += "    ";
  });
  let clientMessageName = `Stream${populate.clientMessageType}`;

  return `
  import { ${clientMessageName} } from "../proto/chat_pb";
  import { Request, Response } from "express";
  import { credentials } from "grpc";
  import { ${populate.serviceName}Client } from "../proto/chat_grpc_pb";
  import ws from "ws";

  const client = new ChatServiceClient("${populate.uri}", credentials.createInsecure());
  const request = new UnaryNormalMessage();
  
  export const ${funcName} = (req: Request, res: Response, wsc: ws): any => {
    if (wsc.OPEN === 1) {
      const request = new StreamNormalMessage();
      const recieved = req.body;
      // console.log(recieved);
      request.setBodyList(recieved.body);
      request.setLanguage(recieved.language);
      // read message sent to server
  
      const port = 7899;
      const uri = 'localhost:7899';
      const client = new ChatServiceClient(uri, credentials.createInsecure());
      const stream = client.serverStreamComms(request);
      stream.on("err", (err) => console.log(err));
      stream.on("data", (d) => {
        wsc.send(d.toString());
      });
      stream.on("end", () => {
        res.json({ msg: "stream closed" });
      });
    }
    
    const request = new ${clientMessageName}();
    ${request_code}
    
    client.${populate.rpcName}(request, function (err: any, data: any) {
      if (err) {
        console.log(err);
        return;
      }
      //
      res.json(data.toObject());
    });
  };
  //
`;
};

export function generateServerStreamFunction(rpc: IUnaryRpcTemplate) {
  const data: string = template(rpc);
  const dir = __dirname + `/../generated_clients`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o744);
  }
  fs.writeFileSync(`${dir}/${rpc.rpcName}.ts`, data, (err: Error) => {
    if (err) throw err;
    console.log(`rpc : ${rpc.rpcName}`);
  });
}
