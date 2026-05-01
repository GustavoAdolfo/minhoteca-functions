import { DynamoDBRepository, MongoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';
import {
  AlterarAutorUseCase,
  AlterarEditoraUseCase,
  CriarAutorUseCase,
  CriarEditoraUseCase,
  CriarLivroUseCase,
  ListarEditoraUseCase,
  ListarAutorUseCase,
  ObterAutorUseCase,
  ObterEditoraUseCase,
  ObterLivroUseCase,
  RemoverAutorUseCase,
  RemoverEditoraUseCase,
  ListarPaisUseCase,
  ObterPaisUseCase,
  AlterarPaisUseCase,
  RemoverPaisUseCase,
  CriarPaisUseCase,
  ListarLivrosUseCase,
  AlterarLivroUseCase,
  RemoverLivroUseCase,
} from '../use-cases';
import { UploadImgUseCase } from '../use-cases/comum/uploadImg';

const repository =
  process.env.DYNAMODB_REPOSITORY && process.env.DYNAMODB_REPOSITORY === 'true'
    ? new DynamoDBRepository()
    : MongoDBRepository.getInstance();

export const pathUseCaseRegister = {
  post: [
    { '/v1/admin/livro': new CriarLivroUseCase(repository) },
    { '/v1/admin/autor': new CriarAutorUseCase(repository) },
    { '/v1/admin/editora': new CriarEditoraUseCase(repository) },
    { '/v1/admin/pais': new CriarPaisUseCase(repository) },
  ],
  get: [
    // admin
    { '/v1/admin/editoras': new ListarEditoraUseCase(repository) },
    { '/v1/admin/autores': new ListarAutorUseCase(repository) },
    { '/v1/admin/livros': new ListarLivrosUseCase(repository) },
    { '/v1/admin/paises': new ListarPaisUseCase(repository) },
    { '^\/v1\/admin\/autor[\/a-f0-9\-]+$': new ObterAutorUseCase(repository) },
    { '^\/v1\/admin\/livro[\/a-f0-9\-]+$': new ObterLivroUseCase(repository) },
    { '^\/v1\/admin\/editora[\/a-f0-9\-]+$': new ObterEditoraUseCase(repository) },
    { '^\/v1\/admin\/pais[\/a-f0-9\-]+$': new ObterPaisUseCase(repository) },
    { '/v1/admin/upload/image': new UploadImgUseCase(repository) },
    // public
    // { '/v1/editora/obter': new ObterEditoraUseCase(repository) },
    { '^\/v1\/editora[\/a-f0-9\-]+$': new ObterEditoraUseCase(repository) },
    { '/v1/editora/listar': new ListarEditoraUseCase(repository) },
    { '/v1/autor/listar': new ListarAutorUseCase(repository) },
    { '^\/v1\/autor[\/a-f0-9\-]+$': new ObterAutorUseCase(repository) },
    { '/v1/livro/listar': new ListarLivrosUseCase(repository) },
    { '^\/v1\/livro[\/a-f0-9\-]+$': new ObterLivroUseCase(repository) },
    { '/v1/pais/listar': new ListarPaisUseCase(repository) },
    { '^\/v1\/pais[\/a-f0-9\-]+$': new ObterPaisUseCase(repository) },
  ],
  put: [
    { '^\/v1\/admin\/editora[\/a-f0-9\-]+$': new AlterarEditoraUseCase(repository) },
    { '^\/v1\/admin\/autor[\/a-f0-9\-]+$': new AlterarAutorUseCase(repository) },
    { '^\/v1\/admin\/livro[\/a-f0-9\-]+$': new AlterarLivroUseCase(repository) },
    { '^\/v1\/admin\/pais[\/a-f0-9\-]+$': new AlterarPaisUseCase(repository) },
  ],
  delete: [
    { '^\/v1\/admin\/editora[\/a-f0-9\-]+$': new RemoverEditoraUseCase(repository) },
    { '^\/v1\/admin\/autor[\/a-f0-9\-]+$': new RemoverAutorUseCase(repository) },
    { '^\/v1\/admin\/livro[\/a-f0-9\-]+$': new RemoverLivroUseCase(repository) },
    { '^\/v1\/admin\/pais[\/a-f0-9\-]+$': new RemoverPaisUseCase(repository) },
  ],
};
