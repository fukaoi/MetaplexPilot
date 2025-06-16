import { expect, describe } from "@jest/globals";
import { filebaseUploader } from "../filebase-uploader";

describe("filebaseUploader", () => {
  it("load filebaseUploader", async () => {
    const response = filebaseUploader();
    expect(response).toBeDefined();
    console.log("# response: ", response);
  });
});
