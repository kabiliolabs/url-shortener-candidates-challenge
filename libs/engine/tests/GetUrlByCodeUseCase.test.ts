import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUrlByCodeUseCase } from '../src/use-cases/GetUrlByCodeUseCase';
import { IUrlRepository } from '../src/domain/repositories/IUrlRepository';
import { UrlNotFoundError } from '../src/domain/errors/UrlErrors';
import { Url } from '../src/domain/entities/Url';
import { ShortCode } from '../src/domain/value-objects/ShortCode';
import { OriginalUrl } from '../src/domain/value-objects/OriginalUrl';

describe('GetUrlByCodeUseCase', () => {
  let mockRepo: vitest.Mocked<IUrlRepository>;
  let useCase: GetUrlByCodeUseCase;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findByCode: vi.fn(),
      incrementClicks: vi.fn(),
      findRecent: vi.fn(),
    };
    useCase = new GetUrlByCodeUseCase(mockRepo);
  });

  it('should return mapped UrlDto if URL exists', async () => {
    const mockUrl = Url.create({
      id: '123',
      originalUrl: OriginalUrl.create('https://example.com'),
      shortCode: ShortCode.create('someCode'),
      clicks: 5,
      createdAt: new Date('2024-01-01')
    });
    mockRepo.findByCode.mockResolvedValue(mockUrl);

    const result = await useCase.execute('someCode');

    expect(result.shortCode).toBe('someCode');
    expect(result.clicks).toBe(5);
  });

  it('should throw UrlNotFoundError if code does not exist', async () => {
    mockRepo.findByCode.mockResolvedValue(null);

    await expect(useCase.execute('invalidCode')).rejects.toThrow(UrlNotFoundError);
  });
});
