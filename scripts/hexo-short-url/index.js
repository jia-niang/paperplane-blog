async function generateShortUrl(post) {
  if (!process.env.API_KEY) {
    return;
  }

  const shortUrl = await require("axios")
    .post(
      "https://paperplane.cc/api/short",
      { url: post.permalink, public: true, reuse: true },
      { headers: { "X-API-KEY": process.env.API_KEY } }
    )
    .then((res) => res.data)
    .then((res) => "p01.cc/s/" + res.key);

  post.shortUrl = shortUrl;
}

hexo.extend.filter.register("before_post_render", generateShortUrl);
