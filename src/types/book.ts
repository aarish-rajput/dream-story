export interface IChapter {
  subTitle: string;
  textContent: string;
  imageDescription: string;
  imageUrl?: string;
  page: number;
}

export interface IGenerateStoryResponse {
  bookTitle: string;
  bookCoverDescription: string; // ✅ Must match AI response
  chapters: IChapter[];
}

export interface ISaveStoryRequest extends IGenerateStoryResponse {
  bookCoverUrl: string;
  description: string;
  chapters: IChapter[]; // with imageUrl included
}

export interface IBook {
  _id: string;
  bookTitle: string;
  bookCoverDescription: string;
  description: string;
  slug: string;
  bookCoverUrl: string;
  chapters?: IChapter[];
  author: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
