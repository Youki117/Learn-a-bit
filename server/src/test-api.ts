import { createAiService } from "./lib/genai";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
async function test() {
  try {
    const ai = createAiService();
    console.log("Calling Google Gemini natively...");
    const res = await ai.generateTitles("科学");
    console.log("Success! Generated", res.titleGroups.length, "title groups.");
  } catch(e: any) {
    console.error("Test failed:", e.message);
  }
}
test();
