import { Drive, FileList } from '../interfaces';

export interface BaseMethods {
    getDrives(): Drive[];
    getFolders(pathToRead: string): string[];
    getFiles(pathToRead: string): FileList;
}
