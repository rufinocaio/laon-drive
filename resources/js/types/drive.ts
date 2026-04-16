export type DriveFile = {
    id: string;
    name: string;
    original_name: string | null;
    mime_type: string | null;
    size: number | null;
    formatted_size: string;
    is_folder: boolean;
    parent_id: string | null;
    url: string | null;
    file_key: string | null;
    is_shared: boolean;
    share_token: string | null;
    share_url: string | null;
    created_at: string;
    updated_at: string;
};

export type DriveBreadcrumb = {
    id: string | null;
    name: string;
};

export type DrivePageProps = {
    files: DriveFile[];
    currentFolder: DriveFile | null;
    breadcrumbs: DriveBreadcrumb[];
    storageUsed: number;
    storageFormatted: string;
};
