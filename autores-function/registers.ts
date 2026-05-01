import { DynamoDBRepository, MongoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';
import { ListarAutorUseCase, ObterAutorUseCase } from '../use-cases';

const repository =
  process.env.DYNAMODB_REPOSITORY && process.env.DYNAMODB_REPOSITORY === 'true'
    ? new DynamoDBRepository()
    : MongoDBRepository.getInstance();

export const pathUseCaseRegister = {
  get: [
    { '^\/v1\/autores$': new ListarAutorUseCase(repository) },
    { '^\/v1\/autor\/[A-Fa-f0-9\-]+$': new ObterAutorUseCase(repository) },
  ],
};
