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
  let clientMessageName = `Unary${populate.clientMessageType}`;

  return `
  import { ${clientMessageName} } from "../proto/chat_pb";
  import { Response } from "express";
  import { credentials } from "grpc";
  import { ${populate.serviceName}Client } from "../proto/chat_grpc_pb";


  const client = new ChatServiceClient("${populate.uri}", credentials.createInsecure());
  const request = new UnaryNormalMessage();
  
  const ${funcName} = (req: Request, res: Response): any => {
    
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
  module.exports = ${funcName};
`;
};

export function generateServerStreamFunction(rpc: IUnaryRpcTemplate) {
  const populate: IUnaryRpcTemplate = {
    rpcName: rpc.rpcName,
    clientMessageType: rpc.clientMessageType,
    requestBody: rpc.requestBody,
    uri: rpc.uri,
    serviceName: rpc.serviceName,
  };

  const data: string = template(populate);

  const dir = __dirname + `/../generated_clients`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 0o744);
  }
  fs.writeFileSync(`${dir}/${rpc.rpcName}.ts`, data, (err: Error) => {
    if (err) throw err;
    console.log(`rpc : ${rpc.rpcName}`);
  });
}
