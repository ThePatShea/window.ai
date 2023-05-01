import { BaseManager } from "./base"

export interface Usage {
  id: string,
  used: number
}

export type UsageData = Pick<Usage, "id" | "used">

class UsageManager extends BaseManager<Usage> {
  constructor() {
    super("usages")
  }

  init(id: string): Usage {
    return {
      id,
      used: 0
    }
  }

  isUnderLimit(limit: number, maxCost: number | undefined, used: number): boolean {
    const isUnderLimit = limit !== 0 && maxCost !== undefined && (limit === -1 || used + maxCost <= limit)

    return isUnderLimit
  }
}

export const usageManager = new UsageManager()
