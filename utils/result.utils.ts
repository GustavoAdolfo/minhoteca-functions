import {
  AutorDTO,
  EditoraDTO,
  LivroDTO,
  PageDataType,
  PaisDTO,
} from '@gustavoadolfo/minhoteca-core-layer';

export const createResult = (
  data: LivroDTO[] | PaisDTO[] | AutorDTO[] | EditoraDTO[] | undefined,
  code: number,
  message?: string,
  params?: {
    totalItems?: number;
    totalPages?: number;
    page?: number;
    nextPage?: string;
    prevPage?: string;
  }
): PageDataType => {
  return {
    PageData: data,
    Items: Array.isArray(data) ? data.length : 1,
    TotalItems: params?.totalItems ?? (Array.isArray(data) ? data.length : 1),
    TotalPage: params?.totalPages ?? 1,
    Page: params?.page ?? 1,
    NextPage: params?.nextPage,
    PreviousPage: params?.prevPage,
    Code: code,
    Message: message,
  };
};
