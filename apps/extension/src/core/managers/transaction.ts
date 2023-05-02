import { v4 as uuidv4 } from "uuid"
import tiktoken from "@dqbd/tiktoken"
import {
  type CompletionOptions,
  type Input,
  type Output,
  isTextOutput
} from "window.ai"

import type { ModelID } from "~public-interface"

import { BaseManager } from "./base"
import type { OriginData } from "./origin"
import { originManager } from "./origin"

export interface Transaction {
  id: string
  timestamp: number
  origin: OriginData
  input: Input

  temperature?: number
  maxTokens?: number
  stopSequences?: string[]
  model?: ModelID | string
  numOutputs?: number

  outputs?: Output[]
  error?: string
}

const originIndexName = "byOrigin"

class TransactionManager extends BaseManager<Transaction> {
  constructor() {
    super("transactions")
  }

  init(
    input: Input,
    origin: OriginData,
    options: CompletionOptions<ModelID>
  ): Transaction {
    this._validateInput(input)
    const { temperature, maxTokens, stopSequences, model, numOutputs } = options
    return {
      id: uuidv4(),
      origin,
      timestamp: Date.now(),
      input,
      temperature,
      maxTokens,
      stopSequences,
      model,
      numOutputs
    }
  }

  async save(txn: Transaction): Promise<boolean> {
    const isNew = await super.save(txn)

    if (isNew) {
      const originData = txn.origin
      const newOrigin = originManager.init(originData)
      const origin = await originManager.getOrInit(newOrigin.id, newOrigin)
      await Promise.all([
        originManager.save(origin),
        this.indexBy(txn, origin.id, originIndexName)
      ])
    }

    return isNew
  }

  formatInput(txn: Transaction): string {
    if ("prompt" in txn.input) {
      return txn.input.prompt
    }
    return txn.input.messages.map((m) => `${m.role}: ${m.content}`).join("\n")
  }

  formatOutput(txn: Transaction): string | undefined {
    if (!txn.outputs) {
      return undefined
    }
    return txn.outputs
      .map((t) =>
        isTextOutput(t) ? t.text : `${t.message.role}: ${t.message.content}`
      )
      .join("\n")
  }

  countTokens(query: string): number {
    const enc = tiktoken.get_encoding("cl100k_base")
    const tokens = enc.encode(query)

    return tokens.length
  }

  getMaxCost(txn: Transaction, promptCost: number, completionCost: number, maxTokens: number | null): number | undefined {
    if ((!promptCost && promptCost !== 0) || (!completionCost && completionCost !== 0) || (!maxTokens && maxTokens !== 0)) { 
      return undefined 
    }

    const input = this.formatInput(txn)
    const promptTokens = this.countTokens(input)

    const maxCost = (promptTokens * promptCost) + (maxTokens * completionCost)

    return maxCost
  }

  getTotalCost(txn: Transaction, promptCost: number, completionCost: number): number | undefined {
    const input = this.formatInput(txn)
    const output = this.formatOutput(txn)

    if (!output) {
      return undefined
    }

    const promptTokens = this.countTokens(input)
    const completionTokens = this.countTokens(output)

    const totalCost = (promptTokens * promptCost) + (completionTokens * completionCost)

    return totalCost
  }

  formatJSON(txn: Transaction): object {
    const { input, temperature, maxTokens, stopSequences, model, numOutputs } =
      txn
    return {
      input,
      temperature,
      maxTokens,
      stopSequences,
      model,
      numOutputs
    }
  }

  _validateInput(input: Input): void {
    if (
      typeof input !== "object" ||
      (!("prompt" in input) && !("messages" in input))
    ) {
      throw new Error("Invalid input")
    }
  }
}

export const transactionManager = new TransactionManager()
