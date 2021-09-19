import { Request, Response } from "express";

export const uploadProto = (req: Request, res: Response) => {
  if (req.file?.mimetype !== "application/octet-stream") {
    res.json({ msg: "Wrong file type", status: "Error" });
    return;
  }

  res.json({ msg: "Upload Successful", status: "success" });
};
