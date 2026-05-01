import {
  LivroDTO,
  LivroAdapter,
  UseCaseInterface,
  Autor,
  AutorAdapter,
  Editora,
  EditoraAdapter,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createResult } from '../../utils';

export class CriarLivroUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.LIVRO_TABLE_NAME || 'Livros';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const body = JSON.parse(data.body ?? '{}');
      const dto = body as LivroDTO;
      const entity = LivroAdapter.fromCreateDTO(dto);
      await this._repository.saveData(this._tableName, entity);
      const livroDTO = LivroAdapter.toDTO(entity);

      const attributes: KeyValueAttr[] = [
        {
          attribute: {
            AttributeName: 'id',
            AttributeType: 'S',
          },
          attributeValue: livroDTO.autorId,
          partitionKey: false,
          sortKey: false,
        },
      ];
      const autorData = await this._repository.queryData(
        process.env.AUTOR_TABLE_NAME || 'Autores',
        attributes
      );
      const autorEntity = autorData ? Autor.create(autorData as any, (autorData as any).id) : null;
      livroDTO.autor = autorEntity ? AutorAdapter.toDTO(autorEntity) : undefined;

      const attributeEditora: KeyValueAttr[] = [
        {
          attribute: {
            AttributeName: 'id',
            AttributeType: 'S',
          },
          attributeValue: livroDTO.editoraId,
          partitionKey: false,
          sortKey: false,
        },
      ];
      const editoraData = await this._repository.queryData(
        process.env.EDITORA_TABLE_NAME || 'Editoras',
        attributeEditora
      );
      const editoraEntity = editoraData
        ? Editora.create(editoraData as any, (editoraData as any).id)
        : null;
      livroDTO.editora = editoraEntity ? EditoraAdapter.toDTO(editoraEntity) : undefined;

      return createResult([livroDTO], 201, 'Livro criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      throw new Error('Falha ao criar livro.');
    }
  }
}
