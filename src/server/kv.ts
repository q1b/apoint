import { server$ } from "@builder.io/qwik-city";
import { StorageValue, createStorage } from "unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-http";

const storage = createStorage({
    driver: cloudflareKVBindingDriver({ 
        accountId: 'ca4f18a2b8408ea85a45f3f6099155eb',
        namespaceId: '92c19bbabe254336b9b93a7ceba5c6a8',
        email: "peadevp@gmail.com",
        apiKey: "1a4f31fecca2bb5406286afd07e5afd18fc33",
     }),
});

const set = server$((key: string, value: StorageValue) => storage.setItem(key, value))
const get = server$((key: string) => storage.getItem(key))
const has = server$((key: string) => storage.hasItem(key))
const del = server$((key: string) => storage.removeItem(key))
const getKeys = server$((key: string) => storage.getKeys(key))
export const kv = {
    set,
    get,
    has,
    del,
    getKeys
}