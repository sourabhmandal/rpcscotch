import { Request, Response } from "express";

export const Ping = (req: Request, res: Response) => {
  res.send("GRPC TESTER IS RUNNING");
};
