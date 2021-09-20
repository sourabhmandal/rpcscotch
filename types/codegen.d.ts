export interface ICodeGeneratorData {
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
      uri: string;
      serverMessageType: string;
    }[];
  }[];
}
