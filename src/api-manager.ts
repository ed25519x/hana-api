import { KebHana } from "@ed25519x/kebhana.js";

export default class APIManager {
    private static _apiMap: Map<string, KebHana> = new Map();

    static setAPI(accountId: string, api: KebHana) {
        this._apiMap.set(accountId, api);
    }

    static getAPI(accountId: string): KebHana | undefined {
        return this._apiMap.get(accountId);
    }
};