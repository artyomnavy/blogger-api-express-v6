export type CreateAndUpdatePostModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
}

export type PaginatorPostModel = {
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
}