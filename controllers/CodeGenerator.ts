import { Request, Response } from "express";
import { generateClientStreamFunction } from "../code_generator_template/clientStreaming";
import { generateServerStreamFunction } from "../code_generator_template/serverStreaming";
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

interface IClientStreamRpcTemplate {
  rpcName: string;
  clientMessageType: string;
  requestBody: any;
  uri: string;
  serviceName: string;
  socketKeepAliveTime: number;
}

export const CodeGenerator = (req: Request, res: Response) => {
  const requestData: ICodeGeneratorData = req.body;

  requestData.services.map((service: any) => {
    service.rpcs.map((rpc: any) => {
      if (rpc.rpcType === "unary") {
        const rpcData: IUnaryRpcTemplate = {
          serviceName: service.serviceName,
          rpcName: rpc.rpcName,
          clientMessageType: rpc.clientMessageType,
          requestBody: rpc.requestBody,
          uri: rpc.uri,
        };
        generateUnaryFunction(rpcData);
      } else if (rpc.rpcType === "server-stream") {
        const rpcData: IUnaryRpcTemplate = {
          serviceName: service.serviceName,
          rpcName: rpc.rpcName,
          clientMessageType: rpc.clientMessageType,
          requestBody: rpc.requestBody,
          uri: rpc.uri,
        };
        generateServerStreamFunction(rpcData);
      } else if (rpc.rpcType === "client-stream") {
        const rpcData: IClientStreamRpcTemplate = {
          serviceName: service.serviceName,
          rpcName: rpc.rpcName,
          clientMessageType: rpc.clientMessageType,
          requestBody: rpc.requestBody,
          uri: rpc.uri,
          socketKeepAliveTime: 1000,
        };
        generateClientStreamFunction(rpcData);
      }
    });
  });
  res.json({ msg: "Code generated for RPCS" });
};
