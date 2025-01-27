class RefillingTokenBucket {
  public max: number
  public refillIntervalSeconds: number

  constructor(max: number, refillIntervalSeconds: number) {
    this.max = max
    this.refillIntervalSeconds = refillIntervalSeconds
  }

  private storage = new Map<string, RefillBucket>()

  public check = (key: string, cost: number): boolean => {
    const bucket = this.storage.get(key) ?? null
    if (bucket === null) {
      return true
    }
    const now = Date.now()
    const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000))
    if (refill > 0) {
      return Math.min(bucket.count + refill, this.max) >= cost
    }
    return bucket.count >= cost
  }

  public consume = (key: string, cost: number): boolean => {
    let bucket = this.storage.get(key) ?? null
    const now = Date.now()
    if (bucket === null) {
      bucket = {
        count: this.max - cost,
        refilledAt: now
      }
      this.storage.set(key, bucket)
      return true
    }
    const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000))
    bucket.count = Math.min(bucket.count + refill, this.max)
    bucket.refilledAt = now
    if (bucket.count < cost) {
      return false
    }
    bucket.count -= cost
    this.storage.set(key, bucket)
    return true
  }
}

class Throttler {
  public timeoutSeconds: number[]

  private storage = new Map<string, ThrottlingCounter>()

  constructor(timeoutSeconds: number[]) {
    this.timeoutSeconds = timeoutSeconds
  }

  public consume = (key: string): boolean => {
    let counter = this.storage.get(key) ?? null
    const now = Date.now()
    if (counter === null) {
      counter = {
        timeout: 0,
        updatedAt: now
      }
      this.storage.set(key, counter)
      return true
    }
    const allowed = now - counter.updatedAt >= this.timeoutSeconds[counter.timeout] * 1000
    if (!allowed) {
      return false
    }
    counter.updatedAt = now
    counter.timeout = Math.min(counter.timeout + 1, this.timeoutSeconds.length - 1)
    this.storage.set(key, counter)
    return true
  }

  public reset = (key: string): void => {
    this.storage.delete(key)
  }
}

class ExpiringTokenBucket {
  public max: number
  public expiresInSeconds: number

  private storage = new Map<string, ExpiringBucket>()

  constructor(max: number, expiresInSeconds: number) {
    this.max = max
    this.expiresInSeconds = expiresInSeconds
  }

  public check = (key: string, cost: number): boolean => {
    const bucket = this.storage.get(key) ?? null
    const now = Date.now()
    if (bucket === null) {
      return true
    }
    if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
      return true
    }
    return bucket.count >= cost
  }

  public consume = (key: string, cost: number): boolean => {
    let bucket = this.storage.get(key) ?? null
    const now = Date.now()
    if (bucket === null) {
      bucket = {
        count: this.max - cost,
        createdAt: now
      }
      this.storage.set(key, bucket)
      return true
    }
    if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
      bucket.count = this.max
    }
    if (bucket.count < cost) {
      return false
    }
    bucket.count -= cost
    this.storage.set(key, bucket)
    return true
  }

  public reset = (key: string): void => {
    this.storage.delete(key)
  }
}

interface RefillBucket {
  count: number
  refilledAt: number
}

interface ExpiringBucket {
  count: number
  createdAt: number
}

interface ThrottlingCounter {
  timeout: number
  updatedAt: number
}

export { ExpiringTokenBucket, RefillingTokenBucket, Throttler }
