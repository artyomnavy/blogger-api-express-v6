export type CreateAndUpdateBlogModel = {
    name: string,
    description: string,
    websiteUrl: string,
}

export type PaginatorBlogModel = {
    searchNameTerm?: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
    pageNumber?: number,
    pageSize?: number
}

export type PaginatorPostWithBlogIdModel = {
    pageNumber?: number,
    pageSize?: number
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
}