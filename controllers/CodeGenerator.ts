import { Request, Response } from "express";
import { generateUnaryFunction } from "../code_generator_template/unary";

interface ICodeGeneratorData {
  messages: {
    messageName: string;
    fields: {
      name: string;
      type: string;
    }[];
  }[];
  services: {
    serviceName: string;
    rpcs: {
      rpcName: string;
      clientMessageType: string;
      rpcType: string;
      requestBody: any;
      uri: string;
    }[];
  }[];
}

interface IUnaryRpcTemplate {
  rpcName: string;
  clientMessageType: string;
  requestBody: any;
  uri: string;
  serviceName: string;
}

export const CodeGenerator = (req: Request, res: Response) => {
  const requestData: ICodeGeneratorData = req.body;
  const rpc: IUnaryRpcTemplate = {
    serviceName: requestData.services[0].serviceName,
    rpcName: requestData.services[0].rpcs[0].rpcName,
    clientMessageType: requestData.services[0].rpcs[0].clientMessageType,
    requestBody: requestData.services[0].rpcs[0].requestBody,
    uri: requestData.services[0].rpcs[0].uri,
  };
  generateUnaryFunction(rpc);
  res.json(rpc);
};
