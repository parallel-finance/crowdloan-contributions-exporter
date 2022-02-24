import { GraphqlConfig } from "../utils/config";
import { DotContributionFetcher } from "./auction";

export interface ApiServiceConfig {
    graphqlTrigger: GraphqlConfig;
}

export interface ServiceConfig {
    name: string;
    startHeight: number;
    recordsLimit: number;
    adjustHeight: number;
    listeningInterval: number;
    graphql: string;
}

export interface SubqlFectchMethod {
    (start: number, end: number, endpoint: string): Promise<any>
}

export interface BasicFetchOperation {
    fetchAllRecordsCount: SubqlFectchMethod
    fetchAllRecords: SubqlFectchMethod
}

export interface BasicWriteOperation {
    writeOne: (record: any) => Promise<any>
    writeMany: (record: any[]) => Promise<any>
}
export type FetchOption = BasicFetchOperation
export type WriteOption = BasicWriteOperation

export type FetchServiceType = DotContributionFetcher