export interface ICourse {
  id: string;
  title: string;
  description: string;
  progress?: number;
}

export interface ILesson {
  id: number;
  name: string;
  description?: string;
  status: "public" | "private";
  videoURL: string;
  createdAt: number;
  updatedAt: number;
}
