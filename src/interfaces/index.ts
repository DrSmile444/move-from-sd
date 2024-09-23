export interface Drive {
    drive: string;
    size: number;
    freeSpace: number;
    driveType: 'local' | 'removable' | 'unknown';
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
    hasRawPhoto: boolean;
    hasRelatedJpg: boolean;
    isRaw: boolean;
}

export interface DateMeta {
    value: string;
    name: string;
}
