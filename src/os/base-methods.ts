import { Drive, FileList } from '../interfaces';

export interface BaseMethods {
    getDrives(): Drive[];
    getFiles(pathToRead: string): FileList;
}
