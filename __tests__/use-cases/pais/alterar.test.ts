import { AlterarPaisUseCase } from '../../../use-cases/pais';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';

describe('AlterarPaisUseCase', () => {
  let alterarPaisUseCase: AlterarPaisUseCase;
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
    alterarPaisUseCase = new AlterarPaisUseCase(mockRepository);
  });

  it('deve alterar um país com sucesso', async () => {
    const expectedPaisDTO = {
      id: '123',
      nome: 'Brasil',
      nomePortugues: 'Brasil',
      bandeira: '🇧🇷',
      isoAlpha2: 'BR',
      isoAlpha3: 'BRA',
      isoNumeric: 76,
    };

    const event: APIGatewayEvent = {
      body: JSON.stringify(expectedPaisDTO),
    } as any;

    (mockRepository.findByMinhotecaId as jest.Mock).mockResolvedValueOnce(expectedPaisDTO);
    (mockRepository.updateByMinhotecaId as jest.Mock).mockResolvedValueOnce(undefined);
    const result = await alterarPaisUseCase.execute(event);

    expect(mockRepository.updateByMinhotecaId).toHaveBeenCalledWith(
      'Paises',
      expect.objectContaining({
        nome: 'Brasil',
        nomePortugues: 'Brasil',
        bandeira: '🇧🇷',
        isoAlpha2: 'BR',
        isoAlpha3: 'BRA',
        isoNumeric: 76,
      }),
      '123'
    );
    expect(result).toEqual({
      Code: 200,
      NextPage: undefined,
      PreviousPage: undefined,
      Message: 'Pais alterado com sucesso',
      PageData: [expectedPaisDTO],
      Items: 1,
      TotalItems: 1,
      TotalPage: 1,
      Page: 1,
    });
  });
});
