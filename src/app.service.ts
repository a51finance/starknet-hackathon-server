import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CustomCache } from "./config";
import {
  BLACKLIST_STRATEGIES,
  BLACKLIST_STRATEGIES_CACHE,
  CONFIG_CACHE,
} from "./common/variables";
import { CONFIGS } from "./common/mapping";
import { ChainConfig } from "./common/types";

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(private readonly customCache: CustomCache) {}

  async onModuleInit() {
    try {
      this.logger.debug("Setting configs to cache.");
      
      // Fetch configs and blacklist strategies in parallel
      const [chainConfigs, blacklistedStrategies] = await Promise.all([
        this.customCache.get<ChainConfig>(CONFIG_CACHE),
        this.customCache.get<string[]>(BLACKLIST_STRATEGIES_CACHE),
      ]);
  
      // Set caches independently if missing
      const cachePromises = [];
      
      if (!chainConfigs) {
        this.logger.debug("Setting CONFIG_CACHE as it is missing.");
        cachePromises.push(this.customCache.set(CONFIG_CACHE, CONFIGS));
      }
  
      if (!blacklistedStrategies) {
        this.logger.debug("Setting BLACKLIST_STRATEGIES_CACHE as it is missing.");
        cachePromises.push(
          this.customCache.set(BLACKLIST_STRATEGIES_CACHE, BLACKLIST_STRATEGIES)
        );
      }
  
      // Wait for cache set operations to complete
      if (cachePromises.length) {
        await Promise.all(cachePromises);
      }
  
      this.logger.debug("Cache setup complete.");
      
    } catch (error) {
      this.logger.error("Error setting config cache:", error?.message || error);
    }
  }  
}
