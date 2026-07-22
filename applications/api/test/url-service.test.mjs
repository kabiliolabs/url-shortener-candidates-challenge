import assert from "node:assert/strict";
import test from "node:test";
import { UrlService } from "../dist/domain/url-service.js";
import { DuplicateCodeError, ValidationError } from "../dist/domain/errors.js";

class InMemoryRepository {
  constructor() {
    this.urls = new Map();
  }

  async create(url) {
    if (this.urls.has(url.code)) throw new DuplicateCodeError();
    this.urls.set(url.code, url);
  }

  async findByCode(code) {
    return this.urls.get(code) ?? null;
  }

  async findAll() {
    return [...this.urls.values()];
  }

  async incrementClicks(code) {
    const url = this.urls.get(code);
    if (!url) return null;
    url.clicks += 1;
    return url;
  }
}

test("creates a normalized URL with a unique code", async () => {
  const service = new UrlService(new InMemoryRepository(), () => "validCode");
  const url = await service.create({ url: "https://example.com/path" });

  assert.equal(url.code, "validCode");
  assert.equal(url.url, "https://example.com/path");
  assert.equal(url.clicks, 0);
});

test("retries when a generated code already exists", async () => {
  const repository = new InMemoryRepository();
  await repository.create({ code: "duplicate", url: "https://example.com", createdAt: new Date(), clicks: 0 });
  const codes = ["duplicate", "unique"];
  const service = new UrlService(repository, () => codes.shift());

  const url = await service.create({ url: "https://example.org" });
  assert.equal(url.code, "unique");
});

test("rejects unsafe or malformed destination URLs", async () => {
  const service = new UrlService(new InMemoryRepository(), () => "validCode");

  await assert.rejects(() => service.create({ url: "javascript:alert(1)" }), ValidationError);
  await assert.rejects(() => service.create({ url: "not a url" }), ValidationError);
  await assert.rejects(() => service.create({ url: "https://user:password@example.com" }), ValidationError);
});

test("increments clicks when resolving a short code", async () => {
  const service = new UrlService(new InMemoryRepository(), () => "validCode");
  const created = await service.create({ url: "https://example.com" });
  const resolved = await service.resolveAndRecordVisit(created.code);

  assert.equal(resolved.clicks, 1);
});
