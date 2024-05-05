"use server";

import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import "cheerio";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { pull } from "langchain/hub";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PGMemoryManager } from "./pgVectorStore";

export type ChatWithHistoryInputType = {
  sessionId: string;
  question: string;
  ability: string;
};

export const chatWithHistory = async ({
  sessionId,
  question,
  ability,
}: ChatWithHistoryInputType) => {
  const prompt = ChatPromptTemplate.fromMessages([
    "system",
    "You're an assistant who's good at {ability}.",
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);
  const chain = prompt.pipe(
    new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 })
  );
  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: (sessionId) =>
      new UpstashRedisChatMessageHistory({
        sessionId,
        config: {
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        },
      }),
    inputMessagesKey: "question",
    historyMessagesKey: "history",
  });
  const result = await chainWithHistory.invoke(
    {
      ability: ability,
      question,
    },
    {
      configurable: {
        sessionId,
      },
    }
  );
  console.log(result);
  return result;
};

export const qnaWithMemoryStore = async (question: string) => {
  const pTagSelector = "p";
  const loader = new CheerioWebBaseLoader(
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    {
      selector: pTagSelector,
    }
  );
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(docs);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings()
  );
  // Retrieve and generate using the relevant snippets of the blog.
  const retriever = vectorStore.asRetriever();
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

  const contextualizeQSystemPrompt = `Given a chat history and the latest user question
    which might reference context in the chat history, formulate a standalone question
    which can be understood without the chat history. Do NOT answer the question,
    just reformulate it if needed and otherwise return it as is.`;

  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ["system", contextualizeQSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  const qaSystemPrompt = `You are an assistant for question-answering tasks.
  Use the following pieces of retrieved context to answer the question.
  If you don't know the answer, just say that you don't know.
  Use three sentences maximum and keep the answer concise.
  
  {context}`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", qaSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  const contextualizeQChain = contextualizeQPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());

  let chat_history: any[] = [];
  const contextualizedQuestion = (input: Record<string, unknown>) => {
    if ("chat_history" in input) {
      return contextualizeQChain;
    }
    return input.question;
  };
  //   const ragChain = await createStuffDocumentsChain({
  //     llm,
  //     prompt,
  //     outputParser: new StringOutputParser(),
  //   });

  //   const retrievedDocs = await retriever.getRelevantDocuments(
  //     "what is task decomposition"
  //   );

  //   const response = await ragChain.invoke({
  //     question: "What is task decomposition?",
  //     context: retrievedDocs,
  //   });
  //   console.log(response);
  //   const response = await contextualizeQChain.invoke({
  //     chat_history: [
  //       new HumanMessage("What does LLM stand for?"),
  //       new AIMessage("Large language model"),
  //     ],
  //     question: "What is meant by large",
  //   });

  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input: Record<string, unknown>) => {
        if ("chat_history" in input) {
          const chain = contextualizedQuestion(input);
          return chain.pipe(retriever).pipe(formatDocumentsAsString);
        }
        return "";
      },
    }),
    qaPrompt,
    llm,
  ]);

  const aiMsg = await ragChain.invoke({ question, chat_history });
  chat_history = chat_history.concat(aiMsg);

  const secondQuestion = "What are common ways of doing it?";
  const response = await ragChain.invoke({
    question: secondQuestion,
    chat_history,
  });

  console.log(response);
  return response;
};

export const perUserRetrieval = async () => {
  console.info("PER USER RETRIEVAL");
  const projectContext = {
    project: "onabu",
  };
  //   const memoryManager = await MemoryManager.getInstance();
  //   await memoryManager.addDocuments();

  const pgMemoryManager = await PGMemoryManager.getInstance();
  //   pgMemoryManager.addDocumentsToVectorStore();

  const template = `Answer the question based only on the following context:
    {context}
    Question: {question}`;
  const prompt = ChatPromptTemplate.fromTemplate(template);
  const model = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });
  const docs = await pgMemoryManager.vectorSearch(
    projectContext,
    "where am I working at?"
  );
  const chain = RunnableSequence.from([
    {
      context: async (input, config) => {
        // if (!config || !("configurable" in config)) {
        //   throw new Error("No config");
        // }
        // const { configurable } = config;
        // const configuredRetriever = (vectorStore as PineconeStore).asRetriever(
        //   configurable
        // );
        // return JSON.stringify(
        //   await configuredRetriever.getRelevantDocuments(input)
        // );
        return JSON.stringify(docs);
      },
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke("Where did the user work?");
  console.log(answer);
  return answer;
};
