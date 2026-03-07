import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateShortUrlUseCase } from '../src/use-cases/CreateShortUrlUseCase';
import { IUrlRepository } from '../src/domain/repositories/IUrlRepository';
import { IShortCodeGenerator } from '../src/domain/services/IShortCodeGenerator';
import { Url } from '../src/domain/entities/Url';
import { ShortCodeConflictError } from '../src/domain/errors/UrlErrors';
import { ShortCode } from '../src/domain/value-objects/ShortCode';
import { OriginalUrl } from '../src/domain/value-objects/OriginalUrl';

describe('CreateShortUrlUseCase', () => {
  let mockRepo: vitest.Mocked<IUrlRepository>;
  let mockGenerator: vitest.Mocked<IShortCodeGenerator>;
  let useCase: CreateShortUrlUseCase;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findByCode: vi.fn(),
      incrementClicks: vi.fn(),
      findRecent: vi.fn(),
    };

    mockGenerator = {
      generate: vi.fn(),
    };

    useCase = new CreateShortUrlUseCase(mockRepo, mockGenerator);
  });

  it('should successfully create a short URL', async () => {
    const validUrl = 'https://google.com';
    const generatedCode = 'abc123';
    
    mockGenerator.generate.mockReturnValue(generatedCode);
    // Simulated DB says: no existing url found for this code
    mockRepo.findByCode.mockResolvedValueOnce(null);
    // Simulated DB says: after saving, here is the generated entity
    mockRepo.findByCode.mockResolvedValueOnce(Url.create({
      id: 'uuid-1',
      originalUrl: OriginalUrl.create(validUrl),
      shortCode: ShortCode.create(generatedCode),
      clicks: 0,
      createdAt: new Date('2024-01-01')
    }));

    const result = await useCase.execute({ url: validUrl });

    expect(result.originalUrl).toBe(validUrl);
    expect(result.shortCode).toBe(generatedCode);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should retry generation if collision occurs and eventually succeed', async () => {
    const validUrl = 'https://google.com';
    
    mockGenerator.generate
        .mockReturnValueOnce('collision1')
        .mockReturnValueOnce('success2');
        
    mockRepo.findByCode
        .mockResolvedValueOnce(Url.create({} as any)) // 1st Check: Collision
        .mockResolvedValueOnce(null)                  // 2nd Check: Free
        .mockResolvedValueOnce(Url.create({           // 3rd Fetch: Final return
          id: 'uuid-2',
          originalUrl: OriginalUrl.create(validUrl),
          shortCode: ShortCode.create('success2'),
        }));

    const result = await useCase.execute({ url: validUrl });

    expect(result.shortCode).toBe('success2');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockGenerator.generate).toHaveBeenCalledTimes(2);
  });

  it('should throw ConflictError if collisions persist after 3 retries', async () => {
    const validUrl = 'https://google.com';
    
    // Always return a collision
    mockGenerator.generate.mockReturnValue('collide');
    mockRepo.findByCode.mockResolvedValue(Url.create({} as any));

    await expect(useCase.execute({ url: validUrl })).rejects.toThrow(ShortCodeConflictError);
    // generator called initial + 3 retries = 4 times
    expect(mockGenerator.generate).toHaveBeenCalledTimes(4);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
