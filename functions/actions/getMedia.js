const { Client } = require("twitter-api-sdk");
require("dotenv").config();

if (!process.env.TWITTER_BEARER_TOKEN) throw new Error("Please add your BEARER_TOKEN as an environment variable in the Secrets section");

const client = new Client(process.env.TWITTER_BEARER_TOKEN);

async function getMedia(ids) {
  const { data, includes } = await client.tweets.findTweetsById({
    ids: [ids], // photo = 1572362547902423041 || video = 1572568625172647937 || gif = 1572542674707816448
    "tweet.fields": ["attachments"],
    expansions: ["attachments.media_keys", "attachments.poll_ids"],
    "media.fields": ["alt_text", "duration_ms", "preview_image_url", "public_metrics", "variants", "url"],
  });

  if (!data) throw new Error("Couldn't retrieve Tweet");

  // console.log("\nTweet text:\t" + data[0].text);
  // console.log("Media:\t\t" + includes?.media[0].type);
  // console.log("Alt text:\t" + includes?.media[0].alt_text);
  let media;
  if (includes?.media[0].type === "photo") {
    // console.table(includes?.media, ["url"]);
    media = includes?.media;
  } else if (includes?.media[0].type === "video") {
    // console.log("Views:\t\t" + includes?.media[0].public_metrics?.view_count);
    media = includes?.media[0]?.variants?.filter((vi) => vi.content_type === "video/mp4");

    // console.table(
    //   includes?.media[0]?.variants?.filter((vi) => vi.content_type === "video/mp4"),
    //   ["bit_rate", "url"]
    // );
  } else if (includes?.media[0].type === "animated_gif") {
    // console.log("Views:\t\t" + includes?.media[0].public_metrics?.view_count);
    media = includes?.media[0]?.variants?.filter((vi) => vi.content_type === "video/mp4");

    // console.table(
    //   includes?.media[0]?.variants?.filter((vi) => vi.content_type === "video/mp4"),
    //   ["bit_rate", "url"]
    // );
  }
  // dump whole JSON data objects
  // console.log("data", JSON.stringify(data, null, 1));
  // console.log("includes", JSON.stringify(includes, null, 1));

  return {
    media,
    type: includes?.media[0].type,
  };
}

module.exports = {
  getMedia,
};
