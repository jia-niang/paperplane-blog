async function generateShortUrl(post) {
  if (
    !process.env.PAPAERPLANE_API_ADMIN_HEADER_NAME ||
    !process.env.PAPAERPLANE_API_ADMIN_HEADER_VALUE
  ) {
    return
  }

  const shortUrl = await require('axios')
    .post(
      'https://console.paperplane.cc/api/shorts',
      {
        url: post.permalink,
        type: 'SYSTEM',
        expiredAt: null,
      },
      {
        headers: {
          [process.env.PAPAERPLANE_API_ADMIN_HEADER_NAME]:
            process.env.PAPAERPLANE_API_ADMIN_HEADER_VALUE,
        },
      }
    )
    .then(res => res.data.data.p01ShortUrl)

  post.shortUrl = shortUrl
}

module.exports = generateShortUrl
