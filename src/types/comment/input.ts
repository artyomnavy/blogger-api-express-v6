export type CreateAndUpdateCommentModel = {
    content: string
}

export type PaginatorCommentModel = {
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
}