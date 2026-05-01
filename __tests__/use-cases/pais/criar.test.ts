import { CriarPaisUseCase } from '../../../use-cases/pais/criar';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';

describe('CriarPaisUseCase', () => {
  let criarPaisUseCase: CriarPaisUseCase;
  let mockRepository: RepositoryInterface;

  beforeEach(() => {
    mockRepository = {
      saveData: jest.fn(),
      getData: jest.fn(),
      queryData: jest.fn(),
      removeData: jest.fn(),
      getAll: jest.fn(),
      updateByMinhotecaId: jest.fn(),
      deleteByMinhotecaId: jest.fn(),
      findByMinhotecaId: jest.fn(),
    };
    criarPaisUseCase = new CriarPaisUseCase(mockRepository);
  });

  it('deve criar um país com sucesso', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        nome: 'Brasil',
        nomePortugues: 'Brasil',
        bandeira: '🇧🇷',
        isoAlpha2: 'BR',
        isoAlpha3: 'BRA',
        isoNumeric: 76,
      }),
    } as any;

    const expectedPaisDTO = {
      nome: 'Brasil',
      nomePortugues: 'Brasil',
      bandeira: '🇧🇷',
      isoAlpha2: 'BR',
      isoAlpha3: 'BRA',
      isoNumeric: 76,
    };

    (mockRepository.saveData as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await criarPaisUseCase.execute(event);

    expect(mockRepository.saveData).toHaveBeenCalledWith(
      'Paises',
      expect.objectContaining({
        isoNumeric: 76,
        nome: 'Brasil',
      })
    );
    expect(result).toEqual({
      PageData: [expectedPaisDTO],
      Items: 1,
      TotalItems: 1,
      TotalPage: 1,
      Page: 1,
      NextPage: undefined,
      PreviousPage: undefined,
      Code: 201,
      Message: 'Pais criado com sucesso',
    });
  });

  it('deve lançar um erro ao criar um país', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({ nome: 'Brasil' }),
    } as any;

    (mockRepository.saveData as jest.Mock).mockRejectedValueOnce(new Error('Erro ao salvar dados'));

    await expect(criarPaisUseCase.execute(event)).rejects.toThrow('Falha ao criar pais.');
  });
});
