export interface Drive {
    drive: string;
    name: string;
}

export interface FileList {
    files: FileMeta[];
    dates: DateMeta[];
}

export interface FileMeta {
    stat: any;
    file: string;
    size: number;
    fileName: string;
    fullDate: string;
}

export interface DateMeta {
    value: string;
    name: string;
}
