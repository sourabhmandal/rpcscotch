import { capitalizeFirstLetter } from "../utils";
import fs from "fs";

interface IUnaryRpcTemplate {
  rpcName: string;
  clientMessageType: string;
  requestBody: any;
  uri: string;
  serviceName: string;
}

// TODO : validate message and and request body params

const template = (populate: IUnaryRpcTemplate): string => {
  let request_code = "";
  let funcName = `unary${capitalizeFirstLetter(populate.rpcName)}`;
  Object.keys(populate.requestBody).map((key: string, idx: number) => {
    let keyCaptitalised = capitalizeFirstLetter(key);
    request_code += `request.set${keyCaptitalised}(req.body.${key});\n`;
    request_code += "    ";
  });

  return `
  import { ${populate.clientMessageType} } from "../proto/recieved_pb";
  import { Request, Response } from "express";
  import { credentials } from "grpc";
  import { ${populate.serviceName}Client } from "../proto/recieved_grpc_pb";


  const client = new ${populate.serviceName}Client("${populate.uri}", credentials.createInsecure());
  const request = new ${populate.clientMessageType}();
  
  const ${funcName} = (req: Request, res: Response): any => {
    
    const request = new ${populate.clientMessageType}();
    ${request_code}
    
    client.${populate.rpcName}(request, function (err: any, data: any) {
      if (err) {
        console.log(err);
        return;
      }
      res.json(data.toObject());
    });
  };
  module.exports = ${funcName}
`;
};

export function generateUnaryFunction(rpc: IUnaryRpcTemplate) {
  const data: string = template(rpc);
  const dir = __dirname + `/../generated_clients`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o744);
  }
  fs.writeFileSync(`${dir}/${rpc.rpcName}.ts`, data);
}
