import { BaseManager } from "./base"

export interface Origin {
  id: string
  domain: string
  path: string
  title: string
  limit: number
  used: number
}

export type OriginData = Pick<Origin, "id" | "domain" | "path" | "title">

class OriginManager extends BaseManager<Origin> {
  constructor() {
    super("origins")
  }

  init(data: OriginData): Origin {
    return {
      ...data,
      limit: 0,
      used: 0
    }
  }

  getData(origin: string, pathName: string, title: string): OriginData {
    return {
      id: origin + pathName,
      domain: origin,
      path: pathName,
      title
    }
  }

  url(origin: OriginData): string {
    return origin.domain + origin.path
  }

  originDisplay(origin: OriginData): string {
    const url = origin.domain
    const withoutProtocol = url.split("//")[1]
    const withoutWWW = withoutProtocol.replace(/^www\./, "")
    return withoutWWW
  }

  urlDisplay(origin: OriginData): string {
    return this.originDisplay(origin) + origin.path
  }
}

export const originManager = new OriginManager()
