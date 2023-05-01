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

}

export const usageManager = new UsageManager()
