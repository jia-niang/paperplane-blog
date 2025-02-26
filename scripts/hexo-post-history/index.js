async function generateHistory(post) {
  if ((hexo.env.cmd || "").includes("server")) {
    return;
  }

  if (post.history === 0) {
    return;
  }

  const filePath = `source/_posts/${encodeURIComponent(post.slug)}.md`;
  const metaData = await require("axios")
    .get(
      `https://git.paperplane.cc/api/v1/repos/jia-niang/paperplane-blog/commits?sha=master&path=${filePath}&stat=false&verification=false`
    )
    .then((res) => res.data)
    .catch(() => []);
  const history = metaData.map((item) => {
    const ts = new Date(item.created).valueOf();
    return {
      message: item.commit.message,
      url: item.html_url,
      ts,
    };
  });

  const result = {
    url: `https://git.paperplane.cc/jia-niang/paperplane-blog/commits/branch/master/${filePath}`,
    list: history,
  };

  post.historyMeta = result;
}

hexo.extend.filter.register("before_post_render", generateHistory);
