import { Request, Response } from "express";
import { generateBiDirStreamFunction } from "../code_generator_template/binaryStreaming";
import { generateClientStreamFunction } from "../code_generator_template/clientStreaming";
import { generateServerStreamFunction } from "../code_generator_template/serverStreaming";
import { generateUnaryFunction } from "../code_generator_template/unary";
import { ICodeGeneratorData } from "../types/codegen";
import { IStreamRpcTemplate, IUnaryRpcTemplate } from "../types/rpc";

export const CodeGenerator = (req: Request, res: Response) => {
  const requestData: ICodeGeneratorData = req.body;

  // TODO: check if all mentioned message types messages are present

  requestData.services.map((service: any) => {
    service.rpcs.map((rpc: any) => {
      if (rpc.rpcType === "unary") {
        const rpcData: IUnaryRpcTemplate = {
          serviceName: service.serviceName,
          rpcName: rpc.rpcName,
          clientMessageType: rpc.clientMessageType,
          clientMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.clientMessageType
          )?.fields,
          serverMessageType: rpc.serverMessageType,
          serverMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.serverMessageType
          )?.fields,
          uri: rpc.uri,
        };
        generateUnaryFunction(rpcData);
      } else if (rpc.rpcType === "server-stream") {
        const rpcData: IStreamRpcTemplate = {
          serviceName: service.serviceName,
          rpcName: rpc.rpcName,
          clientMessageType: rpc.clientMessageType,
          clientMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.clientMessageType
          )?.fields,
          serverMessageType: rpc.serverMessageType,
          serverMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.serverMessageType
          )?.fields,
          uri: rpc.uri,
          socketKeepAliveTime: rpc.socketKeepAliveTime,
        };

        generateServerStreamFunction(rpcData);
      } else if (rpc.rpcType === "client-stream") {
        const rpcData: IStreamRpcTemplate = {
          serviceName: service.serviceName,
          rpcName: rpc.rpcName,
          clientMessageType: rpc.clientMessageType,
          clientMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.clientMessageType
          )?.fields,
          serverMessageType: rpc.serverMessageType,
          serverMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.serverMessageType
          )?.fields,
          uri: rpc.uri,
          socketKeepAliveTime: rpc.socketKeepAliveTime,
        };
        generateClientStreamFunction(rpcData);
      } else if (rpc.rpcType === "bidir-stream") {
        const rpcData: IStreamRpcTemplate = {
          serviceName: service.serviceName,
          rpcName: rpc.rpcName,
          clientMessageType: rpc.clientMessageType,
          clientMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.clientMessageType
          )?.fields,
          serverMessageType: rpc.serverMessageType,
          serverMessageBody: requestData.messages.find(
            (el) => el.messageName === rpc.serverMessageType
          )?.fields,
          uri: rpc.uri,
          socketKeepAliveTime: rpc.socketKeepAliveTime,
        };
        generateBiDirStreamFunction(rpcData);
      }
    });
  });
  res.json({ msg: "Code generated for RPCS" });
};
