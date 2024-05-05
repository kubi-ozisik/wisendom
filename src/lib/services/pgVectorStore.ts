import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PoolConfig } from "pg";

export type VectorSearchContextFilter = {
  project: string;
};

export class PGMemoryManager {
  private static instance: PGMemoryManager;
  private vectorDBClient: PGVectorStore;

  // 'postgresql+psycopg2://smeetpgvadmin:CodePg1234@smeet-pgv.postgres.database.azure.com:5432/pgvector'
  private config = {
    postgresConnectionOptions: {
      host: "smeet-pgv.postgres.database.azure.com",
      port: 5432,
      user: "smeetpgvadmin",
      password: "CodePg1234",
      ssl: true,
      database: "pgvector",
    } as PoolConfig,
    tableName: "testlangchain",
    columns: {
      idColumnName: "id",
      vectorColumnName: "vector",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
    // distance strategies: cosine (default), innerProduct or Euclidian
    distanceStrategy: "cosine" as DistanceStrategy,
  };
  private embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  public constructor() {
    this.vectorDBClient = new PGVectorStore(this.embeddings, this.config);
  }

  public async init() {
    console.log("initializing pg vector store");
    if (this.vectorDBClient instanceof PGVectorStore) {
    }

    // todo: check this part, connecting twice?
    this.vectorDBClient = await PGVectorStore.initialize(
      new OpenAIEmbeddings(),
      this.config
    );
  }

  public async addDocumentsToVectorStore() {
    const docResult = await this.vectorDBClient.addDocuments([
      new Document({
        pageContent: "I am working on Smeet",
        metadata: { project: "smeet" },
      }),
      new Document({
        pageContent: "I am working on Onabu",
        metadata: { project: "onabu" },
      }),
    ]);
    console.info("DOCUMENT ADD RESULT", docResult);
  }

  public async vectorSearch(filter: VectorSearchContextFilter, query: string) {
    const configuration = {
      filter,
    };
    const docs = await this.vectorDBClient
      .asRetriever(configuration)
      .getRelevantDocuments(query);
    return docs;
  }

  public static async getInstance(): Promise<PGMemoryManager> {
    if (!PGMemoryManager.instance) {
      PGMemoryManager.instance = new PGMemoryManager();
      await PGMemoryManager.instance.init();
    }

    return PGMemoryManager.instance;
  }
}
