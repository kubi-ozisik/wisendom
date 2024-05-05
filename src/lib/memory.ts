import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Redis } from "@upstash/redis";
export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: Pinecone;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new Pinecone({
      apiKey:
        process.env.PINECONE_API_KEY ?? "ba59ec06-e545-42e1-8bad-0fa7d6f5baef",
    });
  }

  public async init() {
    console.log("initializing memory manager");
    if (this.vectorDBClient instanceof Pinecone) {
      //   await this.vectorDBClient.init({
      //     apiKey: process.env.PINECONE_API_KEY!,
      //   });
      const index = this.vectorDBClient.index(
        process.env.PINECONE_INDEX ?? "companion"
      );
    }
  }

  public async addDocuments() {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const pinecone = <Pinecone>this.vectorDBClient;
    const index = pinecone.Index("companion");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });
    const docResult = await vectorStore.addDocuments(
      [
        new Document({
          pageContent: "I am working on Smeet",
        }),
      ],
      { namespace: "smeet" }
    );
    console.info("DOCUMENT RESULT", docResult);
  }

  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string
  ) {
    const pineconeClient = <Pinecone>this.vectorDBClient;

    const pineconeIndex = pineconeClient.index(
      process.env.PINECONE_INDEX ?? "companion"
    );

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      {
        pineconeIndex,
      }
    );

    const similarDocuments = await vectorStore
      .similaritySearch(recentChatHistory, 3)
      .catch((err) => {
        console.log("failed to get vector search results", err);
      });
    return similarDocuments;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }

    return MemoryManager.instance;
  }

  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey) {
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrect");
      return "";
    }

    const key = this.generateRedisCompanionKey(companionKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });
    return result;
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrect");
      return "";
    }

    const key = this.generateRedisCompanionKey(companionKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });
    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }

  public async seedChatHistory(
    seedContent: string,
    delimiter: string = "\n",
    companionKey: CompanionKey
  ) {
    const key = this.generateRedisCompanionKey(companionKey);
    if (!this.history.exists(key)) {
      // already created
      console.log("already created chat history");
    }

    const content = seedContent.split(delimiter);
    let counter = 0;

    for (const line of content) {
      await this.history.zadd(key, {
        score: counter++,
        member: line,
      });
    }
  }
}
