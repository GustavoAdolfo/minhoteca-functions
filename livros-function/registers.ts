import { DynamoDBRepository, MongoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';
import { ListarLivrosUseCase, ObterLivroUseCase } from '../use-cases';

const repository =
  process.env.DYNAMODB_REPOSITORY && process.env.DYNAMODB_REPOSITORY === 'true'
    ? new DynamoDBRepository()
    : MongoDBRepository.getInstance();

export const pathUseCaseRegister = {
  get: [
    { '^\/v1\/livros$': new ListarLivrosUseCase(repository) },
    { '^\/v1\/livro\/[A-Fa-f0-9\-]+$': new ObterLivroUseCase(repository) },
  ],
};
