export interface PostFrontmatter {
  title: string
  date: string
  summary: string
  tags: string[]
  draft: boolean
}

export interface PostListItem {
  filename: string
  title: string
  date: string
  draft: boolean
}

export interface PostContent {
  filename: string
  frontmatter: PostFrontmatter
  body: string
}

export interface PublishResult {
  ok: boolean
  message: string
}

export interface EscritorApi {
  listPosts: () => Promise<PostListItem[]>
  readPost: (filename: string) => Promise<PostContent>
  savePost: (filename: string, frontmatter: PostFrontmatter, body: string) => Promise<void>
  createPost: (frontmatter: PostFrontmatter, body?: string) => Promise<PostContent>
  publish: (filenames: string[], message: string) => Promise<PublishResult>
  getPostsPath: () => Promise<string>
}
