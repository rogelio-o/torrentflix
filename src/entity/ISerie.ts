export interface ISerie {
  id?: string;

  externalReferenceId: string;

  name: string;

  poster: string;

  backdrop: string;

  status: string;

  network: string;

  genres: string[];

  description: string;

  voteAverage: number;

  voteCount: number;
}
