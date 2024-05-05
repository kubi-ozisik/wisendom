// import { db } from "@/lib/db";
// import { MemoryManager } from "@/lib/memory";
// import { rateLimit } from "@/lib/rateLimit";
// import { currentUser } from "@clerk/nextjs/server";
// import { LangChainStream, StreamingTextResponse } from "ai";
// // import { CallbackManager } from "langchain/callbacks";
// import { CallbackManager } from "@langchain/core/callbacks/manager";
// // import { Replicate } from "langchain/llms/replicate";
// import { Replicate } from "@langchain/community/llms/replicate";
import { chatWithHistory } from "@/lib/services/rag_service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    // const [retriever, vectorStore] = await perUserRetrieval();
    // const answer = await perUserRetrieval();
    // const answer = await qnaWithMemoryStore("");
    const answer = await chatWithHistory({
      sessionId: "1234",
      question: "What's its inverse?",
      ability: "math",
    });
    return NextResponse.json({ answer });
  } catch (err) {
    console.log("[CHAT_API]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// export async function POST(
//   request: Request,
//   { params }: { params: { chatId: string } }
// ) {
//   try {
//     const { prompt } = await request.json();
//     const user = await currentUser();
//     const { chatId } = params;

//     if (!user || !user.id || !user.firstName) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const identifier = request.url + "-" + user.id;
//     const { success } = await rateLimit(identifier);
//     if (!success) {
//       return new NextResponse("Rate limit exceeded", { status: 429 });
//     }

//     const companion = await db.companion.update({
//       where: {
//         id: chatId,
//       },
//       data: {
//         messages: {
//           create: {
//             content: prompt,
//             role: "user",
//             userId: user.id,
//           },
//         },
//       },
//     });

//     if (!companion) {
//       return new NextResponse("Companion not found", { status: 404 });
//     }

//     const name = companion.id;
//     const companion_file_name = name + ".txt";
//     const companionKey = {
//       companionName: name,
//       modelName: "llama2-13n",
//       userId: user.id,
//     };

//     const memoryManager = await MemoryManager.getInstance();
//     const records = await memoryManager.readLatestHistory(companionKey);
//     if (records.length === 0) {
//       // seed the chat history
//       await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
//     }

//     // save to vector db
//     memoryManager.writeToHistory(`User: ${prompt} \n`, companionKey);
//     const recentChatHistory = await memoryManager.readLatestHistory(
//       companionKey
//     );
//     const similarDocs = await memoryManager.vectorSearch(
//       recentChatHistory,
//       companion_file_name
//     );

//     let relevantHistory = "";
//     if (!!similarDocs && similarDocs.length !== 0) {
//       relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
//     }

//     const { handlers } = LangChainStream();
//     const model = new Replicate({
//       model:
//         "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
//       input: {
//         max_length: 2048,
//       },
//       apiKey: process.env.REPLICATE_API_TOKEN,
//       callbackManager: CallbackManager.fromHandlers(handlers),
//     });
//     model.verbose = true;

//     const resp = String(
//       await model
//         .call(
//           `
//             ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${name}: prefix.

//             ${companion.instructions}

//             Below are the relevant details about ${name}'s past and the conversation you are in.
//             ${relevantHistory}

//             ${recentChatHistory}\n${name}
//             `
//         )
//         .catch(console.error)
//     );

//     const cleaned = resp.replaceAll(",", "");
//     const chunks = cleaned.split("\n");
//     const response = chunks[0];
//     await memoryManager.writeToHistory("" + response.trim(), companionKey);
//     var Readable = require("stream").Readable;

//     let s = new Readable();
//     s.push(response);
//     s.push(null);
//     if (response !== undefined && response.length > 1) {
//       memoryManager.writeToHistory("" + response.trim(), companionKey);

//       await db.companion.update({
//         where: {
//           id: chatId,
//         },
//         data: {
//           messages: {
//             create: {
//               content: response.trim(),
//               role: "system",
//               userId: user.id,
//             },
//           },
//         },
//       });
//     }
//     return new StreamingTextResponse(s);
//   } catch (err) {

//   }
// }
