import {
  CACHE_MANAGER,
  CacheModuleAsyncOptions,
  CacheStore,
} from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";
import { Env } from "../common/env";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        host: configService.get<string>(Env.REDIS_HOST),
        port: parseInt(configService.get<string>(Env.REDIS_PORT)),
      },
      database: parseInt(configService.get<string>(Env.REDIS_DB)), // Use the database number from the environment variable
    });
    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};

@Injectable()
export class CustomCache {
  prefix: string;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore & Cache,
    configService: ConfigService
  ) {
    // fix: added CacheStore in interface of cacheManger because ttl was not working.
    this.prefix = configService.get<string>(Env.PROJECT_NAME);
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(`${this.prefix}${key}`);
    } catch (error) {
      console.error("Cache get error:", error);
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      // Validate TTL
      const ttlValue = ttl && ttl > 0 ? ttl : undefined;
      await this.cacheManager.set(`${this.prefix}${key}`, value, {
        ttl: ttlValue,
      });
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.error("Cache reset error:", error);
    }
  }
}
