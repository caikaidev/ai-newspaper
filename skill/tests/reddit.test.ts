import { describe, expect, it } from 'vitest'
import { parseRedditRss } from '../lib/fetchers/reddit.js'

describe('parseRedditRss', () => {
  it('parses atom entries into reddit raw items', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>tag:reddit.com,2005:comments/abc123</id>
          <title>First post</title>
          <link href="https://www.reddit.com/r/programming/comments/abc123/first_post/" />
        </entry>
        <entry>
          <id>tag:reddit.com,2005:comments/def456</id>
          <title>Second post</title>
          <link href="/r/programming/comments/def456/second_post/" />
        </entry>
      </feed>`

    const items = parseRedditRss(xml, 'programming')
    expect(items).toHaveLength(2)
    expect(items[0].source).toBe('reddit')
    expect(items[0].subreddit).toBe('programming')
    expect(items[1].url).toBe('https://www.reddit.com/r/programming/comments/def456/second_post/')
  })
})
