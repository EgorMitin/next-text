export const config = {
  api: {
    maxWordsLimit: process.env.MAX_WORDS_LIMIT ? parseInt(process.env.MAX_WORDS_LIMIT, 10) : 600,
  },
};