interface IBaseRPCTemplate {
  rpcName: string;
  clientMessageType: string;
  clientMessageBody: any;
  serverMessageType: string;
  serverMessageBody: any;
  uri: string;
  serviceName: string;
}
export interface IUnaryRpcTemplate extends IBaseRPCTemplate {}

export interface IStreamRpcTemplate extends IBaseRPCTemplate {
  socketKeepAliveTime: number;
}
