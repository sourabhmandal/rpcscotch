import { Request, Response } from "express";
import { exec } from "child_process";

export const uploadProto = (req: Request, res: Response) => {
  if (req.file?.mimetype !== "application/octet-stream") {
    res.json({ msg: "Wrong file type", status: "Error" });
    return;
  }

  var cmd = "./build.sh";

  exec(cmd, function (error, stdout, stderr) {
    if (error) console.log(stderr);
    console.log(stdout);
    console.log("Code Generation Started");
  });

  res.json({ msg: "Upload Successful", status: "success" });
};
