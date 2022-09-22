const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "./.env") });
const fetch = require("node-fetch");
const { Client } = require("twitter-api-sdk");

const client = new Client(process.env.TWITTER_BEARER_TOKEN);

// Twitter docs: https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent#tab1
const getTweets = async (account, fromDate) => {
  let res = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?query=from:${account}&expansions=in_reply_to_user_id,attachments.media_keys&max_results=10&tweet.fields=created_at&start_time=${fromDate}&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width,alt_text`,
    {
      headers: {
        Authorization: "Bearer " + process.env.TWITTER_BEARER_TOKEN,
      },
    }
  );
  // curl --request GET 'https://api.twitter.com/2/tweets?ids=1263145271946551300&expansions=attachments.media_keys&
  res = await res.json();
  console.log(JSON.stringify(res, null, 1));

  // Normalize empty response
  if (!res.data) return [];
  return res.data;
};

const getMedia = async (ids) => {
  const { data, includes } = await client.tweets.findTweetsById({
    ids: [ids], // photo = 1572362547902423041 || video = 1572568625172647937 || gif = 1572542674707816448
    "tweet.fields": ["attachments"],
    expansions: ["attachments.media_keys", "attachments.poll_ids"],
    "media.fields": ["alt_text", "duration_ms", "preview_image_url", "public_metrics", "variants", "url"],
  });

  if (!data) throw new Error("Couldn't retrieve Tweet");

  if (includes?.media[0].type === "photo") {
    console.table(includes?.media, ["url"]);

    return includes?.media;
  } else if (includes?.media[0].type === "video" || includes?.media[0].type === "animated_gif") {
    console.log("Views:\t\t" + includes?.media[0].public_metrics?.view_count);
    const urls = includes?.media[0]?.variants?.filter((vi) => vi.content_type === "video/mp4");
    console.table(urls, ["bit_rate", "url"]);
    return urls;
  } else {
    return !1;
  }
  // console.log("\nTweet text:\t" + data[0].text);
  // console.log("Media:\t\t" + includes?.media[0].type);
  // console.log("Alt text:\t" + includes?.media[0].alt_text);
  // // dump whole JSON data objects
  // console.log("data", JSON.stringify(data, null, 1));
  // console.log("includes", JSON.stringify(includes, null, 1));
};

const getDataUser = async (userName) => {
  console.log("🚀 ~ file: twitter.js ~ line 58 ~ getDataUser ~ userName", userName);
  try {
    let res = await fetch(`https://api.twitter.com/2/users/by/username/${userName}`, {
      headers: {
        Authorization: "Bearer " + process.env.TWITTER_BEARER_TOKEN,
      },
    });
    return await res.json();
  } catch (error) {
    console.log("🚀 ~ file: twitter.js ~ line 71 ~ getDataUser ~ error", error);
    return !1;
  }
};

const getAllFollowing = async (userID) => {
  console.log("🚀 ~ file: twitter.js ~ line 58 ~ getDataUser ~ userName", userID);
  try {
    let res = await fetch(`https://api.twitter.com/2/users/${userID}/following`, {
      headers: {
        Authorization: "Bearer " + process.env.TWITTER_BEARER_TOKEN,
      },
    });
    return await res.json();
  } catch (error) {
    console.log("🚀 ~ file: twitter.js ~ line 71 ~ getDataUser ~ error", error);
    return !1;
  }
};

module.exports = {
  getTweets,
  getMedia,
  getDataUser,
  getAllFollowing,
};
