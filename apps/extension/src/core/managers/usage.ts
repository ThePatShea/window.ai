import { BaseManager } from "./base"

export interface Usage {
  key: string,
  used: number
}

export type UsageData = Pick<Origin, "key">

class UsageManager extends BaseManager<Origin> {
  constructor() {
    super("usages")
  }

  init(data: UsageData): Usage {
    return {
      ...data,
      used: 0
    }
  }

  async getUsage(id: string): UsageData {
    const storeData = await this.store.get(<string>(id))

    const used = storeData.used

    return {
      key: id,
      used
    }
  }

  setUsage(key: string, used: number): UsageData {
    return {
      key,
      used: 0
    }
  }
}

export const usageManager = new UsageManager()
