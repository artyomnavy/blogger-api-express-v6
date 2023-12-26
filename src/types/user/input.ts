export type PaginatorUserModel = {
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
    pageNumber?: number,
    pageSize?: number,
    searchLoginTerm?: string,
    searchEmailTerm?: string
}

export type CreateUserModel = {
    login: string,
    password: string,
    email: string
}